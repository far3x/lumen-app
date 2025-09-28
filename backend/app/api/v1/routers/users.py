from fastapi import APIRouter, Depends, HTTPException, Query, status, Request, Response, BackgroundTasks
from sqlalchemy.orm import Session
import json
import secrets
import tiktoken
from datetime import timedelta, datetime, timezone
from pathlib import Path
from authlib.integrations.starlette_client import OAuth
from solders.pubkey import Pubkey
from solders.message import Message
from nacl.signing import VerifyKey
import nacl.exceptions
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

from app.db import crud, models, database
from app.api.v1 import dependencies
from app.schemas import User as UserSchema, AccountDetails, ContributionResponse, UserUpdate, ValuationMetrics, AiAnalysis, ChangePasswordRequest, WalletLinkRequest, BatchPayoutResponse, SetWalletAddressRequest, UserDeletePayload, LeaderboardEntry, ContributionCreate
from pydantic import BaseModel
from typing import List, Optional
from app.core import security, config
from app.core.limiter import limiter
from app.tasks import process_contribution

class PaginatedContributions(BaseModel):
    items: List[ContributionResponse]
    total: int

router = APIRouter(prefix="/users", tags=["Users"])

mail_conf = ConnectionConfig(
    MAIL_USERNAME=config.settings.MAIL_USERNAME,
    MAIL_PASSWORD=config.settings.MAIL_PASSWORD,
    MAIL_FROM=config.settings.MAIL_FROM,
    MAIL_PORT=config.settings.MAIL_PORT,
    MAIL_SERVER=config.settings.MAIL_SERVER,
    MAIL_FROM_NAME=config.settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=config.settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=config.settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER=Path(__file__).parent.parent.parent.parent / 'templates'
)

oauth = OAuth()
oauth.register( name='github', client_id=config.settings.GITHUB_CLIENT_ID, client_secret=config.settings.GITHUB_CLIENT_SECRET, access_token_url='https://github.com/login/oauth/access_token', authorize_url='https://github.com/login/oauth/authorize', api_base_url='https://api.github.com/', client_kwargs={'scope': 'user:email'} )

try:
    tokenizer = tiktoken.get_encoding("cl100k_base")
except Exception:
    tokenizer = None

@router.post("/me/contribute/web", status_code=status.HTTP_202_ACCEPTED, dependencies=[Depends(dependencies.verify_beta_access)])
@limiter.limit("5/day")
async def contribute_data_from_web(
    request: Request,
    payload: ContributionCreate,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db)
):
    one_day_ago = datetime.now(timezone.utc) - timedelta(days=1)

    counted_statuses = [
        'PENDING', 'PROCESSING', 'PROCESSED'
    ]
    
    contributions_in_last_24h = db.query(models.Contribution).filter(
        models.Contribution.user_id == current_user.id,
        models.Contribution.status.in_(counted_statuses),
        models.Contribution.created_at >= one_day_ago
    ).count()

    if contributions_in_last_24h >= 3:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="You have reached your daily limit of 3 successful or pending contributions (from web or CLI)."
        )

    if tokenizer:
        token_count = len(tokenizer.encode(payload.codebase))
        if token_count > 700_000:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Payload is too large. The request is not allowed."
            )

    new_contribution = crud.create_contribution_record(
        db,
        user=current_user,
        codebase=payload.codebase,
        valuation_results={},
        reward=0.0,
        embedding=None,
        initial_status="PENDING",
        source='web'
    )

    process_contribution.delay(current_user.id, new_contribution.id)

    return {"message": "Contribution received and is being processed.", "contribution_id": new_contribution.id}


@router.get("/me", response_model=UserSchema)
@limiter.limit("60/minute")
async def read_users_me(request: Request, current_user: models.User = Depends(dependencies.get_current_user)):
    has_beta_access = True
    waitlist_position = None

    if config.settings.BETA_MODE_ENABLED:
        if current_user.id > config.settings.BETA_MAX_USERS:
            has_beta_access = False
            waitlist_position = current_user.id - config.settings.BETA_MAX_USERS
    
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "display_name": current_user.display_name,
        "is_in_leaderboard": current_user.is_in_leaderboard,
        "is_verified": current_user.is_verified,
        "is_two_factor_enabled": current_user.is_two_factor_enabled,
        "has_password": current_user.has_password,
        "github_id": current_user.github_id,
        "solana_address": current_user.solana_address,
        "has_beta_access": has_beta_access,
        "waitlist_position": waitlist_position,
        "reward_multiplier": current_user.reward_multiplier,
    }
    return UserSchema(**user_data)

@router.get("/me/rank", response_model=Optional[LeaderboardEntry])
@limiter.limit("60/minute")
async def get_my_rank(
    request: Request, 
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db)
):
    if not current_user.is_verified:
        return None
        
    user_rank_data = crud.get_user_rank(db, user_id=current_user.id)
    if user_rank_data:
        return LeaderboardEntry(
            rank=user_rank_data.rank,
            display_name=user_rank_data.display_name,
            total_usd_earned=user_rank_data.total_usd_earned
        )
    return None

