import hashlib
import json
import re
import secrets
import sqlalchemy as sa
from sqlalchemy.orm import Session
from sqlalchemy import func, text, case, desc
from sqlalchemy.dialects import postgresql
from fastapi import HTTPException, status
from typing import Optional, List, Dict
from datetime import datetime, timedelta, timezone
import html

from app.core import security, config
from app import schemas, business_schemas
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
    if provider == "github": return db.query(models.User).filter(models.User.github_id == oauth_id).first()
    return None

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    display_name = re.sub(r'[^\w\s-]', '', user.email.split('@')[0]).strip()
    if not display_name:
        display_name = f"user-{secrets.token_hex(4)}"

    db.execute(text("LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE"))
    max_id = db.query(func.max(models.User.id)).scalar()
    new_user_id = (max_id or 0) + 1

    db_user = models.User(
        id=new_user_id,
        email=user.email,
        hashed_password=hashed_password,
        display_name=display_name
    )
    
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

    db.execute(text("LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE"))
    max_id = db.query(func.max(models.User.id)).scalar()
    new_user_id = (max_id or 0) + 1

    user_data = {
        "id": new_user_id,
        "display_name": clean_name, 
        "email": email, 
        "is_verified": True
    }
    if provider == "github": user_data["github_id"] = str(user_info["id"])
    
    db_user = models.User(**user_data)
    
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
    
    last_claim_at = db.query(func.max(models.BatchPayout.created_at)).filter(
        models.BatchPayout.user_id == user_id,
        models.BatchPayout.status == 'COMPLETED'
    ).scalar()
    
    return schemas.AccountDetails(
        usd_balance=account.usd_balance,
        total_usd_earned=account.total_usd_earned,
        last_claim_at=last_claim_at
    )

def get_network_stats(db: Session):
    return db.query(models.NetworkStats).first()

def update_network_stats(db: Session, complexity_score: float, reward_amount_usd: float, total_lloc: int, total_tokens: int, quality_score: float):
    stats = get_network_stats(db)
    if not stats:
        stats = models.NetworkStats()
        db.add(stats)

    if stats.total_usd_distributed is None: stats.total_usd_distributed = 0.0
    if stats.total_contributions is None: stats.total_contributions = 0
    if stats.total_lloc is None: stats.total_lloc = 0
    if stats.total_tokens is None: stats.total_tokens = 0
    
    stats.total_usd_distributed += reward_amount_usd
    stats.total_lloc += total_lloc
    stats.total_tokens += total_tokens

    n = stats.total_contributions
    stats.total_contributions += 1

    delta_complexity = complexity_score - stats.mean_complexity
    stats.mean_complexity += delta_complexity / (n + 1)
    delta2_complexity = complexity_score - stats.mean_complexity
    stats.m2_complexity += delta_complexity * delta2_complexity
    if n > 0:
        stats.variance_complexity = stats.m2_complexity / n
        stats.std_dev_complexity = stats.variance_complexity ** 0.5
    
    delta_quality = quality_score - stats.mean_quality
    stats.mean_quality += delta_quality / (n + 1)
    delta2_quality = quality_score - stats.mean_quality
    stats.m2_quality += delta_quality * delta2_quality
    if n > 0:
        stats.variance_quality = stats.m2_quality / n
        stats.std_dev_quality = stats.variance_quality ** 0.5

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
    query = db.query(models.User, models.Account.total_usd_earned)\
             .join(models.Account)\
             .filter(models.User.is_in_leaderboard == True, models.User.is_verified == True)
    
    if config.settings.BETA_MODE_ENABLED:
        query = query.filter(models.User.id <= config.settings.BETA_MAX_USERS)

    return query.order_by(models.Account.total_usd_earned.desc())\
                .offset(skip).limit(limit).all()

def get_recent_processed_contributions(db: Session, limit: int = 10):
    query = db.query(models.Contribution, models.User.display_name)\
             .join(models.User)\
             .filter(
                models.Contribution.status == "PROCESSED", 
                models.User.is_in_leaderboard == True,
                models.User.is_verified == True
             )

    if config.settings.BETA_MODE_ENABLED:
        query = query.filter(models.User.id <= config.settings.BETA_MAX_USERS)

    return query.order_by(models.Contribution.created_at.desc())\
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

def get_business_user_by_id(db: Session, user_id: int) -> Optional[models.BusinessUser]:
    return db.query(models.BusinessUser).filter(models.BusinessUser.id == user_id).first()

