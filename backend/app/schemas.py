from pydantic import BaseModel, EmailStr, constr, field_validator, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from solders.pubkey import Pubkey

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    recaptcha_token: str

class User(BaseModel):
    id: int
    email: Optional[EmailStr] = None
    display_name: str
    is_in_leaderboard: bool
    is_verified: bool
    is_two_factor_enabled: bool
    has_password: bool
    github_id: Optional[str] = None
    solana_address: Optional[str] = None
    has_beta_access: bool
    waitlist_position: Optional[int] = None
    reward_multiplier: float

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    is_in_leaderboard: Optional[bool] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    password: str

class TwoFactorSetupResponse(BaseModel):
    provisioning_uri: str
    setup_key: str

class TwoFactorEnableRequest(BaseModel):
    token: str
    setup_key: str

class TwoFactorDisableRequest(BaseModel):
    password: str

class TwoFactorLoginRequest(BaseModel):
    tfa_token: str
    code: str

class TwoFactorBackupCodeLoginRequest(BaseModel):
    tfa_token: str
    backup_code: str

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

class UserDeletePayload(BaseModel):
    password: Optional[str] = None
    token: Optional[str] = None

class Account(BaseModel):
    usd_balance: float
    total_usd_earned: float

    class Config:
        from_attributes = True

class AccountDetails(Account):
    last_claim_at: Optional[datetime] = None

class ContributionCreate(BaseModel):
    codebase: constr(max_length=5000000)

class ValuationMetrics(BaseModel):
    total_lloc: int = 0
    total_tokens: int = 0
    avg_complexity: float = 0.0
    compression_ratio: float = 0.0
    language_breakdown: Dict[str, int] = {}
    
class AiAnalysis(BaseModel):
    project_clarity_score: float = 0.0
    architectural_quality_score: float = 0.0
    code_quality_score: float = 0.0
    analysis_summary: Optional[str] = None

class ContributionResponse(BaseModel):
    id: int
    created_at: datetime
    reward_amount: float
    status: str
    transaction_hash: Optional[str] = None
    valuation_details: Optional[Dict[str, Any]] = None
    manual_metrics: Optional[ValuationMetrics] = None
    ai_analysis: Optional[AiAnalysis] = None
    user_display_name: Optional[str] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class PublicContributionResponse(BaseModel):
    id: int
    created_at: datetime
    reward_amount: float
    user_display_name: str

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class ContributionStatus(BaseModel):
    status: str
    contribution_id: int
    message: Optional[str] = None

class ContributionCliResponse(BaseModel):
    id: int
    created_at: datetime
    status: str
    reward_amount: float

    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    rank: int
    display_name: str
    total_usd_earned: float 

    class Config:
        from_attributes = True

class LeaderboardResponse(BaseModel):
    top_users: List[LeaderboardEntry]
    current_user_rank: Optional[LeaderboardEntry] = None

class WalletLinkRequest(BaseModel):
    solana_address: str
    message: str
    signature: str

class BatchPayoutResponse(BaseModel):
    id: int
    amount_usd: float
    status: str
    transaction_hash: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SetWalletAddressRequest(BaseModel):
    solana_address: str

    @field_validator('solana_address')
    def validate_solana_address(cls, v):
        try:
            Pubkey.from_string(v)
        except ValueError:
            raise ValueError('Invalid Solana address format')
        return v

class FeedbackCreate(BaseModel):
    page: Optional[str] = Field(None, max_length=255)
    rating: Optional[int] = Field(None, ge=1, le=5)
    content: str = Field(..., min_length=10, max_length=2000)

class ClaimRequestResponse(BaseModel):
    message: str
    claim_id: int

class ContactSalesCreate(BaseModel):
    full_name: str = Field(..., min_length=2)
    work_email: EmailStr
    company_name: str = Field(..., min_length=2)
    job_title: Optional[str] = None
    contact_reason: str
    message: Optional[str] = Field(None, max_length=5000)