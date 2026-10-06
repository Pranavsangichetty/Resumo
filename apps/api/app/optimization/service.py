from sqlalchemy.orm import Session
from app.models.resume import Resume

from app.models.resume import Resume
from app.ats.service import evaluate_resume

from app.optimization.ai_optimizer import (
    optimize_resume_with_ai,
)

from app.services.resume_service import (
    create_optimized_resume,
)


# ======================================================
# OPTIMIZATION ANALYSIS
# ======================================================

def analyze_resume_for_optimization(
    db: Session,
    resume: Resume,
    job_description: str,
):
    """
    Analyze an existing resume against a job description.

    This uses the ATS engine as the foundation
    for the optimization loop.

    It does NOT modify the resume.
    """

    # ==================================================
    # RUN ATS EVALUATION
    # ==================================================

    ats_result = evaluate_resume(
        db=db,
        resume=resume,
        job_description=job_description,
    )

    # ==================================================
    # EXTRACT ATS RESULTS
    # ==================================================

    current_score = ats_result.get(
        "score",
        0,
    )

    matched_keywords = ats_result.get(
        "matched_keywords",
        [],
    )

    missing_keywords = ats_result.get(
        "missing_keywords",
        [],
    )

    keyword_match = ats_result.get(
        "keyword_match",
        0,
    )

    skills_match = ats_result.get(
        "skills_match",
        0,
    )

    experience_match = ats_result.get(
        "experience_match",
        0,
    )

    education_match = ats_result.get(
        "education_match",
        0,
    )

    # ==================================================
    # BUILD OPTIMIZATION ISSUES
    # ==================================================

    issues = []

    # --------------------------------------------------
    # Missing keywords
    # --------------------------------------------------

    if missing_keywords:
        issues.append(
            {
                "category": "keywords",
                "title": "Missing job-specific keywords",
                "description": (
                    "The resume does not currently contain "
                    "some keywords detected in the target "
                    "job description."
                ),
                "priority": (
                    "high"
                    if len(missing_keywords) >= 4
                    else "medium"
                ),
            }
        )

    # --------------------------------------------------
    # Keyword alignment
    # --------------------------------------------------

    if keyword_match < 70:
        issues.append(
            {
                "category": "alignment",
                "title": "Low keyword alignment",
                "description": (
                    "The resume could be better aligned "
                    "with the terminology and technical "
                    "requirements used in the job description."
                ),
                "priority": "high",
            }
        )

    # --------------------------------------------------
    # Skills alignment
    # --------------------------------------------------

    if skills_match < 70:
        issues.append(
            {
                "category": "skills",
                "title": "Skills alignment needs improvement",
                "description": (
                    "Important skills mentioned in the job "
                    "description may not be clearly represented "
                    "in the resume."
                ),
                "priority": "high",
            }
        )

    # --------------------------------------------------
    # Experience alignment
    # --------------------------------------------------

    if experience_match < 70:
        issues.append(
            {
                "category": "experience",
                "title": "Experience alignment needs improvement",
                "description": (
                    "The resume could do a better job of "
                    "connecting previous experience and "
                    "projects with the requirements of "
                    "the target position."
                ),
                "priority": "medium",
            }
        )

    # --------------------------------------------------
    # Education alignment
    # --------------------------------------------------

    if education_match < 70:
        issues.append(
            {
                "category": "education",
                "title": "Education alignment needs improvement",
                "description": (
                    "Relevant education or field-of-study "
                    "information may not be clearly aligned "
                    "with the job requirements."
                ),
                "priority": "low",
            }
        )

    # ==================================================
    # BUILD RECOMMENDATIONS
    # ==================================================

    recommendations = []

    if missing_keywords:
        recommendations.append(
            (
                "Review the missing keywords and add "
                "only those that genuinely represent "
                "your skills, experience, or projects."
            )
        )

    if keyword_match < 70:
        recommendations.append(
            (
                "Use terminology from the job description "
                "naturally when describing relevant experience "
                "and projects."
            )
        )

    if skills_match < 70:
        recommendations.append(
            (
                "Make relevant technical skills easier to "
                "identify by listing them clearly in the "
                "skills section and supporting them with "
                "project or experience evidence."
            )
        )

    if experience_match < 70:
        recommendations.append(
            (
                "Rewrite relevant experience bullets around "
                "actions, technologies, outcomes, and "
                "measurable achievements."
            )
        )

    if education_match < 70:
        recommendations.append(
            (
                "Make your relevant degree and field of study "
                "easy for ATS systems to identify."
            )
        )

    if not recommendations:
        recommendations.append(
            (
                "Your resume already has strong initial "
                "alignment. Focus on measurable achievements, "
                "clear wording, and evidence for the skills "
                "listed in the job description."
            )
        )

    # ==================================================
    # RETURN ANALYSIS
    # ==================================================

    return {
        "resume_id": resume.id,
        "current_score": current_score,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "issues": issues,
        "recommendations": recommendations,
    }


