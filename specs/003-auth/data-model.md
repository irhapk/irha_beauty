# Data Model: User Authentication (003-auth)

**Date**: 2026-02-28
**Branch**: `003-auth`

---

## Overview

Auth introduces no new tables. It extends the existing `users` table with a single `hashed_password` column and reuses all existing `User` ORM model infrastructure.

---

## Entity: User (extended)

**Table**: `users` (existing — extended via Alembic migration)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INTEGER | PRIMARY KEY, auto-increment | Existing |
| `full_name` | VARCHAR(150) | NOT NULL | Existing |
| `email` | VARCHAR(320) | NOT NULL, UNIQUE | Existing — normalized to lowercase |
| `created_at` | TIMESTAMPTZ | NOT NULL, server_default=now() | Existing |
| `hashed_password` | VARCHAR(72) | NULLABLE | **NEW in Phase 3** — bcrypt hash, always 60 chars; nullable to preserve existing rows |

**Validation rules**:
- `full_name`: stripped of leading/trailing whitespace before storage
- `email`: lowercased and stripped before storage and lookup
- `hashed_password`: never stored plain; bcrypt hash generated in `security.py`; NULL only for legacy rows created before auth existed

**Notes**:
- `hashed_password` is 72 chars max because bcrypt truncates input at 72 bytes. VARCHAR(72) is sufficient.
- The `unique` constraint on `email` is already enforced at the DB level — no migration change needed for that.
- Existing rows with `hashed_password = NULL` cannot log in (service-layer check prevents it, and they were never real user accounts).

---

## No New Tables

Auth operates entirely within the existing `users` table:

- No `sessions` table — sessions are stateless JWT cookies
- No `tokens` table — tokens are not stored server-side (stateless design)
- No `refresh_tokens` table — refresh tokens are signed JWTs; validity is verified by signature + expiry, not a DB lookup
- No `accounts` or `credentials` table — single auth method (email + password) doesn't need a separate credentials table

---

## Token Payloads (in-memory only, not persisted)

### Access Token (JWT, httpOnly cookie, 30 min)
```json
{
  "sub": "42",
  "type": "access",
  "exp": 1234567890
}
```
- `sub`: string representation of `user.id`
- `type`: distinguishes access vs refresh tokens
- `exp`: Unix timestamp of expiry

### Refresh Token (JWT, httpOnly cookie, 7 days)
```json
{
  "sub": "42",
  "type": "refresh",
  "exp": 1234567890
}
```

Both signed with `JWT_SECRET` using `HS256`. The `type` field prevents a refresh token from being used as an access token (and vice versa) — validated in `security.py` decode functions.

---

## Alembic Migration

**Migration name**: `add_hashed_password_to_users`

Operation:
```
ALTER TABLE users ADD COLUMN hashed_password VARCHAR(72);
```
(nullable, no default — existing rows get NULL automatically)
