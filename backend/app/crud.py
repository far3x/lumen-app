from sqlalchemy.orm import Session
from . import models, schemas
from .auth import get_password_hash
import random

# ... (get_user, get_user_by_email, get_user_by_oauth_id, create_user remain the same) ...

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_oauth_id(db: Session, provider: str, oauth_id: str):
    if provider == "google":
        return db.query(models.User).filter(models.User.google_id == oauth_id).first()
    if provider == "github":
        return db.query(models.User).filter(models.User.github_id == oauth_id).first()
    return None

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, display_name=user.email.split('@')[0])
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    create_account_for_user(db, db_user)
    return db_user

def create_oauth_user(db: Session, provider: str, user_info: dict):
    email = user_info.get("email")
    if email:
        db_user = get_user_by_email(db, email=email)
        if db_user:
            if provider == "google" and not db_user.google_id:
                db_user.google_id = user_info["sub"]
            elif provider == "github" and not db_user.github_id:
                db_user.github_id = str(user_info["id"])
            if not db_user.display_name and (user_info.get("name") or user_info.get("login")):
                 db_user.display_name = user_info.get("name") or user_info.get("login")
            db.commit()
            db.refresh(db_user)
            return db_user

    user_data = {
        "display_name": user_info.get("name") or user_info.get("login"),
        "email": email,
    }
    if provider == "google":
        user_data["google_id"] = user_info["sub"]
    elif provider == "github":
        user_data["github_id"] = str(user_info["id"])

    db_user = models.User(**user_data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    create_account_for_user(db, db_user)
    return db_user

def get_total_user_count(db: Session):
    return db.query(models.User).count()

# REWARD LOGIC CHANGE: Bonus is no longer applied here.
def create_account_for_user(db: Session, user: models.User):
    # Initial balance is always 0 now.
    db_account = models.Account(user_id=user.id, lum_balance=0.0)
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

def get_account(db: Session, user_id: int):
    return db.query(models.Account).filter(models.Account.user_id == user_id).first()

# REWARD LOGIC CHANGE: This function now handles the Genesis bonus.
def update_balance_for_contribution(db: Session, user: models.User, file_size_kb: float):
    account = get_account(db, user_id=user.id)
    if not account:
        return None
        
    base_reward = file_size_kb * 0.05
    random_bonus = random.uniform(0, base_reward * 0.2)
    final_reward = base_reward + random_bonus
    
    # Check for Genesis Bonus
    user_count = get_total_user_count(db)
    if user_count <= 500 and not user.has_contributed:
        final_reward += 500.0  # Add the 500 LUM bonus
        user.has_contributed = True # Mark that the bonus has been awarded

    account.lum_balance += final_reward
    db.add(user)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account