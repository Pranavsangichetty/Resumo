from pydantic import BaseModel, Field


# ======================================================
# OPTIMIZATION ANALYSIS REQUEST
# ======================================================

class OptimizationAnalysisRequest(BaseModel):
    resume_id: int = Field(
        ...,
        gt=0,
        description="ID of the resume to analyze",
    )

    job_description: str = Field(
        ...,
        min_length=20,
        description="Target job description",
    )


# ======================================================
# OPTIMIZATION ISSUE
# ======================================================

class OptimizationIssue(BaseModel):
    category: str
    title: str
    description: str
    priority: str


# ======================================================
# OPTIMIZATION ANALYSIS RESPONSE
# ======================================================

class OptimizationAnalysisResponse(BaseModel):
    resume_id: int

    current_score: int = Field(
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

    issues: list[OptimizationIssue] = Field(
        default_factory=list,
    )

    recommendations: list[str] = Field(
        default_factory=list,
    )


# ======================================================
# AI OPTIMIZATION REQUEST
# ======================================================

class OptimizationRequest(BaseModel):
    resume_id: int = Field(
        ...,
        gt=0,
        description="ID of the resume to optimize",
    )

    job_description: str = Field(
        ...,
        min_length=20,
        description="Target job description",
    )


# ======================================================
# AI OPTIMIZATION RESPONSE
# ======================================================

class OptimizationResponse(BaseModel):
    resume_id: int

    original_content: str

    optimized_content: str

    changes: list[str] = Field(
        default_factory=list,
    )

    added_keywords: list[str] = Field(
        default_factory=list,
    )

    removed_keywords: list[str] = Field(
        default_factory=list,
    )

    summary: str = ""

    warnings: list[str] = Field(
        default_factory=list,
    )


# ======================================================
# SAVE OPTIMIZED RESUME REQUEST
# ======================================================

class SaveOptimizedResumeRequest(BaseModel):
    resume_id: int = Field(
        ...,
        gt=0,
        description="ID of the original resume",
    )

    optimized_content: str = Field(
        ...,
        min_length=1,
        description="AI optimized resume content",
    )


# ======================================================
# SAVE OPTIMIZED RESUME RESPONSE
# ======================================================

class SaveOptimizedResumeResponse(BaseModel):
    resume_id: int

    original_resume_id: int

    title: str

    message: str

# ======================================================
# SAVE OPTIMIZED RESUME REQUEST
# ======================================================

class SaveOptimizedResumeRequest(BaseModel):
    resume_id: int = Field(
        ...,
        gt=0,
        description="Original resume ID",
    )

    optimized_content: str = Field(
        ...,
        min_length=1,
        description="AI optimized resume content",
    )

    title: str = Field(
        default="AI Optimized Resume",
        min_length=1,
        max_length=255,
        description="Title for the new resume",
    )


# ======================================================
# SAVE OPTIMIZED RESUME RESPONSE
# ======================================================

class SaveOptimizedResumeResponse(BaseModel):
    resume_id: int
    title: str
    content: str
    message: str