# Tasks: User Authentication (003-auth)

**Input**: Design documents from `/specs/003-auth/`
**Branch**: `003-auth`
**Constitution**: v3.0.0
**Total tasks**: 25 (T001–T025)

---

## Phase 1: Setup

**Purpose**: Install new dependencies and configure environment settings.

- [x] T001 Add `PyJWT>=2.9.0`, `passlib[bcrypt]>=1.7.4`, `bcrypt>=4.0.1,<5.0` to `backend/requirements.txt`
- [x] T002 Add `JWT_SECRET`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`, `ENVIRONMENT` fields to `backend/app/core/config.py` Settings class
- [x] T003 [P] Create empty `backend/app/auth/__init__.py`
- [x] T004 [P] Create empty `backend/app/auth/tests/__init__.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database migration, security utilities, and shared schemas — MUST complete before any user story.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [x] T005 Add `hashed_password: Mapped[str | None] = mapped_column(String(72), nullable=True)` column to `User` class in `backend/app/users/models.py`
- [x] T006 Generate Alembic migration (`alembic revision --autogenerate -m "add_hashed_password_to_users"`) from `backend/` and apply it (`alembic upgrade head`) — verify NeonDB `users` table now has `hashed_password` column
- [x] T007 Create `backend/app/core/security.py` with six functions: `hash_password(plain) → str`, `verify_password(plain, hashed) → bool`, `create_access_token(user_id) → str`, `create_refresh_token(user_id) → str`, `decode_access_token(token) → dict` (raises `jwt.ExpiredSignatureError` / `jwt.InvalidTokenError`), `decode_refresh_token(token) → dict` (validates `type == "refresh"`)
- [x] T008 [P] Add `create_user_with_password(db, full_name, email, hashed_password) → User` function to `backend/app/users/repository.py`
- [x] T009 [P] Create `backend/app/auth/schemas.py` with `RegisterRequest` (full_name, email: EmailStr, password min_length=8), `LoginRequest` (email: EmailStr, password), `UserRead` (id, full_name, email, created_at — from_attributes=True)

**Checkpoint**: security.py, migration applied, schemas ready — user story implementation can begin.

---

## Phase 3: US1 — Register New Account (Priority: P1) 🎯 MVP

**Goal**: A visitor submits name + email + password → account created → immediately logged in via httpOnly cookies.

**Independent Test**: `POST /api/v1/auth/register` with valid data → 201 + UserRead + cookies set → `GET /api/v1/auth/me` returns same user.

- [x] T010 [US1] Create `backend/app/auth/service.py` with `register(db, data, response)` function: check duplicate email (409 EMAIL_ALREADY_EXISTS), hash password, call `create_user_with_password`, set both auth cookies via `_set_auth_cookies(response, user_id)` private helper using `settings.ENVIRONMENT`
- [x] T011 [US1] Create `backend/app/auth/router.py` with `POST /register` endpoint — accepts `RegisterRequest`, injects `db` and `response`, calls `service.register()`, returns 201 `UserRead`
- [x] T012 [US1] Write `test_register_success`, `test_register_duplicate_email` (409), `test_register_short_password` (422), `test_register_invalid_email` (422) in `backend/app/auth/tests/test_auth.py`

**Checkpoint**: Register fully works. New user can register and session cookies are set.

---

## Phase 4: US2 — Login to Existing Account (Priority: P1)

**Goal**: A returning user submits email + password → authenticated → session cookies issued.

**Independent Test**: `POST /api/v1/auth/login` with correct credentials → 200 + UserRead + cookies set.

- [x] T013 [US2] Add `login(db, data, response)` function to `backend/app/auth/service.py`: look up user by email (401 INVALID_CREDENTIALS if not found), verify password (401 INVALID_CREDENTIALS if wrong — timing-safe), set both auth cookies
- [x] T014 [US2] Add `POST /login` endpoint to `backend/app/auth/router.py` — accepts `LoginRequest`, returns 200 `UserRead`
- [x] T015 [US2] Add `test_login_success`, `test_login_wrong_password` (401), `test_login_unknown_email` (401), `test_email_case_insensitive` (UPPER email registers → lower email logs in) to `backend/app/auth/tests/test_auth.py`

**Checkpoint**: Register + Login both working. P1 user stories complete.

---

## Phase 5: US3 — Logout (Priority: P2)

**Goal**: Logged-in user clears their session cookies → subsequent requests treated as unauthenticated.

**Independent Test**: Login → `POST /api/v1/auth/logout` → 204 → `GET /api/v1/auth/me` → 401.

- [x] T016 [US3] Add `logout(response)` function to `backend/app/auth/service.py`: call `response.delete_cookie("access_token")` and `response.delete_cookie("refresh_token")` (idempotent — no error if not logged in)
- [x] T017 [US3] Add `POST /logout` endpoint to `backend/app/auth/router.py` — returns 204 No Content
- [x] T018 [US3] Add `test_logout` (login → logout → /me returns 401) to `backend/app/auth/tests/test_auth.py`

