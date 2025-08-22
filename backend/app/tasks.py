import math
import json
import numpy as np
import logging
from app.core.celery_app import celery_app
from app.core.config import settings
from app.db.database import SessionLocal
from app.db import crud
from app.services.valuation import hybrid_valuation_service
from app.services.embedding import embedding_service
from app.services.redis_service import redis_service
from app.schemas import ContributionResponse, ValuationMetrics, AiAnalysis
from app.services.solana_service import solana_service
from app.services.email_service import email_service
from app.services.sanitization_service import sanitization_service
from app.services.price_service import price_service
import asyncio

logger = logging.getLogger(__name__)

SIMILARITY_UPDATE_THRESHOLD = 0.85 
NEAR_PERFECT_SIMILARITY_THRESHOLD = 0.999
DISTANCE_UPDATE_THRESHOLD = 1 - SIMILARITY_UPDATE_THRESHOLD
NEAR_PERFECT_DISTANCE_THRESHOLD = 1 - NEAR_PERFECT_SIMILARITY_THRESHOLD

@celery_app.task(name="app.tasks.update_token_price_task")
def update_token_price_task():
    logger.info("Running scheduled task to update LUMEN price...")
    try:
        price = asyncio.run(price_service.get_lumen_price_usd())
        if price is not None:
            redis_service.r.set("token_price:lumen_usd", str(price))
            logger.info(f"LUMEN price successfully cached: ${price}")
        else:
            logger.warning("Scheduled task could not retrieve LUMEN price. Cache not updated.")
    except Exception as e:
        logger.error(f"Error in update_token_price_task: {e}", exc_info=True)

@celery_app.task(name="send_contact_sales_email")
def send_contact_sales_email_task(name: str, email: str):
    asyncio.run(email_service.send_contact_sales_confirmation(name, email))
    logger.info(f"Contact sales confirmation email sent to {email}")

def publish_user_update(db, user_id: int, event_type: str, payload: dict):
    message = { "type": event_type, "payload": payload }
    redis_service.r.publish(f"user-updates:{user_id}", json.dumps(message))

def publish_contribution_update(db, contribution_id: int, user_id: int):
    contrib = crud.get_contribution_by_id(db, contribution_id)
    if not contrib: return

    valuation_data = {}
    if contrib.valuation_results and isinstance(contrib.valuation_results, str):
        try:
            data = json.loads(contrib.valuation_results)
            if isinstance(data, dict): valuation_data = data
        except (json.JSONDecodeError, TypeError): pass

    manual_metrics = ValuationMetrics(
        total_lloc=valuation_data.get('total_lloc', 0), total_tokens=valuation_data.get('total_tokens', 0),
        avg_complexity=valuation_data.get('avg_complexity', 0.0), compression_ratio=valuation_data.get('compression_ratio', 0.0),
        language_breakdown=valuation_data.get('language_breakdown', {})
    )
    ai_analysis = AiAnalysis(
        project_clarity_score=valuation_data.get('project_clarity_score', 0.0), architectural_quality_score=valuation_data.get('architectural_quality_score', 0.0),
        code_quality_score=valuation_data.get('code_quality_score', 0.0), analysis_summary=valuation_data.get('analysis_summary')
    )
    
    response_data = ContributionResponse(
        id=contrib.id, created_at=contrib.created_at, reward_amount=contrib.reward_amount, status=contrib.status,
        valuation_details=valuation_data, manual_metrics=manual_metrics, ai_analysis=ai_analysis, transaction_hash=contrib.transaction_hash
    )
    account_details = crud.get_account_details(db, user_id=user_id)
    new_payload = { "contribution": json.loads(response_data.model_dump_json()) }
    if account_details:
        new_payload["account"] = json.loads(account_details.model_dump_json())

    publish_user_update(db, user_id, "contribution_update", new_payload)

