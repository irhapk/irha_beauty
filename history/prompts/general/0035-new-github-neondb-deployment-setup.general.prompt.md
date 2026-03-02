---
id: "0035"
title: New GitHub + NeonDB + Deployment Setup
stage: general
date: 2026-03-02
surface: agent
model: claude-sonnet-4-6
feature: none
branch: 005-admin-dashboard
user: irhapk
command: implement plan
labels: ["deployment","neondb","github","railway","vercel","infrastructure"]
links:
  spec: specs/004-nextjs-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/.env
  - .specify/memory/constitution.md
  - specs/004-nextjs-storefront/spec.md
  - specs/004-nextjs-storefront/plan.md
  - specs/004-nextjs-storefront/quickstart.md
tests:
  - "Manual: git remote -v → https://github.com/irhapk/irha_beauty.git"
  - "Manual: SELECT * FROM alembic_version; → b2c3d4e5f6a7 (after SQL applied)"
  - "Manual: backend/.env has new DATABASE_URL + CORS_ORIGINS"
---

## Prompt

Implement the following plan:

# Plan: New GitHub + NeonDB Setup + Deployment Artifacts Update

Context: Client's previous email account crashed. New GitHub account (`irhapk/irha_beauty`) and new NeonDB
instance have been created. Hosting decision finalised: Vercel (frontend) + Railway (backend)
+ Namecheap domain (`irhapk.com`). All SDD artifacts must be updated to reflect this. Local `.env`
must be updated with the new NeonDB connection string, new NeonDB schema must be seeded via SQL,
git remote must point to the new repo, and all branches pushed.

Steps:
1. Update `backend/.env` with new DATABASE_URL + CORS_ORIGINS
2. Apply 4 migrations to new NeonDB via SQL Editor
3. Update git remote to irhapk/irha_beauty and push all branches
4. Update SDD artifacts (constitution.md, spec.md, plan.md, quickstart.md)
5. Create PHR 0035

## Response snapshot

All file changes completed:

**backend/.env** — DATABASE_URL updated to new NeonDB instance (ep-lucky-cake-aiavp703-pooler);
CORS_ORIGINS added with production domain (irhapk.com, www.irhapk.com).

**constitution.md** — F1 Frontend Identity updated: Deployment changed to Vercel (frontend) +
Railway (backend); domain irhapk.com via Namecheap added; F2 tech stack table expanded with
hosting rows; version bumped to v4.1.0.

**specs/004-nextjs-storefront/spec.md** — Assumptions section extended with 3 new bullets
covering production hosting (Vercel + Railway), domain (irhapk.com), and database (NeonDB via
Railway env var).

**specs/004-nextjs-storefront/plan.md** — Technical Context section extended with Deployment
Infrastructure table (Frontend/Backend/Database/Domain/Repo rows).

**specs/004-nextjs-storefront/quickstart.md** — New "Production Deployment" section added with
step-by-step guides for Railway (backend), Vercel (frontend), and Namecheap domain setup.

**git remote** — Updated from `infoirhabeauty-lab/irha_beauty` to `irhapk/irha_beauty`. Push
blocked by cached Windows credentials for `anusbutt`; user must run pushes manually from a
terminal to trigger GCM browser re-authentication.

**NeonDB SQL** — 4 migration SQL scripts provided for user to run in NeonDB SQL Editor (cannot
be run programmatically from local environment).

## Outcome

- ✅ Impact: backend/.env, constitution.md, spec.md, plan.md, quickstart.md all updated to reflect new infrastructure
- 🧪 Tests: Manual verifications — git remote, NeonDB SELECT, .env review
- 📁 Files: 5 files modified
- 🔁 Next prompts: User runs NeonDB SQL migrations; user pushes branches from terminal; Railway + Vercel connected to irhapk/irha_beauty
- 🧠 Reflection: Git credential re-authentication on Windows requires interactive browser flow — cannot be automated via bash in this environment

## Evaluation notes (flywheel)

- Failure modes observed: GCM cached credentials for old GitHub account blocked automated git push
- Graders run and results (PASS/FAIL): N/A — infrastructure update, no automated tests
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Have user generate PAT for irhapk account and use HTTPS URL with token for non-interactive pushes
