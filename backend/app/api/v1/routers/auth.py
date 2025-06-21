import base64
import json
from datetime import timedelta, datetime, timezone
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query, Response, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from starlette.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config as AuthlibConfig
import httpx
from jose import JWTError, jwt
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

from app.core import security, config
from app.db import crud, models, database
from app.api.v1 import dependencies
from app.schemas import User as UserSchema, Token, UserCreate, ApproveDeviceRequest, PersonalAccessToken as PATSchema, ForgotPasswordRequest, ResetPasswordRequest, TwoFactorLoginRequest, TwoFactorBackupCodeLoginRequest
from app.services.redis_service import redis_service
from app.core.limiter import limiter
from app.services.encryption import encryption_service
import pyotp

router = APIRouter(prefix="/auth", tags=["Authentication"])

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

authlib_config = AuthlibConfig('.env')
oauth = OAuth(authlib_config)
oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_id=config.settings.GOOGLE_CLIENT_ID,
    client_secret=config.settings.GOOGLE_CLIENT_SECRET,
    client_kwargs={'scope': 'openid email profile'}
)
oauth.register(
    name='github',
    client_id=config.settings.GITHUB_CLIENT_ID,
    client_secret=config.settings.GITHUB_CLIENT_SECRET,
    access_token_url='https://github.com/login/oauth/access_token',
    access_token_params=None,
    authorize_url='https://github.com/login/oauth/authorize',
    authorize_params=None,
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email'},
)

async def verify_recaptcha(token: str):
    if not config.settings.GOOGLE_RECAPTCHA_SECRET_KEY:
        print("Warning: GOOGLE_RECAPTCHA_SECRET_KEY not set. Skipping reCAPTCHA verification.")
        return
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={
                "secret": config.settings.GOOGLE_RECAPTCHA_SECRET_KEY,
                "response": token,
            },
        )
        result = response.json()
        if not result.get("success"):
            raise HTTPException(status_code=400, detail="Invalid reCAPTCHA token.")

@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def register_user(request: Request, user: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    await verify_recaptcha(user.recaptcha_token)

    db_user = crud.get_user_by_email(db, email=user.email)
    fm = FastMail(mail_conf)

    if db_user:
        login_link = f"{config.settings.FRONTEND_URL}/login"
        reset_password_link = f"{config.settings.FRONTEND_URL}/forgot-password"
        
        template_body = {
            "login_link": login_link,
            "reset_password_link": reset_password_link,
            "year": datetime.now().year
        }
        message = MessageSchema(
            subject="Lumen Protocol: Sign-up Attempt",
            recipients=[db_user.email],
            template_body=template_body,
            subtype="html"
        )
        background_tasks.add_task(fm.send_message, message, template_name="existing_account_signup_attempt.html")
    
    else:
        new_user = crud.create_user(db=db, user=user)
        verification_link = f"{config.settings.FRONTEND_URL}/verify?token={new_user.verification_token}"
        
        template_body = {
            "verification_link": verification_link,
            "year": datetime.now().year
        }
        message = MessageSchema(
            subject="Lumen Protocol: Verify Your Email",
            recipients=[new_user.email],
            template_body=template_body,
            subtype="html"
        )
        background_tasks.add_task(fm.send_message, message, template_name="verification_email.html")
    
    return {"message": "If an account with this email doesn't already exist, a verification link has been sent. Otherwise, we've sent instructions to the existing account's email address."}


@router.get("/verify-email")
async def verify_email(token: str, db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM])
        subject = payload.get("sub")
        if not subject or not subject.startswith("verify:"):
            raise HTTPException(status_code=400, detail="Invalid token type.")
        
        email = subject.split("verify:")[1]
        user = crud.get_user_by_email(db, email=email)

        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        if user.is_verified:
            return {"message": "Account already verified."}
        if user.verification_token != token:
            raise HTTPException(status_code=400, detail="Invalid verification token.")

        user.is_verified = True
        user.verification_token = None
        db.add(user)
        db.commit()

        return {"message": "Email verified successfully."}

    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token.")

