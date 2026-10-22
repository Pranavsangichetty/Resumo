import json
import os
import re
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.dependencies import get_current_user
from app.core.config import settings
from app.models.user import User

router = APIRouter(
    prefix="/mock-interview",
    tags=["Mock Interview"],
)


class MockInterviewRequest(BaseModel):
    job_title: str
    seniority: Optional[str] = "Mid-Level"
    company_name: Optional[str] = None
    job_description: Optional[str] = None
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
    company_name: Optional[str] = None
    questions: List[InterviewQuestion]


class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    seniority: Optional[str] = "Mid-Level"


class EvaluateAnswerResponse(BaseModel):
    score: int
    grade: str
    feedback: str
    strengths: List[str]
    improvements: List[str]
    sample_answer_snippet: Optional[str] = None


GEMINI_MODELS = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-flash-latest",
]


def _call_gemini_raw(prompt: str) -> Optional[str]:
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        from google import genai as google_genai
        client = google_genai.Client(api_key=api_key)
        for model_name in GEMINI_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if response.text and response.text.strip():
                    clean_text = response.text.strip()
                    if clean_text.startswith("```"):
                        clean_text = re.sub(r"^```[a-zA-Z]*\n?", "", clean_text)
                        clean_text = re.sub(r"\n?```$", "", clean_text)
                    return clean_text.strip()
            except Exception as e:
                print(f"[MockInterview] Gemini model {model_name} failed: {e}")
                continue
    except Exception as exc:
        print(f"[MockInterview] Gemini generation exception: {exc}")

    return None


def _generate_questions_with_gemini(
    job_title: str,
    seniority: str,
    company_name: Optional[str],
    job_description: Optional[str],
    focus_area: Optional[str],
) -> Optional[List[InterviewQuestion]]:
    company_context = f"- Target Company: {company_name.strip()}" if company_name and company_name.strip() else "- Target Company: General Industry Standard"
    jd_context = f"- Job Description Provided:\n\"\"\"\n{job_description.strip()[:2000]}\n\"\"\"" if job_description and job_description.strip() else "- Job Description: Not provided (infer standard industry requirements)."

    prompt = f"""
You are an elite technical & executive interview coach at leading tech companies.
Generate exactly 5 realistic, targeted mock interview questions tailored specifically for this role and company:

ROLE DETAILS:
- Job Title: {job_title}
- Seniority Level: {seniority}
{company_context}
- Focus Area: {focus_area or 'mixed'}
{jd_context}

INSTRUCTIONS:
1. If a Company Name is provided ({company_name or 'the company'}), tailor the questions and tips to that company's engineering culture, values, tech ecosystem, or scale.
2. If a Job Description is provided, extract specific technologies, architectural patterns, and core responsibilities mentioned in the JD and ask direct questions about them.
3. Include a balanced mix across:
   - Question 1: Behavioral / Leadership (STAR format) tailored to the company's culture.
   - Question 2: Technical Architecture / System Design relevant to the company's domain.
   - Question 3: Core Frameworks / Coding / Problem Solving matching the JD tech stack.
   - Question 4: Production Debugging / Reliability / Scalability.
   - Question 5: Role-Specific Deep Dive / Domain Strategy.
4. Each question MUST include:
   - "id": integer 1 to 5
   - "category": string (e.g. "Behavioral (STAR)", "System Design", "Core Technical", "Debugging & Reliability", "Company & Role Fit")
   - "question": string (concise, direct, highly professional)
   - "tips": string (specific actionable coaching advice on how to structure a winning answer)
   - "sample_key_points": list of 3 concrete bullet points a hiring manager looks for

FORMAT: Return ONLY a valid JSON array of 5 objects matching this schema, with no markdown code fences or conversational text:
[
  {{
    "id": 1,
    "category": "Behavioral (STAR)",
    "question": "...",
    "tips": "...",
    "sample_key_points": ["Point 1", "Point 2", "Point 3"]
  }}
]
"""
    raw = _call_gemini_raw(prompt)
    if not raw:
        return None

    try:
        # If response wrapped in code block
        json_match = re.search(r"\[.*\]", raw, re.DOTALL)
        if json_match:
            raw = json_match.group(0)
        parsed = json.loads(raw)
        if isinstance(parsed, list) and len(parsed) >= 3:
            questions = []
            for idx, item in enumerate(parsed[:5], start=1):
                questions.append(
                    InterviewQuestion(
                        id=idx,
                        category=str(item.get("category", "General")),
                        question=str(item.get("question", "")),
                        tips=str(item.get("tips", "")),
                        sample_key_points=[str(p) for p in item.get("sample_key_points", [])][:4],
                    )
                )
            return questions
    except Exception as err:
        print(f"[MockInterview] Failed to parse Gemini response: {err}")

    return None


