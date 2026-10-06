import re
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.resume import Resume
from app.models.user import User

router = APIRouter(
    prefix="/job-description",
    tags=["Job Description"],
)


class JDAnalysisRequest(BaseModel):
    job_title: Optional[str] = None
    company: Optional[str] = None
    job_description: str
    resume_id: Optional[int] = None


class JDAnalysisResponse(BaseModel):
    role_detected: str
    seniority_level: str
    key_responsibilities: List[str]
    required_skills: List[str]
    preferred_skills: List[str]
    top_keywords: List[str]
    suggested_action_verbs: List[str]
    resume_match_score: Optional[int] = None
    matched_skills: List[str] = []
    missing_skills: List[str] = []


COMMON_TECH_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "FastAPI",
    "SQL", "PostgreSQL", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git",
    "CI/CD", "REST API", "GraphQL", "Tailwind CSS", "HTML5", "CSS3", "Redux",
    "Microservices", "Agile", "Scrum", "Machine Learning", "Data Analysis",
    "Pandas", "NumPy", "TensorFlow", "PyTorch", "Linux", "Terraform", "Redis",
    "MongoDB", "C++", "Java", "Spring Boot", "Go", "Rust", "System Design"
]

ACTION_VERBS = [
    "Architected", "Engineered", "Optimized", "Spearheaded", "Accelerated",
    "Designed", "Implemented", "Streamlined", "Maximized", "Delivered",
    "Orchestrated", "Enhanced", "Integrated", "Pioneered", "Automated"
]


@router.post("/analyze", response_model=JDAnalysisResponse)
def analyze_job_description(
    payload: JDAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    text = payload.job_description.strip()
    if len(text) < 30:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description must be at least 30 characters long.",
        )

    # 1. Detect seniority level
    lower_text = text.lower()
    if any(w in lower_text for w in ["lead", "principal", "staff", "director", "head of"]):
        seniority = "Lead / Principal"
    elif any(w in lower_text for w in ["senior", "sr.", "5+ years", "6+ years", "7+ years"]):
        seniority = "Senior"
    elif any(w in lower_text for w in ["junior", "associate", "entry", "intern", "0-2 years"]):
        seniority = "Entry / Junior"
    else:
        seniority = "Mid-Level"

    # 2. Detect role
    role = payload.job_title or "Software Engineer / Professional"
    if not payload.job_title:
        for possible_role in [
            "Full Stack Developer", "Frontend Developer", "Backend Developer",
            "DevOps Engineer", "Data Scientist", "Product Manager",
            "Software Engineer", "Cloud Architect", "QA Engineer"
        ]:
            if possible_role.lower() in lower_text:
                role = possible_role
                break

    # 3. Extract skills present in text
    detected_skills = [
        skill for skill in COMMON_TECH_SKILLS
        if re.search(rf"\b{re.escape(skill)}\b", text, re.IGNORECASE)
    ]

    if not detected_skills:
        # Fallback keyword extraction
        words = re.findall(r"\b[A-Za-z]{3,15}\b", text)
        freq = {}
        for w in words:
            cap = w.capitalize()
            if cap not in ["And", "The", "For", "With", "You", "Our", "Will", "Are", "That", "Have"]:
                freq[cap] = freq.get(cap, 0) + 1
        detected_skills = sorted(freq.keys(), key=lambda k: freq[k], reverse=True)[:10]

    # Split required vs preferred
    split_point = len(detected_skills) // 2 or 1
    required_skills = detected_skills[:split_point]
    preferred_skills = detected_skills[split_point:]

    # 4. Extract responsibilities from bullet lines
    lines = text.split("\n")
    responsibilities = []
    for line in lines:
        cleaned = line.strip(" -*•\t\r")
        if len(cleaned) > 25 and len(cleaned) < 180:
            responsibilities.append(cleaned)
        if len(responsibilities) >= 5:
            break
    if not responsibilities:
        responsibilities = [
            "Build, optimize, and maintain high-performance software systems.",
            "Collaborate with cross-functional teams to define architecture and requirements.",
            "Write scalable, clean, and thoroughly tested production code.",
        ]

    # 5. Extract top keywords
    top_keywords = detected_skills[:8] + [seniority, "Problem Solving", "Scalability", "Team Collaboration"]

    # 6. Check resume match if resume_id provided
    match_score = None
    matched_skills = []
    missing_skills = list(detected_skills)

    if payload.resume_id:
        stmt = select(Resume).where(
            Resume.id == payload.resume_id,
            Resume.user_id == current_user.id,
        )
        resume = db.scalar(stmt)
        if resume and resume.content:
            res_text = resume.content.lower()
            matched = [s for s in detected_skills if s.lower() in res_text]
            missing = [s for s in detected_skills if s.lower() not in res_text]
            matched_skills = matched
            missing_skills = missing
            match_score = int((len(matched) / max(len(detected_skills), 1)) * 100)

    return JDAnalysisResponse(
        role_detected=role,
        seniority_level=seniority,
        key_responsibilities=responsibilities,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        top_keywords=list(set(top_keywords)),
        suggested_action_verbs=ACTION_VERBS[:8],
        resume_match_score=match_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
    )