def get_business_user_by_email(db: Session, email: str) -> Optional[models.BusinessUser]:
    return db.query(models.BusinessUser).filter(models.BusinessUser.email == email).first()

def create_business_user(db: Session, user_data: business_schemas.BusinessUserCreate) -> models.BusinessUser:
    company = None
    role = 'admin'

    if user_data.invite_token:
        invitation = db.query(models.TeamInvitation).filter(
            models.TeamInvitation.token == user_data.invite_token,
            models.TeamInvitation.email == user_data.email,
            models.TeamInvitation.status == 'pending',
            models.TeamInvitation.expires_at > datetime.now(timezone.utc)
        ).first()
        if invitation:
            company = invitation.company
            invitation.status = 'accepted'
            db.add(invitation)
            role = 'member' 
    
    if not company:
        company = models.Company(
            name=user_data.company_name,
            company_size=user_data.company_size,
            industry=user_data.industry,
            plan="free",
            token_balance=0
        )
        db.add(company)
        db.commit()
        db.refresh(company)

    hashed_password = security.get_password_hash(user_data.password)
    
    db_user = models.BusinessUser(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        job_title=user_data.job_title,
        company_id=company.id,
        role=role
    )
    
    expires = timedelta(hours=24)
    verification_token = security.create_access_token(
        data={"sub": f"verify_business:{db_user.email}"}, expires_delta=expires
    )
    db_user.verification_token = verification_token
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_company_by_api_key(db: Session, api_key: str) -> Optional[models.Company]:
    hashed_key = hashlib.sha256(api_key.encode()).hexdigest()
    api_key_obj = db.query(models.ApiKey).filter(
        models.ApiKey.key_hash == hashed_key,
        models.ApiKey.is_active == True
    ).first()
    return api_key_obj.company if api_key_obj else None

def get_api_keys_for_company(db: Session, company_id: int) -> list[models.ApiKey]:
    return db.query(models.ApiKey).filter(models.ApiKey.company_id == company_id).order_by(models.ApiKey.created_at.desc()).all()

def create_api_key(db: Session, company: models.Company, name: str) -> str:
    key_prefix = secrets.token_hex(4)
    raw_key = f"lum_biz_{key_prefix}_{secrets.token_urlsafe(32)}"
    hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()

    db_key = models.ApiKey(
        company_id=company.id,
        name=name,
        key_prefix=key_prefix,
        key_hash=hashed_key
    )
    db.add(db_key)
    db.commit()
    return raw_key

def revoke_api_key(db: Session, key_id: int, company_id: int):
    api_key = db.query(models.ApiKey).filter(models.ApiKey.id == key_id, models.ApiKey.company_id == company_id).first()
    if not api_key:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API Key not found or you do not have permission to revoke it.")
    api_key.is_active = False
    db.commit()

def get_distinct_contribution_languages(db: Session) -> List[str]:
    results = db.query(models.ContributionLanguage.name).order_by(models.ContributionLanguage.name).all()
    return [row[0] for row in results]

