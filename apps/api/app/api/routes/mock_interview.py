from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/mock-interview",
    tags=["Mock Interview"],
)


class MockInterviewRequest(BaseModel):
    job_title: str
    seniority: Optional[str] = "Mid-Level"
    focus_area: Optional[str] = "mixed"  # technical, behavioral, system_design, mixed


class InterviewQuestion(BaseModel):
    id: int
    category: str
    question: str
    tips: str
    sample_key_points: List[str]


class MockInterviewResponse(BaseModel):
    job_title: str
    seniority: str
    questions: List[InterviewQuestion]


@router.post("/generate", response_model=MockInterviewResponse)
def generate_mock_interview(
    payload: MockInterviewRequest,
    current_user: User = Depends(get_current_user),
):
    title = payload.job_title.strip()
    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job title is required.",
        )

    questions = [
        InterviewQuestion(
            id=1,
            category="Behavioral (STAR)",
            question=f"Can you tell me about a time when you had to resolve a complex technical challenge under tight deadlines in a {title} role?",
            tips="Use the STAR method (Situation, Task, Action, Result). Highlight specific quantifiable metrics or outcomes.",
            sample_key_points=[
                "Set the context and urgency of the challenge clearly",
                "Explain the concrete actions you took and tools you utilized",
                "Conclude with the measurable outcome (e.g., 35% latency drop, zero downtime)",
            ],
        ),
        InterviewQuestion(
            id=2,
            category="Technical & Architecture",
            question=f"How would you design a scalable, fault-tolerant system or API for {title} workflows handling high concurrency?",
            tips="Discuss data flow, database indexing, caching strategies (Redis), asynchronous background processing, and error recovery.",
            sample_key_points=[
                "Define API contracts and database schema normalization vs caching",
                "Address bottlenecks: database connection pooling, load balancing, rate limiting",
                "Explain observability: distributed tracing, logging, and health metrics",
            ],
        ),
        InterviewQuestion(
            id=3,
            category="Problem Solving & Debugging",
            question="Describe how you investigate and troubleshoot a critical regression or performance bottleneck in production.",
            tips="Walk through your systematic debugging framework rather than jumping directly to conclusions.",
            sample_key_points=[
                "Isolate reproducible steps using logs, APM traces, and telemetry",
                "Formulate and test hypotheses methodically",
                "Deploy a guarded fix and implement automated regression tests",
            ],
        ),
        InterviewQuestion(
            id=4,
            category="Leadership & Collaboration",
            question="How do you handle disagreements on technical architecture or coding standards within your team?",
            tips="Emphasize active listening, data-driven trade-off analysis, and building consensus.",
            sample_key_points=[
                "Understand the differing viewpoints and underlying trade-offs",
                "Use benchmarks, RFCs, and prototyping to make objective choices",
                "Commit fully once a decision is agreed upon",
            ],
        ),
        InterviewQuestion(
            id=5,
            category="Role-Specific Depth",
            question=f"What modern frameworks, libraries, or architectural patterns do you consider essential for a high-impact {title} today?",
            tips="Demonstrate continuous learning and articulate why certain technologies are selected over alternatives.",
            sample_key_points=[
                "Mention modern developer toolchains and performance optimizations",
                "Discuss security best practices (JWT, OAuth2, sanitization, least privilege)",
                "Relate tool choices directly to business outcomes and team velocity",
            ],
        ),
    ]

    return MockInterviewResponse(
        job_title=title,
        seniority=payload.seniority or "Mid-Level",
        questions=questions,
    )
