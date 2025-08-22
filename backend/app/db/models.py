import hashlib
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, BigInteger, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime
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
    cooldown_until = Column(DateTime(timezone=True), nullable=True)
    account = relationship("Account", back_populates="user", uselist=False, cascade="all, delete-orphan")
    personal_access_tokens = relationship("PersonalAccessToken", back_populates="user", cascade="all, delete-orphan")
    contributions = relationship("Contribution", back_populates="user")
    claim_transactions = relationship("ClaimTransaction", back_populates="user", cascade="all, delete-orphan")
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

class ClaimTransaction(Base):
    __tablename__ = "claim_transactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount_claimed = Column(Float, nullable=False)
    transaction_hash = Column(String, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="claim_transactions")

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
    mean_complexity = Column(Float, default=5.0, nullable=False)
    m2_complexity = Column(Float, default=0.0, nullable=False)
    variance_complexity = Column(Float, default=4.0, nullable=False)
    std_dev_complexity = Column(Float, default=2.0, nullable=False)

class Contribution(Base):
    __tablename__ = "contributions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    raw_content = Column(Text, nullable=False)
    valuation_results = Column(JSONB, nullable=False)
    reward_amount = Column(Float, nullable=False)
    content_embedding = Column(Vector(384), nullable=True)
    status = Column(String, default="PENDING", nullable=False)
    transaction_hash = Column(String, nullable=True, index=True)
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