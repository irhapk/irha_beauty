---
id: "0017"
title: Frontend Storefront Tasks Generated
stage: tasks
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 004-nextjs-storefront
branch: 004-nextjs-storefront
user: PC
command: /sp.tasks
labels: ["tasks","nextjs","framer-motion","zustand","ecommerce","frontend","senior-quality"]
links:
  spec: specs/004-nextjs-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-nextjs-storefront/tasks.md (created)
tests:
  - n/a — tasks phase
---

## Prompt

/sp.tasks — code must be scalable and like a senior developer written it. must be clean and scalable.

## Response snapshot

Generated `specs/004-nextjs-storefront/tasks.md` with 65 tasks (T001–T065) across 11 phases.

Quality mandate embedded: strict TypeScript, no `any`, components ≤150 lines, barrel exports, `cn()` for class merging, no prop-drilling past 2 levels, all magic numbers extracted as constants.

Phase summary:
- Phase 1 (T001-T010): Backend orders domain — models, migration, service, router, 4 tests → 53/53 backend tests
- Phase 2 (T011-T016): Next.js init, Tailwind tokens, fonts, env, rewrites proxy
- Phase 3 (T017-T028): Types, api.ts, Zustand stores, ScrollReveal, FadeIn, PageTransition, Providers
- Phase 4 (T029-T034): Header, Footer, ScrollProgress, ScrollToTop
- Phase 5 (T035-T039): HeroCarousel (directional AnimatePresence), CategoryGrid, FeaturedProducts, homepage page.tsx
- Phase 6 (T040-T045): ProductCard (dual-image CSS hover), ComingSoon, product pages
- Phase 7 (T046-T047): Cart page with AnimatePresence remove animation
- Phase 8 (T048-T050): CheckoutForm (COD), order submission, order history with skeleton loading
- Phase 9 (T051-T053): Auth pages (login/register) with route guards
- Phase 10 (T054-T056): About + Contact pages (UI-only contact form)
- Phase 11 (T057-T065): Responsive audit, image placeholders, SEO metadata, 404/loading pages, build validation, 9-scenario manual QA

## Outcome

- ✅ Impact: 65 executable tasks generated. Senior-quality code mandates embedded in every task description.
- 🧪 Tests: Backend target 53/53. No automated frontend tests in Phase 4.
- 📁 Files: specs/004-nextjs-storefront/tasks.md (created)
- 🔁 Next: `/sp.implement` after user places all 9 images in `frontend/public/`
- 🧠 Key decisions encoded in tasks: CSS group-hover for dual-image (T040), skipHydration Zustand (T023), AnimatePresence page transitions (T027), Next.js rewrites proxy (T014), AuthProvider on mount (T022)

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run: n/a — tasks phase
- Prompt variant: tasks with quality mandate
- Next experiment: n/a
