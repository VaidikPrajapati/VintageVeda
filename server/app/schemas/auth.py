from pydantic import BaseModel, EmailStr
from typing import Optional, List


# ── Signup ──
class SignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class SignupResponse(BaseModel):
    message: str
    user_id: str


# ── Login ──
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ── Complete Profile (Step 2) ──
class CompleteProfileRequest(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    has_allergies: bool = False
    allergies: List[str] = []
    pre_existing: Optional[str] = None
    health_goal: Optional[str] = None


# ── User Profile Response ──
class UserProfile(BaseModel):
    id: str
    full_name: str
    email: str
    email_verified: bool
    role: str
    profile_complete: bool
    dosha_type: str
    allergies: List[str]
    dark_mode: bool
    created_at: str


# ── Update Profile ──
class UpdateProfileRequest(BaseModel):
    allergies: Optional[List[str]] = None
    dosha_type: Optional[str] = None
    dark_mode: Optional[bool] = None


# ── Password Reset ──
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ── Refresh Token ──
class RefreshRequest(BaseModel):
    refresh_token: str
