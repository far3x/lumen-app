from pydantic import BaseModel, EmailStr
from typing import Optional

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    email: Optional[EmailStr] = None
    display_name: str
    
    class Config:
        orm_mode = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None
    
# Account Schema
class Account(BaseModel):
    lum_balance: float

    class Config:
        orm_mode = True