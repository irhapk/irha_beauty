# Implementation Plan: Backend CRUD APIs — Phase 1

**Branch**: `001-backend-crud-apis` | **Date**: 2026-02-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-backend-crud-apis/spec.md`

---

## Summary

Build Phase 1 of the Irha Beauty backend: full CRUD REST APIs for three resources — Products, Categories, and Users — using FastAPI + Pydantic v2, with in-memory storage, uniform error handling, and full endpoint test coverage. No database, no auth.

---

## Technical Context

**Language/Version**: Python 3.12+
**Primary Dependencies**: FastAPI, Pydantic v2, Uvicorn, httpx, pytest, pytest-asyncio
**Storage**: In-memory dict per domain service (Phase 1 only — swappable in Phase 2)
**Testing**: pytest + httpx `AsyncClient` with `ASGITransport`
**Target Platform**: Local development server (Linux/Windows)
**Project Type**: Web API — backend only
**Performance Goals**: No load targets for Phase 1 (in-memory, dev only)
**Constraints**: No database, no auth, no external services, no environment variables
**Scale/Scope**: 3 resources × 5 endpoints = 15 total endpoints

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|---|---|---|
| Python 3.12+ | ✅ PASS | Mandated in constitution |
| FastAPI + Pydantic v2 | ✅ PASS | Mandated in constitution |
| Domain-driven structure `app/<domain>/` | ✅ PASS | Enforced in project structure below |
| Router → Service layering | ✅ PASS | No logic in routers |
| `/api/v1/` prefix on all routes | ✅ PASS | Applied to all contracts |
| Uniform error envelope `{detail, code}` | ✅ PASS | Applied to all error contracts |
| Schema suffixes `Create/Update/Read` | ✅ PASS | Applied to all schemas |
| In-memory storage only (Phase 1) | ✅ PASS | No DB connection anywhere |
| pytest + httpx `AsyncClient` tests | ✅ PASS | Test structure follows constitution |
| No auth, no DB, no payments | ✅ PASS | Explicitly out of Phase 1 scope |

**GATE RESULT: ALL PASS. Proceeding to Phase 0.**

---

## Project Structure

### Documentation (this feature)

```text
specs/001-backend-crud-apis/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── products.md
│   ├── categories.md
│   └── users.md
└── tasks.md             # Created by /sp.tasks (not this command)
```

### Source Code

```text
backend/
├── app/
│   ├── main.py                        # FastAPI app, router registration
│   ├── core/
│   │   └── exceptions.py              # HTTPException handlers, error envelope
│   ├── products/
│   │   ├── router.py
│   │   ├── schemas.py
│   │   ├── service.py
│   │   └── tests/
│   │       └── test_products.py
│   ├── categories/
│   │   ├── router.py
│   │   ├── schemas.py
│   │   ├── service.py
│   │   └── tests/
│   │       └── test_categories.py
│   └── users/
│       ├── router.py
│       ├── schemas.py
│       ├── service.py
│       └── tests/
│           └── test_users.py
├── conftest.py                        # Global pytest fixtures (async client)
└── requirements.txt
```

**Structure Decision**: Domain-driven per constitution. Each resource is a self-contained domain under `app/`. Shared error logic lives in `app/core/`.

---

## Complexity Tracking

No constitution violations. No complexity justification needed.
