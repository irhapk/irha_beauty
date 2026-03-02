---
id: "0037"
title: Storefront UX Enhancements Spec
stage: spec
date: 2026-03-02
surface: agent
model: claude-sonnet-4-6
feature: 007-storefront-ux
branch: 005-admin-dashboard
user: irhapk
command: update SDD artifacts for storefront UX changes
labels: ["ux","frontend","cart","popup","mobile","buy-now","navbar"]
links:
  spec: specs/007-storefront-ux/spec.md
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - specs/007-storefront-ux/spec.md
  - specs/007-storefront-ux/plan.md
  - specs/007-storefront-ux/tasks.md
  - history/prompts/007-storefront-ux/0037-storefront-ux-spec.spec.prompt.md
tests:
  - frontend build clean (npm run build)
---

## Prompt

now we need to do some changes and updates. all are defined below.
- add "buy now" button. so user can directly proceed to checkout page.
- add premium pop up. on add to cart. when user click add to cart. then there should be a professional success message through popup.
- and on mobile cart shouldn't be menu. it should be on navbar.

now update all SDD artifacts first.

## Response snapshot

Created full SDD artifact set for feature 007-storefront-ux:

**spec.md** — 3 functional requirements:
- FR-01: Buy Now button on ProductCard (gold CTA, adds to cart + navigates to /checkout)
- FR-02: Add-to-Cart success popup (top-right, auto-dismiss 3s, Framer Motion slide, product name)
- FR-03: Mobile cart on navbar (CartIcon moved out of Sheet, visible in header bar)

**plan.md** — 5 architectural decisions:
- AD-01: Popup state in cart store (popupProduct + popupOpen + showPopup/hidePopup)
- AD-02: CartPopup as root-level component fixed at top-24 right-6 z-[60]
- AD-03: Buy Now uses useRouter from next/navigation
- AD-04: Mobile cart placement (one line added to header row, one removed from Sheet)
- AD-05: No new npm packages (Framer Motion + Zustand already installed)

**tasks.md** — T001–T006:
- T001: Extend cart store with popup state
- T002: Create CartPopup component (NEW)
- T003: Add CartPopup to root layout
- T004: Update ProductCard (popup trigger + Buy Now button)
- T005: Move CartIcon to mobile navbar
- T006: Verify

## Outcome

- ✅ Impact: SDD artifacts created for 3 targeted UX improvements
- 🧪 Tests: frontend build verification (T006)
- 📁 Files: 4 files created (spec, plan, tasks, PHR)
- 🔁 Next prompts: implement T001–T006
- 🧠 Reflection: Popup state co-located in cart store avoids adding a new store. Mobile cart fix is a 2-line change in Header.tsx.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): pending implementation
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): implement T001 (store extension) first, then T002 (popup component)
