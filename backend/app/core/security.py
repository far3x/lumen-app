import secrets
import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext

from .config import settings

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# JWT for Web App Sessions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# Personal Access Token (PAT) for CLI
def create_pat() -> tuple[str, str]:
    """Generates a new PAT and its hash. Returns (raw_token, hashed_token)."""
    raw_token = f"lum_pat_{secrets.token_urlsafe(32)}"
    hashed_token = hashlib.sha256(raw_token.encode()).hexdigest()
    return raw_token, hashed_token

# HMAC Signature for Securing CLI Requests
def create_hmac_signature(challenge: str, timestamp: str, body: bytes) -> str:
    """Creates an HMAC signature for a request."""
    body_hash = hashlib.sha256(body).hexdigest()
    string_to_sign = f"{challenge}:{timestamp}:{body_hash}".encode()
    secret = settings.LUMEN_CLIENT_SECRET.encode()
    signature = hmac.new(secret, string_to_sign, hashlib.sha256).hexdigest()
    return signature

def verify_hmac_signature(signature: str, challenge: str, timestamp: str, body: bytes) -> bool:
    """Verifies an incoming HMAC signature."""
    expected_signature = create_hmac_signature(challenge, timestamp, body)
    return hmac.compare_digest(expected_signature, signature)