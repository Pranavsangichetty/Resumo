from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.api.routes.applications import router as applications_router
from app.api.routes.auth import router as auth_router
from app.api.routes.cover_letter import router as cover_letter_router
from app.api.routes.job_description import router as job_description_router
from app.api.routes.mock_interview import router as mock_interview_router
from app.api.routes.resumes import router as resumes_router
from app.api.routes.settings import router as settings_router
from app.ats import router as ats_router
from app.db.session import init_db
from app.optimization import router as optimization_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize database tables
    init_db()
    yield


app = FastAPI(
    title="Resumo API",
    version="0.2.0",
    lifespan=lifespan,
)


# --------------------------------------------------
# CORS Configuration
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Register API Routers
# --------------------------------------------------

# Authentication
app.include_router(
    auth_router,
    prefix="/api/v1",
)

# Settings & Profile
app.include_router(
    settings_router,
    prefix="/api/v1",
)

# Resume management
app.include_router(
    resumes_router,
    prefix="/api/v1",
)

# Job Description
app.include_router(
    job_description_router,
    prefix="/api/v1",
)

# Job Applications Tracker
app.include_router(
    applications_router,
    prefix="/api/v1",
)

# Cover Letter Generator
app.include_router(
    cover_letter_router,
    prefix="/api/v1",
)

# Mock Interview Simulator
app.include_router(
    mock_interview_router,
    prefix="/api/v1",
)

# ATS Evaluation
app.include_router(
    ats_router.router,
    prefix="/api/v1",
)

# AI Resume Optimization
app.include_router(
    optimization_router.router,
    prefix="/api/v1",
)


# --------------------------------------------------
# Chat Request Schema
# --------------------------------------------------

class ChatRequest(BaseModel):
    message: str


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "product": "Resumo",
    }


# --------------------------------------------------
# Resumo Assistant
# --------------------------------------------------

@app.post("/api/v1/chat")
def chat(payload: ChatRequest):
    text = payload.message.strip()

    # Placeholder assistant until the LLM/RAG sprint.
    return {
        "reply": (
            f"I received your question: '{text}'. "
            "The Resumo Assistant UI and API are working. "
            "Context-aware resume, job, ATS and interview answers "
            "will be connected during the AI integration sprint."
        )
    }