---
id: "0019"
title: Phase 02 Next.js Init Config
stage: green
date: 2026-02-28
surface: agent
model: claude-sonnet-4-6
feature: 004-nextjs-storefront
branch: 004-nextjs-storefront
user: PC
command: /sp.implement
labels: ["nextjs","tailwind-v4","shadcn","fonts","config","frontend"]
links:
  spec: specs/004-nextjs-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/app/page.tsx
  - frontend/app/globals.css
  - frontend/app/layout.tsx
  - frontend/next.config.ts
  - frontend/.env.local
  - frontend/.env.example
  - frontend/components/ui/button.tsx
  - frontend/components/ui/input.tsx
  - frontend/components/ui/label.tsx
  - frontend/components/ui/dialog.tsx
  - frontend/components/ui/sheet.tsx
  - frontend/components/ui/badge.tsx
  - frontend/components/ui/separator.tsx
  - frontend/lib/utils.ts
tests:
  - "npm run build — exit 0 (TypeScript clean, 4/4 static pages)"
---

## Prompt

/sp.implement phase 02.

## Response snapshot

Bootstrapped the Next.js frontend and configured all foundational infrastructure (T011-T016).

Key adaptations made vs. task spec:
- **Next.js 16.1.6 + React 19** installed (latest stable — plan said 15)
- **Tailwind v4** installed (plan said v3) — theme tokens go in `globals.css` `@theme inline` block, NOT tailwind.config.ts (which doesn't exist in v4)
- **shadcn@3.8.5** auto-detected Tailwind v4 and handled setup correctly

T011: `npx create-next-app@latest frontend --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --no-turbopack --yes`. Cleared page.tsx boilerplate and public SVGs.

T012: `npm install framer-motion zustand axios react-icons`. `npx shadcn@latest init --yes --defaults`. `npx shadcn@latest add button input label dialog sheet badge separator --yes`. All 7 components created in components/ui/.

T013: Added brand tokens to `@theme inline` in globals.css: gold (#ca9236), cream (#f5f3eb), dark-brown (#4e423d), gray-mid (#555555), gray-light (#999999). Font families: --font-heading, --font-body. Width: --width-container: 1470px. shadcn CSS variables preserved.

T014: next.config.ts rewrite: `source: '/api/:path*'` → `${NEXT_PUBLIC_API_URL}/api/:path*`.

T015: .env.local + .env.example with `NEXT_PUBLIC_API_URL=http://localhost:8000`.

T016: layout.tsx — Cormorant_Garamond (400/500/600/700) + Instrument_Sans (400/600) via next/font/google. Variables applied to <html>, body gets antialiased.

Build result: `next build` exits 0, TypeScript clean, 4/4 static pages generated.

## Outcome

- ✅ Impact: Next.js app bootstrapped with full design system foundation — brand tokens, fonts, API proxy, shadcn components
- 🧪 Tests: npm run build — exit 0, TypeScript clean
- 📁 Files: 14 files created/modified
- 🔁 Next prompts: /sp.implement phase 03 (types, API client, Zustand stores, providers)
- 🧠 Reflection: Tailwind v4 is a significant config paradigm shift from v3. No tailwind.config.ts — everything in CSS @theme. shadcn v3.8 handles v4 automatically. Important to adapt task specs to reality of installed versions.

## Evaluation notes (flywheel)

- Failure modes observed: Task spec assumed Tailwind v3 + Next.js 15; actual install is v4 + Next.js 16. Adapted gracefully without breaking anything.
- Graders run and results (PASS/FAIL): npm run build PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
