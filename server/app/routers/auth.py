from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime

from app.schemas.auth import (
    SignupRequest, SignupResponse, LoginRequest, TokenResponse,
    CompleteProfileRequest, UserProfile, UpdateProfileRequest,
    ForgotPasswordRequest, ResetPasswordRequest, RefreshRequest,
)
from app.services.auth_service import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    generate_verification_token,
    get_user_by_email, store_refresh_token, revoke_refresh_token,
)
from app.middleware.auth_middleware import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
async def signup(req: SignupRequest):
    """Step 1: Create account with name, email, password."""
    # Check if email already exists
    existing = await get_user_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user (auto-verified in dev — email service not configured)
    user = User(
        full_name=req.full_name,
        email=req.email,
        password_hash=hash_password(req.password),
        email_verified=True,  # Auto-verify for now
    )
    await user.insert()

    return SignupResponse(
        message="Account created successfully!",
        user_id=str(user.id),
    )


@router.get("/verify-email")
async def verify_email(token: str):
    """Verify email via token link clicked from email."""
    user = await User.find_one(User.verification_token == token)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    user.email_verified = True
    user.verification_token = None
    user.updated_at = datetime.utcnow()
    await user.save()

    # Issue tokens immediately after verification
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    await store_refresh_token(str(user.id), refresh_token)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """Login with email + password. Returns JWT tokens."""
    user = await get_user_by_email(req.email)

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.email_verified:
        raise HTTPException(status_code=403, detail="Please verify your email first")

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    await store_refresh_token(str(user.id), refresh_token)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/complete-profile")
async def complete_profile(req: CompleteProfileRequest, user: User = Depends(get_current_user)):
    """Step 2: Complete health profile after signup."""
    user.age = req.age
    user.gender = req.gender
    user.state = req.state
    user.city = req.city
    user.has_allergies = req.has_allergies
    user.allergies = req.allergies
    user.pre_existing = req.pre_existing
    user.health_goal = req.health_goal
    user.profile_complete = True
    user.updated_at = datetime.utcnow()
    await user.save()

    return {"message": "Profile completed successfully"}


@router.get("/me", response_model=UserProfile)
async def get_me(user: User = Depends(get_current_user)):
    """Get current authenticated user's profile."""
    return UserProfile(
        id=str(user.id),
        full_name=user.full_name,
        email=user.email,
        email_verified=user.email_verified,
        role=user.role,
        profile_complete=user.profile_complete,
        dosha_type=user.dosha_type,
        allergies=user.allergies,
        dark_mode=user.dark_mode,
        created_at=user.created_at.isoformat(),
    )


@router.put("/update-profile")
async def update_profile(req: UpdateProfileRequest, user: User = Depends(get_current_user)):
    """Update user preferences (allergies, dosha, dark_mode)."""
    if req.allergies is not None:
        user.allergies = req.allergies
        user.has_allergies = len(req.allergies) > 0
    if req.dosha_type is not None:
        user.dosha_type = req.dosha_type
    if req.dark_mode is not None:
        user.dark_mode = req.dark_mode
    user.updated_at = datetime.utcnow()
    await user.save()

    return {"message": "Profile updated"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(req: RefreshRequest):
    """Get new access token using a refresh token."""
    try:
        payload = decode_token(req.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    # Revoke old, issue new (token rotation)
    await revoke_refresh_token(req.refresh_token)

    access_token = create_access_token(data={"sub": user_id})
    new_refresh = create_refresh_token(data={"sub": user_id})
    await store_refresh_token(user_id, new_refresh)

    return TokenResponse(access_token=access_token, refresh_token=new_refresh)


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    """Send password reset email with token."""
    user = await get_user_by_email(req.email)
    if not user:
        # Don't reveal whether email exists
        return {"message": "If that email exists, a reset link has been sent."}

    user.reset_token = generate_verification_token()
    user.reset_token_expiry = datetime.utcnow()
    await user.save()

    # TODO: Send reset email via email_service
    # await send_reset_email(user.email, user.reset_token)

    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    """Reset password using emailed token."""
    user = await User.find_one(User.reset_token == req.token)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user.password_hash = hash_password(req.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    user.updated_at = datetime.utcnow()
    await user.save()

    return {"message": "Password reset successful. Please login with your new password."}


@router.post("/logout")
async def logout(user: User = Depends(get_current_user)):
    """Invalidate all refresh tokens for this user."""
    from app.models.user import RefreshToken
    await RefreshToken.find(RefreshToken.user_id == str(user.id)).delete()
    return {"message": "Logged out successfully"}
