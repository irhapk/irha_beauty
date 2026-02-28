---
id: "0011"
title: Auth Library and Implementation Research
stage: general
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 003-auth
branch: master
user: PC
command: research — PyJWT vs python-jose, httpOnly cookies, refresh rotation, CORS, passlib, get_current_user
labels: ["research","auth","jwt","cookies","cors","passlib","bcrypt","pyjwt","refresh-token"]
links:
  spec: specs/003-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - history/prompts/003-auth/0011-auth-library-research.general.prompt.md
tests:
  - n/a — research phase
---

## Prompt

Research the following for a FastAPI + Python 3.12 authentication implementation. Return concise, concrete findings (no code needed, just decisions and rationale):

1. python-jose[cryptography] vs PyJWT — which is better maintained in 2025/2026? Any known security issues with python-jose?
2. Best practice for storing JWT access token + refresh token in httpOnly cookies with FastAPI — how does FastAPI's Response.set_cookie() work with async endpoints?
3. Refresh token rotation: should the refresh token be rotated on every use (new refresh token issued on each /refresh call) or stay fixed until expiry? What does security best practice say?
4. CORS configuration for FastAPI + Next.js with credentials (httpOnly cookies) — what are the exact CORSMiddleware settings needed?
5. passlib[bcrypt] CryptContext setup for FastAPI — is there anything to watch out for in Python 3.12?
6. How should get_current_user FastAPI dependency read the access_token cookie? What exception should it raise when the token is missing/expired?

Return findings as: Decision | Rationale | Alternatives considered — one per topic.

## Response snapshot

Six concrete decisions delivered:

1. JWT Library → Use PyJWT v2.x (not python-jose). python-jose has CVE-2024-33664 and CVE-2024-33663 (algorithm confusion, unpatched). FastAPI docs themselves switched to PyJWT in 2024. Pin: PyJWT>=2.9.0,<3.0.

2. httpOnly Cookies → Inject Response as route function parameter; call response.set_cookie() with httponly=True, secure=True (prod), samesite="lax", max_age=<ttl_seconds>. Logout uses response.delete_cookie(). Works identically in async def routes.

3. Refresh Token Rotation → Rotate on every /refresh call (OWASP + RFC 9700 best practice). Requires refresh_tokens DB table with family_id for replay detection. A replayed stale token triggers full family revocation.

4. CORS → allow_origins=[exact list], allow_credentials=True, explicit methods/headers. Never wildcard with credentials (FastAPI raises ValueError). Frontend needs credentials:"include" on every fetch.

5. passlib[bcrypt] Python 3.12 → Use passlib[bcrypt]>=1.7.4 with bcrypt pinned to avoid version warning (bcrypt 4.x removed internal APIs passlib reads). CryptContext(schemes=["bcrypt"], deprecated="auto") is correct. Python 3.12 crypt removal does not affect bcrypt path.

6. get_current_user dependency → Read via request.cookies.get("access_token"). Raise HTTPException(401) for all three failure modes: absent cookie, ExpiredSignatureError, InvalidTokenError. Never raise 403 for auth failures. JWT sub claim should be user_id (PK), not email.

## Outcome

- Impact: All 6 implementation decisions resolved with rationale and alternatives. Plan phase can proceed with concrete library choices.
- Tests: n/a — research phase
- Files: 1 PHR created
- Next prompts: /sp.plan for 003-auth — use PyJWT, refresh_tokens table, rotation strategy
- Reflection: python-jose CVEs are a critical finding — the spec referenced python-jose; constitution will need updating to PyJWT before plan phase begins.

## Evaluation notes (flywheel)

- Failure modes observed: WebSearch unavailable; research conducted from training knowledge (cutoff Aug 2025). All CVE references and library status current as of knowledge window.
- Graders run and results: n/a — research phase
- Prompt variant: general research
- Next experiment: n/a
