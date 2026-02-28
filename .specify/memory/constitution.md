# Irha Beauty — Backend Constitution

**Version**: v3.0.0
**Ratified**: 2026-02-28
**Amended**: 2026-02-28 — Phase 3: Authentication added

---

## 1. Project Identity

- **Project**: Irha Beauty Backend API
- **Phase 1 Scope**: ✅ Complete — CRUD APIs with in-memory storage
- **Phase 2 Scope**: ✅ Complete — NeonDB (PostgreSQL) via SQLAlchemy async + Alembic migrations
- **Phase 3 Scope**: Authentication — custom JWT in httpOnly cookies, bcrypt password hashing, register/login/logout/refresh/me endpoints
- **Goal**: Layered domain architecture. Each phase adds capability without breaking the previous layer's contracts.

---

## 2. Tech Stack

| Layer | Choice | Phase |
|---|---|---|
| Language | Python 3.12+ | 1 + 2 + 3 |
| Framework | FastAPI | 1 + 2 + 3 |
| Type validation | Pydantic v2 | 1 + 2 + 3 |
| Server | Uvicorn | 1 + 2 + 3 |
| Tests | pytest + httpx (async test client) | 1 + 2 + 3 |
| ORM | SQLAlchemy 2.x (async) | 2 + 3 |
| DB driver | asyncpg (TCP) | 2 + 3 |
| Database | NeonDB — serverless PostgreSQL | 2 + 3 |
| Migrations | Alembic | 2 + 3 |
| Config/Secrets | pydantic-settings + `.env` | 2 + 3 |
| Password hashing | passlib[bcrypt] | 3 |
| JWT | PyJWT[cryptography] | 3 |
| Token transport | httpOnly cookies (Secure, SameSite=Lax) | 3 |

---

## 3. Project Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app, router registration
│   ├── core/
│   │   ├── exceptions.py        # Custom exception handlers
│   │   ├── database.py          # Async engine, sessionmaker, Base
│   │   ├── deps.py              # get_db session + get_current_user  ← updated Phase 3
│   │   ├── config.py            # pydantic-settings Settings
│   │   └── security.py          # JWT encode/decode, bcrypt           ← NEW in Phase 3
│   ├── auth/                    # Auth domain                         ← NEW in Phase 3
│   │   ├── router.py            # /register /login /logout /refresh /me
│   │   ├── schemas.py           # RegisterRequest, LoginRequest, TokenRead, UserRead
│   │   ├── service.py           # register, login, logout, refresh logic
│   │   └── tests/
│   │       └── test_auth.py
│   └── <domain>/
│       ├── router.py            # Route definitions
│       ├── schemas.py           # Pydantic request/response models
│       ├── models.py            # SQLAlchemy ORM model
│       ├── repository.py        # All DB queries (no business logic)
│       ├── service.py           # Business logic (calls repository)
│       └── tests/
│           └── test_<domain>.py
├── alembic/                     # Migration scripts
│   ├── env.py
│   └── versions/
├── alembic.ini
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
- HTTP status codes: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`

**Auth-specific routes** (Phase 3 — outside standard CRUD pattern):

| Action | Method | Path |
|---|---|---|
| Register | POST | `/api/v1/auth/register` |
| Login | POST | `/api/v1/auth/login` |
| Logout | POST | `/api/v1/auth/logout` |
| Refresh token | POST | `/api/v1/auth/refresh` |
| Current user | GET | `/api/v1/auth/me` |

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
- **Phase 3 adds** to required `.env` variables:
  - `JWT_SECRET` — random 32-byte hex string, used to sign access tokens
  - `JWT_ALGORITHM` — `HS256`
  - `ACCESS_TOKEN_EXPIRE_MINUTES` — e.g. `30`
  - `REFRESH_TOKEN_EXPIRE_DAYS` — e.g. `7`

---

## 8a. Security & Auth Rules (Phase 3)

- **Passwords**: hashed with bcrypt via `passlib[bcrypt]` — never stored plain, never logged
- **JWT**: signed with `HS256` using `JWT_SECRET` from `.env`
- **Access token**: short-lived (30 min), stored in httpOnly cookie named `access_token`
- **Refresh token**: long-lived (7 days), stored in httpOnly cookie named `refresh_token`
- **Cookie flags**: `httpOnly=True`, `secure=True` (HTTPS only in production), `samesite="lax"`
- **Token payload**: `{ "sub": user_id, "exp": expiry }`
- **`get_current_user` dependency**: reads `access_token` cookie, decodes JWT, returns User ORM object — raises `401` if missing or invalid
- **Auth domain has no `models.py` or `repository.py`**: it reuses `app/users/models.py` (User) and `app/users/repository.py` (user lookups)
- **No bearer tokens in Authorization header** — cookies only
- **CORS**: must explicitly allowlist frontend origin and set `allow_credentials=True`

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

**Phase 3 includes:**
- `app/core/security.py` — JWT encode/decode, bcrypt hash/verify
- `app/core/deps.py` — add `get_current_user` dependency
- `app/core/config.py` — add JWT env variables
- `app/auth/` — router, schemas, service, tests
- Alembic migration: no new tables (auth reuses `users` table — add `hashed_password` column if not present)
- CORS middleware added to `app/main.py`
- `.env` + `.env.example` updated with JWT variables

**Phase 3 does NOT include:**
- Social login (Google, GitHub)
- Email verification / magic links
- Password reset via email
- Role-based access control (RBAC)
- File storage
- Payment integration

These are deferred to Phase 4+.

---

## Governance

- This constitution supersedes all other practices for Phase 1 and Phase 2.
- Amendments require: a proposed change, ratification note, and version bump.
- All specs, plans, tasks, and code reviews must cite compliance with this constitution.

**Version**: v3.0.0 | **Ratified**: 2026-02-28 | **Last Amended**: 2026-02-28
