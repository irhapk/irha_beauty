# Spec: 007-storefront-ux — Storefront UX Enhancements

**Feature**: 007-storefront-ux
**Branch**: 005-admin-dashboard (continuing on current branch)
**Status**: Approved
**Version**: 1.0.0
**Date**: 2026-03-02

---

## Problem

Three UX gaps in the current storefront:

1. **No Buy Now path** — users must add to cart, open cart, then proceed to checkout. No fast purchase path exists.
2. **Silent cart add** — clicking "Add to Cart" gives zero feedback. No confirmation, no indication the item was added.
3. **Mobile cart hidden in menu** — the cart icon is buried inside the hamburger sheet on mobile. Users can't see their cart count at a glance without opening the menu.

---

## Goal

Three targeted improvements to the product card and mobile header that elevate the purchase experience without altering the backend or routing structure.

---

## Functional Requirements

### FR-01 — Buy Now Button (ProductCard)
- A second action button "Buy Now" appears alongside "Add to Cart" on the product card actions overlay
- Clicking "Buy Now" adds the product to cart (quantity 1) then immediately navigates to `/checkout`
- If the product is already in cart, quantity is incremented (same as Add to Cart) then navigates
- Layout: "Add to Cart" takes `flex-1`, "Buy Now" also takes `flex-1`, wishlist button stays on the right
- Styling: "Buy Now" uses gold background + black text (the accent CTA style from the design system)
- On hover: black background + white text (inverse of Add to Cart hover)

### FR-02 — Add-to-Cart Success Popup
- Triggered when "Add to Cart" is clicked on a ProductCard
- A premium toast-style notification slides in from the top-right corner
- Content: gold checkmark icon + "Added to Cart" headline + product name (truncated at 1 line)
- Auto-dismisses after 3 seconds
- Has an explicit close (×) button
- Only one popup shows at a time (new add replaces current if still visible)
- Popup is rendered at the root layout level (not inside ProductCard) via a Zustand-driven global component
- Uses Framer Motion `AnimatePresence` for slide-in / slide-out animation
- Does NOT block interaction with the rest of the page (no backdrop/overlay)

### FR-03 — Mobile Cart on Navbar
- On mobile (`md:hidden` breakpoint), the CartIcon is moved OUT of the hamburger Sheet
- It appears directly in the mobile header row, between the logo and the hamburger button
- The cart badge count remains visible at all times on mobile
- WishlistIcon stays inside the mobile menu (only cart is promoted)
- The CartIcon inside the Sheet's bottom section is removed to avoid duplication

---

## Non-Functional Requirements

- NFR-01: No new npm packages — use existing Framer Motion + Zustand + shadcn
- NFR-02: Frontend build remains clean (no type errors)
- NFR-03: Animations respect `prefers-reduced-motion` (Framer Motion handles this automatically)
- NFR-04: Buy Now works on both mobile and desktop card overlays

---

## Out of Scope

- Buy Now on ProductDetail page (deferred — card only for now)
- Popup on wishlist add
- Popup persistence across page navigations
- Server-side cart state

---

## Acceptance Criteria

- [ ] ProductCard shows 3 action buttons: "Add to Cart" | "Buy Now" | Wishlist
- [ ] Clicking "Buy Now" adds item + navigates to `/checkout` immediately
- [ ] Clicking "Add to Cart" triggers the popup with product name
- [ ] Popup auto-dismisses after 3 seconds and can be closed manually
- [ ] On mobile, cart icon is visible in the header bar (not inside the sheet)
- [ ] No duplicate cart icon on mobile (removed from Sheet)
- [ ] Build clean, no type errors
