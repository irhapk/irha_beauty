---
id: "0029"
title: live debug order success fix
stage: green
date: 2026-03-01
surface: agent
model: claude-sonnet-4-6
feature: 004-nextjs-storefront
branch: 004-nextjs-storefront
user: PC
command: live debugging session — run servers, fix register 500, fix auth forms, fix logo, update product/pricing, fix order success screen
labels: ["debug","python312","asyncpg","uv","env","delivery-charge","order-success","cart-redirect"]
links:
  spec: specs/004-nextjs-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/.env (NEW — NeonDB credentials, no sslmode)
  - backend/.venv312/ (NEW — Python 3.12.4 venv via uv)
  - frontend/.env.local (NEW — NEXT_PUBLIC_API_URL=http://localhost:8000)
  - frontend/lib/api.ts (interceptor fix: skip refresh retry for /auth/refresh requests)
  - frontend/lib/utils.ts (added DELIVERY_CHARGE = 160)
  - frontend/lib/static-data.ts (product: Irha's Oil Control Facewash, price 499)
  - frontend/components/layout/Header.tsx (logo.jpeg, 44×44, invert class)
  - frontend/components/layout/Footer.tsx (logo.jpeg, 36×36, invert class)
  - frontend/app/cart/page.tsx (delivery charge row + correct total)
  - frontend/app/checkout/page.tsx (orderPlaced state lifted, success screen at page level)
  - frontend/components/checkout/CheckoutForm.tsx (onSuccess callback prop, removed internal success screen)
tests:
  - manual: register 201, login 200, add to cart, checkout → order success screen shows
outcome: |
  Fixed 8 issues in a live debugging session:
  1. asyncpg Python 3.14 → downgraded to 3.12 with uv venv (.venv312)
  2. pip/WMI hang → uv bypasses WMI entirely
  3. frontend node_modules corrupted → fresh npm install
  4. .env.local missing → created with NEXT_PUBLIC_API_URL
  5. 401 interceptor infinite loop → skip refresh retry for /auth/refresh
  6. DATABASE_URL sslmode → removed ?sslmode=require (asyncpg uses connect_args ssl)
  7. Logo white background → invert CSS filter; wrong filename → logo.jpeg
  8. Cart redirect race condition → lifted orderPlaced to checkout/page.tsx so clearCart()
     doesn't trigger redirect before success screen renders
---

## Prompt

Run both servers so I can see. [followed by: register 500, auth forms not showing, logo invisible, product/price/delivery updates, order success screen not showing]

## Response

Resolved all issues across a full live debugging session:

- **asyncpg on Python 3.14**: No Windows wheel for `protocol.cp314-win_amd64.pyd`. Downgraded to Python 3.12.4 using `uv venv .venv312 --python 3.12` + `uv pip install -r requirements.txt`. Backend restarted with `.venv312/Scripts/uvicorn`.
- **Frontend env**: Created `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000`. Without this, Next.js rewrites used `undefined/api/*`.
- **401 loop**: Axios interceptor was retrying `/auth/refresh` on 401, which itself got 401, causing infinite recursion and `setLoading(false)` never being called. Fixed by checking `!original.url?.includes("refresh")`.
- **sslmode**: asyncpg rejects `?sslmode=require` (psycopg2 syntax). Removed from DATABASE_URL; SSL already handled via `connect_args={"ssl": True}` in `database.py`.
- **Logo**: File is `logo.jpeg` (not `logo.png`). Added `invert` Tailwind class (CSS `filter: invert(1)`) to make black logo visible on dark header.
- **Product/delivery**: Updated to Irha's Oil Control Facewash PKR 499, `DELIVERY_CHARGE = 160` exported from `utils.ts`.
- **Order success**: `clearCart()` in CheckoutForm triggered `useEffect` in checkout page which `router.replace("/cart")` before success screen could render. Fixed by lifting `orderPlaced` state to `checkout/page.tsx`, adding `&& !orderPlaced` guard, and passing `onSuccess(grandTotal)` callback to CheckoutForm.
