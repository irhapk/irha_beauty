---
id: "0012"
title: Auth Tasks Generated
stage: tasks
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 003-auth
branch: 003-auth
user: PC
command: /sp.tasks
labels: ["tasks","auth","jwt","pyjwt","bcrypt","cookies","fastapi","pytest"]
links:
  spec: specs/003-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-auth/tasks.md (created)
tests:
  - n/a — tasks phase
---

## Prompt

/sp.tasks

## Response snapshot

Generated `specs/003-auth/tasks.md` with 25 tasks (T001–T025) organized across 7 phases for the 003-auth backend authentication feature.

**Task summary**:
- Phase 1 Setup (T001–T004): Add PyJWT/passlib/bcrypt to requirements.txt, add JWT settings to config.py, create auth/ and auth/tests/ __init__ files
- Phase 2 Foundational (T005–T009): Add hashed_password column to User model, generate+apply Alembic migration, create security.py (6 functions), add create_user_with_password to repository.py, create auth/schemas.py
- Phase 3 US1 Register (T010–T012): service.register(), POST /register router, 4 register tests
- Phase 4 US2 Login (T013–T015): service.login(), POST /login router, 4 login tests
- Phase 5 US3 Logout (T016–T018): service.logout(), POST /logout router, logout test
- Phase 6 US4 Refresh+Me (T019–T022): deps.get_current_user, service.refresh(), /refresh + /me router, 4 refresh+me tests
- Phase 7 Polish (T023–T025): CORSMiddleware + auth router in main.py, .env.example update, full pytest 49/49

**Parallel opportunities**: T003 ‖ T004 (different __init__ files), T008 ‖ T009 (repository.py vs schemas.py)

**Target**: 49/49 tests (36 existing + 13 new auth tests)

## Outcome

- ✅ Impact: 25 executable tasks generated, organized by user story. Each phase independently testable. Tasks detailed enough to implement without additional context.
- 🧪 Tests: n/a — tasks phase. Target: 49/49 after /sp.implement.
- 📁 Files: specs/003-auth/tasks.md (created)
- 🔁 Next prompts: `/sp.implement` to execute T001–T025
- 🧠 Reflection: Organizing tasks strictly by user story (one phase per story) enables incremental delivery — MVP is just Phases 1–4 (US1 Register + US2 Login).

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a — tasks phase
- Prompt variant (if applicable): tasks
- Next experiment: n/a
