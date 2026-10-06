import json
import os

from dotenv import load_dotenv


# ======================================================
# ENVIRONMENT
# ======================================================

load_dotenv()


# ======================================================
# GEMINI CLIENT
# ======================================================

def get_gemini_client():
    try:
        from google import genai
    except ImportError as exc:
        raise RuntimeError(
            "google-genai is not installed. "
            "Install it with: pip install google-genai"
        ) from exc

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured."
        )

    return genai.Client(api_key=api_key)


# ======================================================
# GEMINI OPTIMIZATION
# ======================================================

def optimize_resume_with_ai(
    resume_content: str,
    job_description: str,
    missing_keywords: list[str] | None = None,
) -> dict:

    client = get_gemini_client()

    # Make sure missing_keywords is always a list
    if missing_keywords is None:
        missing_keywords = []

    # Remove duplicates while preserving order
    missing_keywords = list(dict.fromkeys(missing_keywords))

    missing_keywords_text = ", ".join(missing_keywords)

    if not missing_keywords_text:
        missing_keywords_text = "No missing keywords were provided."

    prompt = f"""
You are an expert ATS resume optimization assistant.

Your job is to improve the resume for the provided job description.

IMPORTANT RULES:

1. Do NOT invent experience, education, certifications, companies,
   technologies, achievements, responsibilities, or numbers.

2. Only use information already present in the resume.

3. Improve wording and keyword alignment only where the resume
   genuinely supports it.

4. Keep the resume completely truthful.

5. Make the result ATS-friendly.

6. Use clear, professional language.

7. Preserve important technical skills.

8. Do not add unnecessary formatting.

9. Do not use markdown headings such as # or ##.

10. Do not claim that the candidate has a skill merely because it
    appears in the job description.

11. Missing keywords should only be added when the resume already
    contains equivalent or supporting information.

12. If a missing keyword is not supported by the resume, DO NOT add it.

13. Return ONLY valid JSON.

JOB DESCRIPTION:
{job_description}

CURRENT RESUME:
{resume_content}

ATS MISSING KEYWORDS:
{missing_keywords_text}

Your task:

1. Rewrite the resume to improve ATS alignment.
2. Improve weak or generic wording.
3. Incorporate supported missing keywords naturally.
4. Do not fabricate information.
5. Preserve the candidate's real experience and skills.
6. Make the optimized resume professional and readable.

Return JSON using EXACTLY this structure:

{{
    "optimized_content": "complete optimized resume text",

    "changes": [
        "description of change 1",
        "description of change 2"
    ],

    "added_keywords": [
        "keyword 1",
        "keyword 2"
    ],

    "removed_keywords": [
        "keyword 1"
    ],

    "summary": "short explanation of the optimization"
}}
"""

    # ==================================================
    # CALL GEMINI
    # ==================================================

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    text = response.text.strip()

    # ==================================================
    # REMOVE MARKDOWN CODE FENCES
    # ==================================================

    if text.startswith("```json"):
        text = text[7:]

    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    text = text.strip()

    # ==================================================
    # PARSE JSON
    # ==================================================

    try:
        result = json.loads(text)

    except json.JSONDecodeError as exc:
        raise RuntimeError(
            f"Gemini returned invalid JSON: {exc}"
        ) from exc

    # ==================================================
    # VALIDATE RESPONSE
    # ==================================================

    if "optimized_content" not in result:
        raise RuntimeError(
            "Gemini response is missing optimized_content."
        )

    if not isinstance(result["optimized_content"], str):
        raise RuntimeError(
            "optimized_content must be a string."
        )

    if "changes" not in result:
        result["changes"] = []

    if not isinstance(result["changes"], list):
        result["changes"] = []

    if "added_keywords" not in result:
        result["added_keywords"] = []

    if not isinstance(result["added_keywords"], list):
        result["added_keywords"] = []

    if "removed_keywords" not in result:
        result["removed_keywords"] = []

    if not isinstance(result["removed_keywords"], list):
        result["removed_keywords"] = []

    if "summary" not in result:
        result["summary"] = ""

    # ==================================================
    # RETURN RESULT
    # ==================================================

    return result