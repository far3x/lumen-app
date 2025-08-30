import math
import json
import numpy as np
import logging
import time
from typing import List
from sqlalchemy.orm import Session
from app.core.celery_app import celery_app
from app.core.config import settings
from app.db.database import SessionLocal
from app.db import crud, models
from app.services.valuation import hybrid_valuation_service
from app.services.embedding import embedding_service
from app.services.redis_service import redis_service
from app.schemas import ContributionResponse, ValuationMetrics, AiAnalysis
from app.services.solana_service import solana_service
from app.services.email_service import email_service
from app.services.sanitization_service import sanitization_service
from app.services.price_service import price_service
import asyncio
from fastapi_mail import MessageSchema
from datetime import datetime, timezone
from app.db.models import PayoutBatch, BatchPayout, Account, ContributionLanguage
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

logger = logging.getLogger(__name__)

SIMILARITY_UPDATE_THRESHOLD = 0.85 
NEAR_PERFECT_SIMILARITY_THRESHOLD = 0.999
DISTANCE_UPDATE_THRESHOLD = 1 - SIMILARITY_UPDATE_THRESHOLD
NEAR_PERFECT_DISTANCE_THRESHOLD = 1 - NEAR_PERFECT_SIMILARITY_THRESHOLD

@celery_app.task(name="app.tasks.unlock_all_contributions_task")
def unlock_all_contributions_task(company_id: int):
    logger.info(f"Starting bulk unlock task for company_id: {company_id}")
    db = SessionLocal()
    try:
        crud.unlock_all_contributions_for_company(db, company_id)
        logger.info(f"Successfully completed bulk unlock for company_id: {company_id}")
    except Exception as e:
        logger.error(f"Error during bulk unlock for company_id {company_id}: {e}", exc_info=True)
        # Here you might want to add a notification to the user, e.g., via WebSocket or email.
    finally:
        db.close()