@router.put("/me", response_model=UserSchema, dependencies=[Depends(dependencies.verify_beta_access)])
@limiter.limit("15/hour")
async def update_users_me(
    request: Request,
    user_update: UserUpdate,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db)
):
    updated_user = crud.update_user_profile(db, current_user, user_update)
    return updated_user

@router.post("/me/request-deletion", status_code=status.HTTP_200_OK, dependencies=[Depends(dependencies.verify_beta_access)])
@limiter.limit("3/day")
async def request_account_deletion(
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.has_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Accounts with a password must use password confirmation to delete.")
    if not current_user.email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot send deletion link, no email associated with this account.")

    expires = timedelta(hours=1)
    token = secrets.token_urlsafe(32)
    
    current_user.deletion_token = token
    expires_at = datetime.now(timezone.utc) + expires
    current_user.deletion_token_expires = expires_at.timestamp()
    
    db.add(current_user)
    db.commit()

    deletion_link = f"{config.settings.FRONTEND_URL}/app/dashboard?tab=settings&action=confirm-delete&token={token}"
    
    template_body = {
        "deletion_link": deletion_link,
        "year": datetime.now().year,
        "logo_url": config.settings.PUBLIC_LOGO_URL
    }

    message = MessageSchema(
        subject="Lumen Protocol: Confirm Account Deletion",
        recipients=[current_user.email],
        template_body=template_body,
        subtype="html"
    )
    
    fm = FastMail(mail_conf)
    background_tasks.add_task(fm.send_message, message, template_name="account_deletion_email.html")
    
    return {"message": "A confirmation link to delete your account has been sent to your email."}


@router.delete("/me", status_code=status.HTTP_200_OK, dependencies=[Depends(dependencies.verify_beta_access)])
@limiter.limit("5/day")
async def delete_users_me(
    response: Response,
    request: Request,
    payload: UserDeletePayload,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db)
):
    is_valid = False
    if current_user.has_password:
        if payload.password and security.verify_password(payload.password, current_user.hashed_password):
            is_valid = True
    elif payload.token:
        current_timestamp = datetime.now(timezone.utc).timestamp()
        if (current_user.deletion_token == payload.token and 
            current_user.deletion_token_expires and 
            current_user.deletion_token_expires >= current_timestamp):
            is_valid = True
            current_user.deletion_token = None
            current_user.deletion_token_expires = None
            db.add(current_user)
            db.commit()

    if not is_valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials or token for deletion.")

    crud.delete_user(db, user=current_user)

    response.delete_cookie("access_token")
    response.delete_cookie("is_logged_in")
    
    return {"message": "Your account has been successfully deleted."}

@router.post("/me/change-password", dependencies=[Depends(dependencies.verify_beta_access)])
@limiter.limit("3/day")
async def change_password(
    request: Request,
    payload: ChangePasswordRequest,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db)
):
    if not current_user.hashed_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change password for accounts created with OAuth.")

    if not security.verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect current password.")
    
    current_user.hashed_password = security.get_password_hash(payload.new_password)
    db.add(current_user)
    db.commit()
    return {"message": "Password updated successfully. Please log in again."}

@router.post("/me/link-wallet", response_model=UserSchema, dependencies=[Depends(dependencies.verify_beta_access)])
@limiter.limit("5/hour")
async def link_wallet(
    request: Request,
    payload: WalletLinkRequest,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db)
):
    try:
        pubkey = Pubkey.from_string(payload.solana_address)
        signature_bytes = bytes.fromhex(payload.signature)
        message_bytes = payload.message.encode('utf-8')

        verify_key = VerifyKey(bytes(pubkey))
        verify_key.verify(message_bytes, signature_bytes)

    except nacl.exceptions.BadSignatureError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Signature verification failed.")
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload format.")
    
    existing_user = db.query(models.User).filter(models.User.solana_address == payload.solana_address).first()
    if existing_user and existing_user.id != current_user.id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This wallet is already linked to another account.")
        
    current_user.solana_address = payload.solana_address
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.post("/me/set-wallet-address", response_model=UserSchema, dependencies=[Depends(dependencies.verify_beta_access)])
@limiter.limit("5/hour")
async def set_wallet_address_manually(
    request: Request,
    payload: SetWalletAddressRequest,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db)
):
    try:
        Pubkey.from_string(payload.solana_address)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Solana address format.")

    existing_user = db.query(models.User).filter(models.User.solana_address == payload.solana_address).first()
    if existing_user and existing_user.id != current_user.id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This wallet address is already linked to another account.")
    
    current_user.solana_address = payload.solana_address
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me/balance", response_model=AccountDetails, dependencies=[Depends(dependencies.verify_beta_access)])
@limiter.limit("60/minute")
def get_my_balance(
    request: Request,
    current_user: models.User = Depends(dependencies.get_current_user), 
    db: Session = Depends(database.get_db)
):
    account_details = crud.get_account_details(db, user_id=current_user.id)
    if not account_details:
        raise HTTPException(status_code=404, detail="Account not found")
    return account_details

