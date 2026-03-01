---
id: "0032"
title: Deploy Backend Railway + Frontend Vercel Config
stage: general
date: 2026-03-01
surface: agent
model: claude-sonnet-4-6
feature: none
branch: 004-nextjs-storefront
user: PC
command: implement deployment plan
labels: ["deployment","railway","vercel","cors","config"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/alembic.ini (recreated)
  - backend/railway.toml (created)
  - backend/runtime.txt (created)
  - backend/app/core/config.py (updated)
  - backend/app/main.py (updated)
tests:
  - none (deployment config, no test changes)
---

## Prompt

Implement the following plan:

# Plan: Deploy Backend to Railway + Frontend to Vercel

## Context
The Irha Beauty full-stack app is complete and needs production hosting.
Backend is FastAPI in `backend/`, frontend is Next.js in `frontend/`.
Goal: Backend → Railway, Frontend → Vercel.

---

## Production Architecture

```
Browser → Vercel (Next.js)
            ↓ next.config.ts rewrites: /api/* → Railway backend URL
         Railway (FastAPI + uvicorn)
            ↓
         NeonDB (PostgreSQL, already live)
```

Key insight: Frontend axios uses `baseURL: "/api"` — all API calls proxy through Vercel's server to Railway. Cookie SameSite=lax works unchanged. No CORS issues for proxied calls. No frontend code changes required.

## Code Changes Required

1. `backend/alembic.ini` — RECREATE (was deleted locally)
2. `backend/railway.toml` — CREATE (nixpacks builder, run migrations + uvicorn)
3. `backend/runtime.txt` — CREATE (python-3.12)
4. `backend/app/core/config.py` — ADD `CORS_ORIGINS` + make `TEST_DATABASE_URL` optional
5. `backend/app/main.py` — UPDATE CORS middleware to use dynamic origins from settings

## Response snapshot

All 5 files created/updated successfully:

1. `backend/alembic.ini` recreated with standard Alembic config, `script_location = alembic`.

2. `backend/railway.toml` created:
   - builder = "nixpacks"
   - startCommand = "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
   - restartPolicyType = "on_failure", maxRetries = 3

3. `backend/runtime.txt` created with `python-3.12`.

4. `backend/app/core/config.py` updated:
   - `TEST_DATABASE_URL: str = ""` (optional, no Railway startup failure)
   - `CORS_ORIGINS: str = "http://localhost:3000"` (default, overridden via env var in prod)

5. `backend/app/main.py` updated:
   - Imports `settings` from `app.core.config`
   - `allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]`

## Outcome

- ✅ Impact: Backend is Railway-ready; CORS is now configurable via env var; alembic.ini restored so migrations run on deploy
- 🧪 Tests: No test changes — deployment config only; existing 49/49 tests unaffected
- 📁 Files: 5 files created/modified (alembic.ini, railway.toml, runtime.txt, config.py, main.py)
- 🔁 Next prompts: commit + push → deploy to Railway → deploy to Vercel → update CORS_ORIGINS → verify /docs and homepage
- 🧠 Reflection: Making TEST_DATABASE_URL optional is the critical fix — Railway has no test DB; without default="" it would crash on settings load

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): commit all changes and push to trigger Railway deploy
