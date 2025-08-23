import hashlib
import json
import re
import secrets
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from fastapi import HTTPException, status
from typing import Optional
from datetime import datetime, timedelta, timezone

from app.core import security, config
from app import schemas, business_schemas
from . import models
from app.services.redis_service import redis_service


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_pat(db: Session, pat: str):
    hashed_token = hashlib.sha256(pat.encode()).hexdigest()
    token_obj = db.query(models.PersonalAccessToken).filter(models.PersonalAccessToken.token_hash == hashed_token).first()
    return token_obj.user if token_obj else None

def get_user_by_oauth_id(db: Session, provider: str, oauth_id: str):
    if provider == "github": return db.query(models.User).filter(models.User.github_id == oauth_id).first()
    return None

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    display_name = re.sub(r'[^\w\s-]', '', user.email.split('@')[0]).strip()
    if not display_name:
        display_name = f"user-{secrets.token_hex(4)}"

    db_user = models.User(email=user.email, hashed_password=hashed_password, display_name=display_name)
    
    if config.settings.COOLDOWN_DAYS > 0:
        db_user.cooldown_until = datetime.now(timezone.utc) + timedelta(days=config.settings.COOLDOWN_DAYS)
    
    expires = timedelta(hours=24)
    verification_token = security.create_access_token(data={"sub": f"verify:{db_user.email}"}, expires_delta=expires)
    db_user.verification_token = verification_token

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if config.settings.BETA_MODE_ENABLED and db_user.id <= config.settings.BETA_MAX_USERS:
        db_user.reward_multiplier = 2.0
        db.commit()
        db.refresh(db_user)

    create_account_for_user(db, db_user)
    return db_user

def update_user_profile(db: Session, user: models.User, user_update: schemas.UserUpdate):
    if user_update.display_name is not None:
        clean_name = re.sub(r'[^\w\s-]', '', user_update.display_name).strip()
        if len(clean_name) < 3:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Display name must be at least 3 characters long.")
        if len(clean_name) > 25:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Display name cannot exceed 25 characters.")

        existing_user = db.query(models.User).filter(models.User.display_name == clean_name, models.User.id != user.id).first()
        if existing_user:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Display name is already taken.")
        
        user.display_name = clean_name

    if user_update.is_in_leaderboard is not None:
        user.is_in_leaderboard = user_update.is_in_leaderboard
        
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_oauth_user(db: Session, provider: str, user_info: dict):
    email = user_info.get("email")
    display_name = user_info.get("name") or user_info.get("login")
    clean_name = re.sub(r'[^\w\s-]', '', display_name).strip()
    if not clean_name: clean_name = f"user-{secrets.token_hex(4)}"
    
    existing_user_with_name = db.query(models.User).filter(models.User.display_name == clean_name).first()
    if existing_user_with_name:
        clean_name = f"{clean_name}-{secrets.token_hex(2)}"

    if email:
        db_user = get_user_by_email(db, email=email)
        if db_user:
            if provider == "github" and not db_user.github_id: db_user.github_id = str(user_info["id"])
            if not db_user.display_name:
                 db_user.display_name = clean_name
            db_user.is_verified = True
            db.commit()
            db.refresh(db_user)
            return db_user

    user_data = {"display_name": clean_name, "email": email, "is_verified": True}
    if provider == "github": user_data["github_id"] = str(user_info["id"])
    
    db_user = models.User(**user_data)
    
    if config.settings.COOLDOWN_DAYS > 0:
        db_user.cooldown_until = datetime.now(timezone.utc) + timedelta(days=config.settings.COOLDOWN_DAYS)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if config.settings.BETA_MODE_ENABLED and db_user.id <= config.settings.BETA_MAX_USERS:
        db_user.reward_multiplier = 2.0
        db.commit()
        db.refresh(db_user)

    create_account_for_user(db, db_user)
    return db_user

def create_pat_for_user(db: Session, user: models.User, name: str) -> str:
    raw_token, hashed_token = security.create_pat()
    db_pat = models.PersonalAccessToken(user_id=user.id, token_hash=hashed_token, name=name)
    db.add(db_pat); db.commit()
    return raw_token

