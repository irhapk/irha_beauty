---
id: "0011"
title: Auth Implementation Plan
stage: plan
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 003-auth
branch: 003-auth
user: PC
command: /sp.plan
labels: ["plan","auth","jwt","pyjwt","bcrypt","cookies","cors","fastapi"]
links:
  spec: specs/003-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-auth/plan.md (created)
  - specs/003-auth/research.md (created)
  - specs/003-auth/data-model.md (created)
  - specs/003-auth/contracts/auth.md (created)
  - specs/003-auth/quickstart.md (created)
  - .specify/memory/constitution.md (python-jose → PyJWT)
tests:
  - n/a — plan phase
---

## Prompt

/sp.plan

## Response snapshot

Completed full planning for 003-auth feature.

**Critical research finding**: python-jose has two unpatched CVEs (2024) — CVE-2024-33664 and CVE-2024-33663 (algorithm confusion attacks). Library is unmaintained since 2022. FastAPI docs switched to PyJWT in 2024. Constitution updated from python-jose[cryptography] → PyJWT.

**Plan summary**:
- No new tables — auth reuses existing `users` table + adds `hashed_password VARCHAR(72) NULLABLE` column via Alembic migration
- New files: `app/core/security.py`, `app/auth/` domain (router, schemas, service, tests)
- Modified files: `app/core/config.py` (JWT settings), `app/core/deps.py` (get_current_user), `app/users/models.py` (hashed_password column), `app/users/repository.py` (create_user_with_password), `app/main.py` (CORS + auth router)
- Cookie strategy: httpOnly, SameSite=Lax, secure=True in prod only (controlled by ENVIRONMENT env var)
- 13 new tests → target 49/49 passing (36 existing + 13 auth)
- Timing-safe INVALID_CREDENTIALS: always call verify_password even for unknown email (prevents timing-based enumeration)

**Artifacts generated**: research.md, data-model.md, contracts/auth.md, quickstart.md, plan.md

## Outcome

- ✅ Impact: Full implementation plan ready. All architectural decisions made and documented. PyJWT selected (not python-jose — CVEs). 13 tasks defined in sequential order with parallel opportunities noted.
- 🧪 Tests: n/a — plan phase. Target: 49/49 after implementation.
- 📁 Files: 5 new artifact files + 1 constitution update
- 🔁 Next prompts: `/sp.tasks` → generate tasks.md, then `/sp.implement`
- 🧠 Reflection: Running a research agent revealed a critical security issue (python-jose CVEs) that would have been introduced into production. Always research library choices before committing them to a plan. PyJWT is simpler, actively maintained, and the FastAPI-documented choice as of 2024.

## Evaluation notes (flywheel)

- Failure modes observed: Initial research.md written with python-jose; research agent corrected to PyJWT with CVE evidence. Constitution updated accordingly.
- Graders run and results (PASS/FAIL): n/a — plan phase
- Prompt variant (if applicable): plan
- Next experiment: n/a
