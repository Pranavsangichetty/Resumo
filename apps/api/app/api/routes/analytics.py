import json
import re
from collections import Counter
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.application import Application
from app.models.ats_evaluation import ATSEvaluation
from app.models.resume import Resume
from app.models.user import User

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)

ACTIVE_STATUSES = {"applied", "interviewing"}
INTERVIEW_STATUSES = {"interviewing", "offer"}


def _avg(values: list[int]) -> int | None:
    return round(sum(values) / len(values)) if values else None


def _resume_text_and_skills(content: str | None) -> tuple[str, list[str]]:
    """Flatten resume JSON content into searchable text plus its skills list."""
    if not content:
        return "", []
    try:
        data = json.loads(content)
    except (ValueError, TypeError):
        return content, []

    parts: list[str] = []

    def walk(node: Any) -> None:
        if isinstance(node, str):
            parts.append(node)
        elif isinstance(node, dict):
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for value in node:
                walk(value)

    walk(data)
    skills = data.get("skills") if isinstance(data, dict) else None
    skills = [s.strip() for s in skills if isinstance(s, str) and s.strip()] if isinstance(skills, list) else []
    return " ".join(parts), skills


def _count_term(text: str, term: str) -> int:
    pattern = r"(?<![A-Za-z0-9])" + re.escape(term) + r"(?![A-Za-z0-9])"
    return len(re.findall(pattern, text, flags=re.IGNORECASE))


@router.get("")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # ---------------- ATS evaluations ----------------
    evaluations = db.scalars(
        select(ATSEvaluation)
        .where(ATSEvaluation.user_id == current_user.id)
        .order_by(ATSEvaluation.created_at.asc(), ATSEvaluation.id.asc())
    ).all()

    scores = [e.score for e in evaluations]
    score_change = scores[-1] - scores[0] if len(scores) >= 2 else None

    breakdown = None
    if evaluations:
        breakdown = {
            "keyword_match": _avg([e.keyword_match for e in evaluations]),
            "skills_match": _avg([e.skills_match for e in evaluations]),
            "experience_match": _avg([e.experience_match for e in evaluations]),
            "education_match": _avg([e.education_match for e in evaluations]),
        }

    matched_counter: Counter[str] = Counter()
    missing_counter: Counter[str] = Counter()
    for e in evaluations:
        matched_counter.update({k.lower() for k in (e.matched_keywords or [])})
        missing_counter.update({k.lower() for k in (e.missing_keywords or [])})

    top_matched_skill = None
    if matched_counter:
        name, count = matched_counter.most_common(1)[0]
        top_matched_skill = {
            "name": name,
            "evaluations": count,
            "match_rate": round(count / len(evaluations) * 100),
        }

    # ---------------- Applications ----------------
    applications = db.scalars(
        select(Application).where(Application.user_id == current_user.id)
    ).all()

    status_counts: Counter[str] = Counter(a.status or "Applied" for a in applications)
    normalized = [(a.status or "applied").lower() for a in applications]
    submitted = [s for s in normalized if s != "saved"]
    active = [a for a, s in zip(applications, normalized) if s in ACTIVE_STATUSES]
    interviews = sum(1 for s in submitted if s in INTERVIEW_STATUSES)

    # ---------------- Keyword density (latest resume) ----------------
    latest_resume = db.scalars(
        select(Resume)
        .where(Resume.user_id == current_user.id)
        .order_by(Resume.updated_at.desc())
        .limit(1)
    ).first()

    keyword_density: list[dict[str, Any]] = []
    if latest_resume is not None:
        text, skills = _resume_text_and_skills(latest_resume.content)
        terms = skills or list(matched_counter.keys())
        seen: set[str] = set()
        for term in terms:
            key = term.lower()
            if key in seen:
                continue
            seen.add(key)
            count = _count_term(text, term)
            if count:
                keyword_density.append({"name": term, "count": count})
        keyword_density.sort(key=lambda k: k["count"], reverse=True)
        keyword_density = keyword_density[:12]

    return {
        "ats": {
            "evaluation_count": len(evaluations),
            "average_score": _avg(scores),
            "latest_score": scores[-1] if scores else None,
            "best_score": max(scores) if scores else None,
            "score_change": score_change,
            "breakdown": breakdown,
            "history": [
                {"date": e.created_at.isoformat() if e.created_at else None, "score": e.score, "resume_id": e.resume_id}
                for e in evaluations[-20:]
            ],
            "top_matched_skill": top_matched_skill,
            "top_missing_keywords": [
                {"name": n, "count": c} for n, c in missing_counter.most_common(8)
            ],
        },
        "applications": {
            "total": len(applications),
            "active": len(active),
            "active_companies": len({a.company.strip().lower() for a in active}),
            "submitted": len(submitted),
            "interviews": interviews,
            "interview_conversion": round(interviews / len(submitted) * 100) if submitted else None,
            "status_counts": dict(status_counts),
        },
        "keyword_density": {
            "resume_title": latest_resume.title if latest_resume else None,
            "keywords": keyword_density,
        },
    }
