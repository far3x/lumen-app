import os
from pydantic import EmailStr
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class AppSettings(BaseSettings):
    PROJECT_NAME: str = "Lumen Exchange"
    PROJECT_VERSION: str = "1.0.0"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lumen_exchange.db")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    BUSINESS_FRONTEND_URL: str = os.getenv("BUSINESS_FRONTEND_URL", "http://localhost:5174")
    
    PUBLIC_LOGO_URL: str = os.getenv("PUBLIC_LOGO_URL", "https://i.ibb.co/9HV06CSK/logso.png")

    API_URL: str = os.getenv("API_URL", "http://localhost:8000") 

    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY")
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    LUMEN_CLIENT_SECRET: str = os.getenv("LUMEN_CLIENT_SECRET")

    GITHUB_CLIENT_ID: str = os.getenv("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET: str = os.getenv("GITHUB_CLIENT_SECRET")
    GITHUB_SEARCH_PAT: str = os.getenv("GITHUB_SEARCH_PAT")

    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

    VALUATION_MODE: str = os.getenv("VALUATION_MODE", "MANUAL")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL_NAME: str = os.getenv("GEMINI_MODEL_NAME", "gemini-2.5-flash")
    GEMINI_TEMPERATURE: float = float(os.getenv("GEMINI_TEMPERATURE", "0.2"))
    
    GOOGLE_RECAPTCHA_SITE_KEY: str = os.getenv("GOOGLE_RECAPTCHA_SITE_KEY")
    GOOGLE_RECAPTCHA_SECRET_KEY: str = os.getenv("GOOGLE_RECAPTCHA_SECRET_KEY")

    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD")
    MAIL_FROM: EmailStr = os.getenv("MAIL_FROM")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", 587))
    MAIL_SERVER: str = os.getenv("MAIL_SERVER")
    MAIL_FROM_NAME: str = os.getenv("MAIL_FROM_NAME")
    MAIL_STARTTLS: bool = os.getenv("MAIL_STARTTLS", "True").lower() in ("true", "1", "t")
    MAIL_SSL_TLS: bool = os.getenv("MAIL_SSL_TLS", "False").lower() in ("true", "1", "t")

    SOLANA_RPC_URL: str = os.getenv("SOLANA_RPC_URL", "https://solana-rpc.publicnode.com")
    TREASURY_PRIVATE_KEY: str = os.getenv("TREASURY_PRIVATE_KEY")
    LUM_TOKEN_MINT_ADDRESS: str = os.getenv("LUM_TOKEN_MINT_ADDRESS")
    USDC_TOKEN_MINT_ADDRESS: str = os.getenv("USDC_TOKEN_MINT_ADDRESS")
    
    COOLDOWN_DAYS: int = int(os.getenv("COOLDOWN_DAYS", "7"))

    BETA_MODE_ENABLED: bool = os.getenv("BETA_MODE_ENABLED", "False").lower() in ("true", "1", "t")
    BETA_MAX_USERS: int = int(os.getenv("BETA_MAX_USERS", "200"))
    BETA_GENESIS_BONUS: float = float(os.getenv("BETA_GENESIS_BONUS", "1000.0"))
    
    BIRDEYE_API_KEY: str = os.getenv("BIRDEYE_API_KEY")

    DEV_MODE: bool = os.getenv("DEV_MODE", "False").lower() in ("true", "1", "t")

    AIRDROP_WALLET_PRIVATE_KEY: str = os.getenv("AIRDROP_WALLET_PRIVATE_KEY")
    AIRDROP_TOKEN_MINT_ADDRESS: str = os.getenv("AIRDROP_TOKEN_MINT_ADDRESS")

    FACILITATOR_URL: str = os.getenv("FACILITATOR_URL", "https://facilitator.payai.network")
    MERCHANT_WALLET_ADDRESS: str = os.getenv("MERCHANT_WALLET_ADDRESS", "meow11a1Nn9i5ASDDVZg92sVT3dw4LRz6D2KqBK3p8v")

    IRYS_PRIVATE_KEY: str = os.getenv("IRYS_PRIVATE_KEY")
    IRYS_NETWORK: str = os.getenv("IRYS_NETWORK", "devnet")
    IRYS_TOKEN: str = os.getenv("IRYS_TOKEN", "solana")


settings = AppSettings()