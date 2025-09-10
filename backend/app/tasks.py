import json
import numpy as np
import logging
import time
import sys
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
from app.services.github_service import github_service
import asyncio
from datetime import datetime, timezone, timedelta
from app.db.models import PayoutBatch, BatchPayout, Account, ContributionLanguage, User
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError

logger = logging.getLogger(__name__)

PLAGIARISM_THRESHOLD = 0.95
INNOVATION_THRESHOLD = 0.75

@celery_app.task(name="app.tasks.reset_user_limits_task")
def reset_user_limits_task(user_id: int):
    logger.info(f"Starting development task to reset all limits for user_id: {user_id}")
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            logger.error(f"User with ID {user_id} not found. Aborting.")
            return

        one_day_ago = datetime.now(timezone.utc) - timedelta(days=1)
        
        recent_contributions = db.query(models.Contribution).filter(
            models.Contribution.user_id == user_id,
            models.Contribution.created_at >= one_day_ago
        ).all()

        if recent_contributions:
            logger.info(f"Found and deleting {len(recent_contributions)} recent contributions for user {user_id} to reset daily limit.")
            for contrib in recent_contributions:
                db.delete(contrib)
            db.commit()
        else:
            logger.info(f"No recent contributions found for user {user_id} within the last 24 hours. Daily limit is clear.")

        keys_to_delete = []
        for key in redis_service.r.scan_iter(match=f"LIMITER/*/{user_id}/*"):
            keys_to_delete.append(key)
        
        if keys_to_delete:
            logger.info(f"Found and deleting {len(keys_to_delete)} Redis rate limit keys for user {user_id}.")
            redis_service.r.delete(*keys_to_delete)
        else:
            logger.info(f"No Redis rate limit keys found for user {user_id}.")

        logger.info(f"Successfully reset all limits for user {user_id}.")

    except Exception as e:
        logger.error(f"Error during user limit reset for user {user_id}: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()


@celery_app.task(name="app.tasks.clear_last_contribution_embedding_task")
def clear_last_contribution_embedding_task():
    logger.info("Starting task to clear the last contribution's embedding for testing.")
    db = SessionLocal()
    try:
        last_contribution = db.query(models.Contribution).order_by(desc(models.Contribution.id)).first()

        if not last_contribution:
            logger.warning("No contributions found. Nothing to clear.")
            return

        user_id_of_last_contrib = last_contribution.user_id

        if last_contribution.content_embedding is None:
            logger.info(f"Embedding for last contribution (ID: {last_contribution.id}) is already null. No action taken.")
        else:
            last_contribution.content_embedding = None
            db.commit()
            logger.info(f"Successfully cleared content_embedding for the most recent contribution (ID: {last_contribution.id}).")

        if user_id_of_last_contrib == 1:
            logger.info(f"Last contribution belonged to user 1. Triggering limit reset for this user.")
            reset_user_limits_task.delay(user_id_of_last_contrib)

    except Exception as e:
        logger.error(f"Error clearing last contribution embedding: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()

@celery_app.task(name="app.tasks.penalize_contribution_task")
def penalize_contribution_task(contribution_id: int):
    logger.info(f"Starting penalization task for contribution_id: {contribution_id}")
    db = SessionLocal()
    try:
        contribution = db.query(models.Contribution).filter(models.Contribution.id == contribution_id).first()

        if not contribution:
            logger.error(f"Penalization failed: Contribution with ID {contribution_id} not found.")
            return

        if contribution.reward_amount == 0:
            logger.warning(f"Contribution {contribution_id} has already been penalized or has a zero reward. No action taken.")
            contribution.is_checked = True
            db.commit()
            return
            
        penalty_amount = contribution.reward_amount
        user = contribution.user

        if not user or not user.account:
            logger.error(f"Penalization failed: User or account not found for contribution {contribution_id}.")
            return

        logger.info(f"Penalizing contribution {contribution_id} for user {user.id}. Amount: ${penalty_amount}")

        user.account.usd_balance = max(0, user.account.usd_balance - penalty_amount)
        user.account.total_usd_earned = max(0, user.account.total_usd_earned - penalty_amount)
        
        contribution.reward_amount = 0.0
        contribution.status = "REJECTED_PLAGIARISM"
        contribution.is_checked = True

        db.commit()
        logger.info(f"Successfully penalized contribution {contribution_id}. User {user.id} balance updated.")

        logger.info("Triggering network stats recalculation after penalization.")
        recalculate_network_stats_task.delay()
        
    except Exception as e:
        logger.error(f"Error during penalization for contribution {contribution_id}: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()

@celery_app.task(name="app.tasks.unlock_all_contributions_task")
def unlock_all_contributions_task(company_id: int):
    logger.info(f"Starting bulk unlock task for company_id: {company_id}")
    db = SessionLocal()
    try:
        crud.unlock_all_contributions_for_company(db, company_id)
        logger.info(f"Successfully completed bulk unlock for company_id: {company_id}")
    except Exception as e:
        logger.error(f"Error during bulk unlock for company_id {company_id}: {e}", exc_info=True)
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
        valuation_details=valuation_data, manual_metrics=manual_metrics, ai_analysis=ai_analysis, transaction_hash=contrib.transaction_hash,
        is_open_source=valuation_data.get('is_open_source', False)
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

async def _check_for_open_source(parsed_files, files_to_check):
    print(f"[GITHUB_SERVICE_DEBUG] Starting open source check. AI selected {len(files_to_check)} file(s): {files_to_check}", file=sys.stderr)
    is_open_source = False
    if not files_to_check:
        print("[GITHUB_SERVICE_DEBUG] No files selected for open source check. Skipping.", file=sys.stderr)
        return False
    
    file_map = {f['path']: f['content'] for f in parsed_files}

    for ai_file_path in files_to_check:
        full_path = next((fp for fp in file_map if fp.endswith(ai_file_path)), None)

        if full_path:
            content = file_map[full_path]
            print(f"[GITHUB_SERVICE_DEBUG] Checking content of file: {full_path}", file=sys.stderr)
            print("\n".join(content.splitlines()[:5]), file=sys.stderr)
            
            lines = [line.strip() for line in content.splitlines() if line.strip()]
            
            if len(lines) < 5:
                print(f"[GITHUB_SERVICE_DEBUG] Skipping file {full_path}: not enough significant lines.", file=sys.stderr)
                continue

            query_lines = lines[:15]
            search_query = " ".join('"' + line.replace('"', '\\"') + '"' for line in query_lines)

            print(f"[GITHUB_SERVICE_DEBUG] Search query for {full_path}:\n{search_query}", file=sys.stderr)
 
            if await github_service.search_code_snippet(search_query):
                print(f"[GITHUB_SERVICE_WARNING] OPEN SOURCE DETECTED in file: {full_path}", file=sys.stderr)
                is_open_source = True
                break
        else:
            print(f"[GITHUB_SERVICE_DEBUG] Could not find a matching file for '{ai_file_path}' in the contribution.", file=sys.stderr)

    
    print(f"[GITHUB_SERVICE_DEBUG] Open source check complete. Found public match: {is_open_source}", file=sys.stderr)
    return is_open_source

@celery_app.task(bind=True)
def process_contribution(self, user_id: int, contribution_db_id: int):
    db = SessionLocal()
    try:
        contribution_record = crud.get_contribution_by_id(db, contribution_db_id)
        if not contribution_record:
            logger.error(f"Contribution {contribution_db_id} not found. Aborting task.")
            return

        codebase = contribution_record.raw_content
        source = contribution_record.source
        
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
        
        nearest_neighbors = [res for res in nearest_neighbors if res[0].id != contribution_db_id]

        innovation_multiplier = 1.0

        if nearest_neighbors:
            most_similar_contrib, min_distance = nearest_neighbors[0]
            max_similarity_overall = 1 - min_distance

            if max_similarity_overall > PLAGIARISM_THRESHOLD and most_similar_contrib.user_id != user_id:
                logger.warning(f"[PLAGIARISM_REJECT] High similarity ({max_similarity_overall:.4f}) to another user's C_ID:{most_similar_contrib.id}. Rejecting.")
                crud.update_contribution_status(db, contribution_db_id, "DUPLICATE_CROSS_USER")
                publish_contribution_update(db, contribution_db_id, user_id)
                return

            own_closest_neighbor = next((res for res in nearest_neighbors if res[0].user_id == user_id), None)
            if own_closest_neighbor:
                own_min_distance = own_closest_neighbor[1]
                own_max_similarity = 1 - own_min_distance

                if own_max_similarity > PLAGIARISM_THRESHOLD:
                    logger.warning(f"[DUPLICATE_REJECT] High similarity ({own_max_similarity:.4f}) to own C_ID:{own_closest_neighbor[0].id}. Rejecting as duplicate.")
                    crud.update_contribution_status(db, contribution_db_id, "DUPLICATE_HIGH_SIMILARITY")
                    publish_contribution_update(db, contribution_db_id, user_id)
                    return
                elif own_max_similarity >= INNOVATION_THRESHOLD:
                    innovation_multiplier = 1.0 - own_max_similarity
                    logger.info(f"[INNOVATION_FACTOR] Found similar own contribution (C_ID:{own_closest_neighbor[0].id}) with {own_max_similarity:.4f} similarity. Applying innovation multiplier of {innovation_multiplier:.4f}.")
                else:
                    logger.info(f"[NEW_VERSION] Similarity to own work ({own_max_similarity:.4f}) is below innovation threshold. Treating as a major new version.")

        logger.info(f"[UNIQUENESS_PASS] Contribution {contribution_db_id} is unique enough to proceed to valuation.")
        
        valuation_result = hybrid_valuation_service.calculate(db, current_codebase=final_codebase)
        
        if "error" in valuation_result.get("valuation_details", {}):
            logger.error(f"AI analysis failed for contribution {contribution_db_id}. Setting status to AI_ANALYSIS_PENDING for retry.")
            crud.update_contribution_status(db, contribution_db_id, "AI_ANALYSIS_PENDING")
            publish_contribution_update(db, contribution_db_id, user_id)
            return

        base_reward_usd = valuation_result.get("final_reward", 0.0)
        
        if source == 'web':
            base_reward_usd /= 3.0
            logger.info(f"[REWARD_MOD] Web contribution reward adjusted by 1/3. New base reward: ${base_reward_usd:.4f}")
        
        valuation_details = valuation_result.get("valuation_details", {})
        files_to_check = valuation_details.get("plagiarism_check_files", [])
        is_open_source = asyncio.run(_check_for_open_source(parsed_files, files_to_check))
        valuation_details["is_open_source"] = is_open_source

        if is_open_source:
            base_reward_usd /= 50.0
            logger.warning(f"[REWARD_PENALTY] Open source detected. Reward nerfed by 50x. New base reward: ${base_reward_usd:.4f}")

        final_base_reward_with_innovation = base_reward_usd * innovation_multiplier
        valuation_details['innovation_multiplier'] = round(innovation_multiplier, 4)

        contribution_record.valuation_results = json.dumps(valuation_details)
        
        if final_base_reward_with_innovation > 0:
            reward_with_multiplier = final_base_reward_with_innovation * user.reward_multiplier
            total_reward_for_account = reward_with_multiplier 

            if settings.BETA_MODE_ENABLED and user.id <= settings.BETA_MAX_USERS and not user.is_beta_bonus_claimed:
                bonus_reward_lumen = settings.BETA_GENESIS_BONUS

                lum_price_str = redis_service.r.get("token_price:lumen_usd")
                lum_price_usd = float(lum_price_str) if lum_price_str else 0.001
                bonus_reward_usd = lum_price_usd * bonus_reward_lumen
                
                total_reward_for_account += bonus_reward_usd

                user.is_beta_bonus_claimed = True
                db.add(user)
                db.commit()
                db.refresh(user)
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
            contribution_record.status = "REJECTED_NO_REWARD"
            db.add(contribution_record)
            db.commit()
            logger.warning(f"[REWARD] Contribution {contribution_db_id} was valued at $0.0 after multipliers and status set to {contribution_record.status}.")
        
        publish_contribution_update(db, contribution_db_id, user_id)

    except Exception as e:
        logger.error(f"Unhandled error in process_contribution for c_id {contribution_db_id}: {e}", exc_info=True)
        crud.update_contribution_status(db, contribution_db_id, "FAILED")
        publish_contribution_update(db, contribution_db_id, user_id)
    finally:
        db.close()

@celery_app.task(name="app.tasks.retry_pending_ai_analysis_task")
def retry_pending_ai_analysis_task():
    logger.info("Starting hourly task to retry contributions pending AI analysis...")
    db = SessionLocal()
    try:
        contributions_to_retry = db.query(models.Contribution).filter(models.Contribution.status == 'AI_ANALYSIS_PENDING').all()
        
        if not contributions_to_retry:
            logger.info("No contributions found in AI_ANALYSIS_PENDING state. Nothing to retry.")
            return

        logger.info(f"Found {len(contributions_to_retry)} contributions to re-queue for AI analysis.")
        for contrib in contributions_to_retry:
            logger.info(f"Re-queuing contribution ID: {contrib.id} for user ID: {contrib.user_id}")
            process_contribution.delay(contrib.user_id, contrib.id)

    except Exception as e:
        logger.error(f"Error during AI analysis retry task: {e}", exc_info=True)
    finally:
        db.close()

@celery_app.task(name="app.tasks.simulate_daily_payout_batch_task")
def simulate_daily_payout_batch_task():
    logger.info("Starting daily payout batch SIMULATION...")
    db = SessionLocal()
    try:
        users_to_pay_query = db.query(Account).join(User).filter(
            Account.usd_balance > 0,
            User.solana_address.isnot(None)
        )
        
        users_to_pay = users_to_pay_query.all()
        
        total_simulation_amount_usd = 0
        eligible_user_count = 0
        
        if users_to_pay:
            for account in users_to_pay:
                total_simulation_amount_usd += account.usd_balance
                eligible_user_count += 1

        logger.info("--- Payout Simulation Results ---")
        logger.info(f"Eligible users (balance > 0 and wallet linked): {eligible_user_count}")
        logger.info(f"Total simulated payout amount: ${total_simulation_amount_usd:.4f} USD")
        logger.info("--- End of Simulation ---")
        logger.info("NOTE: No database records were created or modified.")

    except Exception as e:
        logger.error(f"Error during payout simulation task: {e}", exc_info=True)
    finally:
        db.close()