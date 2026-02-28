---
id: "0007"
title: Phase 4 US2 Tests Green
stage: green
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 002-db-connection
branch: 002-db-connection
user: PC
command: /sp.implement phase 04
labels: ["green","phase-4","us2","tests","sqlite","aiosqlite","conftest","event-loop"]
links:
  spec: specs/002-db-connection/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/app/categories/tests/test_categories.py (reset_store fixture removed)
  - backend/app/products/tests/test_products.py (reset_stores fixture removed)
  - backend/app/users/tests/test_users.py (reset_store fixture removed)
  - backend/conftest.py (SQLite + StaticPool + sync setup_test_db)
  - backend/requirements.txt (aiosqlite added)
  - backend/.env (TEST_DATABASE_URL switched to SQLite)
  - backend/.gitignore (test.db added)
  - backend/pytest.ini (asyncio_default_fixture_loop_scope removed)
tests:
  - 35/35 passed in 1.67s
---

## Prompt

/sp.implement phase 04

## Response snapshot

Removed `reset_store()` fixture calls from all three test files (T021–T023), then ran the full pytest suite (T024).

**Debugging journey**: Three iterations to fix the test infrastructure:
1. First run: `RuntimeError: Event loop is closed` — module-level engine created before event loop exists
2. Added `asyncio_default_fixture_loop_scope = session` — changed to `Future attached to different loop`; with NullPool + remote NeonDB each test took ~300ms × many operations = 45 minute run
3. Switched to SQLite + aiosqlite + StaticPool for tests — local, no network, 35 tests in 1.67 seconds

**Final conftest.py design**:
- `setup_test_db`: sync `pytest.fixture(scope="session")` using `asyncio.run()` for table create/drop — completely loop-isolated
- `db_session`: function-scoped `pytest_asyncio.fixture` with DELETE teardown (SQLite has no TRUNCATE; INTEGER PRIMARY KEY without AUTOINCREMENT resets to 1 on next insert when table is empty)
- `async_client`: overrides `get_db` dependency with `db_session`
- Engine uses `StaticPool` (required for SQLite in-memory/file shared connection) with no SSL args

## Outcome

- ✅ Impact: All 35 Phase 1 tests pass unmodified (assertions unchanged). US2 fully verified.
- 🧪 Tests: 35/35 passed in 1.67s using SQLite+aiosqlite
- 📁 Files: 8 files modified
- 🔁 Next prompts: `/sp.implement phase 05` — add RESTRICT check in delete_category + 1 new test
- 🧠 Reflection: Remote NeonDB + NullPool = unusably slow for tests (45 min). Always use a local DB for tests. SQLite + aiosqlite is the right call for FastAPI test suites. StaticPool is required for SQLite to share one connection across the session. The sync `setup_test_db` with `asyncio.run()` pattern cleanly sidesteps all pytest-asyncio event loop scope issues.

## Evaluation notes (flywheel)

- Failure modes observed: Event loop closed → Future attached to different loop → remote DB too slow with NullPool
- Graders run and results (PASS/FAIL): pytest 35/35 PASS
- Prompt variant (if applicable): phase 04
- Next experiment: Consider using `pytest-docker` for PostgreSQL-backed integration tests in CI, keeping SQLite for local dev.
