import secrets
import time
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.core import config
from app.db import database, crud, models
from app.schemas import DeviceAuthResponse, Token, ContributionCreate
from app.services.redis_service import redis_service
from app.api.v1 import dependencies

router = APIRouter(prefix="/cli", tags=["CLI"])

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

def dummy_reward_task(db: Session, user_id: int, codebase: str):
    print(f"Received contribution from user {user_id}. Code length: {len(codebase)}")
    time.sleep(5)
    user = crud.get_user(db, user_id)
    crud.update_balance_for_contribution(db, user, file_size_kb=len(codebase)/1024)
    print(f"Finished processing for user {user_id}")

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
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(dependencies.verify_contribution_signature)]
)
async def contribute_data(
    payload: ContributionCreate,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(dependencies.get_current_user_from_pat)
):
    challenge_key = f"challenge:{current_user.id}"
    redis_service.delete(challenge_key)
    
    db = database.SessionLocal()
    try:
        background_tasks.add_task(dummy_reward_task, db, current_user.id, payload.codebase)
    finally:
        pass
    
    return {"message": "Contribution received and is being processed."}