# ======================================================
# AI OPTIMIZATION
# ======================================================

def optimize_resume(
    db: Session,
    resume: Resume,
    job_description: str,
):
    """
    Generate an AI-improved version of the resume.

    The original database record is NOT modified here.
    """

    # ==================================================
    # RUN ATS EVALUATION
    # ==================================================

    ats_result = evaluate_resume(
        db=db,
        resume=resume,
        job_description=job_description,
    )

    # ==================================================
    # GET ORIGINAL RESUME CONTENT
    # ==================================================

    original_content = resume.content or ""

    # ==================================================
    # GET ATS MISSING KEYWORDS
    # ==================================================

    missing_keywords = ats_result.get(
        "missing_keywords",
        [],
    )

    # ==================================================
    # RUN GEMINI OPTIMIZATION
    # ==================================================

    ai_result = optimize_resume_with_ai(
        resume_content=original_content,
        job_description=job_description,
        missing_keywords=missing_keywords,
    )

    # ==================================================
    # EXTRACT AI RESULTS
    # ==================================================

    optimized_content = ai_result.get(
        "optimized_content",
        "",
    )

    changes = ai_result.get(
        "changes",
        [],
    )

    added_keywords = ai_result.get(
        "added_keywords",
        [],
    )

    removed_keywords = ai_result.get(
        "removed_keywords",
        [],
    )

    summary = ai_result.get(
        "summary",
        "",
    )

    warnings = ai_result.get(
        "warnings",
        [],
    )

    # ==================================================
    # VALIDATE OPTIMIZED CONTENT
    # ==================================================

    if not optimized_content.strip():
        raise RuntimeError(
            "AI returned empty optimized resume content."
        )

    # ==================================================
    # RETURN OPTIMIZATION RESULT
    # ==================================================

    return {
        "resume_id": resume.id,

        "original_content": original_content,

        "optimized_content": optimized_content,

        "changes": changes,

        "added_keywords": added_keywords,

        "removed_keywords": removed_keywords,

        "summary": summary,

        "warnings": warnings,
    }


# ======================================================
# SAVE OPTIMIZED RESUME
# ======================================================

def save_optimized_resume(
    db: Session,
    user_id: int,
    resume: Resume,
    optimized_content: str,
) -> Resume:
    """
    Save the AI-optimized resume as a NEW resume.

    The original resume is never modified.
    """

    if not optimized_content.strip():
        raise RuntimeError(
            "Optimized resume content cannot be empty."
        )

    optimized_resume = create_optimized_resume(
        db=db,
        user_id=user_id,
        original_resume=resume,
        optimized_content=optimized_content,
    )

    return optimized_resume

# ======================================================
# SAVE OPTIMIZED RESUME
# ======================================================

def save_optimized_resume(
    db: Session,
    original_resume: Resume,
    optimized_content: str,
    title: str,
) -> Resume:
    """
    Create a new resume using the AI optimized content.

    The original resume is NOT modified.
    """

    new_resume = Resume(
        user_id=original_resume.user_id,
        title=title,
        content=optimized_content,
        original_filename=original_resume.original_filename,
    )

    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return new_resume