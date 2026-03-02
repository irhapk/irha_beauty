# Tasks: 008-content-fixes — Branding & Content Fixes

**Feature**: 008-content-fixes
**Branch**: 005-admin-dashboard
**Date**: 2026-03-02

---

## T001 — Fix product name in static-data.ts
**File**: `frontend/lib/static-data.ts`
- [ ] Line 44: `"Irha's Oil Control Facewash"` → `"Irha Oil Control Facewash"`

## T002 — Fix product name in reviews.ts
**File**: `frontend/lib/reviews.ts`
- [ ] Line 15: `"Irha's Oil Control Facewash has..."` → `"Irha Oil Control Facewash has..."`

## T003 — Update NeonDB product name (user runs in SQL Editor)
```sql
UPDATE products SET name = 'Irha Oil Control Facewash' WHERE id = 1;
```

## T004 — Build verify + push
- [ ] `npm run build` → clean
- [ ] Commit + push (includes updated review images in public/)
