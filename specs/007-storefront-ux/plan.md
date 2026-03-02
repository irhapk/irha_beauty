# Plan: 007-storefront-ux — Storefront UX Enhancements

**Feature**: 007-storefront-ux
**Branch**: 005-admin-dashboard
**Date**: 2026-03-02

---

## Architecture Decisions

### AD-01: Popup State Lives in Cart Store
- Add two fields to `cart.store.ts`: `popupProduct: Product | null` and `popupOpen: boolean`
- Add action `showPopup(product: Product)` — sets both fields, no timer logic in store
- Timer (auto-dismiss after 3s) is handled inside the popup component via `useEffect`
- Add action `hidePopup()` — sets `popupOpen: false`, then clears `popupProduct` after animation
- Rationale: cart store already exists, no new store or context needed, keeps popup state co-located with cart state

### AD-02: CartPopup is a Root-Level Component
- New file: `components/layout/CartPopup.tsx`
- Rendered once in `components/layout/Header.tsx` (or `app/layout.tsx`) — outside product cards
- Reads `popupOpen` + `popupProduct` from cart store
- Uses Framer Motion `AnimatePresence` + `motion.div` for slide-in from top-right
- Positioned `fixed top-24 right-6 z-[60]` (above header z-50)
- Rationale: avoids portal complexity, Framer Motion handles mount/unmount cleanly

### AD-03: Buy Now Uses next/navigation router
- `handleBuyNow` in ProductCard: calls `addItem(product)` then `router.push('/checkout')`
- Uses `useRouter` from `next/navigation` (already available, client component)
- No new route, no new API call — pure frontend navigation
- Rationale: smallest viable implementation, reuses existing cart + checkout flow

### AD-04: Mobile Cart Placement
- In `Header.tsx`, the mobile row currently is: `[Logo] .... [HamburgerButton]`
- Change to: `[Logo] .... [CartIcon] [HamburgerButton]`
- CartIcon added directly to the mobile header row with `className="md:hidden"`
- CartIcon removed from inside the Sheet's bottom section (the `flex gap-5 py-2` div)
- WishlistIcon remains in the Sheet only
- Rationale: minimal diff — one line added, one line removed

### AD-05: No New npm Packages
- Popup uses: Framer Motion (already installed), Zustand (already installed), React Icons (already installed)
- No `react-hot-toast`, `sonner`, or similar — avoids dependency bloat
- Rationale: keeps bundle small, design is fully custom to match luxury brand aesthetic

---

## Affected Files

| File | Change |
|---|---|
| `frontend/store/cart.store.ts` | +`popupProduct`, `popupOpen`, `showPopup()`, `hidePopup()` |
| `frontend/components/layout/CartPopup.tsx` | NEW — root-level popup component |
| `frontend/components/layout/Header.tsx` | CartIcon in mobile bar + remove from Sheet |
| `frontend/components/product/ProductCard.tsx` | Buy Now button + `showPopup` on Add to Cart |
| `frontend/components/layout/index.ts` | export CartPopup (if index exists) |
| `frontend/app/layout.tsx` | add `<CartPopup />` (if not added in Header) |

---

## Component Design

### CartPopup
```
┌─────────────────────────────────┐
│ ✓  Added to Cart          [×]  │  ← gold checkmark, close button
│    Oil Control Facewash         │  ← product name (truncated)
│    View Cart  ·  Checkout →     │  ← optional action links
└─────────────────────────────────┘
```
- Background: `bg-black border border-gold/30`
- Checkmark: `text-gold` (FiCheck from react-icons)
- Position: `fixed top-24 right-6` (below fixed header)
- Width: `w-80` on desktop, `w-[calc(100vw-3rem)]` on mobile
- Animation: `y: -20, opacity: 0` → `y: 0, opacity: 1` (slide down from top)

### ProductCard actions row (updated)
```
[ Add to Cart (flex-1) ] [ Buy Now (flex-1) ] [ ♡ ]
```

### Mobile header row (updated)
```
[ Logo ]  ................  [ 🛒 ] [ ☰ ]
```

---

## Verification

1. Click "Add to Cart" on any card → popup appears, auto-dismisses in 3s
2. Click "Buy Now" → cart updated, redirected to `/checkout`
3. On mobile: cart icon visible in top bar with correct badge count
4. No cart icon duplication in mobile sheet
5. `npm run build` → clean
