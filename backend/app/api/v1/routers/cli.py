import secrets
import hashlib
import tiktoken
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core import config
from app.db import database, crud, models
from app.db.database import SessionLocal
from app.schemas import DeviceAuthResponse, Token, ContributionCreate, ContributionStatus, ContributionCliResponse
from app.services.redis_service import redis_service
from app.api.v1 import dependencies
from app.tasks import process_contribution
from app.core.limiter import limiter
from typing import List, Optional
from datetime import datetime, timezone

router = APIRouter(prefix="/cli", tags=["CLI"])

def get_user_id_from_pat_for_rate_limit(request: Request) -> str:
    auth_header = request.headers.get("authorization")
    
    if not auth_header or not auth_header.lower().startswith("bearer "):
        return request.client.host

    pat = auth_header.split(" ")[1]
    if not pat.startswith("lum_pat_"):
        return request.client.host

    hashed_token = hashlib.sha256(pat.encode()).hexdigest()

    db = SessionLocal()
    try:
        token_obj = db.query(models.PersonalAccessToken).filter(models.PersonalAccessToken.token_hash == hashed_token).first()
        if token_obj and token_obj.user:
            return str(token_obj.user.id)
    finally:
        db.close()
    
    return request.client.host

def get_cooldown_user_key_from_pat(request: Request) -> Optional[str]:
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        return None
    pat = auth_header.split(" ")[1]
    if not pat.startswith("lum_pat_"):
        return None

    db = SessionLocal()
    try:
        user = crud.get_user_by_pat(db, pat)
        if user and user.cooldown_until and datetime.now(timezone.utc) < user.cooldown_until:
            return str(user.id)
    finally:
        db.close()
    return None

@router.post("/device-auth", response_model=DeviceAuthResponse)
@limiter.limit("10/minute")
async def cli_device_auth(request: Request):
    user_code = "".join(secrets.choice("BCDFGHJKLMNPQRSTVWXYZ") for _ in range(8))
    user_code = f"{user_code[:4]}-{user_code[4:]}"
    device_code = secrets.token_urlsafe(32)
    
    user_code_key = f"device_flow:user_code:{user_code}"
    redis_service.set_with_ttl(user_code_key, device_code, ttl_seconds=600)

    verification_uri = f"{config.settings.FRONTEND_URL}/link"

    return DeviceAuthResponse(
        device_code=device_code,
        user_code=user_code,
        verification_uri=verification_uri,
        expires_in=600,
        interval=5
    )

@router.post("/handshake", response_model=str)
@limiter.limit("60/minute", key_func=get_user_id_from_pat_for_rate_limit)
async def cli_handshake(
    request: Request,
    current_user: models.User = Depends(dependencies.get_current_user_from_pat)
):
    challenge = secrets.token_hex(16)
    challenge_key = f"challenge:{current_user.id}"
    redis_service.set_with_ttl(challenge_key, challenge, ttl_seconds=60)
    return challenge

try:
    tokenizer = tiktoken.get_encoding("cl100k_base")
except Exception:
    tokenizer = None

@router.post("/contribute", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("1/day", key_func=get_cooldown_user_key_from_pat)
@limiter.limit("5/day", key_func=get_user_id_from_pat_for_rate_limit)
async def contribute_data(
    request: Request,
    payload: ContributionCreate,
    current_user: models.User = Depends(dependencies.get_current_user_from_pat),
    signature_check: None = Depends(dependencies.verify_contribution_signature),
    db: Session = Depends(database.get_db)
):
    challenge_key = f"challenge:{current_user.id}"
    redis_service.delete(challenge_key)

    if tokenizer:
        token_count = len(tokenizer.encode(payload.codebase))
        if token_count > 700_000:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Payload is too large. The request is not allowed."
            )
    
    new_contribution = crud.create_contribution_record(
        db, 
        user=current_user, 
        codebase=payload.codebase, 
        valuation_results={},
        reward=0.0,
        embedding=None,
        initial_status="PENDING"
    )
    
    process_contribution.delay(current_user.id, payload.codebase, new_contribution.id)

    return {"message": "Contribution received and is being processed.", "contribution_id": new_contribution.id}

@router.get("/contributions/{contribution_id}/status", response_model=ContributionStatus)
@limiter.limit("30/minute", key_func=get_user_id_from_pat_for_rate_limit)
async def get_contribution_status(
    request: Request,
    contribution_id: int,
    db: Session = Depends(database.get_db)
):
    contribution = crud.get_contribution_by_id(db, contribution_id)
    if not contribution:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contribution not found.")
    
    return ContributionStatus(
        status=contribution.status,
        contribution_id=contribution_id,
        message=f"Current database status: {contribution.status}"
    )

@router.get("/contributions/history", response_model=List[ContributionCliResponse])
@limiter.limit("30/minute", key_func=get_user_id_from_pat_for_rate_limit)
async def get_contribution_history(
    request: Request,
    current_user: models.User = Depends(dependencies.get_current_user_from_pat),
    db: Session = Depends(database.get_db)
):
    contributions, _ = crud.get_user_contributions_paginated(db, user_id=current_user.id, skip=0, limit=10)
    return contributions