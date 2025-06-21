from fastapi import Depends, HTTPException, status, Request, Header
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

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
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

async def verify_contribution_signature(
    request: Request,
    x_lumen_challenge: str = Header(...),
    x_lumen_signature: str = Header(...),
    x_lumen_timestamp: str = Header(...)
):
    try:
        request_time = int(x_lumen_timestamp)
        current_time = int(time.time())
        if abs(current_time - request_time) > 300:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request timestamp is too old.")
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid timestamp format.")

    body = await request.body()
    
    is_valid = security.verify_hmac_signature(
        signature=x_lumen_signature,
        challenge=x_lumen_challenge,
        timestamp=x_lumen_timestamp,
        body=body
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid client signature.",
        )