@celery_app.task(name="app.tasks.recalculate_network_stats_task")
def recalculate_network_stats_task():
    logger.info("Starting manual recalculation of all network statistics...")
    db = SessionLocal()
    try:
        stats = db.query(models.NetworkStats).first()
        if not stats:
            stats = models.NetworkStats()
            db.add(stats)
            logger.info("No existing network stats found. Created new record.")
        
        # Reset all stats to their initial default values
        logger.info("Resetting current network stats to zero/defaults...")
        stats.total_usd_distributed = 0.0
        stats.total_contributions = 0
        stats.total_lloc = 0
        stats.total_tokens = 0
        stats.mean_complexity = 5.0
        stats.m2_complexity = 0.0
        stats.variance_complexity = 4.0
        stats.std_dev_complexity = 2.0
        stats.mean_quality = 0.5
        stats.m2_quality = 0.0
        stats.variance_quality = 0.25
        stats.std_dev_quality = 0.5
        db.commit()

        all_contributions = db.query(models.Contribution).filter(
            models.Contribution.status == "PROCESSED",
            models.Contribution.reward_amount > 0
        ).order_by(models.Contribution.created_at.asc()).all()

        logger.info(f"Found {len(all_contributions)} processed contributions to recalculate.")

        for i, contribution in enumerate(all_contributions):
            details = json.loads(contribution.valuation_results) if isinstance(contribution.valuation_results, str) else contribution.valuation_results
            
            stats.total_usd_distributed += contribution.reward_amount
            stats.total_lloc += details.get("total_lloc", 0)
            stats.total_tokens += details.get("total_tokens", 0)
            
            n = i
            
            complexity_score = details.get("avg_complexity", 0.0)
            delta_complexity = complexity_score - stats.mean_complexity
            stats.mean_complexity += delta_complexity / (n + 1)
            delta2_complexity = complexity_score - stats.mean_complexity
            stats.m2_complexity += delta_complexity * delta2_complexity
            
            quality_score = details.get("ai_weighted_multiplier", 0.0)
            delta_quality = quality_score - stats.mean_quality
            stats.mean_quality += delta_quality / (n + 1)
            delta2_quality = quality_score - stats.mean_quality
            stats.m2_quality += delta_quality * delta2_quality

        stats.total_contributions = len(all_contributions)
        n_final = stats.total_contributions
        if n_final > 1:
            stats.variance_complexity = stats.m2_complexity / (n_final -1)
            stats.std_dev_complexity = stats.variance_complexity ** 0.5
            stats.variance_quality = stats.m2_quality / (n_final -1)
            stats.std_dev_quality = stats.variance_quality ** 0.5

        db.commit()
        logger.info("Successfully recalculated and saved all network statistics.")

    except Exception as e:
        logger.error(f"Critical error during network stats recalculation: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()

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

@celery_app.task
def send_contact_sales_email_task(name: str, email: str):
    asyncio.run(email_service.send_contact_sales_confirmation(name, email))
    logger.info(f"Contact sales confirmation email sent to {email}")

@celery_app.task
def send_business_verification_email_task(email: str, token: str):
    asyncio.run(email_service.send_business_verification_email(email, token))
    logger.info(f"Business verification email sent to {email}")

@celery_app.task
def send_team_invitation_email_task(
    invited_by_name: str, company_name: str, invitee_email: str, invite_token: str, user_exists: bool
):
    if user_exists:
        asyncio.run(
            email_service.send_existing_user_invitation_email(
                invited_by_name, company_name, invitee_email, invite_token
            )
        )
        logger.info(f"Team invitation email sent to EXISTING user {invitee_email} for company {company_name}")
    else:
        asyncio.run(
            email_service.send_new_user_invitation_email(
                invited_by_name, company_name, invitee_email, invite_token
            )
        )
        logger.info(f"Team invitation email sent to NEW user {invitee_email} for company {company_name}")

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

@celery_app.task(name="app.tasks.reconcile_failed_payouts_task")
def reconcile_failed_payouts_task():
    db = SessionLocal()
    try:
        failed_payouts = db.query(BatchPayout).filter(BatchPayout.status == "FAILED").all()
        if not failed_payouts:
            logger.info("Reconciliation task: No failed payouts to process.")
            return

        logger.info(f"Reconciliation task: Found {len(failed_payouts)} failed payouts to reconcile.")
        for payout in failed_payouts:
            account = db.query(Account).filter(Account.user_id == payout.user_id).first()
            if account:
                logger.warning(f"Refunding ${payout.amount_usd} to user {payout.user_id} for failed payout {payout.id}.")
                account.usd_balance += payout.amount_usd
                payout.status = "RECONCILED"
                payout.error_message = f"Refunded to user balance on {datetime.now(timezone.utc)}. Original Error: {payout.error_message}"
                db.commit()
            else:
                logger.error(f"Could not find account for user {payout.user_id} to refund failed payout {payout.id}.")

    except Exception as e:
        logger.error(f"Critical error during payout reconciliation: {e}", exc_info=True)
    finally:
        db.close()

@celery_app.task(name="app.tasks.process_payout_batch")
def process_payout_batch_task(batch_id: int):
    db = SessionLocal()
    try:
        batch = db.query(PayoutBatch).filter(PayoutBatch.id == batch_id).first()
        if not batch or batch.status != "CLOSED":
            logger.error(f"Payout batch {batch_id} not found or not in CLOSED state.")
            return

        batch.status = "PROCESSING"
        db.commit()

        payouts_to_process = db.query(BatchPayout).filter(BatchPayout.batch_id == batch_id, BatchPayout.status == "PENDING").all()
        
        for i, payout in enumerate(payouts_to_process):
            if i > 0:
                time.sleep(1.2)

            user = payout.user
            if not user or not user.solana_address:
                payout.status = "FAILED"
                payout.error_message = "User or Solana address not found at time of processing."
                db.commit()
                continue
            
            try:
                tx_hash = solana_service.transfer_usdc_tokens(
                    recipient_address_str=user.solana_address,
                    amount_usd=payout.amount_usd
                )
                payout.transaction_hash = tx_hash
                payout.status = "COMPLETED"
            except Exception as e:
                logger.error(f"Failed to process payout {payout.id} for user {user.id}: {e}")
                payout.status = "FAILED"
                payout.error_message = str(e)
            
            db.commit()

        batch.status = "COMPLETED"
        db.commit()
        logger.info(f"Successfully processed payout batch {batch_id}.")

    except Exception as e:
        logger.error(f"Critical error processing payout batch {batch_id}: {e}", exc_info=True)
        batch.status = "FAILED"
        db.commit()
    finally:
        db.close()


@celery_app.task(name="app.tasks.create_daily_payout_batch_task")
def create_daily_payout_batch_task():
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        
        open_batch = db.query(PayoutBatch).filter(PayoutBatch.status == "OPEN").first()
        if not open_batch:
            logger.warning("No open batch found. This should only happen on the first run. Creating a new one.")
        else:
            logger.info(f"Closing batch {open_batch.id}...")
            open_batch.end_time = now
            open_batch.status = "CLOSED"

            users_to_pay = db.query(Account).filter(Account.usd_balance > 0).all()
            
            total_batch_amount = 0
            if users_to_pay:
                for account in users_to_pay:
                    payout_amount = account.usd_balance
                    total_batch_amount += payout_amount

                    new_payout = BatchPayout(
                        batch_id=open_batch.id,
                        user_id=account.user_id,
                        amount_usd=payout_amount
                    )
                    db.add(new_payout)
                    
                    account.usd_balance = 0.0
                    db.add(account)

            open_batch.total_amount_usd = total_batch_amount
            db.commit()
            
            logger.info(f"Batch {open_batch.id} closed. Snapshotted {len(users_to_pay)} users for a total of ${total_batch_amount:.2f}.")

            if total_batch_amount > 0:
                process_payout_batch_task.delay(open_batch.id)

        logger.info("Creating new OPEN batch for the next 24-hour cycle.")
        new_batch = PayoutBatch(start_time=now, status="OPEN")
        db.add(new_batch)
        db.commit()

    except Exception as e:
        logger.error(f"Error in create_daily_payout_batch_task: {e}", exc_info=True)
    finally:
        db.close()

def _add_languages_to_db(db: Session, languages: List[str]):
    for lang_name in languages:
        if not lang_name:
            continue
        try:
            exists = db.query(ContributionLanguage).filter_by(name=lang_name).first()
            if not exists:
                db.add(ContributionLanguage(name=lang_name))
                db.commit()
        except IntegrityError:
            db.rollback()
        except Exception as e:
            logger.error(f"Error adding language '{lang_name}' to db: {e}")
            db.rollback()

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
            total_reward_for_account = reward_with_multiplier 

            if settings.BETA_MODE_ENABLED and user.id <= settings.BETA_MAX_USERS and not user.is_beta_bonus_claimed:
                bonus_reward_lumen = settings.BETA_GENESIS_BONUS

                lum_price_str = redis_service.r.get("token_price:lumen_usd")
                lum_price_usd = float(lum_price_str) if lum_price_str else 0.001
                bonus_reward_usd = lum_price_usd * bonus_reward_lumen
                
                total_reward_for_account += bonus_reward_usd

                user.is_beta_bonus_claimed = True
                db.add(user)
                logger.info(f"[REWARD] Awarded Genesis Bonus of {settings.BETA_GENESIS_BONUS} LUMEN to user {user_id}.")

            crud.apply_reward_to_user(db, user, total_reward_for_account)
            
            avg_complexity = valuation_details.get("avg_complexity", 0.0)
            quality_score = valuation_details.get("ai_weighted_multiplier", 0.0)
            total_lloc = valuation_details.get("total_lloc", 0)
            total_tokens = valuation_details.get("total_tokens", 0)
            
            languages = list(valuation_details.get("language_breakdown", {}).keys())
            if languages:
                _add_languages_to_db(db, languages)

            if avg_complexity > 0 or quality_score > 0:
                crud.update_network_stats(
                    db,
                    avg_complexity,
                    reward_with_multiplier,
                    total_lloc,
                    total_tokens,
                    quality_score
                )
            
            contribution_record.reward_amount = reward_with_multiplier
            contribution_record.content_embedding = new_embedding
            contribution_record.status = "PROCESSED"
            
            db.add(contribution_record)
            db.commit()
            
            logger.info(f"[REWARD] Successfully processed. Contribution {contribution_db_id} valued at ${reward_with_multiplier:.4f}. Total account credit: ${total_reward_for_account:.4f}.")
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