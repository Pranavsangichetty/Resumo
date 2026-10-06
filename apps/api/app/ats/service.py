import json
import re

from sqlalchemy.orm import Session

from app.models.resume import Resume


# ======================================================
# COMMON ATS / JOB KEYWORDS
# ======================================================

COMMON_KEYWORDS = {
    "python",
    "sql",
    "excel",
    "power bi",
    "tableau",
    "machine learning",
    "deep learning",
    "data analysis",
    "data analytics",
    "statistics",
    "pandas",
    "numpy",
    "scikit-learn",
    "tensorflow",
    "pytorch",
    "nlp",
    "natural language processing",
    "aws",
    "azure",
    "gcp",
    "docker",
    "git",
    "github",
    "etl",
    "data visualization",
    "dashboard",
    "dashboards",
    "reporting",
    "forecasting",
    "a/b testing",
    "api",
    "fastapi",
    "flask",
    "streamlit",
}


# ======================================================
# TEXT NORMALIZATION
# ======================================================

def normalize_text(text: str) -> str:
    text = text.lower()

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


# ======================================================
# EXTRACT KEYWORDS
# ======================================================

def extract_keywords(text: str) -> set[str]:
    """
    Extract relevant ATS keywords from text.

    Uses a controlled list of common technical,
    analytics, AI/ML and software keywords.
    """

    normalized = normalize_text(text)

    found: set[str] = set()

    for keyword in COMMON_KEYWORDS:
        if keyword in normalized:
            found.add(keyword)

    return found


# ======================================================
# CONVERT STRUCTURED RESUME TO TEXT
# ======================================================

def resume_content_to_text(
    content: str | None,
) -> str:

    if not content:
        return ""

    # --------------------------------------------------
    # Try structured JSON first
    # --------------------------------------------------

    try:
        data = json.loads(content)

        if isinstance(data, dict):
            text_parts: list[str] = []

            def collect_values(value):
                if isinstance(value, dict):
                    for nested_value in value.values():
                        collect_values(nested_value)

                elif isinstance(value, list):
                    for item in value:
                        collect_values(item)

                elif isinstance(value, str):
                    text_parts.append(value)

            collect_values(data)

            return " ".join(text_parts)

    except (json.JSONDecodeError, TypeError):
        pass

    # --------------------------------------------------
    # Fallback: plain text
    # --------------------------------------------------

    return content


# ======================================================
# CALCULATE MATCH PERCENTAGE
# ======================================================

def calculate_match_percentage(
    required_keywords: set[str],
    resume_keywords: set[str],
) -> int:

    if not required_keywords:
        return 0

    matched = (
        required_keywords
        & resume_keywords
    )

    percentage = (
        len(matched)
        / len(required_keywords)
    ) * 100

    return round(percentage)


# ======================================================
# ATS EVALUATION
# ======================================================

def evaluate_resume(
    db: Session,
    resume: Resume,
    job_description: str,
):
    resume_text = resume_content_to_text(
        resume.content
    )

    normalized_resume = normalize_text(
        resume_text
    )

    normalized_jd = normalize_text(
        job_description
    )

    # --------------------------------------------------
    # Extract keywords
    # --------------------------------------------------

    resume_keywords = extract_keywords(
        normalized_resume
    )

    jd_keywords = extract_keywords(
        normalized_jd
    )

    # --------------------------------------------------
    # Matched / missing keywords
    # --------------------------------------------------

    matched_keywords = sorted(
        resume_keywords & jd_keywords
    )

    missing_keywords = sorted(
        jd_keywords - resume_keywords
    )

    # --------------------------------------------------
    # Keyword match
    # --------------------------------------------------

    keyword_match = calculate_match_percentage(
        jd_keywords,
        resume_keywords,
    )

    # --------------------------------------------------
    # Skills match
    #
    # For the first ATS version we use the
    # keyword overlap as the skills signal.
    # --------------------------------------------------

    skills_match = keyword_match

    # --------------------------------------------------
    # Experience match
    #
    # Basic first version:
    # check whether the resume contains
    # experience-related terms from the JD.
    # --------------------------------------------------

    experience_terms = {
        "experience",
        "internship",
        "intern",
        "developer",
        "engineer",
        "analyst",
        "manager",
        "lead",
        "project",
    }

    jd_experience_terms = {
        term
        for term in experience_terms
        if term in normalized_jd
    }

    resume_experience_terms = {
        term
        for term in experience_terms
        if term in normalized_resume
    }

    experience_match = calculate_match_percentage(
        jd_experience_terms,
        resume_experience_terms,
    )

    # --------------------------------------------------
    # Education match
    # --------------------------------------------------

    education_terms = {
        "b.tech",
        "btech",
        "bachelor",
        "bachelors",
        "master",
        "masters",
        "m.tech",
        "mtech",
        "degree",
        "computer science",
        "engineering",
        "information technology",
        "data science",
    }

    jd_education_terms = {
        term
        for term in education_terms
        if term in normalized_jd
    }

    resume_education_terms = {
        term
        for term in education_terms
        if term in normalized_resume
    }

    if jd_education_terms:
        education_match = calculate_match_percentage(
            jd_education_terms,
            resume_education_terms,
        )
    else:
        # No explicit education requirement
        # should not punish the resume.
        education_match = 100

    # --------------------------------------------------
    # Overall score
    # --------------------------------------------------

    score = round(
        (
            keyword_match * 0.50
            + skills_match * 0.25
            + experience_match * 0.15
            + education_match * 0.10
        )
    )

    score = max(
        0,
        min(100, score),
    )

    # --------------------------------------------------
    # Suggestions
    # --------------------------------------------------

    suggestions: list[str] = []

    if missing_keywords:
        suggestions.append(
            "Consider adding relevant missing keywords "
            "from the job description when they genuinely "
            "match your skills or experience."
        )

    if keyword_match < 60:
        suggestions.append(
            "Increase alignment between your resume "
            "and the technical requirements in the "
            "job description."
        )

    if experience_match < 60:
        suggestions.append(
            "Add measurable achievements and "
            "role-specific experience relevant to "
            "the target position."
        )

    if education_match < 60:
        suggestions.append(
            "Make your relevant degree, field of study, "
            "or educational qualifications clearly visible."
        )

    if not suggestions:
        suggestions.append(
            "Your resume has good initial alignment "
            "with this job description. Focus on "
            "measurable achievements and clear wording."
        )

    return {
        "score": score,
        "keyword_match": keyword_match,
        "skills_match": skills_match,
        "experience_match": experience_match,
        "education_match": education_match,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "suggestions": suggestions,
    }