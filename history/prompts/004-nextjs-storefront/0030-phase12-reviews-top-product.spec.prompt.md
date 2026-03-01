---
id: "0030"
title: phase12 reviews top product spec
stage: spec
date: 2026-03-01
surface: agent
model: claude-sonnet-4-6
feature: 004-nextjs-storefront
branch: 004-nextjs-storefront
user: PC
command: add reviews section and top product section to homepage
labels: ["reviews","carousel","top-product","homepage","animation","phase12"]
links:
  spec: specs/004-nextjs-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-nextjs-storefront/spec.md (FR-032, FR-033, FR-034, FR-035 added)
  - specs/004-nextjs-storefront/tasks.md (T066–T069 added, total 69 tasks)
tests:
  - manual: Reviews auto-rotate every 5s, dot navigation works
  - manual: Top Product Add to Cart wired correctly
outcome: |
  SDD artifacts updated before implementation:
  - spec.md: Added FR-032 (reviews section), FR-033 (auto-rotate), FR-034 (top product spotlight), FR-035 (scroll animations). Updated Assumptions and Out of Scope to reflect wishlist and reviews being in-phase but client-side only.
  - tasks.md: Added Phase 12 with T066 (reviews data), T067 (ReviewsCarousel component), T068 (TopProduct component), T069 (wire into homepage). Total tasks updated to 69.
  Reviewer data: Anus Butt (AI Engineer), Furqan Tufail (Admin Manager), Noor Abro (Social Media Executive). Images confirmed in frontend/public/.
---

## Prompt

I'll put persons image and name with designation. Add a good reviews for facewash. Reviews must have animation and must be professional. Add shampoo as top product with description with ingredients for oil control and vitamin e. Update all SDD artifacts first then implement.

## Response

Updated SDD artifacts (spec.md + tasks.md) with FR-032 through FR-035 and T066–T069 before any implementation. Phase 12 defined with 4 tasks covering data layer, two new components, and homepage wiring.
