import base64
import json
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from starlette.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config as AuthlibConfig

from app.core import security, config
from app.db import crud, models, database
from app.api.v1 import dependencies
from app.schemas import User as UserSchema, Token, UserCreate, ApproveDeviceRequest, PersonalAccessToken as PATSchema
from app.services.redis_service import redis_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

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

@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get('/login/{provider}')
async def login_via_provider(request: Request, provider: str, state: str | None = Query(None)):
    redirect_uri = f"{request.base_url}api/v1/auth/callback/{provider}"
    
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

    user = crud.get_user_by_oauth_id(db, provider, str(user_info.get("sub") or user_info.get("id")))
    if not user:
        user = crud.create_oauth_user(db, provider, user_info)
    
    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    state_data_b64 = request.session.pop('oauth_state_data', None)
    redirect_path = "/app/dashboard"
    if state_data_b64:
        try:
            state_json = base64.b64decode(state_data_b64).decode('utf-8')
            state_data = json.loads(state_json)
            redirect_path = state_data.get('redirect_path', redirect_path)
        except (json.JSONDecodeError, TypeError):
            pass
            
    frontend_url = f"{config.settings.FRONTEND_URL}/auth/callback?token={access_token}&redirect_to={redirect_path}"
    return RedirectResponse(url=frontend_url)

@router.post("/cli/approve-device", response_model=PATSchema)
async def approve_cli_device(
    payload: ApproveDeviceRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    user_code_key = f"device_flow:user_code:{payload.user_code.upper()}"
    device_code = redis_service.get(user_code_key)

    if not device_code:
        raise HTTPException(status_code=404, detail="Invalid or expired user code.")
    
    raw_token = crud.create_pat_for_user(db, user=current_user, name=payload.device_name)
    
    device_code_key = f"device_flow:device_code:{device_code}"
    redis_service.set_with_ttl(key=device_code_key, value=raw_token, ttl_seconds=120)

    redis_service.delete(user_code_key)
    
    return PATSchema(name=payload.device_name, token=raw_token)