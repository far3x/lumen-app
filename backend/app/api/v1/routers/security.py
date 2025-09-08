import pyotp
import json
import secrets
from pathlib import Path
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

from app.db import database, models
from app.api.v1 import dependencies
from app.schemas import TwoFactorSetupResponse, TwoFactorEnableRequest, TwoFactorDisableRequest
from app.services.encryption import encryption_service
from app.core import security, config
from app.core.limiter import limiter

router = APIRouter(prefix="/security", tags=["Security"])

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

class TokenPayload(BaseModel):
    token: str

@router.post("/2fa/setup", response_model=TwoFactorSetupResponse, dependencies=[Depends(dependencies.verify_beta_access)])
@limiter.limit("5/hour")
async def setup_2fa(request: Request, current_user: models.User = Depends(dependencies.get_current_user)):
    if current_user.is_two_factor_enabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="2FA is already enabled.")
    
    setup_key = pyotp.random_base32()
    provisioning_uri = pyotp.totp.TOTP(setup_key).provisioning_uri(
        name=current_user.email,
        issuer_name="Lumen Protocol"
    )
    
    return TwoFactorSetupResponse(provisioning_uri=provisioning_uri, setup_key=setup_key)

@router.post("/2fa/enable", dependencies=[Depends(dependencies.verify_beta_access)])
@limiter.limit("5/hour")
async def enable_2fa(request: Request, payload: TwoFactorEnableRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    totp = pyotp.TOTP(payload.setup_key)
    if not totp.verify(payload.token):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid 2FA token.")
    
    backup_codes = [f"{secrets.token_hex(4)}-{secrets.token_hex(4)}" for _ in range(10)]
    encrypted_backup_codes = encryption_service.encrypt(json.dumps(backup_codes))

    current_user.two_factor_secret = encryption_service.encrypt(payload.setup_key)
    current_user.is_two_factor_enabled = True
    current_user.two_factor_backup_codes = encrypted_backup_codes
    db.commit()

    return {"backup_codes": backup_codes}

@router.post("/2fa/disable", dependencies=[Depends(dependencies.verify_beta_access)])
@limiter.limit("5/hour")
async def disable_2fa(request: Request, payload: TwoFactorDisableRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    if not current_user.hashed_password or not security.verify_password(payload.password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password.")
        
    current_user.two_factor_secret = None
    current_user.is_two_factor_enabled = False
    current_user.two_factor_backup_codes = None
    db.commit()

    return {"message": "2FA has been disabled."}

@router.post("/2fa/request-disable", dependencies=[Depends(dependencies.verify_beta_access)])
@limiter.limit("3/hour")
async def request_disable_2fa(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if not current_user.is_two_factor_enabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="2FA is not enabled.")
    
    if current_user.has_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Users with a password must use the password-based disable method.")
        
    if not current_user.email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot send disable link, no email associated with this account.")

    expires = timedelta(hours=1)
    token = secrets.token_urlsafe(32)
    
    current_user.two_factor_disable_token = token
    expires_at = datetime.now(timezone.utc) + expires
    current_user.two_factor_disable_expires = expires_at.timestamp()
    
    db.add(current_user)
    db.commit()

    disable_link = f"{config.settings.FRONTEND_URL}/app/dashboard?tab=settings&action=disable-2fa&token={token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Lumen Protocol 2FA Disable</title>
    </head>
    <body>
        <h1>Lumen Protocol: 2FA Disable Request</h1>
        <p>We received a request to disable Two-Factor Authentication on your account. Click the button below to confirm. This link is valid for 1 hour.</p>
        <a href="{disable_link}" target="_blank">Disable 2FA</a>
        <p>If you did not request this, please ignore this email. Your account remains secure.</p>
    </body>
    </html>
    """
    
    message = MessageSchema(
        subject="Lumen Protocol: 2FA Disable Request",
        recipients=[current_user.email],
        body=html_content,
        subtype="html"
    )
    
    fm = FastMail(mail_conf)
    background_tasks.add_task(fm.send_message, message)

    return {"message": "A confirmation link has been sent to your email address."}

@router.post("/2fa/confirm-disable")
@limiter.limit("5/hour")
async def confirm_disable_2fa(request: Request, payload: TokenPayload, db: Session = Depends(database.get_db)):
    token = payload.token
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Disable token is missing.")
    
    user = db.query(models.User).filter(models.User.two_factor_disable_token == token).first()

    current_timestamp = datetime.now(timezone.utc).timestamp()

    if not user or (user.two_factor_disable_expires and user.two_factor_disable_expires < current_timestamp):
        raise HTTPException(status_code=400, detail="Invalid or expired 2FA disable token.")

    user.is_two_factor_enabled = False
    user.two_factor_secret = None
    user.two_factor_backup_codes = None
    user.two_factor_disable_token = None
    user.two_factor_disable_expires = None
    db.add(user)
    db.commit()

    return {"message": "Two-Factor Authentication has been successfully disabled."}