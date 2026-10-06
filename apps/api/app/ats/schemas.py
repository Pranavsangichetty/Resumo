from pydantic import BaseModel, Field


# ======================================================
# ATS EVALUATION REQUEST
# ======================================================

class ATSEvaluationRequest(BaseModel):
    resume_id: int = Field(
        ...,
        gt=0,
        description="ID of the resume to evaluate",
    )

    job_description: str = Field(
        ...,
        min_length=20,
        description="Job description to compare against the resume",
    )


# ======================================================
# ATS EVALUATION RESPONSE
# ======================================================

class ATSEvaluationResponse(BaseModel):
    score: int = Field(
        ...,
        ge=0,
        le=100,
    )

    keyword_match: int = Field(
        ...,
        ge=0,
        le=100,
    )

    skills_match: int = Field(
        ...,
        ge=0,
        le=100,
    )

    experience_match: int = Field(
        ...,
        ge=0,
        le=100,
    )

    education_match: int = Field(
        ...,
        ge=0,
        le=100,
    )

    matched_keywords: list[str] = Field(
        default_factory=list,
    )

    missing_keywords: list[str] = Field(
        default_factory=list,
    )

    suggestions: list[str] = Field(
        default_factory=list,
    )