def get_total_user_count(db: Session):
    return db.query(models.User).count()

def create_account_for_user(db: Session, user: models.User):
    db_account = models.Account(user_id=user.id, usd_balance=0.0, total_usd_earned=0.0)
    db.add(db_account); db.commit(); db.refresh(db_account)
    return db_account

def get_account_details(db: Session, user_id: int) -> Optional[schemas.AccountDetails]:
    account = db.query(models.Account).filter(models.Account.user_id == user_id).first()
    if not account:
        return None
    
    last_claim_at = db.query(func.max(models.ClaimTransaction.created_at)).filter(models.ClaimTransaction.user_id == user_id).scalar()
    
    return schemas.AccountDetails(
        usd_balance=account.usd_balance,
        total_usd_earned=account.total_usd_earned,
        last_claim_at=last_claim_at
    )

def get_network_stats(db: Session):
    return db.query(models.NetworkStats).first()

def update_network_stats(db: Session, complexity_score: float, reward_amount_usd: float):
    stats = get_network_stats(db)
    if not stats:
        stats = models.NetworkStats(); db.add(stats)

    if stats.total_usd_distributed is None:
        stats.total_usd_distributed = 0.0
    if stats.total_contributions is None:
        stats.total_contributions = 0

    stats.total_usd_distributed += reward_amount_usd
    n = stats.total_contributions; stats.total_contributions += 1
    delta = complexity_score - stats.mean_complexity
    stats.mean_complexity += delta / (n + 1)
    delta2 = complexity_score - stats.mean_complexity
    stats.m2_complexity += delta * delta2
    if n > 0:
        stats.variance_complexity = stats.m2_complexity / n
        stats.std_dev_complexity = stats.variance_complexity ** 0.5
    db.commit()

def apply_reward_to_user(db: Session, user: models.User, reward_amount_usd: float):
    account = user.account
    if not account: return 0.0
    
    if account.total_usd_earned is None:
        account.total_usd_earned = 0.0

    account.usd_balance += reward_amount_usd
    account.total_usd_earned += reward_amount_usd

    db.add(user)
    db.add(account)
    db.commit()
    return reward_amount_usd

def get_nearest_neighbors(db: Session, embedding, limit: int = 5):
    return db.query(
        models.Contribution,
        models.Contribution.content_embedding.cosine_distance(embedding).label('distance')
    ).filter(models.Contribution.content_embedding.isnot(None))\
     .order_by(models.Contribution.content_embedding.cosine_distance(embedding))\
     .limit(limit)\
     .all()

def get_contribution_by_id(db: Session, contribution_id: int) -> models.Contribution | None:
    return db.query(models.Contribution).filter(models.Contribution.id == contribution_id).first()

def update_contribution_status(db: Session, contribution_id: int, status: str):
    contribution = db.query(models.Contribution).filter(models.Contribution.id == contribution_id).first()
    if contribution:
        contribution.status = status
        db.add(contribution)
        db.commit()
        db.refresh(contribution)
    return contribution

def create_contribution_record(db: Session, user: models.User, codebase: str, valuation_results: dict, reward: float, embedding: list[float] | None, initial_status: str = "PENDING"):
    db_contribution = models.Contribution(
        user_id=user.id,
        raw_content=codebase,
        valuation_results=json.dumps(valuation_results),
        reward_amount=reward,
        content_embedding=embedding,
        status=initial_status
    )
    db.add(db_contribution)
    db.commit()
    db.refresh(db_contribution)
    return db_contribution

def get_all_user_contributions(db: Session, user_id: int):
    return db.query(models.Contribution).filter(models.Contribution.user_id == user_id).order_by(models.Contribution.created_at.asc()).all()

def get_user_contributions(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Contribution).filter(models.Contribution.user_id == user_id).order_by(models.Contribution.created_at.desc()).offset(skip).limit(limit).all()

def get_leaderboard(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User, models.Account.total_usd_earned)\
             .join(models.Account)\
             .filter(models.User.is_in_leaderboard == True, models.User.is_verified == True, models.User.id <= config.settings.BETA_MAX_USERS if config.settings.BETA_MODE_ENABLED else True)\
             .order_by(models.Account.total_usd_earned.desc())\
             .offset(skip).limit(limit).all()

