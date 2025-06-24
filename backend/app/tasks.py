import math
import json
import difflib
import numpy as np
import logging
from sklearn.metrics.pairwise import cosine_similarity
from app.core.celery_app import celery_app
from app.core.config import settings
from app.db.database import SessionLocal
from app.db import crud
from app.services.valuation import hybrid_valuation_service
from app.services.embedding import embedding_service
from app.services.redis_service import redis_service

logger = logging.getLogger(__name__)

SIMILARITY_REJECT_THRESHOLD = 0.98
SIMILARITY_UPDATE_THRESHOLD = 0.80

@celery_app.task(bind=True)
def process_contribution(self, user_id: int, codebase: str, contribution_db_id: int):
    db = SessionLocal()
    
    try:
        crud.update_contribution_status(db, contribution_db_id, "PROCESSING")
        user = crud.get_user(db, user_id=user_id)
        if not user:
            logger.error(f"Error: User with ID {user_id} not found for contribution {contribution_db_id}.")
            crud.update_contribution_status(db, contribution_db_id, "FAILED")
            return

        logger.info(f"Processing contribution {contribution_db_id} for user {user_id}. Starting uniqueness check...")
        
        parsed_files = hybrid_valuation_service._parse_codebase(codebase)
        
        full_codebase_content = "\n".join(
            file_data["content"] for file_data in parsed_files
        )
        
        if not full_codebase_content.strip():
            logger.warning(f"[UNIQUENESS_REJECT] Contribution {contribution_db_id} is empty after parsing. Yielding no reward.")
            crud.update_contribution_status(db, contribution_db_id, "REJECTED_EMPTY")
            return

        new_embedding = embedding_service.generate(full_codebase_content)
        
        if new_embedding is None:
            logger.error(f"[UNIQUENESS_ERROR] Could not generate embedding for submission {contribution_db_id}.")
            crud.update_contribution_status(db, contribution_db_id, "FAILED_EMBEDDING")
            return

        all_embeddings_data = crud.get_all_contribution_embeddings(db)
        
        code_to_value = codebase
        is_update = False
        rejection_reason = None

        if all_embeddings_data:
            existing_embeddings = [np.array(json.loads(e[2])) for e in all_embeddings_data if e[2]]
            if existing_embeddings:
                similarities = cosine_similarity([new_embedding], existing_embeddings)[0]
                max_similarity = np.max(similarities)
                most_similar_index = np.argmax(similarities)
                most_similar_id, most_similar_user_id, _ = all_embeddings_data[most_similar_index]

                if max_similarity > SIMILARITY_REJECT_THRESHOLD:
                    rejection_reason = "DUPLICATE_HIGH_SIMILARITY"
                    logger.warning(f"[UNIQUENESS_REJECT] Contribution {contribution_db_id} rejected for high similarity ({max_similarity:.2f}) with contribution {most_similar_id}.")
                    crud.update_contribution_status(db, contribution_db_id, rejection_reason)
                    return

                if max_similarity > SIMILARITY_UPDATE_THRESHOLD:
                    if most_similar_user_id == user_id:
                        is_update = True
                        logger.info(f"Contribution {contribution_db_id} is an update to {most_similar_id}. Performing diff.")
                        previous_contribution = crud.get_contribution_by_id(db, most_similar_id)
                        if previous_contribution:
                            diff = difflib.unified_diff(
                                previous_contribution.raw_content.splitlines(keepends=True),
                                codebase.splitlines(keepends=True),
                                fromfile='previous', tofile='current'
                            )
                            added_lines = [line[1:] for line in diff if line.startswith('+') and not line.startswith('+++')]
                            code_to_value = "".join(added_lines)
                            if not code_to_value.strip():
                                rejection_reason = "REJECTED_NO_NEW_CODE"
                                logger.warning(f"[UNIQUENESS_REJECT] Contribution {contribution_db_id} is an update with no new code.")
                        else:
                            rejection_reason = "FAILED_DIFF_PROCESSING"
                            logger.error(f"Could not find previous contribution {most_similar_id} for diff processing.")
                    else:
                        rejection_reason = "DUPLICATE_CROSS_USER"
                        logger.warning(f"[UNIQUENESS_REJECT] Contribution {contribution_db_id} is too similar to another user's submission {most_similar_id}.")
            
            if rejection_reason:
                crud.update_contribution_status(db, contribution_db_id, rejection_reason)
                return
        
        logger.info(f"[UNIQUENESS_PASS] Contribution {contribution_db_id} is unique or a valid update. Proceeding to valuation...")
        valuation_result = hybrid_valuation_service.calculate(db, code_to_value)
        base_reward = valuation_result.get("final_reward", 0.0)
        valuation_details = valuation_result.get("valuation_details", {})

        contribution_record = crud.get_contribution_by_id(db, contribution_db_id)
        if not contribution_record:
            return

        contribution_record.valuation_results = json.dumps(valuation_details)
        
        if base_reward > 0:
            total_reward_given = crud.apply_reward_to_user(db, user, base_reward)
            avg_complexity = valuation_details.get("avg_complexity", 0.0)
            crud.update_network_stats(db, avg_complexity, total_reward_given)
            
            contribution_record.reward_amount = total_reward_given
            contribution_record.content_embedding = json.dumps(new_embedding.tolist()) if new_embedding is not None else None
            contribution_record.status = "PROCESSED"
            
            db.add(contribution_record)
            db.commit()
            
            logger.info(f"[REWARD] Successfully processed and rewarded {total_reward_given:.4f} LUM for user {user_id} (Contribution {contribution_db_id}).")
            logger.info(f"Valuation Details: {json.dumps(valuation_details, indent=2)}")
            
            redis_service.set_with_ttl(f"task_status:{self.request.id}", "PROCESSED", 3600)
        else:
            contribution_record.reward_amount = 0.0
            contribution_record.status = "REJECTED_NO_REWARD"
            db.add(contribution_record)
            db.commit()
            logger.warning(f"[REWARD] Contribution {contribution_db_id} was valued at 0.0 LUM and rejected.")
            redis_service.set_with_ttl(f"task_status:{self.request.id}", "REJECTED", 3600)

    except Exception as e:
        logger.error(f"Unhandled error in process_contribution for c_id {contribution_db_id}: {e}", exc_info=True)
        crud.update_contribution_status(db, contribution_db_id, "FAILED")
        redis_service.set_with_ttl(f"task_status:{self.request.id}", "FAILED", 3600)
    finally:
        db.close()