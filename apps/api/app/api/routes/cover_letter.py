import json
import os
import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.resume import Resume
from app.models.user import User

router = APIRouter(
    prefix="/cover-letter",
    tags=["Cover Letter"],
)


class CoverLetterRequest(BaseModel):
    recipient_name: Optional[str] = "Hiring Manager"
    company_name: str
    job_title: str
    job_description: str  # Required
    resume_id: Optional[int] = None
    key_skills: Optional[str] = None  # Key skills to highlight
    additional_info: Optional[str] = None  # Additional context
    tone: Optional[str] = "professional"  # professional, confident, enthusiastic
    length: Optional[str] = "standard"  # short, standard, detailed


class CoverLetterResponse(BaseModel):
    cover_letter: str
    subject_line: str
    key_highlights: list[str]
    word_count: int


# ── Resume Parsing Helpers ───────────────────────────────────────────────────

def _extract_resume_details(raw_content: Optional[str]) -> dict:
    """Extract structured details from resume content, whether it's JSON or plain text."""
    if not raw_content:
        return {
            "name": None,
            "email": None,
            "phone": None,
            "skills": [],
            "experiences": [],
            "summary": "",
            "formatted_text": "",
        }

    try:
        data = json.loads(raw_content)
        if isinstance(data, dict):
            personal = data.get("personal") or {}
            skills = data.get("skills") or []
            experiences = data.get("experiences") or []
            summary = data.get("summary") or ""

            # Format clean text representation for LLM
            lines = []
            if personal.get("fullName"):
                lines.append(f"Name: {personal['fullName']}")
            if personal.get("email"):
                lines.append(f"Email: {personal['email']}")
            if personal.get("phone"):
                lines.append(f"Phone: {personal['phone']}")
            if personal.get("location"):
                lines.append(f"Location: {personal['location']}")
            if summary:
                lines.append(f"\nProfessional Summary:\n{summary}")
            if skills:
                lines.append(f"\nCore Skills:\n{', '.join(skills)}")
            if experiences:
                lines.append("\nWork Experience:")
                for exp in experiences:
                    role = exp.get("role") or ""
                    comp = exp.get("company") or ""
                    desc = exp.get("description") or ""
                    lines.append(f"- {role} at {comp}\n  {desc}")

            return {
                "name": personal.get("fullName"),
                "email": personal.get("email"),
                "phone": personal.get("phone"),
                "skills": skills,
                "experiences": experiences,
                "summary": summary,
                "formatted_text": "\n".join(lines),
            }
    except Exception:
        pass

    # Fallback for plain text resume
    return {
        "name": None,
        "email": None,
        "phone": None,
        "skills": [],
        "experiences": [],
        "summary": "",
        "formatted_text": raw_content.strip(),
    }


def _word_target_desc(length: str) -> str:
    l = (length or "standard").lower()
    if l == "short":
        return "approximately 150–200 words (concise, high-impact)"
    if l == "detailed":
        return "approximately 400–500 words (thorough, extensive detail)"
    return "approximately 250–350 words (standard, well-balanced)"


def _build_prompt(
    *,
    candidate_name: str,
    candidate_email: str,
    candidate_phone: Optional[str],
    company: str,
    title: str,
    manager: str,
    resume_text: str,
    job_description: str,
    key_skills: Optional[str],
    additional_info: Optional[str],
    tone: str,
    length: str,
) -> str:
    target_desc = _word_target_desc(length)

    skills_highlight = ""
    if key_skills and key_skills.strip():
        skills_highlight = f"\nSpecific Key Skills to Highlight (emphasize these only if supported by the resume):\n{key_skills.strip()}"

    extra_context = ""
    if additional_info and additional_info.strip():
        extra_context = f"\nAdditional Candidate Notes / Context:\n{additional_info.strip()}"

    return f"""You are an elite career advisor and executive cover letter strategist.
Write a bespoke, tailored cover letter connecting the candidate's actual qualifications to the target position.

TARGET ROLE:
- Position: {title}
- Company: {company}
- Addressed To: {manager}

CANDIDATE CONTACT DETAILS (Keep consistent):
- Name: {candidate_name}
- Email: {candidate_email}
{f"- Phone: {candidate_phone}" if candidate_phone else ""}

TARGET JOB DESCRIPTION:
\"\"\"
{job_description.strip()}
\"\"\"

CANDIDATE'S VERIFIED RESUME:
\"\"\"
{resume_text.strip() if resume_text else "No specific resume supplied. Rely strictly on candidate details."}
\"\"\"
{skills_highlight}
{extra_context}

PARAMETERS:
- Tone: {tone.capitalize()}
- Desired Length: {target_desc}

CRITICAL INSTRUCTIONS (MUST COMPLY STRICTLY):
1. Extract relevant skills, responsibilities, and technical keywords from the job description and align them directly with the candidate's background.
2. Use ONLY information and achievements supported by the candidate's verified resume. Do NOT fabricate, hallucinate, or exaggerate technologies, metrics, employers, or accomplishments.
3. Prioritize experience and projects that directly match the needs of the target role at {company}.
4. Avoid generic fluff and clichés such as:
   - "I am impressed by your company's standards of excellence"
   - "I am writing with great enthusiasm to submit my resume"
   - "I believe I am the ideal candidate"
   - "I am a motivated self-starter and team player"
5. Do NOT simply repeat bullet points from the resume word-for-word. Synthesize achievements naturally into coherent narrative paragraphs.
6. The writing must sound authentic, polished, and human-written.
7. Structure:
   - Professional formal greeting (e.g., "Dear {manager},")
   - Compelling, role-specific opening paragraph
   - 1 to 2 targeted body paragraphs demonstrating concrete relevance and impact
   - Concise, proactive closing paragraph with a clear call to action
   - Professional sign-off followed by candidate's name and contact information
8. Return ONLY the complete cover letter text. Do NOT include markdown code fences, headers, or explanations.
"""


