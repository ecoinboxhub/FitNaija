import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    TARGET_ENV: str = "development"

    # Database & Redis Settings
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/fitnaija"
    REDIS_URL: str = "redis://localhost:6379/0"

    # API Keys
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    TERMII_API_KEY: str = ""
    PAYSTACK_SECRET_KEY: str = ""
    REVENUECAT_API_KEY: str = ""
    GOOGLE_CLIENT_ID: str = ""

    # Security
    JWT_SECRET_KEY: str = "supersecretkeychangeinproduction"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS Allowed Origins
    ALLOWED_ORIGINS: List[str] = [
        "https://fitnaija.netlify.app",
        "https://main--fitnaija.netlify.app",
        "https://fitnaija.vercel.app",
        "https://fitnaija-3rnuhhk06-eco-s-projects0.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "capacitor://localhost",
        "https://localhost",
    ]

settings = Settings()
