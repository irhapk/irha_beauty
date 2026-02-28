---
id: "0003"
title: Phase 2 DB Connection Tasks
stage: tasks
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 002-db-connection
branch: 002-db-connection
user: PC
command: /sp.tasks
labels: ["tasks","backend","phase-2","database","sqlalchemy","alembic","postgresql"]
links:
  spec: specs/002-db-connection/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-db-connection/tasks.md
tests:
  - 35 existing tests (unmodified assertions)
  - 1 new test (test_delete_category_with_products)
---

## Prompt

/sp.tasks

## Response snapshot

Generated 29 tasks across 6 phases for the database connection feature.

**Key design decision resolved in tasks**: Existing tests assert `data["id"] == 1` for the first created resource. This is preserved by using `TRUNCATE ... RESTART IDENTITY CASCADE` in the `db_session` teardown (instead of pure transaction rollback), which resets PostgreSQL sequences after each test. Each test starts fresh with sequences at 1 — matching Phase 1 behavior.

**Phase summary**:
- Phase 1 (Setup): 2 tasks — requirements.txt + .env.example / .gitignore
- Phase 2 (Foundational): 4 tasks — config.py → database.py → deps.py + Alembic init (sequential)
- Phase 3 (US1): 14 tasks — ORM models (3, parallel) → migration → repos (3, parallel) → services (3, parallel) → routers (3, parallel) → conftest update
- Phase 4 (US2): 4 tasks — remove reset_store from 3 test files (parallel) + run 35 tests
- Phase 5 (US3): 2 tasks — RESTRICT check in delete_category + new test for CATEGORY_HAS_PRODUCTS
- Phase 6 (Polish): 3 tasks — full suite (36 tests), manual persistence, docs

**Parallel opportunities**: T001‖T002, T005‖T006, T007–T009, T011–T013, T014–T016, T017–T019, T021–T023, T028‖T029.

**Test file modifications**: Only 3 changes needed — remove `reset_store()` fixtures from each test file. Zero assertion changes.

## Outcome

- ✅ Impact: 29 immediately-executable tasks ready for /sp.implement phase by phase
- 🧪 Tests: 35 existing (pass unmodified) + 1 new = 36 total
- 📁 Files: specs/002-db-connection/tasks.md
- 🔁 Next prompts: /sp.implement phase 01, 02, 03... (stop after each phase for validation)
- 🧠 Reflection: The TRUNCATE+RESTART IDENTITY approach is the right call given the existing `== 1` ID assertions in tests. Pure transaction rollback would break those tests without file changes. Truncate gives us sequence reset + data isolation cleanly.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): format validation — all 29 tasks follow checkbox + ID + optional P + optional Story + description with file path format
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none