@limiter.limit("3/hour")
@router.post("/forgot-password")
async def forgot_password(request: Request, payload: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    user = crud.get_user_by_email(db, email=payload.email)
    if user:
        expires = timedelta(hours=1)
        token = security.create_access_token(data={"sub": f"reset:{user.email}"}, expires_delta=expires)
        
        user.password_reset_token = token
        expires_at = datetime.now(timezone.utc) + expires
        user.password_reset_expires = expires_at.timestamp()
        
        db.add(user)
        db.commit()

        reset_link = f"{config.settings.FRONTEND_URL}/reset-password?token={token}"
        
        template_body = {
            "reset_link": reset_link,
            "year": datetime.now().year
        }

        message = MessageSchema(
            subject="Lumen Protocol: Password Reset Request",
            recipients=[user.email],
            template_body=template_body,
            subtype="html"
        )
        
        fm = FastMail(mail_conf)
        background_tasks.add_task(fm.send_message, message, template_name="password_reset_email.html")

    return {"message": "If an account with that email exists, a password reset link has been sent."}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(request.token, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM])
        subject = payload.get("sub")
        if not subject or not subject.startswith("reset:"):
            raise HTTPException(status_code=400, detail="Invalid token type.")
        
        email = subject.split("reset:")[1]
        user = crud.get_user_by_email(db, email=email)
        
        current_timestamp = datetime.now(timezone.utc).timestamp()

        if not user or user.password_reset_token != request.token or user.password_reset_expires < current_timestamp:
            raise HTTPException(status_code=400, detail="Invalid or expired password reset token.")
        
        user.hashed_password = security.get_password_hash(request.password)
        user.password_reset_token = None
        user.password_reset_expires = None
        db.add(user)
        db.commit()

        return {"message": "Password has been reset successfully."}

    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token.")

