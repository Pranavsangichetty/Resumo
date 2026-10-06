from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.resume import Resume
from app.schemas.resume import ResumeCreate, ResumeUpdate


# ======================================================
# CREATE RESUME
# ======================================================

def create_resume(
    db: Session,
    user_id: int,
    resume_data: ResumeCreate,
) -> Resume:
    resume = Resume(
        user_id=user_id,
        title=resume_data.title,
        content=resume_data.content,
        original_filename=resume_data.original_filename,
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return resume


# ======================================================
# GET USER RESUMES
# ======================================================

def get_user_resumes(
    db: Session,
    user_id: int,
) -> list[Resume]:
    statement = (
        select(Resume)
        .where(Resume.user_id == user_id)
        .order_by(Resume.updated_at.desc())
    )

    return list(
        db.scalars(statement).all()
    )


# ======================================================
# GET RESUME BY ID
# ======================================================

def get_resume_by_id(
    db: Session,
    resume_id: int,
    user_id: int,
) -> Resume | None:
    statement = select(Resume).where(
        Resume.id == resume_id,
        Resume.user_id == user_id,
    )

    return db.scalar(statement)


# ======================================================
# UPDATE RESUME
# ======================================================

def update_resume(
    db: Session,
    resume: Resume,
    resume_data: ResumeUpdate,
) -> Resume:

    update_data = resume_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(
            resume,
            field,
            value,
        )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return resume


# ======================================================
# DELETE RESUME
# ======================================================

def delete_resume(
    db: Session,
    resume: Resume,
) -> None:
    db.delete(resume)
    db.commit()


# ======================================================
# CREATE OPTIMIZED RESUME
# ======================================================

def create_optimized_resume(
    db: Session,
    user_id: int,
    original_resume: Resume,
    optimized_content: str,
) -> Resume:
    """
    Create a new resume containing the AI-optimized
    content.

    The original resume is NOT modified.
    """

    original_title = (
        original_resume.title
        or "Resume"
    )

    optimized_title = (
        f"{original_title} - Optimized"
    )

    optimized_resume = Resume(
        user_id=user_id,
        title=optimized_title,
        content=optimized_content,
        original_filename=(
            original_resume.original_filename
        ),
    )

    db.add(optimized_resume)
    db.commit()
    db.refresh(optimized_resume)

    return optimized_resume