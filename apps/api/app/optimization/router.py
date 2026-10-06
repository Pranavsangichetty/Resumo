from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.optimization.schemas import (
    OptimizationAnalysisRequest,
    OptimizationAnalysisResponse,
    OptimizationRequest,
    OptimizationResponse,
    SaveOptimizedResumeRequest,
    SaveOptimizedResumeResponse,
)

from app.optimization.service import (
    analyze_resume_for_optimization,
    optimize_resume,
    save_optimized_resume,
)

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User

from app.services.resume_service import get_resume_by_id

from app.optimization.schemas import (
    OptimizationAnalysisRequest,
    OptimizationAnalysisResponse,
    OptimizationRequest,
    OptimizationResponse,
)

from app.optimization.service import (
    analyze_resume_for_optimization,
    optimize_resume,
)


# ======================================================
# ROUTER
# ======================================================

router = APIRouter(
    prefix="/optimization",
    tags=["Optimization"],
)


# ======================================================
# ANALYZE RESUME
# ======================================================

@router.post(
    "/analyze",
    response_model=OptimizationAnalysisResponse,
)
def analyze_resume(
    request: OptimizationAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --------------------------------------------------
    # Find user's resume
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
    # Run ATS optimization analysis
    # --------------------------------------------------

    try:
        result = analyze_resume_for_optimization(
            db=db,
            resume=resume,
            job_description=request.job_description,
        )

        return result

    except Exception as exc:
        print(
            "Optimization analysis error:",
            repr(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to analyze resume.",
        )


# ======================================================
# AI OPTIMIZE RESUME
# ======================================================

@router.post(
    "/optimize",
    response_model=OptimizationResponse,
)
def optimize_resume_endpoint(
    request: OptimizationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --------------------------------------------------
    # Find user's resume
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
    # Run AI optimization
    # --------------------------------------------------

    try:
        result = optimize_resume(
            db=db,
            resume=resume,
            job_description=request.job_description,
        )

        return result

    except RuntimeError as exc:
        print(
            "AI optimization runtime error:",
            repr(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )

    except Exception as exc:
        print(
            "AI optimization error:",
            repr(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to optimize resume.",
        )

# ======================================================
# SAVE OPTIMIZED RESUME
# ======================================================

@router.post(
    "/save",
    response_model=SaveOptimizedResumeResponse,
)
def save_optimized_resume_endpoint(
    request: SaveOptimizedResumeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --------------------------------------------------
    # Find original resume
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
    # Validate optimized content
    # --------------------------------------------------

    if not request.optimized_content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Optimized resume content cannot be empty.",
        )

    # --------------------------------------------------
    # Create new resume
    # --------------------------------------------------

    try:
        new_resume = save_optimized_resume(
            db=db,
            original_resume=resume,
            optimized_content=request.optimized_content,
            title=request.title,
        )

        return {
            "resume_id": new_resume.id,
            "title": new_resume.title,
            "content": new_resume.content or "",
            "message": "Optimized resume saved successfully.",
        }

    except Exception as exc:
        db.rollback()

        print(
            "Save optimized resume error:",
            repr(exc),
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save optimized resume.",
        )
    