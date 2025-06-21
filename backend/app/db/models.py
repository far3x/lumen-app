import hashlib
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, BigInteger, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB

from .database import Base
from app.core.config import settings

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    github_id = Column(String, unique=True, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    display_name = Column(String)
    has_contributed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    account = relationship("Account", back_populates="user", uselist=False, cascade="all, delete-orphan")
    personal_access_tokens = relationship("PersonalAccessToken", back_populates="user", cascade="all, delete-orphan")
    contributions = relationship("Contribution", back_populates="user", cascade="all, delete-orphan")

class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lum_balance = Column(Float, default=0.0)
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
    total_lum_distributed = Column(Float, default=0.0, nullable=False)
    total_contributions = Column(BigInteger, default=0, nullable=False)
    mean_complexity = Column(Float, default=5.0, nullable=False)
    m2_complexity = Column(Float, default=0.0, nullable=False)
    variance_complexity = Column(Float, default=4.0, nullable=False)
    std_dev_complexity = Column(Float, default=2.0, nullable=False)

class Contribution(Base):
    __tablename__ = "contributions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    raw_content = Column(Text, nullable=False)
    valuation_results = Column(JSONB if "postgresql" in settings.DATABASE_URL else Text, nullable=False)
    reward_amount = Column(Float, nullable=False)
    content_hash = Column(String, nullable=True, index=True)
    user = relationship("User", back_populates="contributions")