@celery_app.task(bind=True)
def process_claim(self, user_id: int, claim_id: int):
    db = SessionLocal()
    try:
        user = crud.get_user(db, user_id=user_id)
        if not user or not user.solana_address:
            raise Exception("User or Solana address not found.")
        
        account = db.query(crud.models.Account).filter(crud.models.Account.user_id == user.id).first()
        if not account or account.usd_balance <= 0:
            raise Exception("No claimable balance.")
            
        claimable_usd = account.usd_balance

        lum_price_str = redis_service.r.get("token_price:lumen_usd")
        if not lum_price_str or float(lum_price_str) <= 0:
            raise Exception("Current token price is unavailable. Please try again shortly.")
        
        lum_price = float(lum_price_str)
        amount_lumen = claimable_usd / lum_price
        amount_lamports = int(amount_lumen * (10**9))
        
        tx_hash = solana_service.transfer_lum_tokens(
            recipient_address_str=user.solana_address,
            amount_lamports=amount_lamports
        )
        
        account.usd_balance = 0.0
        db.add(account)
        db.commit()

        crud.update_claim_transaction_hash(db, claim_id, tx_hash)
        
        updated_account_details = crud.get_account_details(db, user_id=user.id)
        
        publish_user_update(db, user_id, "claim_success", {
            "message": f"Successfully claimed {amount_lumen:.4f} LUMEN.",
            "transaction_hash": tx_hash,
            "account": json.loads(updated_account_details.model_dump_json())
        })

    except Exception as e:
        logger.error(f"Claim processing failed for claim_id {claim_id}: {e}", exc_info=True)
        publish_user_update(db, user_id, "claim_failed", {
            "message": f"Claim failed: {str(e)}"
        })
    finally:
        db.close()


