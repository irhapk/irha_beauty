---
id: "0004"
title: Backend Constitution Ratified
stage: constitution
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: none
branch: master
user: PC
command: Implement the following plan (Backend Constitution)
labels: ["constitution","backend","architecture","setup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

Implement the following plan:

# Plan: Backend Constitution

We are starting the Irha Beauty full-stack ecommerce project using Spec-Driven Development.
Before any feature work begins, a constitution must exist — a ratified rulebook that all
future specs, plans, tasks, and code must comply with. This plan covers the content and
placement of the backend constitution only.

Output File: `.specify/memory/constitution.md`

Constitution covers: Project Identity, Tech Stack (mandated), Architecture Principles,
API Design Rules, Code Quality Standards, Database Principles, Testing Standards,
Security Rules, File & Naming Conventions, Domain Build Order (MVP), Governance.

## Response snapshot

Wrote `.specify/memory/constitution.md` (129 lines) with all 10 sections filled:

1. **Project Identity** — Irha Beauty Backend API v1.0.0, ratified 2026-02-28
2. **Tech Stack** — Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2.x async, Alembic, NeonDB, JWT/httpOnly, Cloudflare R2, Stripe+COD, Ruff, Mypy strict, pytest
3. **I. Domain-Driven Modular Architecture** — `app/<domain>/` with exactly router/service/repository/schemas/models/tests; core in `app/core/`
4. **II. API Design Rules** — Pydantic v2 only, error envelope `{detail, code}`, semantic HTTP codes, no logic in routers, `/api/v1/`
5. **III. Code Quality Standards** — Ruff, Mypy strict, no Any without justification, 50-line max, no commented-out code
6. **IV. Database Principles** — async sessions only, Alembic migrations mandatory, no `create_all()`, CASCADE documented
7. **V. Testing Standards** — unit + integration per endpoint, co-located tests, 80% coverage gate
8. **VI. Security Rules** — no secrets in code, JWT in httpOnly cookies only, bcrypt, CORS allowlist, pre-signed R2 URLs
9. **VII. File & Naming Conventions** — snake_case files, PascalCase classes, schema suffixes, plain-noun models
10. **Domain Build Order** — core → auth → users → categories → products → cart → orders → payments → reviews → media
11. **Governance** — constitution supersedes all; amendments require ADR; CI enforces Ruff/Mypy/pytest

No placeholders remain. Version v1.0.0, ratified 2026-02-28.

## Outcome

- ✅ Impact: Backend constitution ratified and written to `.specify/memory/constitution.md`. All future specs, plans, tasks, and code reviews must cite compliance with this document.
- 🧪 Tests: none (document-only step)
- 📁 Files: `.specify/memory/constitution.md` (created/overwritten, 129 lines)
- 🔁 Next prompts: Scaffold `backend/` directory, copy constitution to `backend/.specify/memory/constitution.md`, then begin `/sp.specify` for the `core` domain
- 🧠 Reflection: Constitution is clean, complete, and has no unresolved placeholders. All 10 plan sections mapped to constitution sections.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): manual verification — all sections present, no placeholders, version/date correct — PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none
