---
id: "0015"
title: Next.js Technical Decisions Research
stage: general
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 004-nextjs-storefront
branch: 004-nextjs-storefront
user: PC
command: research 8 technical decisions for Next.js 15 luxury ecommerce storefront
labels: ["research","nextjs","framer-motion","zustand","axios","auth","carousel","hydration"]
links:
  spec: specs/004-nextjs-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - null
tests:
  - null
---

## Prompt

Research the following 8 technical decisions for a Next.js 15 luxury ecommerce storefront. For each, provide: Decision (what to use), Rationale (why), Alternatives considered.

**Context**: Irha Beauty ecommerce — Next.js 15 App Router + TypeScript + Tailwind CSS v3 + shadcn/ui + Framer Motion v11 + Zustand v5 + Axios. Backend: FastAPI with JWT in httpOnly cookies at localhost:8000. Luxury black/white/gold theme.

Topics covered:
1. Framer Motion + Next.js 15 App Router (RSC, "use client", page transitions)
2. Hero Carousel with AnimatePresence (3-slide, direction-aware, 4s interval)
3. Dual-image product card hover (CSS vs Framer Motion)
4. Zustand v5 + localStorage persistence (SSR hydration mismatch, skipHydration)
5. Framer Motion scroll reveal: whileInView vs useInView
6. Auth hydration from httpOnly cookies in Next.js 15
7. Axios withCredentials for cross-origin localhost requests
8. COD order payload structure

## Response snapshot

See main response — structured notes delivered for all 8 topics with Decision / Rationale / Alternatives for each.

## Outcome

- Impact: All 8 implementation decisions documented before /sp.specify — prevents mid-build architectural drift
- Tests: none (research task)
- Files: PHR 0015 created
- Next prompts: /sp.specify for 004-nextjs-storefront, or /sp.adr for significant decisions
- Reflection: Decision on proxy vs withCredentials (Topic 7) and Zustand skipHydration (Topic 4) are the two highest-risk areas — both have clear paths forward

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): Validate Zustand skipHydration + useEffect pattern compiles correctly in Next.js 15 strict mode before writing spec
