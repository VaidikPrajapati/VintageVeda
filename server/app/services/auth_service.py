from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
import bcrypt
import secrets

from app.config import settings
from app.models.user import User, RefreshToken


def hash_password(password: str) -> str:
    """Hash a plain-text password with bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.jwt_access_token_expire_minutes))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.jwt_refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token. Raises JWTError on failure."""
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])


def generate_verification_token() -> str:
    """Generate a secure random token for email verification / password reset."""
    return secrets.token_urlsafe(32)


async def get_user_by_email(email: str) -> Optional[User]:
    """Find a user by email address."""
    return await User.find_one(User.email == email)


async def get_user_by_id(user_id: str) -> Optional[User]:
    """Find a user by their document ID."""
    return await User.get(user_id)


async def store_refresh_token(user_id: str, token: str) -> RefreshToken:
    """Store a refresh token in the database."""
    refresh = RefreshToken(
        user_id=user_id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(days=settings.jwt_refresh_token_expire_days),
    )
    await refresh.insert()
    return refresh


async def revoke_refresh_token(token: str) -> bool:
    """Delete a refresh token from the database."""
    doc = await RefreshToken.find_one(RefreshToken.token == token)
    if doc:
        await doc.delete()
        return True
    return False
