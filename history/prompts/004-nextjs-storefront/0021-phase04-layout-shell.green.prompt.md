---
id: "0021"
title: Phase 04 Layout Shell
stage: green
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 004-nextjs-storefront
branch: 004-nextjs-storefront
user: PC
command: /sp.implement phase 04.
labels: ["layout","header","footer","framer-motion","nextjs","tailwind-v4"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/components/layout/ScrollProgress.tsx
  - frontend/components/layout/ScrollToTop.tsx
  - frontend/components/layout/CartIcon.tsx
  - frontend/components/layout/Header.tsx
  - frontend/components/layout/Footer.tsx
  - frontend/app/layout.tsx
  - frontend/components/animations/ScrollReveal.tsx
  - frontend/components/animations/FadeIn.tsx
  - specs/004-nextjs-storefront/tasks.md
tests:
  - npm run build → exit 0 (TypeScript clean, 4 routes generated)
---

## Prompt

/sp.implement phase 04.

## Response snapshot

Implemented Phase 4 — Layout Shell (T029–T034). All 6 components created and wired into app layout. Build passed after fixing a Framer Motion TypeScript type error.

**T029 — ScrollProgress.tsx**: Fixed top gold bar using `useScroll()` + `useSpring()` from Framer Motion. `scaleX` drives a `motion.div` with `transformOrigin: "left"`, z-index 60, height 3px, `bg-gold`.

**T030 — ScrollToTop.tsx**: Appears after 100px scroll. `AnimatePresence` fade-in/out. Smooth scroll on click. Fixed bottom-right black circle + gold FiArrowUp icon.

**T031 — CartIcon.tsx**: Reads `useCartCount()` from Zustand. AnimatePresence spring-scale badge when count > 0. Links to `/cart`. Uses FiShoppingBag icon.

**T032 — Header.tsx**: Fixed top, `bg-black`, z-50. Three zones: logo (`next/image /logo.png`), desktop nav (Home/Shop/About/Contact + Categories dropdown with AnimatePresence), icons (CartIcon + auth state). Auth: shows first name + Logout if authenticated, Login/Register links otherwise. Mobile: shadcn `<Sheet>` side="right" with `<SheetTitle className="sr-only">` for accessibility. Scroll effect: `bg-black/90 backdrop-blur-md` after 50px. Active NavLink uses `layoutId="nav-underline"` `motion.span` for smooth gold underline.

**T033 — Footer.tsx**: `bg-black text-white`. Four-column `ScrollReveal` grid with stagger: Brand (logo + tagline), Quick Links, Categories, Connect (React Icons socials + shadcn Input/Button newsletter form). Copyright bottom bar.

**T034 — layout.tsx**: Final wiring: `<Providers> → <ScrollProgress /> + <Header /> + <PageTransition>{children}</PageTransition> + <Footer /> + <ScrollToTop />`.

**Bug fixed**: Framer Motion `ease: "easeOut"` string is not assignable to `Easing | Easing[] | undefined`. Fixed in both `ScrollReveal.tsx` and `FadeIn.tsx` by replacing with bezier constant `const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]`. Also added `import type { Variants }` for explicit typing.

**Build result**: `npm run build` → exit 0. TypeScript clean. 4 routes generated (`/`, `/_not-found`, compiled in 4.2s).

## Outcome

- ✅ Impact: Full layout shell is live — Header, Footer, ScrollProgress, ScrollToTop, CartIcon all render on every route. Framer Motion animations wired. App visually complete at shell level.
- 🧪 Tests: npm run build exits 0, TypeScript strict-clean. No unit tests for layout components (visual-only).
- 📁 Files: 6 new layout components + 2 animation components patched + layout.tsx updated + tasks.md updated (T029–T034 marked [X]).
- 🔁 Next prompts: /sp.implement phase 05 (Homepage: HeroCarousel, CategoryGrid, FeaturedProducts)
- 🧠 Reflection: Framer Motion Easing type is a union — plain strings like "easeOut" are not safe. Always use bezier tuples or the specific Easing union values. shadcn Sheet requires SheetTitle for accessibility even if visually hidden.

## Evaluation notes (flywheel)

- Failure modes observed: `ease: "easeOut"` caused TypeScript error in Footer.tsx (transitively via scrollItemVariants). Build-time type checking caught it.
- Graders run and results (PASS/FAIL): npm run build → PASS (exit 0)
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Add `ease` type helper constant to animations barrel export to avoid future occurrences.
