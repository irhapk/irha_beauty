---
id: "0002"
title: Phase 2 DB Connection Plan
stage: plan
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 002-db-connection
branch: 002-db-connection
user: PC
command: /sp.plan
labels: ["plan","backend","phase-2","database","sqlalchemy","asyncpg","alembic","neondb"]
links:
  spec: specs/002-db-connection/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-db-connection/plan.md
  - specs/002-db-connection/research.md
  - specs/002-db-connection/data-model.md
  - specs/002-db-connection/quickstart.md
  - specs/002-db-connection/contracts/categories.md
  - specs/002-db-connection/contracts/products.md
  - specs/002-db-connection/contracts/users.md
tests:
  - None generated at plan stage
---

## Prompt

/sp.plan

## Response snapshot

Generated complete Phase 2 implementation plan for database connection.

**Phase 0 — Research (research.md)**: 9 decisions resolved:
- SQLAlchemy 2.x async engine + `async_sessionmaker` with `pool_pre_ping=True` for NeonDB serverless
- `get_db` async generator dependency yielding `AsyncSession` per request
- Test isolation via transaction rollback: each test binds to an uncommitted connection, rolls back after
- Alembic async setup using `asyncio.run` + `conn.run_sync(do_run_migrations)` in env.py
- NeonDB connection string: `postgresql+asyncpg://...?sslmode=require`
- pydantic-settings `BaseSettings` in `app/core/config.py`
- Category delete: **RESTRICT** (409 `CATEGORY_HAS_PRODUCTS`) — not CASCADE
- Services become async, accept `db: AsyncSession`, call repositories
- SQLAlchemy 2.x `Mapped[]` + `mapped_column()` style for ORM models

**Phase 1 — Design artifacts**:
- `data-model.md`: Category (4 cols, UNIQUE name, RESTRICT delete), Product (7 cols, FK → categories RESTRICT, Numeric price), User (4 cols, UNIQUE email)
- `contracts/`: 3 files documenting all 15 endpoints — identical to Phase 1 except DELETE /categories/{id} now returns 409 CATEGORY_HAS_PRODUCTS
- `quickstart.md`: env setup, migration steps, 4 integration test scenarios, full file change list

**plan.md**: 8 implementation phases:
1. Infrastructure (config, database, deps) — BLOCKING
2. ORM Models (parallel: categories, products, users)
3. Alembic initial migration
4. Repositories (parallel: 3 domains)
5. Services (async, call repositories)
6. Routers (inject db session)
7. conftest.py update (rollback isolation)
8. Polish (run 35 tests, verify persistence, verify RESTRICT)

**Constitution check**: All 13 rules pass. No violations.

## Outcome

- ✅ Impact: Complete implementation plan ready for /sp.tasks. All research resolved, all design artifacts generated, all architectural decisions documented.
- 🧪 Tests: No tests generated at plan stage — carried from Phase 1 (35 tests)
- 📁 Files: 7 files created (plan.md, research.md, data-model.md, quickstart.md, 3 contracts)
- 🔁 Next prompts: /sp.tasks (generate tasks.md), then /sp.implement phase by phase
- 🧠 Reflection: The RESTRICT decision on category delete is the only behavioural addition to Phase 1 — everything else is purely internal plumbing. The test isolation pattern (transaction rollback) is the most complex piece. The `reset_store()` removal from test files is the only test file modification.

## Evaluation notes (flywheel)

- Failure modes observed: research agent timed out — resolved by writing research.md directly from domain knowledge
- Graders run and results (PASS/FAIL): Constitution check 13/13 PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none

---

📋 Architectural decision detected: **RESTRICT vs CASCADE on category delete** — choosing not to cascade-delete products when a category is removed, instead returning 409. Document reasoning and tradeoffs? Run `/sp.adr category-delete-behaviour`
