from pydantic import BaseModel, Field
from datetime import datetime

class User(BaseModel):
    username: str

class UserInDB(User):
    hashed_password: str

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)

class UserSignupRequest(UserCreate):
    confirm_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class SensorData(BaseModel):
    id: int
    timestamp: datetime
    valeur: float