def _generate_tailored_fallback_questions(
    job_title: str,
    seniority: str,
    company_name: Optional[str],
    job_description: Optional[str],
) -> List[InterviewQuestion]:
    company = company_name.strip() if company_name and company_name.strip() else "our company"
    
    # Extract likely tech keywords from JD if available
    tech_keywords = []
    if job_description:
        common_tech = ["react", "node", "python", "typescript", "aws", "docker", "kubernetes", "sql", "postgresql", "fastapi", "graphql", "microservices", "redis", "kafka", "ci/cd", "agile", "next.js", "java", "go", "c#", "azure", "gcp"]
        jd_low = job_description.lower()
        for tech in common_tech:
            if tech in jd_low:
                tech_keywords.append(tech.title())

    tech_mention = f" using {', '.join(tech_keywords[:3])}" if tech_keywords else ""

    return [
        InterviewQuestion(
            id=1,
            category=f"Behavioral & Culture Fit at {company}",
            question=f"Can you tell me about a time when you had to resolve a high-stakes challenge or deliver a critical initiative under tight deadlines in a {seniority} {job_title} role?",
            tips=f"Structure your response using the STAR method (Situation, Task, Action, Result). Highlight your personal agency, collaboration with cross-functional teams, and measurable business outcomes relevant to {company}.",
            sample_key_points=[
                "Define the problem scope, urgency, and the constraints you faced",
                "Describe the deliberate actions and technical decisions you made",
                "Quantify the outcome (e.g., 40% performance gain, zero customer downtime, on-time delivery)",
            ],
        ),
        InterviewQuestion(
            id=2,
            category="System Design & Architecture",
            question=f"How would you architect a scalable, fault-tolerant system or API service{tech_mention} at {company} to handle peak traffic with sub-100ms latency?",
            tips="Walk through data modeling, load balancing, caching (e.g. Redis), asynchronous message queuing, database partitioning, and rate limiting.",
            sample_key_points=[
                "Establish functional and non-functional requirements (throughput, availability, consistency)",
                "Identify potential single points of failure and bottleneck mitigation strategies",
                "Explain observability, automated failover, and metrics collection",
            ],
        ),
        InterviewQuestion(
            id=3,
            category="Technical Problem Solving & Deep Dive",
            question=f"Walk us through how you investigate and troubleshoot a severe, intermittent performance regression or memory leak in a high-throughput {job_title} service.",
            tips="Hiring managers want to see your scientific diagnostic methodology rather than guessing. Discuss logging, profiling tools, and root cause analysis.",
            sample_key_points=[
                "Formulate and isolate reproducible test cases using telemetry and APM traces",
                "Analyze memory allocations, connection leaks, or unoptimized database queries",
                "Deploy a regression test suite and automated canary rollback triggers",
            ],
        ),
        InterviewQuestion(
            id=4,
            category="Leadership & Cross-Functional Alignment",
            question=f"How do you handle technical disagreements on architectural direction or code review standards when collaborating with other engineers and product managers at {company}?",
            tips="Emphasize empathy, objective trade-off analysis (pros/cons/prototyping), and a 'disagree and commit' mindset.",
            sample_key_points=[
                "Listen to alternative technical perspectives and align on user requirements",
                "Use prototypes, benchmarks, or RFC documents to facilitate objective alignment",
                "Foster a blameless culture that prioritizes collective team velocity",
            ],
        ),
        InterviewQuestion(
            id=5,
            category=f"Role-Specific Excellence for {company}",
            question=f"What modern engineering standards, security practices, and tools do you consider non-negotiable for a {seniority} {job_title} joining {company} today?",
            tips="Demonstrate domain seniority, knowledge of zero-trust security, continuous delivery, and engineering velocity.",
            sample_key_points=[
                "Modern developer experience, CI/CD pipeline automation, and container orchestration",
                "Security hygiene: OWASP compliance, token authentication, and least-privilege access",
                "Connecting code quality and architectural hygiene directly to business outcomes",
            ],
        ),
    ]


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

    # 1. Try Gemini generation with company and JD context
    ai_questions = _generate_questions_with_gemini(
        job_title=title,
        seniority=payload.seniority or "Mid-Level",
        company_name=payload.company_name,
        job_description=payload.job_description,
        focus_area=payload.focus_area,
    )

    if ai_questions:
        return MockInterviewResponse(
            job_title=title,
            seniority=payload.seniority or "Mid-Level",
            company_name=payload.company_name.strip() if payload.company_name else None,
            questions=ai_questions,
        )

    # 2. Intelligent fallback customized to company name and job description
    fallback_questions = _generate_tailored_fallback_questions(
        job_title=title,
        seniority=payload.seniority or "Mid-Level",
        company_name=payload.company_name,
        job_description=payload.job_description,
    )

    return MockInterviewResponse(
        job_title=title,
        seniority=payload.seniority or "Mid-Level",
        company_name=payload.company_name.strip() if payload.company_name else None,
        questions=fallback_questions,
    )


