---
id: "0014"
title: Frontend Constitution v4.0.0
stage: constitution
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: none
branch: 003-auth
user: PC
command: update constitution for frontend
labels: ["constitution","frontend","nextjs","tailwind","framer-motion","design-system","animations"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md (updated v3.0.0 → v4.0.0)
tests:
  - n/a — constitution update
---

## Prompt

update the constitution for frontend

## Response snapshot

Updated `.specify/memory/constitution.md` from v3.0.0 (backend-only) to v4.0.0 (full-stack).

Added 12 new frontend sections (F1–F12):
- F1: Frontend Identity (Next.js 15, TypeScript, Vercel, reference design: premiumwallartstudio.com)
- F2: Frontend Tech Stack (Next.js 15, Tailwind, shadcn/ui, Framer Motion, Zustand, Axios)
- F3: Design System (Black/Gold/Cream palette, Cormorant Garamond + Instrument Sans, 50px rounded buttons)
- F4: Project Structure (App Router, components/, store/, lib/, types/)
- F5: Animation Rules (mandatory Framer Motion — scroll reveal, hero stagger, dual-image hover, parallax)
- F6: Component Rules (RSC by default, no inline styles, next/image required)
- F7: State Management (Zustand — cart persist + auth hydration)
- F8: API Integration (Axios + withCredentials, typed functions, .env.local)
- F9: Image & Asset Rules (9 images in /public, dual product images, aspect ratios)
- F10: Routing Conventions (12 routes, auth-protected checkout + orders)
- F11: Naming Conventions (PascalCase components, useX hooks, handle prefix)
- F12: Phase 4 Boundary (what's in / out of scope)

## Outcome

- ✅ Impact: Constitution now covers full stack. Frontend team has complete rulebook.
- 📁 Files: .specify/memory/constitution.md (v4.0.0)
- 🔁 Next prompts: `/sp.specify` for frontend feature, then `/sp.plan`, `/sp.tasks`, `/sp.implement`

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run: n/a
- Next experiment: n/a
