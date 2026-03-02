---
id: "0039"
title: Email Notifications Spec
stage: spec
date: 2026-03-03
surface: agent
model: claude-sonnet-4-6
feature: 009-email-notifications
branch: 005-admin-dashboard
user: irhapk
command: "okk! now do you have any question before writing spec for adding resend. [answered: both emails, yes to status updates, noreply@irhapk.com] now first update constitution then write new artifacts for this feature."
labels: ["email","resend","orders","notifications","spec","plan","tasks"]
links:
  spec: specs/009-email-notifications/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - specs/009-email-notifications/spec.md
  - specs/009-email-notifications/plan.md
  - specs/009-email-notifications/tasks.md
tests:
  - null
---

## Prompt

okk! now do you have any question before writing spec for adding resend.

[Clarifications gathered]:
1. Recipients: both — admin notification + customer confirmation
2. Status change emails: yes — customer notified on processing / delivered / cancelled
3. Sender address: noreply@irhapk.com

now first update constitution then write new artifacts for this feature.

## Response snapshot

**Constitution updated** to v4.3.0:
- Added Phase 9 to identity section (In Progress)
- Added `resend` to tech stack table (Phase 9)
- Added `RESEND_API_KEY` and `EMAIL_FROM` to configuration section
- Bumped version + amended note at top and footer

**SDD Artifacts created**:

`specs/009-email-notifications/spec.md`:
- FR-001: Admin notification on new order
- FR-002: Customer order confirmation
- FR-003: Customer status update (processing / delivered / cancelled, skips pending)
- FR-004: Best-effort sending — email failures never fail order operations
- FR-005: Plain-text + HTML emails, inline styles, branded black/gold theme

`specs/009-email-notifications/plan.md`:
- AD-001: Resend SDK over aiosmtplib (deliverability, simplicity)
- AD-002: Email in app/core/email.py (side effect, not a domain)
- AD-003: `asyncio.to_thread()` wraps sync Resend SDK call
- AD-004: try/except fire-and-forget pattern
- Full module design for email.py (4 functions)
- Updated service.py integration points
- DNS setup instructions for Namecheap
- Test mock strategy with `unittest.mock.AsyncMock`

`specs/009-email-notifications/tasks.md`:
- T001: Install resend
- T002: Add config variables
- T003: Create app/core/email.py
- T004: Update orders/service.py
- T005: Update order tests with mocks
- T006: DNS verification on Namecheap (user action)
- T007: Railway env vars (user action)
- T008: End-to-end smoke test (user action)
- T009: Commit and push

## Outcome

- ✅ Impact: Full spec/plan/tasks for 009-email-notifications feature; constitution at v4.3.0
- 🧪 Tests: none yet (implementation pending)
- 📁 Files: 4 files created/updated
- 🔁 Next prompts: /sp.implement 009-email-notifications
- 🧠 Reflection: Email as core side-effect (not a domain) is the right call — keeps domain structure clean; best-effort pattern is critical for checkout reliability

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a (spec stage)
- Prompt variant (if applicable): null
- Next experiment: after implementation, verify Resend domain DNS propagation time on Namecheap
