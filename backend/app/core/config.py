import os
from functools import lru_cache
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv(".env", override=True)


class Settings(BaseSettings):
    PROJECT_NAME: str = "FinOS API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    PORT: int = 8000
    DEBUG: bool = False

    # Allowed CORS Origins
    FRONTEND_URL: str = "http://localhost:3000"

    # SQLite Local Database
    DB_PATH: str = "finos.db"

    # Single-User Master Password & Auth Token Secret
    APP_PASSWORD: str = "admin123"
    SECRET_KEY: str = "finos-master-secret-key-32charslongmin"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
