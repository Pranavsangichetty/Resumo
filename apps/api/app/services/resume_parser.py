from __future__ import annotations

import re
from typing import Any


# ======================================================
# HELPERS
# ======================================================

def clean_text(text: str) -> str:
    """
    Clean extracted/OCR text while preserving useful
    resume formatting.
    """

    if not text:
        return ""

    # Normalize line endings
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Remove excessive spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Remove excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def normalize_list(value: Any) -> list:
    """
    Ensure a parsed field is always returned as a list.
    """

    if value is None:
        return []

    if isinstance(value, list):
        return value

    return [value]


# ======================================================
# OCR
# ======================================================

def ocr_image(image: Any) -> str:
    """
    Extract text from an image using Tesseract OCR.
    """

    try:
        import pytesseract
        pytesseract.pytesseract.tesseract_cmd = (
            r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        )
    except ImportError as exc:
        raise RuntimeError(
            "pytesseract is not installed. "
            "Install it with: pip install pytesseract pillow"
        ) from exc

    try:
        text = pytesseract.image_to_string(
            image,
            config="--psm 6",
        )

        return clean_text(text)

    except pytesseract.TesseractNotFoundError as exc:
        raise RuntimeError(
            "Tesseract OCR was not found. "
            "Make sure Tesseract is installed at "
            r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        ) from exc

    except Exception as exc:
        raise RuntimeError(
            f"OCR processing failed: {exc}"
        ) from exc


# ======================================================
# PDF OCR
# ======================================================

def extract_text_from_image_pdf(
    file_bytes: bytes,
) -> str:
    """
    OCR fallback for scanned/image-based PDFs.

    This function uses PyMuPDF to render each PDF page
    as an image and then sends the image through
    Tesseract OCR.
    """

    try:
        import fitz
    except ImportError as exc:
        raise RuntimeError(
            "PyMuPDF is required for scanned PDF OCR. "
            "Install it with: pip install pymupdf"
        ) from exc

    try:
        from PIL import Image
    except ImportError as exc:
        raise RuntimeError(
            "Pillow is required for scanned PDF OCR. "
            "Install it with: pip install pillow"
        ) from exc

    try:
        document = fitz.open(
            stream=file_bytes,
            filetype="pdf",
        )

        pages: list[str] = []

        for page in document:
            # Render page at a higher resolution for OCR.
            matrix = fitz.Matrix(2, 2)

            pixmap = page.get_pixmap(
                matrix=matrix,
                alpha=False,
            )

            image = Image.frombytes(
                "RGB",
                [
                    pixmap.width,
                    pixmap.height,
                ],
                pixmap.samples,
            )

            page_text = ocr_image(image)

            if page_text:
                pages.append(page_text)

        document.close()

        return clean_text(
            "\n\n".join(pages)
        )

    except Exception as exc:
        raise RuntimeError(
            f"Scanned PDF OCR failed: {exc}"
        ) from exc


# ======================================================
# MAIN RESUME PARSER
# ======================================================

