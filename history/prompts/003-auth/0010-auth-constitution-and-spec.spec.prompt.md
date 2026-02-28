---
id: "0010"
title: Auth Constitution Update and Spec
stage: spec
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 003-auth
branch: 003-auth
user: PC
command: /sp.specify user authentication — register, login, logout, refresh, me
labels: ["spec","auth","jwt","bcrypt","cookies","register","login","logout","refresh"]
links:
  spec: specs/003-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md (updated to v3.0.0 — Phase 3 auth added)
  - specs/003-auth/spec.md (created)
  - specs/003-auth/checklists/requirements.md (created)
tests:
  - n/a — spec phase
---

## Prompt

yes first update constitution then write artifacts. do you have any other question regarding auth? / yes Option B, update constitution and start spec

## Response snapshot

Updated backend constitution to v3.0.0. Key additions:
- Phase 3 scope: custom JWT auth (email + password only, httpOnly cookies)
- Tech stack: passlib[bcrypt], python-jose[cryptography], httpOnly cookies
- New project structure: app/auth/ domain, app/core/security.py, updated deps.py
- New Section 8a: Security & Auth Rules (cookie flags, token payload, CORS requirements)
- Auth-specific API routes: POST /register /login /logout /refresh, GET /me
- Config: JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
- Phase 3 scope boundaries documented (no social login, no email verification, no RBAC)

Spec written for 003-auth with 4 user stories:
- US1 (P1): Register new account — immediate login after register
- US2 (P1): Login to existing account — cookie-based session
- US3 (P2): Logout — clear cookies
- US4 (P2): Refresh access token — silent renewal

14 functional requirements, 6 success criteria, full edge cases and assumptions documented.
Key design decision: auth domain reuses existing users table + repository (no new tables — only adds hashed_password column via migration).

## Outcome

- ✅ Impact: Constitution ratified at v3.0.0 with full auth architecture defined. Spec ready for /sp.plan.
- 🧪 Tests: n/a — spec phase
- 📁 Files: 3 files created/modified
- 🔁 Next prompts: `/sp.plan` for 003-auth → generate data-model.md, contracts/, research.md
- 🧠 Reflection: Confirming Option B (custom FastAPI auth) before writing the spec saved significant rework. better-auth is Node.js only — using it with FastAPI would have required a split auth architecture. Custom JWT is simpler, fully owned, and directly integrates with the existing users domain.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a — spec phase
- Prompt variant (if applicable): spec
- Next experiment: n/a
