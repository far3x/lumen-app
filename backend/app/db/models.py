from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, BigInteger, Text, Enum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.hybrid import hybrid_property
from pgvector.sqlalchemy import Vector

from .database import Base
from app.core.config import settings


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    github_id = Column(String, unique=True, nullable=True)
    display_name = Column(String)
    solana_address = Column(String, unique=True, nullable=True, index=True)
    is_beta_bonus_claimed = Column(Boolean, default=False, nullable=False)
    reward_multiplier = Column(Float, nullable=False, default=1.0)
    is_in_leaderboard = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String, nullable=True)
    password_reset_token = Column(String, nullable=True)
    password_reset_expires = Column(Float, nullable=True)
    is_two_factor_enabled = Column(Boolean, default=False, nullable=False)
    two_factor_secret = Column(String, nullable=True)
    two_factor_backup_codes = Column(Text, nullable=True)
    two_factor_disable_token = Column(String, unique=True, nullable=True)
    two_factor_disable_expires = Column(Float, nullable=True)
    deletion_token = Column(String, unique=True, nullable=True)
    deletion_token_expires = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_banned = Column(Boolean, default=False, nullable=False)
    account = relationship("Account", back_populates="user", uselist=False, cascade="all, delete-orphan")
    personal_access_tokens = relationship("PersonalAccessToken", back_populates="user", cascade="all, delete-orphan")
    contributions = relationship("Contribution", back_populates="user")
    feedback = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    
    @hybrid_property
    def has_password(self):
        return self.hashed_password is not None

    @hybrid_property
    def has_beta_access(self):
        if not settings.BETA_MODE_ENABLED:
            return True
        return self.id <= settings.BETA_MAX_USERS

    @hybrid_property
    def waitlist_position(self):
        if not settings.BETA_MODE_ENABLED or self.id <= settings.BETA_MAX_USERS:
            return None
        return self.id - settings.BETA_MAX_USERS

class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    usd_balance = Column(Float, default=0.0)
    total_usd_earned = Column(Float, default=0.0, nullable=False)
    user = relationship("User", back_populates="account")

class PersonalAccessToken(Base):
    __tablename__ = "personal_access_tokens"
    id = Column(Integer, primary_key=True, index=True)
    token_hash = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    user = relationship("User", back_populates="personal_access_tokens")

class NetworkStats(Base):
    __tablename__ = "network_stats"
    id = Column(Integer, primary_key=True)
    total_usd_distributed = Column(Float, default=0.0, nullable=False)
    total_contributions = Column(BigInteger, default=0, nullable=False)
    total_lloc = Column(BigInteger, default=0, nullable=False)
    total_tokens = Column(BigInteger, default=0, nullable=False)
    mean_complexity = Column(Float, default=5.0, nullable=False)
    m2_complexity = Column(Float, default=0.0, nullable=False)
    variance_complexity = Column(Float, default=4.0, nullable=False)
    std_dev_complexity = Column(Float, default=2.0, nullable=False)
    mean_quality = Column(Float, default=0.5, nullable=False)
    m2_quality = Column(Float, default=0.0, nullable=False)
    variance_quality = Column(Float, default=0.25, nullable=False)
    std_dev_quality = Column(Float, default=0.5, nullable=False)

class Contribution(Base):
    __tablename__ = "contributions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    raw_content = Column(Text, nullable=True)
    irys_tx_id = Column(String(64), unique=True, index=True, nullable=True)
    content_preview = Column(Text, nullable=True)
    valuation_results = Column(JSONB, nullable=False)
    reward_amount = Column(Float, nullable=False)
    content_embedding = Column(Vector(1536), nullable=True)
    status = Column(String, default="PENDING", nullable=False)
    transaction_hash = Column(String, nullable=True, index=True)
    is_checked = Column(Boolean, default=False, nullable=False)
    source = Column(String, default="cli", nullable=False)
    user = relationship("User", back_populates="contributions")

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    visitor_id = Column(String, index=True, nullable=False)
    page = Column(String, nullable=True)
    rating = Column(Integer, nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="feedback")

