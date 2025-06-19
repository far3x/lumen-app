import hashlib
import json
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core import security
from app import schemas
from . import models

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_pat(db: Session, pat: str):
    hashed_token = hashlib.sha256(pat.encode()).hexdigest()
    token_obj = db.query(models.PersonalAccessToken).filter(models.PersonalAccessToken.token_hash == hashed_token).first()
    return token_obj.user if token_obj else None

def get_user_by_oauth_id(db: Session, provider: str, oauth_id: str):
    if provider == "google": return db.query(models.User).filter(models.User.google_id == oauth_id).first()
    if provider == "github": return db.query(models.User).filter(models.User.github_id == oauth_id).first()
    return None

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, display_name=user.email.split('@')[0])
    db.add(db_user); db.commit(); db.refresh(db_user)
    create_account_for_user(db, db_user)
    return db_user

def update_user_profile(db: Session, user: models.User, user_update: schemas.UserUpdate):
    if user_update.display_name is not None:
        user.display_name = user_update.display_name
    if user_update.is_in_leaderboard is not None:
        user.is_in_leaderboard = user_update.is_in_leaderboard
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_oauth_user(db: Session, provider: str, user_info: dict):
    email = user_info.get("email")
    if email:
        db_user = get_user_by_email(db, email=email)
        if db_user:
            if provider == "google" and not db_user.google_id: db_user.google_id = user_info["sub"]
            elif provider == "github" and not db_user.github_id: db_user.github_id = str(user_info["id"])
            if not db_user.display_name and (user_info.get("name") or user_info.get("login")):
                 db_user.display_name = user_info.get("name") or user_info.get("login")
            db.commit(); db.refresh(db_user)
            return db_user
    user_data = {"display_name": user_info.get("name") or user_info.get("login"), "email": email}
    if provider == "google": user_data["google_id"] = user_info["sub"]
    elif provider == "github": user_data["github_id"] = str(user_info["id"])
    db_user = models.User(**user_data)
    db.add(db_user); db.commit(); db.refresh(db_user)
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
    db_account = models.Account(user_id=user.id, lum_balance=0.0)
    db.add(db_account); db.commit(); db.refresh(db_account)
    return db_account

def get_account(db: Session, user_id: int):
    return db.query(models.Account).filter(models.Account.user_id == user_id).first()

def get_network_stats(db: Session):
    return db.query(models.NetworkStats).first()

def update_network_stats(db: Session, complexity_score: float, reward_amount: float):
    stats = get_network_stats(db)
    if not stats:
        stats = models.NetworkStats(); db.add(stats)
    stats.total_lum_distributed += reward_amount
    n = stats.total_contributions; stats.total_contributions += 1
    delta = complexity_score - stats.mean_complexity
    stats.mean_complexity += delta / (n + 1)
    delta2 = complexity_score - stats.mean_complexity
    stats.m2_complexity += delta * delta2
    if n > 0:
        stats.variance_complexity = stats.m2_complexity / n
        stats.std_dev_complexity = stats.variance_complexity ** 0.5
    db.commit()

def apply_reward_to_user(db: Session, user: models.User, reward_amount: float):
    account = get_account(db, user_id=user.id)
    if not account: return 0.0
    total_reward = reward_amount
    user_count = get_total_user_count(db)
    if user_count <= 500 and not user.has_contributed:
        total_reward += 500.0
        user.has_contributed = True
    account.lum_balance += total_reward
    db.add(user); db.add(account); db.commit()
    return total_reward

def get_all_contribution_embeddings(db: Session) -> list[tuple[int, int, str]]:
    return db.query(
        models.Contribution.id,
        models.Contribution.user_id,
        models.Contribution.content_embedding
    ).filter(models.Contribution.content_embedding.isnot(None)).all()

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
    embedding_str = json.dumps(embedding.tolist()) if embedding is not None else None
    db_contribution = models.Contribution(
        user_id=user.id,
        raw_content=codebase,
        valuation_results=json.dumps(valuation_results),
        reward_amount=reward,
        content_embedding=embedding_str,
        status=initial_status
    )
    db.add(db_contribution)
    db.commit()
    db.refresh(db_contribution)
    return db_contribution

def get_user_contributions(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Contribution).filter(models.Contribution.user_id == user_id).order_by(models.Contribution.created_at.desc()).offset(skip).limit(limit).all()

def get_leaderboard(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User, models.Account.lum_balance)\
             .join(models.Account)\
             .filter(models.User.is_in_leaderboard == True)\
             .order_by(models.Account.lum_balance.desc())\
             .offset(skip).limit(limit).all()

def get_recent_processed_contributions(db: Session, limit: int = 10):
    return db.query(models.Contribution, models.User.display_name)\
             .join(models.User)\
             .filter(models.Contribution.status == "PROCESSED", models.User.is_in_leaderboard == True)\
             .order_by(models.Contribution.created_at.desc())\
             .limit(limit).all()

def get_user_contributions_paginated(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    query = db.query(models.Contribution).filter(models.Contribution.user_id == user_id)
    total_count = query.count()
    items = query.order_by(models.Contribution.created_at.desc()).offset(skip).limit(limit).all()
    return items, total_count