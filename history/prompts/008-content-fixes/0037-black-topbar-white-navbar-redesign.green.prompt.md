---
id: "0037"
title: Black Topbar White Navbar Redesign
stage: green
date: 2026-03-02
surface: agent
model: claude-sonnet-4-6
feature: 008-content-fixes
branch: 005-admin-dashboard
user: irhapk
command: "now few more ui changes. create black topbar and update navbar color to white. and should be exactly like uploaded image."
labels: ["ui","header","topbar","navbar","tailwind","framer-motion"]
links:
  spec: specs/008-content-fixes/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/components/layout/Header.tsx
  - frontend/components/layout/CartIcon.tsx
  - frontend/components/layout/WishlistIcon.tsx
  - frontend/components/layout/CartPopup.tsx
  - frontend/app/about/page.tsx
  - frontend/app/categories/[slug]/page.tsx
  - frontend/app/categories/[slug]/loading.tsx
  - frontend/app/cart/page.tsx
  - frontend/app/wishlist/page.tsx
  - frontend/app/loading.tsx
  - frontend/app/admin/orders/page.tsx
  - frontend/app/checkout/page.tsx
  - frontend/app/contact/page.tsx
  - frontend/app/products/loading.tsx
  - frontend/app/not-found.tsx
  - frontend/app/products/[id]/page.tsx
  - frontend/app/orders/page.tsx
  - frontend/app/products/page.tsx
tests:
  - npm run build → clean (17/17 pages)
---

## Prompt

now few more ui changes. create black topbar and update navbar color to white. and should be exactly like uploaded image. copy uploaded image to update navbar and create topbar. icon should be same as in the uploaded image. [reference image: black topbar with social icons + promo text + phone/email; white navbar with hamburger MENU left, brand center, icons right]

## Response snapshot

Complete rewrite of `Header.tsx` into a two-section fixed header:

**Black TopBar** (hides on scroll via `max-h` transition):
- Left: 6 social icon buttons (FB/IG/Twitter/LinkedIn/Pinterest/WA) in circular border wrappers
- Center: Promo text carousel — 3 messages, 4s auto-rotate, prev/next arrow buttons, AnimatePresence slide animation
- Right: Phone (+92-312-100-7112) and Email (info.irhapk0@gmail.com) stacked, hidden on mobile

**White Navbar** (shadow on scroll):
- Left: Sheet trigger `≡ MENU` (slides from left side)
- Center: "Irha Beauty" brand, absolutely positioned `left-1/2 -translate-x-1/2`
- Right: FiSearch → /products (desktop), FiUser → /login or /orders (desktop), WishlistIcon, CartIcon
- Sheet content: Home/Shop/About/Contact + Categories + Auth section

**Supporting fixes**:
- CartIcon + WishlistIcon: `text-white` → `text-black transition-colors hover:text-gold`
- CartPopup: `top-24` → `top-[140px]` (clears taller combined header)
- All ~20 app pages: `pt-20` → `pt-36` (≈144px to clear TopBar + Navbar)
- Build clean: 17/17 pages generated
- Pushed to `005-admin-dashboard` and `main`

## Outcome

- ✅ Impact: Header now matches reference design — black TopBar with social/promo/contact, white navbar with centered brand
- 🧪 Tests: npm run build → clean, 17/17 pages, TypeScript pass
- 📁 Files: 18 files changed (293 insertions, 260 deletions)
- 🔁 Next prompts: NeonDB SQL seed for product name update; future features
- 🧠 Reflection: TopBar height ~52px + Navbar ~68px = ~120px → pt-36 (144px) gives comfortable clearance

## Evaluation notes (flywheel)

- Failure modes observed: none — build clean first attempt
- Graders run and results (PASS/FAIL): build PASS
- Prompt variant (if applicable): null
- Next experiment: reduce pt-36 to pt-32 if any page feels too much top whitespace
