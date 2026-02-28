# Irha Beauty — Backend Constitution

**Version**: v2.0.0
**Ratified**: 2026-02-28
**Amended**: 2026-02-28 — Phase 2: Database Connection added

---

## 1. Project Identity

- **Project**: Irha Beauty Backend API
- **Phase 1 Scope**: ✅ Complete — CRUD APIs with in-memory storage
- **Phase 2 Scope**: Database connection — replace in-memory storage with NeonDB (PostgreSQL) via SQLAlchemy async + Alembic migrations
- **Goal**: All API contracts and business logic validated in Phase 1. Phase 2 wires the real database without changing any route or schema.

---

## 2. Tech Stack

| Layer | Choice | Phase |
|---|---|---|
| Language | Python 3.12+ | 1 + 2 |
| Framework | FastAPI | 1 + 2 |
| Type validation | Pydantic v2 | 1 + 2 |
| Server | Uvicorn | 1 + 2 |
| Tests | pytest + httpx (async test client) | 1 + 2 |
| ORM | SQLAlchemy 2.x (async) | 2 |
| DB driver | asyncpg (TCP) | 2 |
| Database | NeonDB — serverless PostgreSQL | 2 |
| Migrations | Alembic | 2 |
| Config/Secrets | pydantic-settings + `.env` | 2 |

---

## 3. Project Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app, router registration
│   ├── core/
│   │   ├── exceptions.py        # Custom exception handlers
│   │   ├── database.py          # Async engine, sessionmaker, Base
│   │   └── deps.py              # FastAPI dependency: get_db session
│   └── <domain>/
│       ├── router.py            # Route definitions
│       ├── schemas.py           # Pydantic request/response models
│       ├── models.py            # SQLAlchemy ORM model          ← NEW in Phase 2
│       ├── repository.py        # All DB queries (no business logic)  ← NEW in Phase 2
│       ├── service.py           # Business logic (calls repository)
│       └── tests/
│           └── test_<domain>.py
├── alembic/                     # Migration scripts              ← NEW in Phase 2
│   ├── env.py
│   └── versions/
├── alembic.ini                  # Alembic config                 ← NEW in Phase 2
├── conftest.py                  # Global pytest fixtures
├── .env                         # Secrets — never committed
├── .env.example                 # Committed template with no values
└── requirements.txt
```

---

## 4. API Design Rules

*(Unchanged from Phase 1)*

- All routes prefixed with `/api/v1/`
- Standard CRUD pattern per resource:

| Action | Method | Path |
|---|---|---|
| List all | GET | `/api/v1/<resource>` |
| Get one | GET | `/api/v1/<resource>/{id}` |
| Create | POST | `/api/v1/<resource>` |
| Update | PUT | `/api/v1/<resource>/{id}` |
| Delete | DELETE | `/api/v1/<resource>/{id}` |

- All request bodies validated with Pydantic models — no raw dicts
- All responses return Pydantic models — no untyped dicts
- Uniform error response: `{ "detail": "...", "code": "SCREAMING_SNAKE" }`
- HTTP status codes: `200`, `201`, `204`, `404`, `422`

---

## 5. Schema Conventions

*(Unchanged from Phase 1)*

- One schemas file per domain: `app/<domain>/schemas.py`
- Three schema classes per resource: `<Resource>Create`, `<Resource>Update`, `<Resource>Read`
- Use `model_config = ConfigDict(from_attributes=True)` on all schemas

---

## 6. Layering Rules

Updated for Phase 2 — four layers:

| Layer | File | Responsibility |
|---|---|---|
| Router | `router.py` | Parse request, inject DB session, call service, return response |
| Service | `service.py` | Business logic and constraint checks — calls repository only |
| Repository | `repository.py` | All DB queries — no business logic, no HTTP concerns |
| Model | `models.py` | SQLAlchemy ORM table definition only |

- **No raw SQL in services** — only repository calls
- **No DB session in routers** — inject via `Depends(get_db)` and pass to service
- **No business logic in repositories** — repositories only query and return

---

## 7. Database Principles

- **Engine**: single async engine created once at startup via `app/core/database.py`
- **Session**: `AsyncSession` via `async_sessionmaker` — one session per request, injected by `get_db` dependency
- **Base**: `DeclarativeBase` subclass in `app/core/database.py` — all models inherit from it
- **Migrations**: every schema change requires an Alembic migration — `Base.metadata.create_all()` is forbidden
- **`CASCADE` deletes**: must be intentional and documented in the model docstring
- **No raw SQL strings** except in complex Alembic migrations (document the reason)
- **Connection**: asyncpg TCP to NeonDB — connection string from `.env` as `DATABASE_URL`

---

## 8. Configuration and Secrets

- All sensitive values via `.env` + `pydantic-settings` `Settings` class in `app/core/config.py`
- `.env` is gitignored — never committed
- `.env.example` is committed with placeholder values and no real secrets
- Minimum required variables:
  - `DATABASE_URL` — full asyncpg connection string to NeonDB
- Settings loaded once at startup, injected where needed

---

## 9. Testing Standards

Updated for Phase 2:

- Every endpoint must have at least one test (carried from Phase 1)
- Use `httpx.AsyncClient` with `ASGITransport` as the test client
- Test naming: `test_<action>_<scenario>`
- Tests live in `app/<domain>/tests/test_<domain>.py`
- Global fixtures in root `conftest.py`:
  - `async_client` — async HTTP test client
  - `db_session` — isolated async DB session for each test
- Test database: separate from production — configured via `TEST_DATABASE_URL` in `.env`
- Each test runs in a **transaction that is rolled back** after the test — no persistent state between tests
- No in-memory stores in Phase 2 tests — all tests hit the real test database

---

## 10. Naming Conventions

*(Unchanged from Phase 1)*

| Thing | Convention | Example |
|---|---|---|
| Files | snake_case | `router.py`, `repository.py` |
| Classes | PascalCase | `ProductCreate`, `Product` (ORM model) |
| Functions | snake_case | `get_product`, `create_product` |
| Constants | SCREAMING_SNAKE | `NOT_FOUND` |
| URL paths | kebab-case | `/api/v1/product-categories` |
| ORM models | plain noun | `User`, `Product`, `Category` |
| Pydantic schemas | noun + intent | `UserCreate`, `UserRead`, `UserUpdate` |

---

## 11. Phase Boundary

**Phase 1** ✅ Complete:
- FastAPI app, CRUD routes, Pydantic schemas, in-memory storage, endpoint tests

**Phase 2 includes:**
- `app/core/database.py` — async engine + session factory
- `app/core/deps.py` — `get_db` dependency
- `app/core/config.py` — pydantic-settings `Settings`
- `app/<domain>/models.py` — SQLAlchemy ORM model per domain
- `app/<domain>/repository.py` — DB queries per domain
- Updated `app/<domain>/service.py` — replace in-memory store calls with repository calls
- Alembic setup + initial migration
- `.env` + `.env.example`
- Updated `conftest.py` — test DB session with rollback isolation

**Phase 2 does NOT include:**
- Authentication / JWT
- File storage
- Payment integration

These are deferred to Phase 3+.

---

## Governance

- This constitution supersedes all other practices for Phase 1 and Phase 2.
- Amendments require: a proposed change, ratification note, and version bump.
- All specs, plans, tasks, and code reviews must cite compliance with this constitution.

**Version**: v2.0.0 | **Ratified**: 2026-02-28 | **Last Amended**: 2026-02-28
