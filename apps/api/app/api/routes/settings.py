from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.security import hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.models.user_settings import UserSettings

router = APIRouter(
    prefix="/settings",
    tags=["Settings"],
)


class UserSettingsSchema(BaseModel):
    theme: str = "dark"
    target_ats_score: int = 85
    resume_length: str = "one_page"
    max_optimization_attempts: int = 3
    notifications_enabled: bool = True


class ProfileUpdateSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


@router.get("", response_model=UserSettingsSchema)
def get_user_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    settings = db.scalar(stmt)

    if not settings:
        settings = UserSettings(
            user_id=current_user.id,
            theme="dark",
            target_ats_score=85,
            resume_length="one_page",
            max_optimization_attempts=3,
            notifications_enabled=True,
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return UserSettingsSchema(
        theme=settings.theme,
        target_ats_score=settings.target_ats_score,
        resume_length=settings.resume_length,
        max_optimization_attempts=settings.max_optimization_attempts,
        notifications_enabled=settings.notifications_enabled,
    )


@router.patch("", response_model=UserSettingsSchema)
def update_user_settings(
    payload: UserSettingsSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    settings = db.scalar(stmt)

    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)

    settings.theme = payload.theme
    settings.target_ats_score = payload.target_ats_score
    settings.resume_length = payload.resume_length
    settings.max_optimization_attempts = payload.max_optimization_attempts
    settings.notifications_enabled = payload.notifications_enabled

    db.commit()
    db.refresh(settings)

    return UserSettingsSchema(
        theme=settings.theme,
        target_ats_score=settings.target_ats_score,
        resume_length=settings.resume_length,
        max_optimization_attempts=settings.max_optimization_attempts,
        notifications_enabled=settings.notifications_enabled,
    )


@router.put("/profile")
def update_profile(
    payload: ProfileUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.name:
        current_user.name = payload.name.strip()

    if payload.email and payload.email.strip().lower() != current_user.email:
        new_email = payload.email.strip().lower()
        stmt = select(User).where(User.email == new_email)
        exists = db.scalar(stmt)
        if exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already taken by another account.",
            )
        current_user.email = new_email

    if payload.new_password:
        if not payload.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to set a new password.",
            )
        if not current_user.password_hash or not verify_password(
            payload.current_password, current_user.password_hash
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password does not match.",
            )
        if len(payload.new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 8 characters long.",
            )
        current_user.password_hash = hash_password(payload.new_password)

    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "message": "Profile updated successfully.",
    }
