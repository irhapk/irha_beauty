---
id: "0016"
title: Frontend Storefront Plan
stage: plan
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 004-nextjs-storefront
branch: 004-nextjs-storefront
user: PC
command: /sp.plan
labels: ["plan","nextjs","framer-motion","zustand","axios","tailwind","shadcn","ecommerce","frontend"]
links:
  spec: specs/004-nextjs-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-nextjs-storefront/research.md (created)
  - specs/004-nextjs-storefront/data-model.md (created)
  - specs/004-nextjs-storefront/contracts/frontend.md (created)
  - specs/004-nextjs-storefront/quickstart.md (updated)
  - specs/004-nextjs-storefront/plan.md (completed)
tests:
  - n/a — plan phase
---

## Prompt

/sp.plan

## Response snapshot

Completed full planning for 004-nextjs-storefront (Irha Beauty frontend storefront).

**Key research findings**:
- Framer Motion requires "use client" — all animated components isolated to client boundary; PageTransition.tsx wraps children in layout.tsx with key={pathname}
- Hero carousel uses AnimatePresence mode="wait" with directional variants (custom prop) + setInterval auto-advance
- Dual-image hover: CSS group-hover opacity transition (not Framer Motion) — GPU-composited, zero JS, 60fps
- Zustand v5 skipHydration + StoreProvider rehydrate pattern avoids SSR hydration mismatch
- whileInView + viewport={{ once: true }} + staggerChildren for all scroll reveals
- AuthProvider client component calls /api/v1/auth/me on mount to hydrate auth store
- Next.js rewrites proxy /api/* → FastAPI localhost:8000 — eliminates CORS entirely
- Backend orders domain REQUIRED: POST /api/v1/orders + GET /api/v1/orders/my (Phase 1 of implementation)

**Artifacts generated**: research.md (8 decisions), data-model.md (TypeScript types + DB schema), contracts/frontend.md (all API calls), quickstart.md (9 scenarios), plan.md (11-phase implementation design)

**Implementation phases defined**:
1. Backend orders domain (prerequisite)
2. Next.js init + config
3. Shared foundation (types, api.ts, stores, providers, animation wrappers)
4. Layout shell (Header, Footer, ScrollProgress)
5. Homepage (HeroCarousel, CategoryGrid, FeaturedProducts)
6. Category + Product pages
7. Cart
8. Checkout + Orders
9. Auth pages
10. About + Contact
11. Polish + responsive audit

## Outcome

- ✅ Impact: Complete plan ready. All 8 technical decisions resolved. 11 implementation phases ordered by dependency. Backend orders domain identified as prerequisite.
- 🧪 Tests: n/a — plan phase. Backend orders domain will add ~4 tests.
- 📁 Files: 5 artifacts created/updated
- 🔁 Next: `/sp.tasks` to generate executable task list
- 🧠 Reflection: The dual-image hover should use CSS not Framer Motion — CSS opacity transitions are GPU-composited with zero JS overhead, critical for product grids with many cards.

## Evaluation notes (flywheel)

- Failure modes observed: Research agent lost to context compaction twice — applied knowledge directly instead
- Graders run: n/a — plan phase
- Prompt variant: plan
- Next experiment: n/a
