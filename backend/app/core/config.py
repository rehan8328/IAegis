from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "IAEGIS"
    DEBUG: bool = True
    VERSION: str = "1.0.0"
    DATABASE_URL: str = "sqlite+aiosqlite:///./iaegis.db"
    SECRET_KEY: str = "change-in-production"
    AGENT_API_KEY: str = "iaegis-dev-agent-key"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    THREAT_SCORE_LOW: int = 25
    THREAT_SCORE_MEDIUM: int = 50
    THREAT_SCORE_HIGH: int = 75
    THREAT_SCORE_CRITICAL: int = 90
    INCIDENT_AUTO_CREATE_SCORE: int = 70
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
