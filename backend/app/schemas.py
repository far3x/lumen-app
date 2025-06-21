from pydantic import BaseModel, EmailStr
from typing import Optional

# --- User Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    email: Optional[EmailStr] = None
    display_name: str
    
    class Config:
        from_attributes = True

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None

class PersonalAccessToken(BaseModel):
    name: str
    token: str

# --- CLI Auth Schemas ---
class DeviceAuthResponse(BaseModel):
    device_code: str
    user_code: str
    verification_uri: str
    expires_in: int
    interval: int

class ApproveDeviceRequest(BaseModel):
    user_code: str
    device_name: Optional[str] = "Lumen CLI"

# --- Account Schema ---
class Account(BaseModel):
    lum_balance: float

    class Config:
        from_attributes = True

# --- NEW: Contribution Schema ---
class ContributionCreate(BaseModel):
    codebase: str