def search_contributions(db: Session, company_id: int, skip: int, limit: int, **kwargs) -> dict:
    print(f"\n--- [DEBUG] Starting search_contributions ---")
    print(f"[DEBUG] Params: skip={skip}, limit={limit}, filters={kwargs}")

    unlocked_subquery = sa.select(models.UnlockedContribution.contribution_id).filter(models.UnlockedContribution.company_id == company_id)
    
    query = db.query(
        models.Contribution,
        case((models.Contribution.id.in_(unlocked_subquery), True), else_=False).label("is_unlocked")
    ).filter(models.Contribution.status == "PROCESSED")

    all_matching_results = query.order_by(models.Contribution.created_at.desc()).all()
    print(f"[DEBUG] Fetched {len(all_matching_results)} total processed records from DB before Python filtering.")

    filtered_previews = []
    for i, (contrib, is_unlocked) in enumerate(all_matching_results):
        print(f"\n[DEBUG] --- Python Processing record {i+1} (ID: {contrib.id}) ---")
        
        raw_details = contrib.valuation_results
        
        details = raw_details
        try:
            while isinstance(details, str):
                details = json.loads(details)
        except json.JSONDecodeError as e:
            print(f"[DEBUG] ERROR: JSON decoding failed for record {contrib.id}. Skipping. Error: {e}")
            continue
        
        if not isinstance(details, dict):
            print(f"[DEBUG] SKIPPING record {contrib.id}: Parsed data is not a dictionary.")
            continue
        
        analysis_summary = details.get("analysis_summary")
        if isinstance(analysis_summary, str):
            analysis_summary = html.unescape(analysis_summary)
            print(f"[DEBUG] Unescaped summary for ID {contrib.id}: {analysis_summary[:100]}...")
        
        keywords_to_search = kwargs.get('keywords')
        if keywords_to_search:
            if not analysis_summary:
                print(f"[DEBUG] SKIPPING record {contrib.id}: No summary to search for keywords.")
                continue
            
            all_keywords_found = all(
                keyword.lower() in analysis_summary.lower() 
                for keyword in keywords_to_search.split()
            )
            if not all_keywords_found:
                print(f"[DEBUG] SKIPPING record {contrib.id}: Did not match all keywords.")
                continue

        languages_to_search = kwargs.get('languages')
        if languages_to_search:
            lang_breakdown = details.get("language_breakdown", {})
            if not lang_breakdown:
                print(f"[DEBUG] SKIPPING record {contrib.id}: No language breakdown to search.")
                continue

            found_lang = any(
                search_lang.lower() == existing_lang.lower()
                for search_lang in languages_to_search
                for existing_lang in lang_breakdown.keys()
            )
            if not found_lang:
                print(f"[DEBUG] SKIPPING record {contrib.id}: Did not match any language.")
                continue

        if kwargs.get('min_tokens') is not None and details.get('total_tokens', 0) < kwargs['min_tokens']:
            print(f"[DEBUG] SKIPPING record {contrib.id}: Fails min_tokens.")
            continue
        if kwargs.get('max_tokens') is not None and details.get('total_tokens', 0) > kwargs['max_tokens']:
            print(f"[DEBUG] SKIPPING record {contrib.id}: Fails max_tokens.")
            continue
        if kwargs.get('min_clarity') is not None and (details.get('project_clarity_score', 0) or 0) * 10 < kwargs['min_clarity']:
            print(f"[DEBUG] SKIPPING record {contrib.id}: Fails min_clarity.")
            continue
        if kwargs.get('min_arch') is not None and (details.get('architectural_quality_score', 0) or 0) * 10 < kwargs['min_arch']:
            print(f"[DEBUG] SKIPPING record {contrib.id}: Fails min_arch.")
            continue
        if kwargs.get('min_quality') is not None and (details.get('code_quality_score', 0) or 0) * 10 < kwargs['min_quality']:
            print(f"[DEBUG] SKIPPING record {contrib.id}: Fails min_quality.")
            continue
        
        first_lang = next(iter(details.get("language_breakdown", {"Unknown": 0})), "Unknown")
        
        files_preview = [{"path": "Full Project Preview", "content": "\n".join(contrib.raw_content.splitlines()[:50])}]
        
        filtered_previews.append({
            "id": contrib.id, "created_at": contrib.created_at, "language": first_lang,
            "tokens": details.get("total_tokens", 0),
            "clarity_score": (details.get("project_clarity_score", 0) or 0) * 10,
            "arch_score": (details.get("architectural_quality_score", 0) or 0) * 10,
            "quality_score": (details.get("code_quality_score", 0) or 0) * 10,
            "is_unlocked": is_unlocked,
            "is_open_source": details.get("is_open_source", False),
            "analysis_summary": analysis_summary or "AI analysis summary is not available for this contribution.",
            "files_preview": files_preview,
            "language_breakdown": details.get("language_breakdown", {})
        })
        print(f"[DEBUG] Record {contrib.id} PASSED all filters.")

    total = len(filtered_previews)
    print(f"[DEBUG] Total previews after Python filtering: {total}")

    paginated_previews = filtered_previews[skip : skip + limit]
    print(f"[DEBUG] Returning {len(paginated_previews)} previews for this page.")
    print(f"--- [DEBUG] Ending search_contributions ---\n")
    return {"items": paginated_previews, "total": total}

def unlock_contribution(db: Session, company_id: int, contribution_id: int, api_key_id: Optional[int] = None) -> models.Contribution:
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    contribution = db.query(models.Contribution).filter(models.Contribution.id == contribution_id).first()

    if not company or not contribution:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    
    is_unlocked = db.query(models.UnlockedContribution).filter_by(company_id=company_id, contribution_id=contribution_id).first()
    if is_unlocked:
        return contribution

    details = contribution.valuation_results
    while isinstance(details, str):
        details = json.loads(details)
    
    token_cost = details.get("total_tokens", 0)
    
    if company.token_balance < token_cost:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="Insufficient token balance")

    company.token_balance -= token_cost
    
    new_unlock = models.UnlockedContribution(company_id=company_id, contribution_id=contribution_id)
    db.add(new_unlock)

    usage_event = models.ApiKeyUsageEvent(
        api_key_id=api_key_id,
        company_id=company_id,
        tokens_used=token_cost
    )
    db.add(usage_event)

    db.commit()
    db.refresh(company)

    return contribution