def _generate_with_gemini(prompt: str) -> Optional[str]:
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        from google import genai as google_genai
        client = google_genai.Client(api_key=api_key)
        for model_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if response.text and response.text.strip():
                    clean_text = response.text.strip()
                    # Strip any markdown backticks if returned
                    if clean_text.startswith("```"):
                        clean_text = re.sub(r"^```[a-zA-Z]*\n", "", clean_text)
                        clean_text = re.sub(r"\n```$", "", clean_text)
                    return clean_text.strip()
            except Exception:
                continue
    except Exception as exc:
        print(f"[CoverLetter] Gemini generation exception: {exc}")

    return None


def _generate_tailored_fallback(
    *,
    candidate_name: str,
    candidate_email: str,
    candidate_phone: Optional[str],
    company: str,
    title: str,
    manager: str,
    resume_details: dict,
    job_description: str,
    key_skills: Optional[str],
    additional_info: Optional[str],
    tone: str,
    length: str,
) -> str:
    """Intelligent fallback that synthesizes real resume content with JD requirements."""
    jd_lower = job_description.lower()
    skills_list = resume_details.get("skills") or []
    experiences = resume_details.get("experiences") or []
    summary = resume_details.get("summary") or ""

    # Find matching skills present in resume that appear in the JD
    matching_skills = []
    for s in skills_list:
        if s.lower() in jd_lower:
            matching_skills.append(s)

    # Also incorporate explicitly requested key_skills if present in resume or provided
    user_skills = [k.strip() for k in (key_skills or "").split(",") if k.strip()]
    for uk in user_skills:
        if uk not in matching_skills:
            matching_skills.append(uk)

    top_skills_str = ", ".join(matching_skills[:5]) if matching_skills else "modern software engineering and architectural best practices"

    # Recent experience highlight
    recent_exp_text = ""
    if experiences:
        top_exp = experiences[0]
        role_name = top_exp.get("role", "Software Engineer")
        comp_name = top_exp.get("company", "previous engagements")
        desc = top_exp.get("description", "")
        # Pick the first strong sentence
        first_line = desc.split("\n")[0].lstrip("•- ") if desc else ""
        if first_line:
            recent_exp_text = f"In my role as {role_name} at {comp_name}, I focused on {first_line[:120].rstrip('.')}."
        else:
            recent_exp_text = f"Serving as {role_name} at {comp_name}, I delivered core features with an emphasis on maintainability and scalable delivery."

    # Tone calibration
    if tone == "confident":
        opening = (
            f"I am writing to express my strong interest in the {title} position at {company}. "
            f"With a proven background grounded in {top_skills_str}, I am prepared to step in and drive immediate "
            f"progress across your engineering roadmap."
        )
        body_intro = (
            f"My technical career has centered on architecting robust systems that directly address complex product demands. "
            f"{recent_exp_text} The requirements outlined in your job description for {title} directly parallel the challenges "
            f"I have successfully resolved throughout my career."
        )
        closing = (
            f"I welcome the opportunity to discuss how my technical execution and proactive problem-solving can help "
            f"{company} achieve its upcoming targets. Thank you for your time and consideration."
        )
    elif tone == "enthusiastic":
        opening = (
            f"I am thrilled to apply for the {title} role at {company}. Having followed {company}'s momentum in the industry, "
            f"I am eager to contribute my background in {top_skills_str} to your team's mission."
        )
        body_intro = (
            f"Throughout my work, I have found the greatest satisfaction in building high-quality, resilient solutions. "
            f"{recent_exp_text} Your focus on delivering scalable, user-centric experiences aligns directly with how I approach software craftsmanship."
        )
        closing = (
            f"I would appreciate the chance to discuss in detail how my skills and background can support the {title} team at {company}. "
            f"Thank you for considering my application."
        )
    else:  # professional
        opening = (
            f"Please accept this letter as an application for the {title} position currently open at {company}. "
            f"With dedicated experience in {top_skills_str}, I am enthusiastic about the opportunity to contribute to your organization."
        )
        body_intro = (
            f"Reviewing the requirements for {title}, I found a clear alignment with my professional journey. "
            f"{recent_exp_text} My approach consistently emphasizes clean system design, cross-functional collaboration, and dependable delivery."
        )
        closing = (
            f"Thank you for reviewing my credentials. I welcome the opportunity for an interview to explore how my experience and perspective "
            f"can contribute to {company}'s ongoing success."
        )

    # Detailed / short length adjustments
    body_paragraphs = [body_intro]

    if length == "detailed":
        detail_paragraph = (
            f"Specifically, my technical toolkit includes {top_skills_str}, which I have applied to streamline development lifecycles "
            f"and enhance operational performance. I take pride in translating complex business specifications into intuitive, stable software."
        )
        if additional_info and additional_info.strip():
            detail_paragraph += f" Furthermore, {additional_info.strip().rstrip('.')}."
        body_paragraphs.append(detail_paragraph)
    elif length == "standard" and additional_info and additional_info.strip():
        body_paragraphs.append(f"In addition, {additional_info.strip().rstrip('.')}.")

    contact_block = f"Sincerely,\n{candidate_name}\n{candidate_email}"
    if candidate_phone:
        contact_block += f"\n{candidate_phone}"

    full_body = "\n\n".join([opening] + body_paragraphs + [closing])

    return f"Dear {manager},\n\n{full_body}\n\n{contact_block}"


