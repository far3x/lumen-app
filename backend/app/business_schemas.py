from pydantic import BaseModel, EmailStr, Field

class BusinessUserCreate(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8)
    company_name: str = Field(..., min_length=2)

class BusinessUserLogin(BaseModel):
    email: EmailStr
    password: str

class BusinessUser(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    company_id: int

    class Config:
        from_attributes = True

class Company(BaseModel):
    id: int
    name: str
    token_balance: int

    class Config:
        from_attributes = True

class BusinessToken(BaseModel):
    access_token: str
    token_type: str
    user: BusinessUser
    company: Company