def unlock_all_contributions_for_company(db: Session, company_id: int):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise ValueError("Company not found")

    unlocked_subquery = sa.select(models.UnlockedContribution.contribution_id).filter(
        models.UnlockedContribution.company_id == company_id
    )
    
    contributions_to_unlock = db.query(models.Contribution).filter(
        models.Contribution.status == "PROCESSED",
        ~models.Contribution.id.in_(unlocked_subquery)
    ).all()

    if not contributions_to_unlock:
        return {"message": "All available contributions are already unlocked."}

    total_cost = 0
    for contrib in contributions_to_unlock:
        details = contrib.valuation_results
        while isinstance(details, str):
            details = json.loads(details)
        total_cost += details.get("total_tokens", 0)

    if company.token_balance < total_cost:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=f"Insufficient token balance. Required: {total_cost}, Available: {company.token_balance}")

    company.token_balance -= total_cost
    
    for contrib in contributions_to_unlock:
        new_unlock = models.UnlockedContribution(company_id=company_id, contribution_id=contrib.id)
        db.add(new_unlock)
        
        details = contrib.valuation_results
        while isinstance(details, str):
            details = json.loads(details)
        token_cost = details.get("total_tokens", 0)

        usage_event = models.ApiKeyUsageEvent(
            api_key_id=None,
            company_id=company_id,
            tokens_used=token_cost
        )
        db.add(usage_event)
        
    db.commit()

def get_unlocked_contribution_content(db: Session, company_id: int, contribution_id: int) -> Optional[models.Contribution]:
    unlocked = db.query(models.UnlockedContribution).filter_by(company_id=company_id, contribution_id=contribution_id).first()
    if unlocked:
        return unlocked.contribution
    return None

def get_dashboard_stats(db: Session, company_id: int):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    active_api_key_count = db.query(models.ApiKey).filter(
        models.ApiKey.company_id == company_id, models.ApiKey.is_active == True
    ).count()

    team_member_count = db.query(models.BusinessUser).filter(
        models.BusinessUser.company_id == company_id
    ).count()

    return {
        "token_balance": company.token_balance,
        "current_plan": company.plan,
        "active_api_key_count": active_api_key_count,
        "team_member_count": team_member_count
    }

def get_api_key_usage_summary(db: Session, company_id: int, start_date: datetime) -> List[Dict]:
    results = db.query(
        models.ApiKey.name,
        models.ApiKey.key_prefix,
        models.ApiKey.is_active,
        func.sum(models.ApiKeyUsageEvent.tokens_used).label('total_tokens')
    ).join(models.ApiKeyUsageEvent, models.ApiKey.id == models.ApiKeyUsageEvent.api_key_id)\
    .filter(
        models.ApiKey.company_id == company_id,
        models.ApiKeyUsageEvent.created_at >= start_date
    ).group_by(models.ApiKey.id).order_by(desc('total_tokens')).all()
    
    all_keys = db.query(models.ApiKey).filter(models.ApiKey.company_id == company_id).all()
    
    usage_map = {res.key_prefix: res.total_tokens for res in results}
    
    summary = []
    for key in all_keys:
        summary.append({
            "name": key.name,
            "key_prefix": key.key_prefix,
            "is_active": key.is_active,
            "total_tokens": usage_map.get(key.key_prefix, 0)
        })

    return sorted(summary, key=lambda x: x['total_tokens'], reverse=True)

def get_usage_stats_by_day(db: Session, company_id: int, start_date: datetime):
    results = db.query(
        func.date(models.ApiKeyUsageEvent.created_at).label('date'),
        func.sum(models.ApiKeyUsageEvent.tokens_used).label('total_tokens')
    ).filter(
        models.ApiKeyUsageEvent.company_id == company_id,
        models.ApiKeyUsageEvent.created_at >= start_date
    ).group_by(
        func.date(models.ApiKeyUsageEvent.created_at)
    ).order_by(
        func.date(models.ApiKeyUsageEvent.created_at)
    ).all()
    return [{"date": row.date, "tokens_used": row.total_tokens} for row in results]