# ── Route Handler ──────────────────────────────────────────────────────────────

@router.post("/generate", response_model=CoverLetterResponse)
def generate_cover_letter(
    payload: CoverLetterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.job_description or not payload.job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is required to generate a tailored cover letter.",
        )

    company = payload.company_name.strip()
    title = payload.job_title.strip()
    manager = (payload.recipient_name or "Hiring Team").strip()
    tone = (payload.tone or "professional").lower()
    length = (payload.length or "standard").lower()

    # ── Fetch resume content if resume_id is provided ──────────────────────────
    resume_content_raw: Optional[str] = None
    resume_title: Optional[str] = None

    if payload.resume_id:
        stmt = select(Resume).where(
            Resume.id == payload.resume_id,
            Resume.user_id == current_user.id,
        )
        res = db.scalar(stmt)
        if res:
            resume_content_raw = res.content or None
            resume_title = res.title or None

    resume_details = _extract_resume_details(resume_content_raw)

    # Derive candidate name/email/phone from resume if available, otherwise current_user
    candidate_name = resume_details.get("name") or current_user.name or "Candidate"
    candidate_email = resume_details.get("email") or current_user.email or ""
    candidate_phone = resume_details.get("phone")

    prompt = _build_prompt(
        candidate_name=candidate_name,
        candidate_email=candidate_email,
        candidate_phone=candidate_phone,
        company=company,
        title=title,
        manager=manager,
        resume_text=resume_details.get("formatted_text", ""),
        job_description=payload.job_description,
        key_skills=payload.key_skills,
        additional_info=payload.additional_info,
        tone=tone,
        length=length,
    )

    # ── Attempt Gemini AI Generation ──────────────────────────────────────────
    cover_letter_text = _generate_with_gemini(prompt)

    # ── Fallback to intelligent deterministic generator if Gemini fails ────────
    if not cover_letter_text:
        cover_letter_text = _generate_tailored_fallback(
            candidate_name=candidate_name,
            candidate_email=candidate_email,
            candidate_phone=candidate_phone,
            company=company,
            title=title,
            manager=manager,
            resume_details=resume_details,
            job_description=payload.job_description,
            key_skills=payload.key_skills,
            additional_info=payload.additional_info,
            tone=tone,
            length=length,
        )

    # Calculate actual word count
    words = len(re.findall(r"\b\w+\b", cover_letter_text))

    # Construct informative highlights
    highlights = [
        f"Tailored specifically for {title} at {company}",
        f"Tone: {tone.capitalize()} · Length: {length.capitalize()}",
    ]
    if resume_title:
        highlights.append(f"Linked with resume: '{resume_title}'")
    if payload.key_skills and payload.key_skills.strip():
        highlights.append(f"Highlights: {payload.key_skills.strip()}")

    return CoverLetterResponse(
        cover_letter=cover_letter_text,
        subject_line=f"Application for {title} – {candidate_name}",
        key_highlights=highlights,
        word_count=words,
    )