@router.get("/me/contributions/all", response_model=List[ContributionResponse], dependencies=[Depends(dependencies.verify_beta_access)])
@limiter.limit("10/minute")
def get_my_all_contributions(
    request: Request,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db)
):
    contributions = crud.get_all_user_contributions(db, user_id=current_user.id)
    
    response_list = []
    for contrib in contributions:
        valuation_data = {}
        if contrib.valuation_results:
            data = contrib.valuation_results
            if isinstance(data, str):
                try: data = json.loads(data)
                except (json.JSONDecodeError, TypeError): data = {}
            if isinstance(data, str):
                try: data = json.loads(data)
                except (json.JSONDecodeError, TypeError): data = {}
            if isinstance(data, dict):
                valuation_data = data
        
        manual_metrics = ValuationMetrics(
            total_lloc=valuation_data.get('total_lloc', 0),
            total_tokens=valuation_data.get('total_tokens', 0),
            avg_complexity=valuation_data.get('avg_complexity', 0.0),
            compression_ratio=valuation_data.get('compression_ratio', 0.0),
            language_breakdown=valuation_data.get('language_breakdown', {})
        )
        
        ai_analysis = AiAnalysis(
            project_clarity_score=valuation_data.get('project_clarity_score', 0.0),
            architectural_quality_score=valuation_data.get('architectural_quality_score', 0.0),
            code_quality_score=valuation_data.get('code_quality_score', 0.0),
            analysis_summary=valuation_data.get('analysis_summary')
        )

        is_open_source = valuation_data.get('is_open_source', False)

        response_list.append(ContributionResponse(
            id=contrib.id,
            created_at=contrib.created_at,
            reward_amount=contrib.reward_amount,
            status=contrib.status,
            valuation_details=valuation_data,
            manual_metrics=manual_metrics,
            ai_analysis=ai_analysis,
            is_open_source=is_open_source
        ))
    
    return response_list

@router.get("/me/contributions", response_model=PaginatedContributions, dependencies=[Depends(dependencies.verify_beta_access)])
@limiter.limit("30/minute")
def get_my_contributions(
    request: Request,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100)
):
    contributions, total_count = crud.get_user_contributions_paginated(db, user_id=current_user.id, skip=skip, limit=limit)
    
    response_list = []
    for contrib in contributions:
        valuation_data = {}
        if contrib.valuation_results:
            data = contrib.valuation_results
            if isinstance(data, str):
                try: data = json.loads(data)
                except (json.JSONDecodeError, TypeError): data = {}
            if isinstance(data, str):
                try: data = json.loads(data)
                except (json.JSONDecodeError, TypeError): data = {}
            if isinstance(data, dict):
                valuation_data = data
        
        manual_metrics = ValuationMetrics(
            total_lloc=valuation_data.get('total_lloc', 0),
            total_tokens=valuation_data.get('total_tokens', 0),
            avg_complexity=valuation_data.get('avg_complexity', 0.0),
            compression_ratio=valuation_data.get('compression_ratio', 0.0),
            language_breakdown=valuation_data.get('language_breakdown', {})
        )
        
        ai_analysis = AiAnalysis(
            project_clarity_score=valuation_data.get('project_clarity_score', 0.0),
            architectural_quality_score=valuation_data.get('architectural_quality_score', 0.0),
            code_quality_score=valuation_data.get('code_quality_score', 0.0),
            analysis_summary=valuation_data.get('analysis_summary')
        )

        is_open_source = valuation_data.get('is_open_source', False)

        response_list.append(ContributionResponse(
            id=contrib.id,
            created_at=contrib.created_at,
            reward_amount=contrib.reward_amount,
            status=contrib.status,
            valuation_details=valuation_data,
            manual_metrics=manual_metrics,
            ai_analysis=ai_analysis,
            is_open_source=is_open_source
        ))
    
    return PaginatedContributions(items=response_list, total=total_count)

@router.get("/me/payouts", response_model=List[BatchPayoutResponse], dependencies=[Depends(dependencies.verify_beta_access)])
@limiter.limit("30/minute")
def get_my_payouts(
    request: Request,
    current_user: models.User = Depends(dependencies.get_current_user),
    db: Session = Depends(database.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100)
):
    payouts = db.query(models.BatchPayout).filter(models.BatchPayout.user_id == current_user.id).order_by(models.BatchPayout.created_at.desc()).offset(skip).limit(limit).all()
    return payouts

@router.get('/link-oauth/{provider}', dependencies=[Depends(dependencies.verify_beta_access)])
async def link_oauth_account(
    request: Request,
    provider: str,
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if provider not in ['github']:
        raise HTTPException(status_code=404, detail="Provider not found")

    request.session['oauth_link_user_id'] = current_user.id
    
    redirect_uri = request.url_for('auth_callback', provider=provider)
    return await oauth.create_client(provider).authorize_redirect(request, redirect_uri)