**Checkpoint**: Logout clears session cleanly.

---

## Phase 6: US4 — Refresh Access Token + /me (Priority: P2)

**Goal**: Expired access token silently renewed via refresh token cookie. `/me` returns current user profile.

**Independent Test**: Login → `POST /api/v1/auth/refresh` → 200 + new `access_token` cookie → `GET /api/v1/auth/me` succeeds.

- [x] T019 [US4] Add `get_current_user(request, db)` async dependency to `backend/app/core/deps.py`: read `access_token` cookie, decode via `decode_access_token`, raise 401 `NOT_AUTHENTICATED` (missing/invalid) or 401 `TOKEN_EXPIRED` (expired), fetch user from DB, return `User`
- [x] T020 [US4] Add `refresh(db, request, response)` function to `backend/app/auth/service.py`: read `refresh_token` cookie (401 INVALID_REFRESH_TOKEN if missing), decode via `decode_refresh_token` (401 INVALID_REFRESH_TOKEN on error), fetch user, set new `access_token` cookie only
- [x] T021 [US4] Add `GET /me` and `POST /refresh` endpoints to `backend/app/auth/router.py` — `/me` uses `Depends(get_current_user)` and returns 200 `UserRead`; `/refresh` calls `service.refresh()` and returns 200 `UserRead`
- [x] T022 [US4] Add `test_me_authenticated` (200), `test_me_unauthenticated` (401 NOT_AUTHENTICATED), `test_refresh_success` (200 + new cookie), `test_refresh_invalid_token` (401 INVALID_REFRESH_TOKEN) to `backend/app/auth/tests/test_auth.py`

**Checkpoint**: All 4 user stories complete. All 5 auth endpoints operational and tested.

---

## Phase 7: Polish & Validation

**Purpose**: Wire everything into the application and validate the full suite.

- [x] T023 Update `backend/app/main.py`: add `CORSMiddleware` (allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["GET","POST","PUT","DELETE","OPTIONS"], allow_headers=["Content-Type"]) and register auth router at prefix `/api/v1/auth` with tag `auth`
- [x] T024 Update `backend/.env.example` with JWT placeholder variables: `JWT_SECRET=your-secret-key-here`, `JWT_ALGORITHM=HS256`, `ACCESS_TOKEN_EXPIRE_MINUTES=30`, `REFRESH_TOKEN_EXPIRE_DAYS=7`, `ENVIRONMENT=dev` — then update `backend/.env` with real values (generate `JWT_SECRET` via `python -c "import secrets; print(secrets.token_hex(32))"`)
- [x] T025 Run full `pytest` from `backend/` — verify all **49 tests pass** (36 existing + 13 new auth tests). Zero failures required.

**Checkpoint**: All 49 tests pass. Auth fully integrated. /docs shows 20 endpoints (15 existing + 5 auth).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately. T003 ‖ T004 in parallel.
- **Phase 2 (Foundational)**: Depends on Phase 1. T008 ‖ T009 in parallel after T007.
- **Phase 3 (US1 Register)**: Depends on Phase 2 complete.
- **Phase 4 (US2 Login)**: Depends on Phase 3 complete (extends same service.py and router.py).
- **Phase 5 (US3 Logout)**: Depends on Phase 4 complete.
- **Phase 6 (US4 Refresh+Me)**: Depends on Phase 5 complete.
- **Phase 7 (Polish)**: Depends on Phase 6 complete.

### Task-Level Dependencies

```
T001 → T002 → T003 ‖ T004
T003, T004 done → T005 → T006 → T007 → T008 ‖ T009
T008, T009 done → T010 → T011 → T012
T012 done → T013 → T014 → T015
T015 done → T016 → T017 → T018
T018 done → T019 → T020 → T021 → T022
T022 done → T023 → T024 → T025
```

### Parallel Opportunities

```
T003 ‖ T004   (different empty __init__ files)
T008 ‖ T009   (different files: repository.py vs schemas.py)
```

---

## Implementation Strategy

### MVP (US1 + US2 only — P1 stories)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 Register — test independently
4. Complete Phase 4: US2 Login — test independently
5. **STOP and VALIDATE**: Register + Login working, cookies set correctly

### Full Feature Delivery

1. MVP above → then
2. Phase 5: US3 Logout
3. Phase 6: US4 Refresh + Me
4. Phase 7: Polish — full suite 49/49

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 25 (T001–T025) |
| Setup tasks | 4 |
| Foundational tasks | 5 |
| US1 tasks | 3 |
| US2 tasks | 3 |
| US3 tasks | 3 |
| US4 tasks | 4 |
| Polish tasks | 3 |
| New tests added | 13 |
| Target test count | 49/49 |
| Parallel opportunities | T003‖T004, T008‖T009 |
