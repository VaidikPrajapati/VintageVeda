from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "vintage_veda"

    # JWT
    jwt_secret_key: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7

    # AI — Gemini (Primary)
    gemini_api_key: Optional[str] = None

    # AI — OpenAI (Fallback)
    openai_api_key: Optional[str] = None

    # Email
    mail_username: Optional[str] = None
    mail_password: Optional[str] = None
    mail_from: str = "noreply@vintageveda.com"
    mail_server: str = "smtp.gmail.com"
    mail_port: int = 587

    # Cloudinary
    cloudinary_cloud_name: Optional[str] = None
    cloudinary_api_key: Optional[str] = None
    cloudinary_api_secret: Optional[str] = None

    # Frontend
    frontend_url: str = "http://localhost:5173"

    # App
    app_name: str = "Vintage Veda"
    debug: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