def get_recently_unlocked_contributions(db: Session, company_id: int, limit: int = 5):
    results = db.query(models.UnlockedContribution)\
        .join(models.Contribution)\
        .filter(models.UnlockedContribution.company_id == company_id)\
        .order_by(models.UnlockedContribution.unlocked_at.desc())\
        .limit(limit).all()
    
    details = []
    for unlock in results:
        contrib = unlock.contribution
        valuation = contrib.valuation_results
        while isinstance(valuation, str):
            valuation = json.loads(valuation)
        
        details.append({
            "id": contrib.id,
            "unlocked_at": unlock.unlocked_at,
            "language": next(iter(valuation.get("language_breakdown", {"Unknown": 0})), "Unknown"),
            "tokens": valuation.get("total_tokens", 0),
            "quality_score": (valuation.get("code_quality_score", 0) or 0) * 10
        })
    return details

def get_team_members(db: Session, company_id: int):
    return db.query(models.BusinessUser).filter(models.BusinessUser.company_id == company_id).order_by(models.BusinessUser.created_at).all()

def create_invited_business_user(db: Session, invite_data: business_schemas.InviteCreate, company: models.Company):
    temp_password = secrets.token_urlsafe(16)
    hashed_password = security.get_password_hash(temp_password)

    db_user = models.BusinessUser(
        email=invite_data.email,
        hashed_password=hashed_password,
        full_name=invite_data.full_name,
        role=invite_data.role,
        company_id=company.id,
        is_verified=True 
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def remove_team_member(db: Session, user_id: int, company_id: int):
    user_to_delete = db.query(models.BusinessUser).filter(
        models.BusinessUser.id == user_id,
        models.BusinessUser.company_id == company_id
    ).first()
    
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="Team member not found in this company.")
    
    db.delete(user_to_delete)
    db.commit()

def update_company_profile(db: Session, company: models.Company, company_data: business_schemas.CompanyUpdate):
    update_data = company_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(company, key, value)
    db.add(company)
    db.commit()
    db.refresh(company)
    return company

def update_business_user_profile(db: Session, user: models.BusinessUser, user_data: business_schemas.BusinessUserUpdate):
    update_data = user_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_api_key_last_used(db: Session, api_key_id: int):
    db.query(models.ApiKey).filter(models.ApiKey.id == api_key_id).update({"last_used_at": datetime.now(timezone.utc)})
    db.commit()

def create_team_invitation(db: Session, company: models.Company, email: str) -> models.TeamInvitation:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=3)
    
    invitation = models.TeamInvitation(
        company_id=company.id,
        email=email,
        token=token,
        status='pending',
        expires_at=expires_at
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    return invitation

def get_pending_invitations_for_user(db: Session, user: models.BusinessUser) -> List[Dict]:
    invitations = db.query(models.TeamInvitation).filter(
        models.TeamInvitation.email == user.email,
        models.TeamInvitation.status == 'pending',
        models.TeamInvitation.expires_at > datetime.now(timezone.utc)
    ).all()

    results = []
    for inv in invitations:
        inviter = db.query(models.BusinessUser).filter(
            models.BusinessUser.company_id == inv.company_id,
            models.BusinessUser.role == 'admin'
        ).first()
        results.append({
            "token": inv.token,
            "company_name": inv.company.name,
            "invited_by_name": inviter.full_name if inviter else "An admin",
            "expires_at": inv.expires_at
        })
    return results


def accept_invitation(db: Session, user: models.BusinessUser, token: str) -> models.BusinessUser:
    invitation = db.query(models.TeamInvitation).filter(
        models.TeamInvitation.token == token,
        models.TeamInvitation.status == 'pending',
        models.TeamInvitation.expires_at > datetime.now(timezone.utc)
    ).first()

    if not invitation or invitation.email != user.email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found or invalid.")

    current_company = user.company
    if current_company:
        member_count = db.query(models.BusinessUser).filter(models.BusinessUser.company_id == current_company.id).count()
        if member_count > 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot accept invitation. You are already part of a team. Please leave your current team first.")

    old_company = user.company
    user.company_id = invitation.company_id
    user.role = 'member'
    invitation.status = 'accepted'
    
    db.add(user)
    db.add(invitation)
    db.commit()

    if old_company:
        db.delete(old_company)
        db.commit()
    
    db.refresh(user)
    return user


def decline_invitation(db: Session, user: models.BusinessUser, token: str):
    invitation = db.query(models.TeamInvitation).filter(
        models.TeamInvitation.token == token,
        models.TeamInvitation.status == 'pending',
        models.TeamInvitation.expires_at > datetime.now(timezone.utc)
    ).first()

    if not invitation or invitation.email != user.email:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found or invalid.")

    invitation.status = 'declined'
    db.add(invitation)
    db.commit()