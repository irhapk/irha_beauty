# Tasks: 007-storefront-ux — Storefront UX Enhancements

**Feature**: 007-storefront-ux
**Branch**: 005-admin-dashboard
**Date**: 2026-03-02

---

## T001 — Extend cart store with popup state

**File**: `frontend/store/cart.store.ts`

- [ ] Add `popupProduct: Product | null` to `CartState` interface (default: `null`)
- [ ] Add `popupOpen: boolean` to `CartState` interface (default: `false`)
- [ ] Add `showPopup: (product: Product) => void` action — sets `popupProduct` + `popupOpen: true`
- [ ] Add `hidePopup: () => void` action — sets `popupOpen: false` (product cleared after animation)

---

## T002 — Create CartPopup component

**File**: `frontend/components/layout/CartPopup.tsx` (NEW)

- [ ] `"use client"` directive
- [ ] Reads `popupOpen`, `popupProduct`, `hidePopup` from cart store
- [ ] Wrapped in `AnimatePresence` from framer-motion
- [ ] `motion.div`: initial `{ opacity: 0, y: -16 }` → animate `{ opacity: 1, y: 0 }` → exit `{ opacity: 0, y: -16 }`
- [ ] Position: `fixed top-24 right-6 z-[60]`
- [ ] Width: `w-80 max-w-[calc(100vw-3rem)]`
- [ ] Styling: `bg-black border border-gold/30 rounded-md p-4 shadow-2xl`
- [ ] Content: gold `FiCheck` icon + "Added to Cart" text + product name (1 line truncated)
- [ ] Close button (×) calls `hidePopup()`
- [ ] `useEffect`: when `popupOpen` becomes true, set a 3s timeout → call `hidePopup()`; clear timeout on cleanup

---

## T003 — Add CartPopup to root layout

**File**: `frontend/app/layout.tsx`

- [ ] Import `CartPopup` from `@/components/layout/CartPopup`
- [ ] Render `<CartPopup />` inside the layout body (after `<Providers>`, alongside `<Header>`)

---

## T004 — Update ProductCard: popup on Add to Cart + Buy Now button

**File**: `frontend/components/product/ProductCard.tsx`

- [ ] Import `useRouter` from `next/navigation`
- [ ] Import `showPopup` from cart store
- [ ] Update `handleAddToCart`: call `addItem(product)` then `showPopup(product)`
- [ ] Add `handleBuyNow`: calls `addItem(product)` → `router.push('/checkout')`
- [ ] Add "Buy Now" button to the actions overlay between "Add to Cart" and wishlist
- [ ] "Add to Cart": `flex-1`, existing black style
- [ ] "Buy Now": `flex-1`, gold background + black text, hover: black + white
- [ ] Both buttons get `e.preventDefault()` to stop card link navigation
- [ ] Wishlist button unchanged (stays on the right)

---

## T005 — Move CartIcon to mobile navbar

**File**: `frontend/components/layout/Header.tsx`

- [ ] In the mobile header row (the `div` with `md:hidden` hamburger button), add `<CartIcon />` directly before the `SheetTrigger`
- [ ] Remove `<CartIcon />` from inside the Sheet's `flex gap-5 py-2` div
- [ ] Keep `<WishlistIcon />` inside the Sheet unchanged
- [ ] Ensure CartIcon in header has no `md:hidden` wrapper (visible on all sizes in that row is fine — desktop already has its own CartIcon in the desktop icons div)
- [ ] Actually: wrap the new mobile CartIcon with `md:hidden` to avoid duplication on desktop

---

## T006 — Verify

- [ ] Click "Add to Cart" on ProductCard → popup slides in, shows product name, dismisses after 3s
- [ ] Click close (×) on popup → dismisses immediately
- [ ] Click "Buy Now" → goes to `/checkout`, cart has the item
- [ ] On mobile: cart icon visible in header bar with badge, not inside hamburger menu
- [ ] No duplicate cart icon on mobile
- [ ] `cd frontend && npm run build` → clean
