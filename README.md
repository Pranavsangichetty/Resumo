# Resumo

> **Craft Better. Apply Smarter.**

Resumo is a modern, end-to-end career assistance platform designed to empower job seekers. From AI-driven resume creation and ATS scoring to job description analysis, cover letter generation, mock interviews, and job application tracking, Resumo streamlines every step of your hiring journey.

---

## 🌟 Key Features

- **Interactive Resume Builder & Templates**: Real-time editor with modular sections (Experience, Projects, Education, Skills, Certifications) and customizable resume templates (ATS-friendly, Harvard, Google, Modern, Creative, etc.).
- **ATS Checker & Optimization Loop**: Analyze resume scoring against target job descriptions and receive automated, actionable suggestions.
- **Job Description Analyzer**: Extract key keywords, required qualifications, and industry competencies.
- **Cover Letter Generator**: Create tailored cover letters matched to specific job descriptions and resume details.
- **Application Tracker**: Organize and monitor job applications across different pipeline stages (Applied, Interviewing, Offered, Rejected).
- **Mock Interview Preparation**: Practice answering role-specific questions and receive feedback.
- **Resumo Assistant (Chatbot)**: Floating AI companion to answer career questions and guide you across the platform.
- **Modern Dashboard & Analytics**: Visualize application metrics, conversion rates, and preparation milestones.

---

## 🏗️ Project Architecture & Structure

The repository is organized as a monorepo containing a modern Next.js frontend and a high-performance FastAPI backend:

```text
Resumo_Application/
├── apps/
│   ├── api/                       # Backend service (FastAPI)
│   │   ├── alembic/               # Database migrations (Alembic)
│   │   │   └── versions/          # Version-controlled DB schema changes
│   │   ├── app/
│   │   │   ├── api/               # API route controllers & dependencies
│   │   │   │   ├── routes/        # Modular endpoints (auth, resumes, applications, etc.)
│   │   │   │   └── dependencies.py
│   │   │   ├── ats/               # ATS analysis service and evaluation logic
│   │   │   ├── core/              # Core configuration, security, JWT auth
│   │   │   ├── db/                # Database engine & session management
│   │   │   ├── models/            # SQLAlchemy ORM models (User, Resume, Application, etc.)
│   │   │   ├── optimization/      # AI resume optimization pipeline & router
│   │   │   ├── schemas/           # Pydantic data validation schemas
│   │   │   ├── services/          # Business logic (resume parser, auth, email service)
│   │   │   └── main.py            # FastAPI entry point
│   │   ├── requirements.txt       # Python backend dependencies
│   │   └── alembic.ini            # Alembic configuration
│   │
│   └── web/                       # Frontend application (Next.js 14 / React)
│       ├── app/                   # Next.js App Router pages
│       │   ├── (auth)/            # Auth views (login, register, forgot-password)
│       │   ├── dashboard/         # Main user dashboard
│       │   ├── resume-builder/    # Interactive resume editor & preview
│       │   ├── ats/               # ATS analysis & score view
│       │   ├── job-description/   # Job description keyword analysis
│       │   ├── cover-letter/      # Tailored cover letter builder
│       │   ├── applications/      # Job application status tracker
│       │   ├── mock-interview/    # Interview preparation module
│       │   ├── job-search/        # Integrated job search module
│       │   ├── analytics/         # User metrics and analytics
│       │   └── settings/          # User settings & preferences
│       ├── components/            # Reusable UI components
│       │   ├── common/            # Primitive UI components (Button, Card, Input, TextArea)
│       │   ├── resume-editor/     # Form section editors (Experience, Skills, Projects, etc.)
│       │   ├── resume-preview/    # Live preview components
│       │   ├── template/          # Resume styling templates (ATS, Harvard, Modern, etc.)
│       │   ├── chatbot.tsx        # Floating Resumo Assistant widget
│       │   └── Sidebar.tsx        # Main navigation sidebar
│       ├── lib/                   # API clients, TypeScript definitions, default templates
│       └── tailwind.config.ts     # Tailwind CSS configuration
│
├── docs/                          # Architecture, schema, chatbot, and roadmap documentation
├── docker-compose.yml             # Local multi-container development setup (PostgreSQL)
├── package.json                   # Root workspace management
└── start-dev.bat                  # One-click Windows startup script
```

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/), [Python 3.10+](https://www.python.org/), [SQLAlchemy](https://www.sqlalchemy.org/), [Alembic](https://alembic.sqlalchemy.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (or SQLite for quick local experimentation)
- **Containerization**: [Docker](https://www.docker.com/) & Docker Compose

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Python](https://www.python.org/) (v3.10 or newer)
- [Docker](https://www.docker.com/) & Docker Compose (optional, for running PostgreSQL)

### 1. Database (Docker)

To spin up the PostgreSQL database in the background:

```bash
docker compose up -d
```

### 2. Backend Setup

```bash
cd apps/api

# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

The API docs will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup

In a new terminal:

```bash
cd apps/web

# Install packages
npm install

# Start Next.js development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

> **Tip for Windows users**: You can run `start-dev.bat` from the root directory to quickly launch your development environment.

---

## 📖 Documentation & Roadmap

- [Project Roadmap](docs/ROADMAP.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Chatbot Architecture](docs/CHATBOT.md)
- [Branching & Workflow Guide](docs/BRANCHES.md)

---

## 🤝 Contributing

Contributions, feature requests, and bug reports are welcome! Feel free to check the [issues page](https://github.com/Pranavsangichetty/Resumo/issues).

## Contributors

- [G.V.M. Durga Sandeep](https://github.com/Sandeep3002)
- [Pranav Sangichetty](https://github.com/Pranavsangichetty)
