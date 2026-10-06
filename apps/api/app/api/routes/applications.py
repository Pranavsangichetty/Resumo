from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.application import Application
from app.models.user import User

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


class ApplicationCreate(BaseModel):
    company: str
    position: str
    location: Optional[str] = None
    status: str = "Applied"
    salary: Optional[str] = None
    applied_date: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None
    resume_id: Optional[int] = None


class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    salary: Optional[str] = None
    applied_date: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None
    resume_id: Optional[int] = None


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    company: str
    position: str
    location: Optional[str] = None
    status: str
    salary: Optional[str] = None
    applied_date: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None
    resume_id: Optional[int] = None

    class Config:
        from_attributes = True


@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Application).where(Application.user_id == current_user.id).order_by(Application.created_at.desc())
    return db.scalars(stmt).all()


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    app_entry = Application(
        user_id=current_user.id,
        company=payload.company.strip(),
        position=payload.position.strip(),
        location=payload.location,
        status=payload.status or "Applied",
        salary=payload.salary,
        applied_date=payload.applied_date,
        job_url=payload.job_url,
        notes=payload.notes,
        resume_id=payload.resume_id,
    )
    db.add(app_entry)
    db.commit()
    db.refresh(app_entry)
    return app_entry


@router.patch("/{app_id}", response_model=ApplicationResponse)
def update_application(
    app_id: int,
    payload: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Application).where(
        Application.id == app_id,
        Application.user_id == current_user.id,
    )
    app_entry = db.scalar(stmt)
    if not app_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(app_entry, field, value)

    db.commit()
    db.refresh(app_entry)
    return app_entry


@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Application).where(
        Application.id == app_id,
        Application.user_id == current_user.id,
    )
    app_entry = db.scalar(stmt)
    if not app_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    db.delete(app_entry)
    db.commit()
    return None