def parse_resume_text(
    text: str,
) -> dict[str, Any]:
    """
    Convert resume text into the structured format
    expected by the Resume Builder.

    The parser is intentionally conservative:
    information that cannot be confidently extracted
    remains empty instead of being invented.
    """

    cleaned = clean_text(text)

    # --------------------------------------------------
    # DEFAULT STRUCTURE
    # --------------------------------------------------

    result: dict[str, Any] = {
        "personal": {
            "fullName": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin": "",
            "github": "",
            "portfolio": "",
        },
        "summary": "",
        "experiences": [],
        "education": [],
        "skills": [],
        "projects": [],
        "certifications": [],
        "courses": [],
    }

    if not cleaned:
        return result

    lines = [
        line.strip()
        for line in cleaned.split("\n")
        if line.strip()
    ]

    # ==================================================
    # EMAIL
    # ==================================================

    email_match = re.search(
        r"\b[A-Za-z0-9._%+-]+@"
        r"[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        cleaned,
    )

    if email_match:
        result["personal"]["email"] = (
            email_match.group(0)
        )

    # ==================================================
    # PHONE
    # ==================================================

    phone_match = re.search(
        r"(?<!\d)"
        r"(?:\+?\d{1,3}[\s.-]?)?"
        r"(?:\(?\d{3,5}\)?[\s.-]?)?"
        r"\d{3,5}[\s.-]?\d{3,5}"
        r"(?!\d)",
        cleaned,
    )

    if phone_match:
        phone = phone_match.group(0).strip()

        # Avoid treating short numbers as phone numbers.
        digits = re.sub(r"\D", "", phone)

        if len(digits) >= 10:
            result["personal"]["phone"] = phone

    # ==================================================
    # LINKEDIN
    # ==================================================

    linkedin_match = re.search(
        r"(https?://)?"
        r"(www\.)?"
        r"linkedin\.com/[^\s|]+",
        cleaned,
        re.IGNORECASE,
    )

    if linkedin_match:
        result["personal"]["linkedin"] = (
            linkedin_match.group(0)
        )

    # ==================================================
    # GITHUB
    # ==================================================

    github_match = re.search(
        r"(https?://)?"
        r"(www\.)?"
        r"github\.com/[^\s|]+",
        cleaned,
        re.IGNORECASE,
    )

    if github_match:
        result["personal"]["github"] = (
            github_match.group(0)
        )

    # ==================================================
    # PORTFOLIO
    # ==================================================

    portfolio_patterns = [
        r"https?://[^\s|]+\.vercel\.app",
        r"https?://[^\s|]+\.netlify\.app",
        r"https?://[^\s|]+\.github\.io",
        r"https?://[^\s|]+",
    ]

    for pattern in portfolio_patterns:
        match = re.search(
            pattern,
            cleaned,
            re.IGNORECASE,
        )

        if match:
            url = match.group(0)

            if (
                "linkedin.com" not in url.lower()
                and "github.com" not in url.lower()
            ):
                result["personal"]["portfolio"] = url
                break

    # ==================================================
    # FULL NAME
    # ==================================================

    # Usually the first meaningful line of a resume.
    # Avoid using contact information as the name.
    for line in lines[:8]:
        lower = line.lower()

        if "@" in line:
            continue

        if "linkedin" in lower:
            continue

        if "github" in lower:
            continue

        if re.search(r"\d{5,}", line):
            continue

        if len(line) > 60:
            continue

        words = line.split()

        if 2 <= len(words) <= 6:
            result["personal"]["fullName"] = line
            break

    # ==================================================
    # SECTION DETECTION
    # ==================================================

    section_aliases = {
        "summary": [
            "summary",
            "professional summary",
            "profile",
            "objective",
        ],
        "experience": [
            "experience",
            "work experience",
            "professional experience",
            "employment",
        ],
        "education": [
            "education",
            "academic background",
        ],
        "skills": [
            "skills",
            "technical skills",
            "core skills",
            "technologies",
        ],
        "projects": [
            "projects",
            "personal projects",
            "academic projects",
            "key projects",
            "selected projects",
        ],
        "certifications": [
            "certifications",
            "certificates",
            "licenses & certifications",
            "certifications & licenses",
            "professional certifications",
            "licenses",
        ],
        "courses": [
            "courses",
            "coursework",
            "relevant coursework",
            "relevant courses",
            "academic coursework",
            "training",
            "trainings",
            "workshops",
            "professional development",
        ],
    }

    def detect_section(line: str) -> str | None:
        normalized = re.sub(
            r"[^a-z& ]",
            "",
            line.lower(),
        ).strip()

        for section, aliases in section_aliases.items():
            for alias in aliases:
                if normalized == alias:
                    return section

        return None

    sections: dict[str, list[str]] = {}
    current_section: str | None = None

    for line in lines:
        detected = detect_section(line)

        if detected:
            current_section = detected
            sections.setdefault(
                current_section,
                [],
            )
            continue

        if current_section:
            sections[current_section].append(line)

    # ==================================================
    # SUMMARY
    # ==================================================

    summary_lines = sections.get(
        "summary",
        [],
    )

    if summary_lines:
        result["summary"] = " ".join(
            summary_lines
        )

    # ==================================================
    # SKILLS
    # ==================================================

    skills_lines = sections.get(
        "skills",
        [],
    )

    skills: list[str] = []

    for line in skills_lines:
        parts = re.split(
            r"[,|•;]",
            line,
        )

        for part in parts:
            skill = part.strip()

            if skill and len(skill) <= 80:
                skills.append(skill)

    # Remove duplicates while preserving order.
    seen_skills: set[str] = set()

    for skill in skills:
        key = skill.lower()

        if key not in seen_skills:
            seen_skills.add(key)
            result["skills"].append(skill)

    # ==================================================
    # EXPERIENCE
    # ==================================================

    experience_lines = sections.get(
        "experience",
        [],
    )

    experiences: list[dict[str, Any]] = []

    current_experience: dict[str, Any] | None = None

    date_pattern = re.compile(
        r"("
        r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
        r"[a-z]*\s+\d{4}"
        r"|"
        r"\d{4}"
        r")"
        r"\s*[-–—]\s*"
        r"("
        r"(?:Present|Current)"
        r"|"
        r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
        r"[a-z]*\s+\d{4}"
        r"|"
        r"\d{4}"
        r")",
        re.IGNORECASE,
    )

    for line in experience_lines:
        date_match = date_pattern.search(line)

        if date_match:
            if current_experience:
                experiences.append(
                    current_experience
                )

            current_experience = {
                "id": str(
                    len(experiences) + 1
                ),
                "company": "",
                "role": "",
                "location": "",
                "startDate": date_match.group(1),
                "endDate": date_match.group(2),
                "current": (
                    date_match.group(2)
                    .lower()
                    in {
                        "present",
                        "current",
                    }
                ),
                "description": "",
            }

            before_date = line[
                :date_match.start()
            ].strip(" |-–—")

            if before_date:
                current_experience[
                    "role"
                ] = before_date

            continue

        if current_experience:
            if not current_experience["company"]:
                current_experience[
                    "company"
                ] = line
            else:
                description = (
                    current_experience[
                        "description"
                    ]
                )

                current_experience[
                    "description"
                ] = (
                    f"{description}\n{line}"
                    if description
                    else line
                )

    if current_experience:
        experiences.append(
            current_experience
        )

    result["experiences"] = experiences

    # ==================================================
    # EDUCATION
    # ==================================================

    education_lines = sections.get(
        "education",
        [],
    )

    education: list[dict[str, Any]] = []

    current_education: dict[str, Any] | None = None

    for line in education_lines:
        date_match = date_pattern.search(line)

        if date_match:
            if current_education:
                education.append(
                    current_education
                )

            current_education = {
                "id": str(
                    len(education) + 1
                ),
                "institution": "",
                "degree": "",
                "fieldOfStudy": "",
                "location": "",
                "startDate": date_match.group(1),
                "endDate": date_match.group(2),
                "grade": "",
            }

            before_date = line[
                :date_match.start()
            ].strip(" |-–—")

            if before_date:
                current_education[
                    "degree"
                ] = before_date

            continue

        if current_education:
            if not current_education[
                "institution"
            ]:
                current_education[
                    "institution"
                ] = line
            elif not current_education[
                "fieldOfStudy"
            ]:
                current_education[
                    "fieldOfStudy"
                ] = line

    if current_education:
        education.append(
            current_education
        )

    result["education"] = education

    # ==================================================
    # PROJECTS
    # ==================================================

    project_lines = sections.get(
        "projects",
        [],
    )

    projects: list[dict[str, Any]] = []
    current_project: dict[str, Any] | None = None

    # Handle any section headers that may have leaked into project_lines
    cleaned_project_lines: list[str] = []
    leaked_course_lines: list[str] = []
    in_leaked_section: str | None = None

    for line in project_lines:
        detected_sec = detect_section(line)
        if detected_sec:
            in_leaked_section = detected_sec
            continue
        if in_leaked_section == "courses":
            leaked_course_lines.append(line)
        elif in_leaked_section == "certifications":
            sections.setdefault("certifications", []).append(line)
        elif in_leaked_section is None:
            cleaned_project_lines.append(line)

    for line in cleaned_project_lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        is_bullet = line_clean.startswith(("•", "-", "*", "●", "▪", "▫"))
        raw_text = line_clean.lstrip("•-*●▪▫ ").strip()

        # Check if this line is a continuation of the previous bullet sentence
        is_continuation = (
            not is_bullet
            and (
                re.match(r"^[a-z,;]", line_clean)
                or re.match(
                    r"^(encoding|ROC-AUC|RMSE reduction|and |with |across |over |validated |using |including )",
                    line_clean,
                    re.IGNORECASE,
                )
            )
        )

        if current_project is None:
            # First line is project title
            current_project = {
                "id": str(len(projects) + 1),
                "name": raw_text,
                "technologies": "",
                "link": "",
                "description": "",
            }
        elif is_continuation:
            # Reattach continuation line to current project description
            if current_project["description"]:
                current_project["description"] += " " + line_clean
            else:
                current_project["description"] = line_clean
        elif is_bullet:
            bullet_line = f"• {raw_text}"
            if current_project["description"]:
                current_project["description"] += f"\n{bullet_line}"
            else:
                current_project["description"] = bullet_line
        else:
            # Check if this line looks like a distinct new project title
            if len(line_clean) <= 80 and not line_clean.endswith((".", ";")):
                projects.append(current_project)
                current_project = {
                    "id": str(len(projects) + 1),
                    "name": line_clean,
                    "technologies": "",
                    "link": "",
                    "description": "",
                }
            else:
                if current_project["description"]:
                    current_project["description"] += f"\n{line_clean}"
                else:
                    current_project["description"] = line_clean

    if current_project:
        projects.append(current_project)

    result["projects"] = projects

    # ==================================================
    # COURSES
    # ==================================================

    course_lines = sections.get("courses", []) + leaked_course_lines
    courses: list[dict[str, Any]] = []

    for line in course_lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        is_bullet = line_clean.startswith(("•", "-", "*", "●", "▪", "▫"))
        text = line_clean.lstrip("•-*●▪▫ ").strip()

        if is_bullet:
            # Detail or note for previous course
            if courses:
                date_m = re.search(r"\(([^)]*\d{4}[^)]*)\)", text)
                if date_m and not courses[-1].get("issueDate"):
                    courses[-1]["issueDate"] = date_m.group(1)
        else:
            course_name = text
            issuer = ""
            if "–" in course_name:
                p = course_name.split("–")
                course_name = p[0].strip()
                issuer = p[1].strip()
            elif " - " in course_name:
                p = course_name.split(" - ")
                course_name = p[0].strip()
                issuer = p[1].strip()

            courses.append(
                {
                    "id": str(len(courses) + 1),
                    "name": course_name,
                    "issuer": issuer,
                    "issueDate": "",
                    "credentialUrl": "",
                }
            )

    result["courses"] = courses

    # ==================================================
    # CERTIFICATIONS
    # ==================================================

    certification_lines = sections.get(
        "certifications",
        [],
    )

    certifications: list[dict[str, Any]] = []

    for line in certification_lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        text = line_clean.lstrip("•-*●▪▫ ").strip()
        name = text
        issuer = ""
        if "–" in name:
            p = name.split("–")
            name = p[0].strip()
            issuer = p[1].strip()
        elif " - " in name:
            p = name.split(" - ")
            name = p[0].strip()
            issuer = p[1].strip()

        certifications.append(
            {
                "id": str(len(certifications) + 1),
                "name": name,
                "issuer": issuer,
                "issueDate": "",
                "credentialUrl": "",
            }
        )

    # If courses exist, ensure they are also represented in certifications
    # so standard templates render them without requiring template redesign.
    existing_cert_names = {c["name"].lower() for c in certifications}
    for c in courses:
        if c["name"].lower() not in existing_cert_names:
            certifications.append(
                {
                    "id": str(len(certifications) + 1),
                    "name": c["name"],
                    "issuer": c.get("issuer", ""),
                    "issueDate": c.get("issueDate", ""),
                    "credentialUrl": c.get("credentialUrl", ""),
                }
            )
            existing_cert_names.add(c["name"].lower())

    result["certifications"] = certifications

    return result