@router.post("/evaluate", response_model=EvaluateAnswerResponse)
def evaluate_interview_answer(
    payload: EvaluateAnswerRequest,
    current_user: User = Depends(get_current_user),
):
    answer = payload.answer.strip()
    if not answer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Answer text is required for evaluation.",
        )

    # Try AI evaluation
    company_text = f"Target Company: {payload.company_name}" if payload.company_name else ""
    role_text = f"Role: {payload.seniority or 'Mid-Level'} {payload.job_title or 'Candidate'}"

    prompt = f"""
You are an expert hiring manager and interview coach evaluating a candidate's spoken or written answer.

INTERVIEW CONTEXT:
{role_text}
{company_text}
Question: "{payload.question}"

CANDIDATE'S ANSWER:
\"\"\"
{answer}
\"\"\"

EVALUATION CRITERIA:
1. STAR Methodology (Situation, Task, Action, Result) clarity.
2. Technical precision and depth appropriate for {payload.seniority or 'Mid-Level'}.
3. Concrete metrics, outcomes, or architectural trade-offs mentioned.
4. Conciseness and communication delivery.

Return ONLY a valid JSON object matching this schema:
{{
  "score": 8,
  "grade": "Strong Answer / Comprehensive STAR Response / Needs Improvement",
  "feedback": "Detailed paragraph giving constructive, actionable advice on what worked and what could be sharpened.",
  "strengths": ["Clear situational context", "Good mention of metrics"],
  "improvements": ["Elaborate more on specific personal actions taken", "Add quantitative business impact"],
  "sample_answer_snippet": "A 1-2 sentence example showing how to sharpen the conclusion."
}}
"""
    raw = _call_gemini_raw(prompt)
    if raw:
        try:
            json_match = re.search(r"\{.*\}", raw, re.DOTALL)
            if json_match:
                raw = json_match.group(0)
            data = json.loads(raw)
            return EvaluateAnswerResponse(
                score=int(data.get("score", 7)),
                grade=str(data.get("grade", "Solid Answer")),
                feedback=str(data.get("feedback", "Good attempt with strong points.")),
                strengths=[str(s) for s in data.get("strengths", [])],
                improvements=[str(i) for i in data.get("improvements", [])],
                sample_answer_snippet=str(data.get("sample_answer_snippet", "")) if data.get("sample_answer_snippet") else None,
            )
        except Exception as err:
            print(f"[MockInterview] Failed to parse evaluation JSON: {err}")

    # Heuristic Fallback
    word_count = len(answer.split())
    star_keywords = ["situation", "task", "action", "result", "because", "decided", "implemented", "reduced", "increased", "%", "metric", "team", "learned"]
    matched_star = sum(1 for kw in star_keywords if kw in answer.lower())

    if word_count < 35:
        score = 5
        grade = "Needs More Detail"
        feedback = "Your response is very concise. In a real interview, flesh out your story using the STAR framework—clearly separate the challenge faced, the specific actions you engineered, and the measurable outcome."
        strengths = ["Direct and to the point"]
        improvements = ["Elaborate on technical choices made", "Add specific quantifiable results (e.g. latency, scale, time saved)"]
    elif word_count < 90:
        score = 7
        grade = "Solid Answer"
        feedback = f"Well-structured answer with good focus ({word_count} words). To push this into top-percentile candidate territory, emphasize personal ownership ('I chose X because...') and articulate how the outcome benefited the team or product."
        strengths = ["Good technical context", "Natural conversational tone"]
        improvements = ["Elaborate on architectural trade-offs", "Conclude with measurable business impact"]
    else:
        score = 9
        grade = "Comprehensive STAR Response"
        feedback = f"Excellent depth and narrative pacing ({word_count} words). You established good context and walked through concrete technical execution. Keep practicing delivering this smoothly in 90-120 seconds."
        strengths = ["Rich technical detail", "Structured narrative flow", "Demonstrates seniority and ownership"]
        improvements = ["Ensure the final result / business metric is stated clearly upfront or as a punchy conclusion"]

    return EvaluateAnswerResponse(
        score=score,
        grade=grade,
        feedback=feedback,
        strengths=strengths,
        improvements=improvements,
        sample_answer_snippet=None,
    )
