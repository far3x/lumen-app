from fastapi import FastAPI, Depends, HTTPException, status, Request, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from starlette.responses import RedirectResponse, JSONResponse
import time
import random
from datetime import timedelta
from starlette.middleware.sessions import SessionMiddleware

# NEW: Import slowapi for rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from . import crud, models, schemas, auth, database
from .config import settings
from .database import engine

# NEW: Setup the rate limiter
limiter = Limiter(key_func=get_remote_address)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# THE FIX: Allow origins now includes the correct Vite port
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://lumen-priv.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Authentication Routes with Rate Limiting ---
@app.post("/auth/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute") # Limit registration attempts
async def register_user(request: Request, user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/auth/token", response_model=schemas.Token)
@limiter.limit("10/minute") # Limit login attempts
async def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# --- OAuth Routes ---
@app.get('/auth/login/{provider}')
@limiter.limit("10/minute")
async def login_via_provider(request: Request, provider: str):
    redirect_uri = request.url_for('auth_callback', provider=provider)
    return await auth.oauth.create_client(provider).authorize_redirect(request, redirect_uri)

@app.get('/auth/callback/{provider}', name='auth_callback')
async def auth_callback(request: Request, provider: str, db: Session = Depends(database.get_db)):
    client = auth.oauth.create_client(provider)
    token = await client.authorize_access_token(request)
    user_info = token.get('userinfo')
    if not user_info:
        resp = await client.get('user', token=token)
        user_info = resp.json()

    oauth_id = str(user_info.get("sub") or user_info.get("id"))
    user = crud.get_user_by_oauth_id(db, provider, oauth_id)
    if not user:
        user = crud.create_oauth_user(db, provider, user_info)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    # THE FIX: Use the configurable FRONTEND_URL from settings
    frontend_url = f"{settings.FRONTEND_URL}/auth/callback?token={access_token}"
    return RedirectResponse(url=frontend_url)

# --- API Routes ---
@app.get("/api/v1/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/api/v1/me/balance", response_model=schemas.Account)
def get_my_balance(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    account = crud.get_account(db, user_id=current_user.id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

# REWARD LOGIC CHANGE: Background task now calls the new function
def reward_processing_task(db: Session, user_id: int, file_size_kb: float):
    user = crud.get_user(db, user_id)
    if user:
        time.sleep(random.randint(5, 15)) # Simulate processing
        crud.update_balance_for_contribution(db, user, file_size_kb)

@app.post("/api/v1/contribute", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("5/minute") # Prevent contribution spam
async def contribute_data(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(None), # Make file optional for testing
    current_user: models.User = Depends(auth.get_current_user)
):
    db = database.SessionLocal()
    try:
        file_size_kb = file.size / 1024 if file and file.size else 100.0 # Default size for testing
        background_tasks.add_task(reward_processing_task, db, current_user.id, file_size_kb)
    finally:
        pass

    return {"message": "Contribution received and is being processed."}