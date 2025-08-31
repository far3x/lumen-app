from pydantic import BaseModel, EmailStr, Field, model_validator, field_validator
from typing import Optional, List, Dict
from datetime import datetime, date

class BusinessUserCreate(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8)
    company_name: Optional[str] = Field(None, min_length=2)
    job_title: Optional[str] = Field(None, max_length=255)
    company_size: Optional[str] = Field(None, max_length=255)
    industry: Optional[str] = Field(None, max_length=255)
    recaptcha_token: str
    invite_token: Optional[str] = None

    @field_validator('company_name', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        if v == "":
            return None
        return v

    @model_validator(mode='after')
    def check_company_or_invite(self) -> 'BusinessUserCreate':
        if self.invite_token is None and self.company_name is None:
            raise ValueError('Company name is required for a new registration without an invite token.')
        return self

class BusinessUserLogin(BaseModel):
    email: EmailStr
    password: str

class BusinessUser(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    job_title: Optional[str] = None
    role: str
    company_id: int
    is_verified: bool

    class Config:
        from_attributes = True

class Company(BaseModel):
    id: int
    name: str
    plan: str
    token_balance: int
    company_size: Optional[str] = None
    industry: Optional[str] = None

    class Config:
        from_attributes = True

class BusinessToken(BaseModel):
    access_token: str
    token_type: str
    user: BusinessUser
    company: Company

class TeamInvitationInfo(BaseModel):
    token: str
    company_name: str
    invited_by_name: str
    expires_at: datetime

    class Config:
        from_attributes = True

class ApiKeyInfo(BaseModel):
    id: int
    name: str
    key_prefix: str
    created_at: datetime
    last_used_at: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True

class ApiKeyUsageSummary(BaseModel):
    name: str
    key_prefix: str
    is_active: bool
    total_tokens: int

class ApiKeyCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    key: Optional[str] = None

class FilePreview(BaseModel):
    path: str
    content: str

class ContributionPreview(BaseModel):
    id: int
    created_at: datetime
    language: str
    tokens: int
    clarity_score: float
    arch_score: float
    quality_score: float
    is_unlocked: bool
    analysis_summary: Optional[str] = None
    files_preview: List[FilePreview]
    language_breakdown: Optional[Dict[str, int]] = None

class FullContribution(BaseModel):
    id: int
    created_at: datetime
    raw_content: str

class ContributionSearchResult(BaseModel):
    keywords: Optional[str] = Field(None, max_length=255)
    languages: Optional[List[str]] = None
    min_tokens: Optional[int] = Field(None, ge=0)
    max_tokens: Optional[int] = Field(None, ge=0)
    min_clarity: Optional[float] = Field(None, ge=0, le=10)
    min_arch: Optional[float] = Field(None, ge=0, le=10)
    min_quality: Optional[float] = Field(None, ge=0, le=10)
    limit: int = 20
    skip: int = 0

class PaginatedContributionPreview(BaseModel):
    items: List[ContributionPreview]
    total: int

class DashboardStats(BaseModel):
    token_balance: int
    current_plan: str
    active_api_key_count: int
    team_member_count: int

class UsageDataPoint(BaseModel):
    date: date
    tokens_used: int

class UnlockedContributionDetail(BaseModel):
    id: int
    unlocked_at: datetime
    language: str
    tokens: int
    quality_score: float

    class Config:
        from_attributes = True

class TeamMember(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class InviteCreate(BaseModel):
    email: EmailStr
    full_name: str
    role: str = 'member'

class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2)
    company_size: Optional[str] = None
    industry: Optional[str] = None

class BusinessUserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2)
    job_title: Optional[str] = None