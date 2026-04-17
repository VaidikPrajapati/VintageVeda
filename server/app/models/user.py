from beanie import Document, Indexed
from pydantic import Field, EmailStr
from typing import Optional, List
from datetime import datetime


class User(Document):
    """User account — stores auth credentials and health profile."""

    full_name: str
    email: Indexed(str, unique=True)
    password_hash: str

    # Email verification
    email_verified: bool = False
    verification_token: Optional[str] = None

    # Password reset
    reset_token: Optional[str] = None
    reset_token_expiry: Optional[datetime] = None

    # Step 2: Health Profile
    age: Optional[int] = None
    gender: Optional[str] = None               # 'male'|'female'|'other'|'prefer_not_to_say'
    state: Optional[str] = None
    city: Optional[str] = None
    has_allergies: bool = False
    allergies: List[str] = []
    pre_existing: Optional[str] = None
    health_goal: Optional[str] = None           # 'general_wellness'|'specific_condition'|'explore'
    dosha_type: str = "unknown"                 # 'vata'|'pitta'|'kapha'|'unknown'

    # System
    role: str = "user"                          # 'user'|'admin'
    profile_complete: bool = False
    dark_mode: bool = False
    vedabot_sessions_today: int = 0
    vedabot_last_reset: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"


class Bookmark(Document):
    """User's saved remedy bookmark."""

    user_id: Indexed(str)
    remedy_id: Indexed(str)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "bookmarks"


class RefreshToken(Document):
    """JWT refresh token stored in DB for secure rotation."""

    user_id: Indexed(str)
    token: Indexed(str, unique=True)
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "refresh_tokens"
