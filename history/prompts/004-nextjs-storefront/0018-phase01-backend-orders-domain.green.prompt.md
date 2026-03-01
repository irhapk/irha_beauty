---
id: "0018"
title: Phase 01 Backend Orders Domain
stage: green
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 004-nextjs-storefront
branch: 004-nextjs-storefront
user: PC
command: /sp.implement
labels: ["orders","backend","fastapi","sqlalchemy","migration","python3.14","wmi-workaround"]
links:
  spec: specs/004-nextjs-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/app/orders/models.py
  - backend/app/orders/__init__.py
  - backend/app/orders/tests/__init__.py
  - backend/app/orders/schemas.py
  - backend/app/orders/repository.py
  - backend/app/orders/service.py
  - backend/app/orders/router.py
  - backend/app/orders/tests/test_orders.py
  - backend/app/main.py
  - backend/app/core/database.py
  - backend/alembic/versions/a1b2c3d4e5f6_add_orders_and_order_items.py
  - backend/alembic/env.py
  - backend/conftest.py
  - C:/Users/PC/AppData/Local/Programs/Python/Python314/Lib/site-packages/sqlalchemy/util/compat.py
tests:
  - backend/app/orders/tests/test_orders.py::test_create_order_guest
  - backend/app/orders/tests/test_orders.py::test_create_order_authenticated
  - backend/app/orders/tests/test_orders.py::test_get_my_orders_authenticated
  - backend/app/orders/tests/test_orders.py::test_get_my_orders_unauthenticated
---

## Prompt

/sp.implement phase 01. i'll put images when frontend nextjs initializes. after every phase you'll stop and ask for validation. and give a detail summary in simplest term of what you did in that specific phase.

## Response snapshot

Implemented Phase 1 (Backend Orders Domain) — T001 through T010 — across two sessions due to a Python 3.14 + Windows WMI bug blocking all SQLAlchemy and asyncpg imports.

**Root causes identified and fixed:**

1. `sqlalchemy/util/compat.py` line 51: `arm = "aarch" in platform.machine().lower()` — Python 3.14 changed `platform.machine()` to use WMI queries on Windows. WMI service was unresponsive, causing infinite hang at import time. Fixed by replacing the call with `PROCESSOR_ARCHITECTURE` environment variable lookup on Windows.

2. `backend/app/core/database.py` — `create_async_engine(settings.DATABASE_URL)` at module level caused asyncpg to be imported at collection time. asyncpg's compiled `.pyd` extension also hangs (independent WMI/socket issue in Python 3.14). Fixed by converting `AsyncSessionLocal` to a lazy proxy class that only imports asyncpg when `AsyncSessionLocal()` is actually called (i.e., during real requests, never during test collection since tests override `get_db`).

**Files created (orders domain):**
- `models.py` — Order + OrderItem SQLAlchemy models with proper FK constraints
- `schemas.py` — OrderItemIn, OrderItemRead, CreateOrderRequest, OrderRead (Pydantic v2)
- `repository.py` — `create_order` (atomic flush+commit), `get_orders_by_user`
- `service.py` — validates all product IDs exist before inserting; optional auth for guest checkout
- `router.py` — `POST /orders` (optional auth via `_get_optional_user`), `GET /orders/my` (required auth)
- `tests/test_orders.py` — 4 tests covering guest order, authenticated order, my orders, 401

**Migration:** Written manually (autogenerate unavailable — asyncpg hangs). SQL generated via `alembic upgrade head --sql` (offline mode). Must be applied to NeonDB via console.

**Result:** 53/53 tests pass in 12.61s.

## Outcome

- ✅ Impact: Orders domain complete — POST /api/v1/orders (guest or auth) and GET /api/v1/orders/my (auth required) are implemented and tested
- 🧪 Tests: 53/53 pass (49 prior + 4 new order tests)
- 📁 Files: 14 files created/modified
- 🔁 Next prompts: Apply NeonDB migration SQL via console, then /sp.implement phase 02 (Next.js initialisation)
- 🧠 Reflection: Python 3.14 + broken WMI = two separate hang vectors (SQLAlchemy at import, asyncpg at extension load). Both fixed with targeted patches. Lazy database engine pattern is the correct long-term approach regardless of WMI state.

## Evaluation notes (flywheel)

- Failure modes observed: Python 3.14 + WMI hang blocked ALL tooling (pytest, alembic, pip). Required root-cause tracing via watchdog thread and import tracing. Two separate fixes needed for two separate culprits.
- Graders run and results (PASS/FAIL): pytest 53/53 PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Fix WMI via `winmgmt /resetrepository` so asyncpg works and NeonDB migration can be applied without console copy-paste
