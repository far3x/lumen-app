import pyotp
import json
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import database, crud, models
from app.api.v1 import dependencies
from app.schemas import TwoFactorSetupResponse, TwoFactorEnableRequest, TwoFactorDisableRequest
from app.services.encryption import encryption_service
from app.core import security

router = APIRouter(prefix="/security", tags=["Security"])

@router.post("/2fa/setup", response_model=TwoFactorSetupResponse)
async def setup_2fa(current_user: models.User = Depends(dependencies.get_current_user)):
    if current_user.is_two_factor_enabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="2FA is already enabled.")
    
    setup_key = pyotp.random_base32()
    provisioning_uri = pyotp.totp.TOTP(setup_key).provisioning_uri(
        name=current_user.email,
        issuer_name="Lumen Protocol"
    )
    
    return TwoFactorSetupResponse(provisioning_uri=provisioning_uri, setup_key=setup_key)

@router.post("/2fa/enable")
async def enable_2fa(request: TwoFactorEnableRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    totp = pyotp.TOTP(request.setup_key)
    if not totp.verify(request.token):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid 2FA token.")
    
    backup_codes = [f"{secrets.token_hex(4)}-{secrets.token_hex(4)}" for _ in range(10)]
    encrypted_backup_codes = encryption_service.encrypt(json.dumps(backup_codes))

    current_user.two_factor_secret = encryption_service.encrypt(request.setup_key)
    current_user.is_two_factor_enabled = True
    current_user.two_factor_backup_codes = encrypted_backup_codes
    db.commit()

    return {"backup_codes": backup_codes}

@router.post("/2fa/disable")
async def disable_2fa(request: TwoFactorDisableRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    if not current_user.hashed_password or not security.verify_password(request.password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password.")
        
    current_user.two_factor_secret = None
    current_user.is_two_factor_enabled = False
    current_user.two_factor_backup_codes = None
    db.commit()

    return {"message": "2FA has been disabled."}