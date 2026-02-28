# Feature Specification: User Authentication

**Feature Branch**: `003-auth`
**Created**: 2026-02-28
**Status**: Draft
**Constitution Compliance**: v3.0.0

---

## Overview

Enable Irha Beauty customers to create an account and securely log in using email and password. Sessions persist via secure cookies so users stay logged in across page visits. The frontend can identify the current user and protect pages that require authentication.

---

## User Scenarios & Testing

### User Story 1 — Register a new account (Priority: P1)

A new visitor enters their name, email, and password to create an Irha Beauty account. After registering they are immediately logged in and can use authenticated features without a separate login step.

**Why this priority**: Every other auth-dependent feature (wishlist, orders, reviews) requires a user to exist first. Registration is the entry point.

**Independent Test**: POST /api/v1/auth/register with valid data → returns user info + sets auth cookies → GET /api/v1/auth/me with cookies → returns same user.

**Acceptance Scenarios**:

1. **Given** a valid name, email, and password (8+ chars), **When** the user submits the registration form, **Then** a new account is created, the user is logged in, and their name and email are returned.
2. **Given** an email that already has an account, **When** another registration is attempted with the same email, **Then** a 409 conflict error is returned with code `EMAIL_ALREADY_EXISTS`.
3. **Given** a password shorter than 8 characters, **When** the user submits, **Then** a 422 validation error is returned.
4. **Given** an invalid email format, **When** the user submits, **Then** a 422 validation error is returned.

---

### User Story 2 — Log in to an existing account (Priority: P1)

A returning user enters their email and password to access their account. On success they receive a session that persists across browser refreshes.

**Why this priority**: Equal priority to registration — existing users must be able to access their accounts.

**Independent Test**: POST /api/v1/auth/login with correct credentials → sets auth cookies → GET /api/v1/auth/me → returns user.

**Acceptance Scenarios**:

1. **Given** a registered user, **When** they submit correct email and password, **Then** they are logged in and their user data is returned.
2. **Given** a correct email but wrong password, **When** the user submits, **Then** a 401 error is returned with code `INVALID_CREDENTIALS`.
3. **Given** an email that does not exist, **When** the user submits, **Then** a 401 error is returned with code `INVALID_CREDENTIALS` (same message — no email enumeration).
4. **Given** a logged-in user, **When** they call GET /api/v1/auth/me, **Then** their profile is returned without re-authenticating.

---

### User Story 3 — Log out (Priority: P2)

A logged-in user ends their session. Their auth cookies are cleared so subsequent requests are treated as unauthenticated.

**Why this priority**: Required for security — users must be able to end their session, especially on shared devices.

**Independent Test**: Login → POST /api/v1/auth/logout → GET /api/v1/auth/me → returns 401.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they call POST /api/v1/auth/logout, **Then** a 204 is returned and their cookies are cleared.
2. **Given** a logged-out user, **When** they call GET /api/v1/auth/me, **Then** a 401 is returned with code `NOT_AUTHENTICATED`.

---

### User Story 4 — Refresh access token (Priority: P2)

A user's short-lived access token expires. The client silently exchanges the refresh token for a new access token without requiring the user to log in again.

**Why this priority**: Without this, users are forced to re-login every 30 minutes, which breaks the shopping experience.

**Independent Test**: Login → POST /api/v1/auth/refresh with refresh cookie → new access token issued → GET /api/v1/auth/me succeeds.

**Acceptance Scenarios**:

1. **Given** a valid refresh token cookie, **When** POST /api/v1/auth/refresh is called, **Then** a new access token is issued (cookie updated) and 200 is returned.
2. **Given** an expired or missing refresh token, **When** POST /api/v1/auth/refresh is called, **Then** 401 is returned with code `INVALID_REFRESH_TOKEN`.

---

### Edge Cases

- What happens when a user registers with leading/trailing whitespace in their name? → stripped and saved clean.
- What happens when a user submits an empty password? → 422 validation error before any DB call.
- What happens if the JWT secret is rotated? → all existing tokens become invalid; users must re-login (acceptable, no migration needed).
- What happens when a user calls a protected endpoint with an expired access token? → 401 with code `TOKEN_EXPIRED`.
- What happens when cookies are missing entirely on a protected endpoint? → 401 with code `NOT_AUTHENTICATED`.
- What happens when the same email is registered with different casing (e.g. User@example.com vs user@example.com)? → treated as the same email (normalized to lowercase).

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow a user to register with name, email (unique), and password (minimum 8 characters).
- **FR-002**: System MUST hash all passwords with bcrypt before storing — plain-text passwords must never be persisted or logged.
- **FR-003**: System MUST reject duplicate email addresses at registration with code `EMAIL_ALREADY_EXISTS` (409).
- **FR-004**: System MUST normalize email to lowercase before storing and comparing.
- **FR-005**: System MUST authenticate users via email and password only — no other method in this phase.
- **FR-006**: System MUST issue a short-lived access token (30 min) and a long-lived refresh token (7 days) on successful register or login.
- **FR-007**: System MUST store both tokens exclusively in httpOnly, Secure, SameSite=Lax cookies — never in the response body.
- **FR-008**: System MUST provide GET /api/v1/auth/me that returns the current user's profile from their access token cookie.
- **FR-009**: System MUST provide POST /api/v1/auth/logout that clears both cookies and returns 204.
- **FR-010**: System MUST provide POST /api/v1/auth/refresh that issues a new access token from a valid refresh token cookie.
- **FR-011**: System MUST return `INVALID_CREDENTIALS` for both wrong password and unknown email — identical response (prevents email enumeration).
- **FR-012**: System MUST add CORS middleware with the frontend origin explicitly allowlisted and `allow_credentials=True`.
- **FR-013**: The `get_current_user` FastAPI dependency MUST be reusable across all future domains requiring authentication.
- **FR-014**: System MUST add `hashed_password` column to the existing `users` table via an Alembic migration.

### Key Entities

- **User** (existing `users` table + new `hashed_password` column): id, name, email, hashed_password, created_at. Auth reuses the existing User ORM model and users repository — no new tables required.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: A new user can register and immediately access protected endpoints — end-to-end in under 3 seconds.
- **SC-002**: Login with correct credentials succeeds on every attempt (0% false negatives).
- **SC-003**: Wrong credentials never return a valid session (0% false positives).
- **SC-004**: All 5 auth endpoints have passing tests covering both happy path and error paths.
- **SC-005**: No password, token secret, or raw JWT appears in any log, response body, or committed file.
- **SC-006**: Token refresh works silently — the user never sees a re-login prompt unless their refresh token has also expired.

---

## Assumptions

- Email + password only in this phase — social login deferred.
- No email verification on registration — account is immediately active.
- No password reset / forgot password — deferred.
- Existing `users` table rows (test data) will have NULL `hashed_password` — acceptable since they are not real accounts.
- CORS origin for development: `http://localhost:3000`. Production origin added when frontend deploys to Vercel.
- `secure=True` on cookies applies in production (HTTPS). In local dev, cookies are sent over HTTP — this is acceptable for development only.

---

## Out of Scope

- Social login (Google, GitHub, Facebook)
- Email verification on registration
- Password reset via email
- Two-factor authentication (2FA)
- Role-based access control (admin vs customer)
- Account deletion
- Session revocation / active session management
