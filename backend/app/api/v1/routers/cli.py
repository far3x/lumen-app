import secrets
import hashlib
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status, Request
from sqlalchemy.orm import Session
from app.core import config
from app.db import database, crud, models
from app.db.database import SessionLocal
from app.schemas import DeviceAuthResponse, Token, ContributionCreate, ContributionStatus
from app.services.redis_service import redis_service
from app.api.v1 import dependencies
from app.tasks import process_contribution
from app.core.limiter import limiter

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


@router.post("/device-auth", response_model=DeviceAuthResponse)
async def cli_device_auth():
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

@router.post("/token", response_model=Token)
async def cli_token(device_code: str):
    device_code_key = f"device_flow:device_code:{device_code}"
    pat = redis_service.get(device_code_key)

    if not pat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization pending, code expired, or invalid device code."
        )
    
    redis_service.delete(device_code_key)

    return Token(access_token=pat, token_type="bearer")

@router.post("/handshake", response_model=str)
async def cli_handshake(
    current_user: models.User = Depends(dependencies.get_current_user_from_pat)
):
    challenge = secrets.token_hex(16)
    challenge_key = f"challenge:{current_user.id}"
    redis_service.set_with_ttl(challenge_key, challenge, ttl_seconds=60)
    return challenge

@router.post(
    "/contribute",
    status_code=status.HTTP_202_ACCEPTED
)
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
    
    new_contribution = crud.create_contribution_record(
        db, 
        user=current_user, 
        codebase=payload.codebase, 
        valuation_results={},
        reward=0.0,
        embedding=None,
        initial_status="PENDING"
    )
    
    task = process_contribution.delay(current_user.id, payload.codebase, new_contribution.id)
    redis_service.set_with_ttl(f"task_status:{task.id}", "PENDING", 3600)
    redis_service.set_with_ttl(f"contribution_task_map:{new_contribution.id}", task.id, 3600)

    return {"message": "Contribution received and is being processed.", "contribution_id": new_contribution.id, "task_id": task.id}

@router.get("/contributions/{contribution_id}/status", response_model=ContributionStatus)
async def get_contribution_status(
    contribution_id: int,
    db: Session = Depends(database.get_db)
):
    contribution = crud.get_contribution_by_id(db, contribution_id)
    if not contribution:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contribution not found.")
    
    task_id = redis_service.get(f"contribution_task_map:{contribution_id}")
    if task_id:
        celery_task_status = redis_service.get(f"task_status:{task_id}")
        if celery_task_status:
            return ContributionStatus(
                status=celery_task_status,
                contribution_id=contribution_id,
                message=f"Processing status: {celery_task_status}"
            )

    return ContributionStatus(
        status=contribution.status,
        contribution_id=contribution_id,
        message=f"Current database status: {contribution.status}"
    )