class ContactSubmission(Base):
    __tablename__ = "contact_submissions"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    work_email = Column(String, nullable=False, index=True)
    company_name = Column(String, nullable=False)
    job_title = Column(String, nullable=True)
    contact_reason = Column(String, nullable=False)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=False, nullable=False)
    plan = Column(String, default="free", nullable=False)
    token_balance = Column(BigInteger, default=0, nullable=False)
    company_size = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    users = relationship("BusinessUser", back_populates="company", cascade="all, delete-orphan")
    api_keys = relationship("ApiKey", back_populates="company", cascade="all, delete-orphan")
    unlocked_contributions = relationship("UnlockedContribution", back_populates="company")
    billing_history = relationship("BillingHistory", back_populates="company", cascade="all, delete-orphan")
    invitations = relationship("TeamInvitation", back_populates="company", cascade="all, delete-orphan")

class BusinessUser(Base):
    __tablename__ = "business_users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    job_title = Column(String, nullable=True)
    role = Column(String, default="member", nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    company = relationship("Company", back_populates="users")

class ApiKey(Base):
    __tablename__ = "api_keys"
    id = Column(Integer, primary_key=True, index=True)
    key_prefix = Column(String(8), unique=True, nullable=False)
    key_hash = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    company = relationship("Company", back_populates="api_keys")
    usage_events = relationship("ApiKeyUsageEvent", back_populates="api_key", cascade="all, delete-orphan")

class PayoutBatch(Base):
    __tablename__ = "payout_batches"
    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum("OPEN", "CLOSED", "PROCESSING", "COMPLETED", name="batch_status_enum"), default="OPEN", nullable=False)
    total_amount_usd = Column(Float, default=0.0)
    payouts = relationship("BatchPayout", back_populates="batch", cascade="all, delete-orphan")

class BatchPayout(Base):
    __tablename__ = "batch_payouts"
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("payout_batches.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount_usd = Column(Float, nullable=False)
    status = Column(Enum("PENDING", "COMPLETED", "FAILED", "RECONCILED", name="payout_status_enum"), default="PENDING", nullable=False)
    transaction_hash = Column(String, nullable=True, index=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    batch = relationship("PayoutBatch", back_populates="payouts")
    user = relationship("User")

class UnlockedContribution(Base):
    __tablename__ = "unlocked_contributions"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    contribution_id = Column(Integer, ForeignKey("contributions.id"), nullable=False)
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())
    
    company = relationship("Company", back_populates="unlocked_contributions")
    contribution = relationship("Contribution")

class ApiKeyUsageEvent(Base):
    __tablename__ = "api_key_usage_events"
    id = Column(Integer, primary_key=True, index=True)
    api_key_id = Column(Integer, ForeignKey("api_keys.id", ondelete="CASCADE"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    tokens_used = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    api_key = relationship("ApiKey", back_populates="usage_events")

class BillingHistory(Base):
    __tablename__ = "billing_history"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    description = Column(String, nullable=False)
    amount_usd = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="paid")
    invoice_url = Column(String, nullable=True)
    company = relationship("Company", back_populates="billing_history")

class TeamInvitation(Base):
    __tablename__ = "team_invitations"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    email = Column(String, nullable=False, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, nullable=False, server_default="pending")
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    company = relationship("Company", back_populates="invitations")

class ContributionLanguage(Base):
    __tablename__ = "contribution_languages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

class AirdropRecipient(Base):
    __tablename__ = "airdrop_recipients"
    solana_address = Column(String, primary_key=True, index=True)
    token_amount = Column(Numeric(30, 10), nullable=False)
    has_claimed = Column(Boolean, default=False, nullable=False)
    solana_transaction_hash = Column(String, nullable=True, index=True)
    claimed_at = Column(DateTime(timezone=True), nullable=True)