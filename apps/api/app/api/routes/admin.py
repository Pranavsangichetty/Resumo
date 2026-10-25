from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_admin_user
from app.core.config import settings
from app.db.session import get_db
from app.models.application import Application
from app.models.ats_evaluation import ATSEvaluation
from app.models.resume import Resume
from app.models.user import User

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
)


class UserStatusUpdate(BaseModel):
    is_active: bool


@router.get("/overview")
def get_admin_overview(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
) -> dict[str, Any]:
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    verified_users = db.query(func.count(User.id)).filter(User.is_verified == True).scalar() or 0

    total_resumes = db.query(func.count(Resume.id)).scalar() or 0
    total_applications = db.query(func.count(Application.id)).scalar() or 0
    total_ats_scans = db.query(func.count(ATSEvaluation.id)).scalar() or 0

    # Recent signups (last 5)
    recent_users_records = (
        db.query(User)
        .order_by(User.created_at.desc())
        .limit(5)
        .all()
    )

    recent_users = [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "auth_provider": u.auth_provider,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "is_admin": u.email.lower() in settings.admin_emails_list,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in recent_users_records
    ]

    return {
        "metrics": {
            "total_users": total_users,
            "active_users": active_users,
            "verified_users": verified_users,
            "total_resumes": total_resumes,
            "total_applications": total_applications,
            "total_ats_scans": total_ats_scans,
        },
        "recent_users": recent_users,
    }


@router.get("/users")
def get_admin_users(
    search: str = Query(default="", description="Search by name or email"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
) -> dict[str, Any]:
    query = db.query(User)

    if search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            (func.lower(User.name).like(term)) | (func.lower(User.email).like(term))
        )

    total_count = query.count()
    users = query.order_by(User.created_at.desc()).offset(offset).limit(limit).all()

    # Pre-aggregate usage counts per user
    user_ids = [u.id for u in users]

    resume_counts = {}
    if user_ids:
        r_counts = (
            db.query(Resume.user_id, func.count(Resume.id))
            .filter(Resume.user_id.in_(user_ids))
            .group_by(Resume.user_id)
            .all()
        )
        resume_counts = dict(r_counts)

    app_counts = {}
    if user_ids:
        a_counts = (
            db.query(Application.user_id, func.count(Application.id))
            .filter(Application.user_id.in_(user_ids))
            .group_by(Application.user_id)
            .all()
        )
        app_counts = dict(a_counts)

    ats_counts = {}
    if user_ids:
        ats_data = (
            db.query(ATSEvaluation.user_id, func.count(ATSEvaluation.id))
            .filter(ATSEvaluation.user_id.in_(user_ids))
            .group_by(ATSEvaluation.user_id)
            .all()
        )
        ats_counts = dict(ats_data)

    user_list = [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "auth_provider": u.auth_provider,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "is_admin": u.email.lower() in settings.admin_emails_list,
            "avatar_url": u.avatar_url,
            "resumes_count": resume_counts.get(u.id, 0),
            "applications_count": app_counts.get(u.id, 0),
            "ats_scans_count": ats_counts.get(u.id, 0),
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "updated_at": u.updated_at.isoformat() if u.updated_at else None,
        }
        for u in users
    ]

    return {
        "total": total_count,
        "users": user_list,
    }


@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
) -> dict[str, Any]:
    target_user = db.get(User, user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Protect super admins from being deactivated
    if target_user.email.lower() in settings.admin_emails_list and not payload.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate an admin account",
        )

    target_user.is_active = payload.is_active
    db.commit()
    db.refresh(target_user)

    return {
        "id": target_user.id,
        "email": target_user.email,
        "is_active": target_user.is_active,
        "message": f"User status set to {'Active' if target_user.is_active else 'Suspended'}",
    }
