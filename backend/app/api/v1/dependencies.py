from fastapi import Depends, HTTPException, status, Request, Header, WebSocket, Query
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import time
import hashlib

from app.core import security, config
from app.db import crud, models
from app.db.database import get_db
from app.schemas import TokenData
from app.services.redis_service import redis_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

async def get_current_user_from_token(token: str, db: Session) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(id=user_id)
    except JWTError:
        raise credentials_exception
    
    user = crud.get_user(db, user_id=int(token_data.id))
    if user is None:
        raise credentials_exception
    return user

async def get_current_user(request: Request, db: Session = Depends(get_db)) -> models.User:
    token = request.cookies.get("access_token")
    user = await get_current_user_from_token(token, db)
    request.state.user = user
    return user

async def verify_beta_access(user: models.User = Depends(get_current_user)):
    if config.settings.BETA_MODE_ENABLED and user.id > config.settings.BETA_MAX_USERS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="USER_ON_WAITLIST"
        )
    return user

async def get_current_user_from_pat(pat: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate Personal Access Token",
    )
    if not pat.startswith("lum_pat_"):
        raise credentials_exception
    
    user = crud.get_user_by_pat(db, pat=pat)
    
    if user is None:
        raise credentials_exception
    return user

async def verify_beta_access_for_cli(user: models.User = Depends(get_current_user_from_pat)):
    if config.settings.BETA_MODE_ENABLED and user.id > config.settings.BETA_MAX_USERS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="USER_ON_WAITLIST"
        )
    return user

async def get_current_user_from_ws(
    websocket: WebSocket,
    db: Session = Depends(get_db),
    token: str | None = Query(None)
) -> models.User:
    if token is None:
        token = websocket.cookies.get("access_token")
    user = await get_current_user_from_token(token, db)
    return user

async def verify_contribution_signature(
    request: Request,
    authorization: str = Header(..., description="The user's Personal Access Token, e.g., 'Bearer lum_pat_'"),
    x_lumen_signature: str = Header(...),
    x_lumen_timestamp: str = Header(...),
    db: Session = Depends(get_db)
):
    try:
        request_time = int(x_lumen_timestamp)
        current_time = int(time.time())
        if abs(current_time - request_time) > 300:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request timestamp is too old.")
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid timestamp format.")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization scheme. Must be 'Bearer'.")
    
    pat = authorization.split(" ")[1]
    
    user = crud.get_user_by_pat(db, pat=pat)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Personal Access Token.")

    challenge_key = f"challenge:{user.id}"
    stored_challenge = redis_service.get(challenge_key)

    if not stored_challenge:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid or expired challenge. Please run 'lum handshake' again.")

    redis_service.delete(challenge_key)

    body = await request.body()
    
    is_valid = security.verify_hmac_signature(
        signature=x_lumen_signature,
        challenge=stored_challenge,
        timestamp=x_lumen_timestamp,
        body=body,
        secret=pat
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid client signature. The request could not be authenticated.",
        )

async def get_current_user_from_token_optional(token: str | None, db: Session) -> models.User | None:
    if not token:
        return None
    try:
        return await get_current_user_from_token(token, db)
    except HTTPException:
        return None

async def get_current_user_optional(request: Request, db: Session = Depends(get_db)) -> models.User | None:
    token = request.cookies.get("access_token")
    user = await get_current_user_from_token_optional(token, db)
    request.state.user = user
    return user