@router.post("/token")
async def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not user.hashed_password or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not user.is_verified:
        raise HTTPException(status_code=status.HTTP_403, detail="Email not verified. Please check your inbox.")

    if user.is_two_factor_enabled:
        tfa_token_expires = timedelta(minutes=5)
        tfa_token = security.create_access_token(
            data={"sub": f"tfa:{user.id}"}, expires_delta=tfa_token_expires
        )
        return {"tfa_required": True, "tfa_token": tfa_token}
        
    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="lax", max_age=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    response.set_cookie(key="is_logged_in", value="true", httponly=False, secure=True, samesite="lax", max_age=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    return {"status": "success"}

@router.post("/token/2fa")
async def login_2fa_verification(response: Response, request: TwoFactorLoginRequest, db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(request.tfa_token, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM])
        subject = payload.get("sub")
        if not subject or not subject.startswith("tfa:"):
            raise HTTPException(status_code=400, detail="Invalid temporary token.")
        
        user_id = int(subject.split("tfa:")[1])
        user = crud.get_user(db, user_id=user_id)

        if not user or not user.is_two_factor_enabled:
             raise HTTPException(status_code=400, detail="2FA is not enabled for this user.")
        
        encrypted_secret = user.two_factor_secret
        decrypted_secret = encryption_service.decrypt(encrypted_secret)
        totp = pyotp.TOTP(decrypted_secret)

        if not totp.verify(request.code):
            raise HTTPException(status_code=401, detail="Invalid 2FA code.")

        access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)
    
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="lax", max_age=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        response.set_cookie(key="is_logged_in", value="true", httponly=False, secure=True, samesite="lax", max_age=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        return {"status": "success"}

    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired temporary token.")

@router.post("/token/2fa-backup")
async def login_2fa_backup_code(response: Response, request: TwoFactorBackupCodeLoginRequest, db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(request.tfa_token, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM])
        subject = payload.get("sub")
        if not subject or not subject.startswith("tfa:"):
            raise HTTPException(status_code=400, detail="Invalid temporary token.")
        
        user_id = int(subject.split("tfa:")[1])
        user = crud.get_user(db, user_id=user_id)

        if not user or not user.is_two_factor_enabled or not user.two_factor_backup_codes:
             raise HTTPException(status_code=400, detail="2FA or backup codes not available for this user.")
        
        decrypted_codes_json = encryption_service.decrypt(user.two_factor_backup_codes)
        backup_codes = json.loads(decrypted_codes_json)

        if request.backup_code not in backup_codes:
            raise HTTPException(status_code=401, detail="Invalid backup code.")

        backup_codes.remove(request.backup_code)
        user.two_factor_backup_codes = encryption_service.encrypt(json.dumps(backup_codes))
        db.commit()

        access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)
    
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="lax", max_age=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        response.set_cookie(key="is_logged_in", value="true", httponly=False, secure=True, samesite="lax", max_age=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        return {"status": "success", "message": "Successfully logged in. A backup code was used."}

    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired temporary token.")

@router.get('/login/{provider}')
async def login_via_provider(request: Request, provider: str, state: str | None = Query(None)):
    # Construct the redirect URI using the public-facing API_URL from settings
    redirect_uri = f"{config.settings.API_URL}/api/v1/auth/callback/{provider}"
    
    if state:
        request.session['oauth_state_data'] = state

    return await oauth.create_client(provider).authorize_redirect(request, redirect_uri)

@router.get('/callback/{provider}', name='auth_callback')
async def auth_callback(request: Request, provider: str, db: Session = Depends(database.get_db)):
    client = oauth.create_client(provider)
    token = await client.authorize_access_token(request)
    user_info = token.get('userinfo')
    if not user_info and provider == 'github':
        resp = await client.get('user', token=token)
        user_info = resp.json()

    oauth_id = str(user_info.get("sub") or user_info.get("id"))
    oauth_email = user_info.get("email")
    
    linking_user_id = request.session.pop('oauth_link_user_id', None)
    if linking_user_id:
        user_to_link = crud.get_user(db, user_id=linking_user_id)
        if not user_to_link:
            return RedirectResponse(url=f"{config.settings.FRONTEND_URL}/app/dashboard?tab=settings&error=link_failed")

        existing_oauth_user = crud.get_user_by_oauth_id(db, provider, oauth_id)
        if existing_oauth_user and existing_oauth_user.id != user_to_link.id:
            return RedirectResponse(url=f"{config.settings.FRONTEND_URL}/app/dashboard?tab=settings&error=oauth_in_use")

        if user_to_link.email and oauth_email and user_to_link.email.lower() != oauth_email.lower():
            return RedirectResponse(url=f"{config.settings.FRONTEND_URL}/app/dashboard?tab=settings&error=email_mismatch")

        if provider == "google": user_to_link.google_id = oauth_id
        elif provider == "github": user_to_link.github_id = oauth_id
        
        if not user_to_link.email and oauth_email:
            user_to_link.email = oauth_email

        db.commit()
        db.refresh(user_to_link)
        return RedirectResponse(url=f"{config.settings.FRONTEND_URL}/app/dashboard?tab=settings&success=link_complete")

    user = crud.get_user_by_oauth_id(db, provider, oauth_id)

    if not user and oauth_email:
        existing_user_by_email = crud.get_user_by_email(db, email=oauth_email)
        if existing_user_by_email:
            if existing_user_by_email.has_password:
                return RedirectResponse(url=f"{config.settings.FRONTEND_URL}/login?error=oauth_email_exists")
            else:
                 return RedirectResponse(url=f"{config.settings.FRONTEND_URL}/login?error=oauth_email_exists")
    
    if not user:
        user = crud.create_oauth_user(db, provider, user_info)
    
    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(data={"sub": str(user.id)}, expires_delta=access_token_expires)
    
    state_data_b64 = request.session.pop('oauth_state_data', None)
    redirect_path = "/app/dashboard"
    if state_data_b64:
        try:
            state_json = base64.b64decode(state_data_b64).decode('utf-8')
            state_data = json.loads(state_json)
            redirect_path = state_data.get('redirect_path', redirect_path)
        except (json.JSONDecodeError, TypeError):
            pass
            
    frontend_url = f"{config.settings.FRONTEND_URL}{redirect_path}"
    response = RedirectResponse(url=frontend_url)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="lax", max_age=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    response.set_cookie(key="is_logged_in", value="true", httponly=False, secure=True, samesite="lax", max_age=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    return response

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("is_logged_in")
    return {"status": "success"}

@router.post("/cli/approve-device", response_model=PATSchema)
async def approve_cli_device(
    payload: ApproveDeviceRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    if not current_user.is_verified:
        raise HTTPException(status_code=403, detail="Account not verified. Please check your email.")

    user_code_key = f"device_flow:user_code:{payload.user_code.upper()}"
    device_code = redis_service.get(user_code_key)

    if not device_code:
        raise HTTPException(status_code=404, detail="Invalid or expired user code.")
    
    raw_token = crud.create_pat_for_user(db, user=current_user, name=payload.device_name)
    
    device_code_key = f"device_flow:device_code:{device_code}"
    redis_service.set_with_ttl(key=device_code_key, value=raw_token, ttl_seconds=120)

    redis_service.delete(user_code_key)
    
    return PATSchema(name=payload.device_name, token=raw_token)