@celery_app.task(bind=True)
def process_contribution(self, user_id: int, codebase: str, contribution_db_id: int, source: str = 'cli'):
    db = SessionLocal()
    try:
        crud.update_contribution_status(db, contribution_db_id, "PROCESSING")
        publish_contribution_update(db, contribution_db_id, user_id)
        
        user = crud.get_user(db, user_id=user_id)
        if not user:
            logger.error(f"Error: User with ID {user_id} not found for contribution {contribution_db_id}.")
            crud.update_contribution_status(db, contribution_db_id, "FAILED")
            publish_contribution_update(db, contribution_db_id, user_id)
            return
            
        final_codebase = codebase
        if source == 'web':
            logger.info(f"Contribution {contribution_db_id} is from web source. Performing server-side sanitization on the entire payload, CLI-style.")
            final_codebase = sanitization_service.sanitize_code(codebase)

        logger.info(f"Processing contribution {contribution_db_id} for user {user_id}. Starting uniqueness check...")
        
        parsed_files = hybrid_valuation_service._parse_codebase(final_codebase)
        full_codebase_content = "\n".join(file_data["content"] for file_data in parsed_files)
        
        if not full_codebase_content.strip():
            logger.warning(f"[UNIQUENESS_REJECT] Contribution {contribution_db_id} is empty after parsing. Yielding no reward.")
            crud.update_contribution_status(db, contribution_db_id, "REJECTED_EMPTY")
            publish_contribution_update(db, contribution_db_id, user_id)
            return

        new_embedding = embedding_service.generate(full_codebase_content)
        
        if new_embedding is None:
            logger.error(f"[UNIQUENESS_ERROR] Could not generate embedding for submission {contribution_db_id}.")
            crud.update_contribution_status(db, contribution_db_id, "FAILED_EMBEDDING")
            publish_contribution_update(db, contribution_db_id, user_id)
            return

        nearest_neighbors = crud.get_nearest_neighbors(db, new_embedding, limit=5)
        
        previous_codebase_for_valuation = None
        rejection_reason = None

        nearest_neighbors = [res for res in nearest_neighbors if res[0].id != contribution_db_id]

        if nearest_neighbors:
            most_similar_contrib, min_distance = nearest_neighbors[0]
            
            max_similarity_overall = 1 - min_distance

            if max_similarity_overall > SIMILARITY_UPDATE_THRESHOLD:
                if most_similar_contrib.user_id == user_id:
                    logger.info(f"[SIMILARITY_UPDATE_CANDIDATE] Max similarity {max_similarity_overall:.4f} to own code (C_ID:{most_similar_contrib.id}). Checking for near-perfect match.")
                    
                    if min_distance <= NEAR_PERFECT_DISTANCE_THRESHOLD:
                        logger.info(f"[SIMILARITY_UPDATE] Confirmed as update to user's own C_ID:{most_similar_contrib.id} (Similarity: {max_similarity_overall:.4f}).")
                        previous_codebase_for_valuation = most_similar_contrib.raw_content
                    else:
                        logger.info(f"[SIMILARITY_PASS] User's own code similarity {max_similarity_overall:.4f} is not a near-perfect match. Treating as new, but will check plagiarism.")
                        pass
                else:
                    logger.warning(f"[SIMILARITY_REJECT] High similarity ({max_similarity_overall:.4f}) to code from another user (C_ID:{most_similar_contrib.id}). Rejecting as potential plagiarism.")
                    rejection_reason = "DUPLICATE_CROSS_USER"
            else:
                 logger.info(f"[SIMILARITY_PASS] Max overall similarity {max_similarity_overall:.4f} is below update threshold. Treating as new.")

        if rejection_reason:
            crud.update_contribution_status(db, contribution_db_id, rejection_reason)
            publish_contribution_update(db, contribution_db_id, user_id)
            return
        
        logger.info(f"[UNIQUENESS_PASS] Contribution {contribution_db_id} is unique or a valid update. Proceeding to valuation...")
        
        valuation_result = hybrid_valuation_service.calculate(db, current_codebase=final_codebase, previous_codebase=previous_codebase_for_valuation)
        base_reward_usd = valuation_result.get("final_reward", 0.0)
        
        if source == 'web':
            base_reward_usd /= 3.0
            logger.info(f"[REWARD_MOD] Web contribution reward adjusted by 1/3. New base reward: ${base_reward_usd:.4f}")

        valuation_details = valuation_result.get("valuation_details", {})

        contribution_record = crud.get_contribution_by_id(db, contribution_db_id)
        if not contribution_record:
            logger.error(f"Failed to retrieve contribution record {contribution_db_id} before final update.")
            return

        contribution_record.valuation_results = json.dumps(valuation_details)
        
        if base_reward_usd > 0:
            reward_with_multiplier = base_reward_usd * user.reward_multiplier
            total_reward_for_contribution = reward_with_multiplier
            bonus_reward = 0.0

            if settings.BETA_MODE_ENABLED and user.id <= settings.BETA_MAX_USERS and not user.is_beta_bonus_claimed:
                bonus_reward = settings.BETA_GENESIS_BONUS
                total_reward_for_contribution += bonus_reward
                user.is_beta_bonus_claimed = True
                db.add(user)
                logger.info(f"[REWARD] Awarded Genesis Bonus of {settings.BETA_GENESIS_BONUS} LUMEN to user {user_id}.")

            crud.apply_reward_to_user(db, user, total_reward_for_contribution)
            
            avg_complexity = valuation_details.get("avg_complexity", 0.0)
            if avg_complexity > 0 :
                crud.update_network_stats(db, avg_complexity, total_reward_for_contribution)
            
            contribution_record.reward_amount = base_reward_usd
            contribution_record.content_embedding = new_embedding
            contribution_record.status = "PROCESSED"
            
            db.add(contribution_record)
            db.commit()
            
            logger.info(f"[REWARD] Successfully processed and rewarded ${total_reward_for_contribution:.4f} for user {user_id} (Contribution {contribution_db_id}).")
        else:
            contribution_record.reward_amount = 0.0
            contribution_record.content_embedding = new_embedding
            contribution_record.status = valuation_details.get("analysis_summary", "REJECTED_NO_REWARD")
            if contribution_record.status == "Contribution rejected: No new valuable code detected in the update.":
                contribution_record.status = "REJECTED_NO_NEW_CODE"
            else:
                contribution_record.status = "REJECTED_NO_REWARD"
            db.add(contribution_record)
            db.commit()
            logger.warning(f"[REWARD] Contribution {contribution_db_id} was valued at $0.0 and status set to {contribution_record.status}.")
        
        publish_contribution_update(db, contribution_db_id, user_id)

    except Exception as e:
        logger.error(f"Unhandled error in process_contribution for c_id {contribution_db_id}: {e}", exc_info=True)
        crud.update_contribution_status(db, contribution_db_id, "FAILED")
        publish_contribution_update(db, contribution_db_id, user_id)
    finally:
        db.close()