def get_recent_processed_contributions(db: Session, limit: int = 10):
    return db.query(models.Contribution, models.User.display_name)\
             .join(models.User)\
             .filter(models.Contribution.status == "PROCESSED", models.User.is_in_leaderboard == True, models.User.id <= config.settings.BETA_MAX_USERS if config.settings.BETA_MODE_ENABLED else True)\
             .order_by(models.Contribution.created_at.desc())\
             .limit(limit).all()

def get_user_contributions_paginated(db: Session, user_id: int, skip: int = 0, limit: int = 10):
    query = db.query(models.Contribution).filter(models.Contribution.user_id == user_id)
    total_count = query.count()
    items = query.order_by(models.Contribution.created_at.desc()).offset(skip).limit(limit).all()
    return items, total_count

def get_user_rank(db: Session, user_id: int):
    query = text("""
        SELECT rank, display_name, total_usd_earned
        FROM (
            SELECT 
                u.id, 
                u.display_name, 
                a.total_usd_earned,
                ROW_NUMBER() OVER (ORDER BY a.total_usd_earned DESC) as rank
            FROM users u
            JOIN accounts a ON u.id = a.user_id
            WHERE u.is_in_leaderboard = :is_in_leaderboard 
              AND u.is_verified = :is_verified 
              AND (:beta_mode_disabled OR u.id <= :beta_max_users)
        ) as ranked_users
        WHERE ranked_users.id = :user_id
    """)

    result = db.execute(query, {
        "is_in_leaderboard": True, 
        "is_verified": True,
        "user_id": user_id,
        "beta_mode_disabled": not config.settings.BETA_MODE_ENABLED,
        "beta_max_users": config.settings.BETA_MAX_USERS
    }).first()
    return result

def reset_claimable_balance(db: Session, user_id: int):
    account = db.query(models.Account).filter(models.Account.user_id == user_id).first()
    if account:
        account.usd_balance = 0.0
        db.add(account)
        db.commit()
        db.refresh(account)
    return account

def log_claim_transaction(db: Session, user_id: int, amount: float, tx_hash: str):
    claim = models.ClaimTransaction(
        user_id=user_id,
        amount_claimed=amount,
        transaction_hash=tx_hash
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim

def update_claim_transaction_hash(db: Session, claim_id: int, tx_hash: str):
    claim = db.query(models.ClaimTransaction).filter_by(id=claim_id).first()
    if claim:
        claim.transaction_hash = tx_hash
        db.commit()
    return claim

def get_user_claim_history(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    query = db.query(models.ClaimTransaction).filter(models.ClaimTransaction.user_id == user_id)
    total_count = query.count()
    items = query.order_by(models.ClaimTransaction.created_at.desc()).offset(skip).limit(limit).all()
    return items, total_count

def delete_user(db: Session, user: models.User):
    db.delete(user)
    db.commit()

def create_contact_submission(db: Session, submission: schemas.ContactSalesCreate):
    db_submission = models.ContactSubmission(
        full_name=submission.full_name,
        work_email=submission.work_email,
        company_name=submission.company_name,
        job_title=submission.job_title,
        contact_reason=submission.contact_reason,
        message=submission.message
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission


def get_business_user_by_email(db: Session, email: str) -> Optional[models.BusinessUser]:
    return db.query(models.BusinessUser).filter(models.BusinessUser.email == email).first()

def get_company_by_name(db: Session, name: str) -> Optional[models.Company]:
    return db.query(models.Company).filter(models.Company.name == name).first()

def create_business_user(db: Session, user_data: business_schemas.BusinessUserCreate) -> models.BusinessUser:
    company = get_company_by_name(db, name=user_data.company_name)
    if not company:
        company = models.Company(name=user_data.company_name)
        db.add(company)
        db.commit()
        db.refresh(company)

    hashed_password = security.get_password_hash(user_data.password)
    
    db_user = models.BusinessUser(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        company_id=company.id,
        role='admin'
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user