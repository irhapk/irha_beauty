---
id: "0026"
title: Phase 09 Auth Pages
stage: green
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 004-nextjs-storefront
branch: 004-nextjs-storefront
user: PC
command: /sp.implement phase 09.
labels: ["auth","register","login","split-screen","framer-motion","nextjs","zustand"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/components/auth/AuthForm.tsx
  - frontend/components/auth/index.ts
  - frontend/app/(auth)/register/page.tsx
  - frontend/app/(auth)/login/page.tsx
  - specs/004-nextjs-storefront/tasks.md
tests:
  - npm run build → exit 0 (13 routes, /register static, /login static)
---

## Prompt

/sp.implement phase 09.

## Response snapshot

Implemented Phase 9 — Auth Pages (T051–T053). Four files created, build passes cleanly with 13 routes.

**T051 — `components/auth/AuthForm.tsx`** ("use client"):

- `AuthSubmitData` interface exported (`full_name`, `email`, `password`) — used by both register and login pages.
- Props: `mode: "login" | "register"`, `onSubmit: (data: AuthSubmitData) => Promise<void>`, `isLoading: boolean`, `error: string`.
- Register shows Full Name field (hidden for login); Email + Password always shown.
- `validate()` pure function: checks all required, email regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), password ≥ 8 chars. Returns `FieldErrors` partial record.
- Password show/hide toggle: `FiEye`/`FiEyeOff` button inside `relative` container, `pr-10` on Input.
- Error prop animates in via `<FadeIn>` — styled as red bordered/backgrounded banner.
- Submit button: `FiLoader animate-spin` + context-aware label ("Signing In…" / "Creating Account…").

**T052 — `app/(auth)/register/page.tsx`** ("use client"):

- Route group `(auth)` — URL is `/register` (parentheses don't appear in URL).
- Auth guard: `useEffect` redirects `router.replace("/")` when `isAuthenticated=true` after auth resolves. Returns `<></>` while `isAuthLoading || isAuthenticated`.
- `handleSubmit`: `registerUser({ full_name, email, password })` → backend sets httpOnly cookie → `fetchCurrentUser()` → `setUser(user)` → `router.push("/")`.
- API error: caught as `ApiError`, shown via `error` prop on `AuthForm`.
- **Left panel** (lg+ only): `shampoo_banner.png` with `bg-black/65` overlay. Three sequential `FadeIn` elements: tagline label (0.1s), "Irha Beauty" heading (0.3s), body text (0.6s).
- **Right panel**: `FadeIn` heading section (0.1s), `FadeIn` form (0.3s), `FadeIn` "Already have an account?" link (0.5s) → `/login`.
- Layout: `min-h-[calc(100vh-80px)]` to fill viewport below the 80px header.

**T053 — `app/(auth)/login/page.tsx`** ("use client"):

- Same pattern as register, same luxury split-screen layout.
- Left panel uses `oil_banner.png` (different brand imagery for visual variety).
- `handleSubmit`: `loginUser({ email, password })` → `fetchCurrentUser()` → `setUser(user)` → `router.push("/")`.
- "Don't have an account?" link → `/register`.

**Design decision**: Auth pages use the existing root layout (Header + Footer) with `min-h-[calc(100vh-80px)]` so the split-screen fills the content area. No layout file needed — clean and avoids routing complexity.

**Build result**: `npm run build` → exit 0. 13 routes. `/login` and `/register` prerendered as static content (client-side Zustand auth hydration).

## Outcome

- ✅ Impact: Auth pages complete — luxury split-screen register + login. Full auth flow: register/login → fetchCurrentUser → setUser → redirect home. Authenticated users redirected away from auth pages. Auth errors displayed inline via FadeIn error banner.
- 🧪 Tests: npm run build exits 0, TypeScript clean, 13 routes.
- 📁 Files: 4 new files (AuthForm.tsx, auth/index.ts, register/page.tsx, login/page.tsx) + tasks.md (T051-T053 marked [X]).
- 🔁 Next prompts: /sp.implement phase 10 (About + Contact pages), then phase 11 (Polish + responsive fixes)
- 🧠 Reflection: `(auth)` Next.js route group doesn't change the URL — `/register` and `/login` work correctly. Auth guard pattern: all hooks at top → early return after hooks — avoids React rules violations. Split-screen layout with `min-h-[calc(100vh-80px)]` fills the content area below the fixed-height header cleanly. `fetchCurrentUser()` after login/register is required because the API returns void (sets httpOnly cookie only) — the store must be populated manually.

## Evaluation notes (flywheel)

- Failure modes observed: None — build passed first try.
- Graders run and results (PASS/FAIL): npm run build → PASS (exit 0, 13 routes)
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Add a "Forgot password?" link to the login page (UI only for now, backend endpoint not yet built).
