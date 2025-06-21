from pydantic import BaseModel, EmailStr, constr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    email: Optional[EmailStr] = None
    display_name: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None

class PersonalAccessToken(BaseModel):
    name: str
    token: str

class DeviceAuthResponse(BaseModel):
    device_code: str
    user_code: str
    verification_uri: str
    expires_in: int
    interval: int

class ApproveDeviceRequest(BaseModel):
    user_code: str
    device_name: Optional[str] = "Lumen CLI"

class Account(BaseModel):
    lum_balance: float

    class Config:
        from_attributes = True

class ContributionCreate(BaseModel):
    codebase: constr(max_length=5000000)