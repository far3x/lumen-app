import math
import json
import difflib
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from app.core.celery_app import celery_app
from app.core.config import settings
from app.db.database import SessionLocal
from app.db import crud
from app.services.valuation import hybrid_valuation_service
from app.services.embedding import embedding_service

SIMILARITY_REJECT_THRESHOLD = 0.98
SIMILARITY_UPDATE_THRESHOLD = 0.80

@celery_app.task
def process_contribution(user_id: int, codebase: str):
    db = SessionLocal()
    try:
        user = crud.get_user(db, user_id=user_id)
        if not user:
            print(f"Error: User with ID {user_id} not found.")
            return

        print(f"Processing contribution for user {user_id}. Starting uniqueness check...")
        
        parsed_files = hybrid_valuation_service._parse_codebase(codebase)
        
        full_codebase_content = "\n".join(
            file_data["content"] for file_data in parsed_files
        )
        
        if not full_codebase_content.strip():
            print("[UNIQUENESS_REJECT] Contribution is empty after parsing. Yielding no reward.")
            return

        new_embedding = embedding_service.generate(full_codebase_content)
        
        if new_embedding is None:
            print("[UNIQUENESS_ERROR] Could not generate embedding for the submission.")
            return

        all_embeddings_data = crud.get_all_contribution_embeddings(db)
        
        code_to_value = codebase
        is_update = False

        if all_embeddings_data:
            existing_embeddings = [np.array(json.loads(e[2])) for e in all_embeddings_data]
            similarities = cosine_similarity([new_embedding], existing_embeddings)[0]
            max_similarity = np.max(similarities)
            most_similar_index = np.argmax(similarities)
            most_similar_id, most_similar_user_id, _ = all_embeddings_data[most_similar_index]

            if max_similarity > SIMILARITY_REJECT_THRESHOLD:
                print(f"[UNIQUENESS_REJECT] Contribution is a near-perfect duplicate of existing contribution ID {most_similar_id} (Similarity: {max_similarity:.4f}).")
                if most_similar_user_id != user_id:
                    print(f"[SECURITY_ALERT] Possible cross-user plagiarism detected! User {user_id} submitted code highly similar to User {most_similar_user_id}'s work.")
                return

            if max_similarity > SIMILARITY_UPDATE_THRESHOLD:
                if most_similar_user_id == user_id:
                    print(f"[UNIQUENESS_UPDATE] Contribution is an update to user's own previous work (ID: {most_similar_id}, Similarity: {max_similarity:.4f}). Processing diff...")
                    is_update = True
                    previous_contribution = crud.get_contribution_by_id(db, most_similar_id)
                    if previous_contribution:
                        diff = difflib.unified_diff(
                            previous_contribution.raw_content.splitlines(keepends=True),
                            codebase.splitlines(keepends=True),
                            fromfile='previous',
                            tofile='current'
                        )
                        added_lines = [line[1:] for line in diff if line.startswith('+') and not line.startswith('+++')]
                        code_to_value = "".join(added_lines)
                        if not code_to_value.strip():
                            print("[UNIQUENESS_UPDATE_REJECT] Update contains no new added lines of code. No reward.")
                            return
                else:
                    print(f"[UNIQUENESS_REJECT] Contribution is a modified version of another user's work (ID: {most_similar_id}, User: {most_similar_user_id}).")
                    return
        
        print("[UNIQUENESS_PASS] Contribution is unique or a valid update. Proceeding to valuation...")
        valuation_result = hybrid_valuation_service.calculate(db, code_to_value)
        base_reward = valuation_result.get("final_reward", 0.0)
        valuation_details = valuation_result.get("valuation_details", {})
        
        print(f"Valuation results (on {'diff' if is_update else 'full codebase'}): {valuation_details}")

        if base_reward > 0:
            total_reward_given = crud.apply_reward_to_user(db, user, base_reward)
            avg_complexity = valuation_details.get("avg_complexity", 0.0)
            crud.update_network_stats(db, avg_complexity, total_reward_given)
            crud.create_contribution_record(db, user, codebase, valuation_details, total_reward_given, new_embedding)
            print(f"Successfully processed and rewarded {total_reward_given:.4f} LUM for user {user_id}.")
        else:
            print(f"Contribution from user {user_id} yielded no reward.")

    finally:
        db.close()