# Research: User Authentication (003-auth)

**Date**: 2026-02-28
**Branch**: `003-auth`

---

## Decision 1 — JWT Library: PyJWT

**Decision**: Use `PyJWT>=2.9.0` for JWT encode/decode. **NOT python-jose.**

**Rationale**:
- `python-jose` has two unpatched CVEs disclosed in 2024: CVE-2024-33664 and CVE-2024-33663 (algorithm confusion attacks — RSA public key accepted as HMAC secret). The library is effectively unmaintained since 2022 with no patch released.
- The FastAPI official documentation quietly replaced `python-jose` with `PyJWT` in its auth tutorial in 2024.
- `PyJWT v2.x` is actively maintained, has a clean CVE response history, and has a stable simple API.
- Raises `jwt.ExpiredSignatureError` (subclass of `jwt.InvalidTokenError`) on expired tokens — enables distinguishing `TOKEN_EXPIRED` vs `NOT_AUTHENTICATED` error codes.
- `[cryptography]` extra not required for HS256 but harmless to include for forward compatibility.

**Alternatives considered**:
- `python-jose[cryptography]` — originally in the constitution but excluded due to CVEs and abandonment. Constitution updated to PyJWT.
- `authlib` — full OAuth2 server library, overkill for simple email+password JWT.

---

## Decision 2 — Password Hashing: passlib[bcrypt] via CryptContext

**Decision**: Use `passlib[bcrypt]` with `CryptContext(schemes=["bcrypt"], deprecated="auto")`.

**Rationale**:
- Standard for FastAPI auth implementations
- `CryptContext` handles scheme migration automatically (`deprecated="auto"`)
- bcrypt is the gold standard for password hashing — adaptive cost factor, salted by default
- `verify_password(plain, hashed)` and `hash_password(plain)` are the only two functions needed

**Alternatives considered**:
- `argon2-cffi` — stronger algorithm, winner of Password Hashing Competition. Rejected for now because bcrypt is more widely understood, has excellent FastAPI documentation, and is sufficient for this application's scale.

**Python 3.12 note**: passlib[bcrypt] works fine on Python 3.12. The only watch-out is that passlib emits a deprecation warning about `crypt` module removal in Python 3.13 — irrelevant since we use bcrypt, not crypt. No action needed.

---

## Decision 3 — Token Storage: httpOnly Cookies (both tokens)

**Decision**: Both `access_token` and `refresh_token` stored exclusively in httpOnly cookies via FastAPI's `Response.set_cookie()`.

**Rationale**:
- httpOnly prevents JavaScript access → XSS cannot steal tokens
- SameSite=Lax prevents CSRF for cross-site requests (safe for GET, blocks third-party POST)
- `secure=True` in production ensures HTTPS-only transmission

**FastAPI cookie pattern**:
- Endpoints that set cookies must accept a `response: Response` parameter (FastAPI injects it)
- Call `response.set_cookie(key, value, httponly=True, samesite="lax", secure=..., max_age=...)`
- For `/logout` and endpoints that clear cookies: `response.delete_cookie(key)`
- In tests: use `async_client.cookies` to read cookies set by the server

**Alternatives considered**:
- localStorage — rejected; vulnerable to XSS, tokens directly accessible by JavaScript
- Authorization header (Bearer) — rejected; requires frontend JS to store the token (same XSS risk)

---

## Decision 4 — Refresh Token Rotation

**Decision**: Refresh token is **NOT rotated** on every use in this phase.

**Rationale**:
- Rotation (issuing a new refresh token on every /refresh call) is a best practice for high-security applications but adds complexity: the old token must be invalidated, which requires a token blocklist in the DB (additional table + lookup on every refresh)
- For MVP: refresh token valid for 7 days from login. User re-authenticates after 7 days.
- This is the same pattern used by many production ecommerce apps at this scale
- Can be upgraded to rotation + blocklist in a future security hardening phase

**Alternatives considered**:
- Rotation without blocklist — rejected; creates a race condition where parallel requests could both use the same refresh token and one gets a new one
- Rotation with Redis blocklist — rejected; adds Redis as a dependency that doesn't exist yet

---

## Decision 5 — CORS Configuration

**Decision**: `CORSMiddleware` added to `app/main.py` with explicit origin allowlist and `allow_credentials=True`.

**Required settings**:
```
allow_origins=["http://localhost:3000"]   # dev; add Vercel URL for prod
allow_credentials=True                     # REQUIRED for cookies to be sent cross-origin
allow_methods=["*"]
allow_headers=["*"]
```

**Critical rule**: `allow_origins` MUST be a specific list — NEVER `["*"]` when `allow_credentials=True`. The browser rejects credentialed CORS requests to wildcard origins.

**Alternatives considered**:
- Wildcard `*` — rejected; browser blocks credentialed requests to wildcard origin (CORS spec requirement)

---

## Decision 6 — `get_current_user` Dependency Pattern

**Decision**: Read `access_token` from `request.cookies`, decode JWT, fetch user from DB, return `User` ORM object. Raise `AppException(401, "NOT_AUTHENTICATED")` if missing or `AppException(401, "TOKEN_EXPIRED")` if expired.

**Implementation approach**:
```
async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")
    if not token:
        raise AppException(detail="Not authenticated", code="NOT_AUTHENTICATED", status_code=401)
    try:
        payload = decode_access_token(token)  # raises JWTError if invalid/expired
        user_id = int(payload["sub"])
    except ExpiredSignatureError:
        raise AppException(detail="Token expired", code="TOKEN_EXPIRED", status_code=401)
    except JWTError:
        raise AppException(detail="Not authenticated", code="NOT_AUTHENTICATED", status_code=401)
    user = await users_repository.get_user(db, user_id)
    if user is None:
        raise AppException(detail="Not authenticated", code="NOT_AUTHENTICATED", status_code=401)
    return user
```

**Alternatives considered**:
- FastAPI's `OAuth2PasswordBearer` — designed for Authorization headers, not cookies. Rejected.
- Reading from header — rejected per constitution (cookies only)

---

## Decision 7 — Auth Domain Structure (No Separate Models/Repository)

**Decision**: `app/auth/` contains only `router.py`, `schemas.py`, `service.py`, `tests/`. No `models.py` or `repository.py`.

**Rationale**:
- Auth reuses the existing `User` model (`app/users/models.py`) and `users` repository
- `users/repository.py` already has `get_user_by_email` and `get_user` — both needed by auth
- A new `create_user_with_password` function is added to `users/repository.py` (not a separate auth repository)
- This avoids duplicating DB logic and keeps the User entity owned by one domain

**New function needed in users/repository.py**:
- `create_user_with_password(db, full_name, email, hashed_password) → User`

---

## Decision 8 — `hashed_password` Column Migration

**Decision**: Add `hashed_password: Mapped[str | None]` as a nullable column to the existing `users` table.

**Rationale**:
- Nullable because existing rows (from earlier test phases) have no password — they're not real user accounts
- New registrations always have a hashed_password (enforced at the service layer, not the DB constraint)
- Migration: `alembic revision --autogenerate -m "add_hashed_password_to_users"`

---

## Decision 9 — Cookie `secure` Flag in Development

**Decision**: `secure=False` in local development, `secure=True` in production. Controlled by a `ENVIRONMENT` env variable (`"dev"` / `"prod"`).

**Rationale**:
- Local FastAPI runs on HTTP (`localhost:8000`) — `secure=True` would reject cookie in browser
- Vercel deployment uses HTTPS — `secure=True` required for production
- Simple check: `secure = settings.ENVIRONMENT == "prod"`
