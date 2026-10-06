# Resumo
**Craft Better. Apply Smarter.**

GitHub-ready foundation with a floating Resumo Assistant.

## Stack
- Next.js + TypeScript + Tailwind CSS
- FastAPI
- PostgreSQL
- Docker

## Start
1. `docker compose up -d`
2. Backend:
   - `cd apps/api`
   - `python -m venv .venv`
   - activate `.venv`
   - `pip install -r requirements.txt`
   - `uvicorn app.main:app --reload`
3. Frontend:
   - `cd apps/web`
   - `npm install`
   - `npm run dev`

Open http://localhost:3000

The chatbot currently includes its UI and a backend conversation endpoint.
A production LLM/RAG connection will be added in the AI sprint.
