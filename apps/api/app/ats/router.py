from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User

from app.schemas.resume import ResumeResponse
from app.services.resume_service import get_resume_by_id

from app.ats.schemas import (
    ATSEvaluationRequest,
    ATSEvaluationResponse,
)

from app.ats.service import evaluate_resume


router = APIRouter(
    prefix="/ats",
    tags=["ATS Evaluation"],
)


# ======================================================
# ATS EVALUATION
# ======================================================

@router.post(
    "/evaluate",
    response_model=ATSEvaluationResponse,
)
def evaluate_resume_for_job(
    request: ATSEvaluationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --------------------------------------------------
    # Find resume belonging to logged-in user
    # --------------------------------------------------

    resume = get_resume_by_id(
        db=db,
        resume_id=request.resume_id,
        user_id=current_user.id,
    )

    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    # --------------------------------------------------
    # Evaluate resume
    # --------------------------------------------------

    result = evaluate_resume(
        db=db,
        resume=resume,
        job_description=request.job_description,
    )

    return result