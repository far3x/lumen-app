from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Dict, Any

class Settings(BaseSettings):
    # .env file location
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    # JWT Authentication
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Public Database Connection
    DB_USER: str = "app_user"
    DB_PASSWORD: str = "appg9"
    DB_NAME: str = "app_db"
    DB_HOST: str = "app.garageisep.com"
    DB_PORT: int = 5409

    @property
    def public_db_config(self) -> Dict[str, Any]:
        """Returns the public database configuration as a dictionary."""
        return {
            "user": self.DB_USER,
            "password": self.DB_PASSWORD,
            "database": self.DB_NAME,
            "host": self.DB_HOST,
            "port": self.DB_PORT,
        }

# Create a single, importable instance of the settings
settings = Settings()