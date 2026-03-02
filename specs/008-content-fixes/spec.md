# Spec: 008-content-fixes — Branding & Content Fixes

**Feature**: 008-content-fixes
**Branch**: 005-admin-dashboard
**Status**: Approved
**Version**: 1.0.0
**Date**: 2026-03-02

---

## Changes

### CF-01 — Review images updated
- User has replaced review photos in `frontend/public/` with updated versions
- Same filenames — no code change required
- Deploy will serve the new images automatically

### CF-02 — Product name: "Irha's" → "Irha"
- `frontend/lib/static-data.ts`: `"Irha's Oil Control Facewash"` → `"Irha Oil Control Facewash"`
- `frontend/lib/reviews.ts`: review text `"Irha's Oil Control Facewash has..."` → `"Irha Oil Control Facewash has..."`
- NeonDB SQL: `UPDATE products SET name='Irha Oil Control Facewash' WHERE id=1;`

---

## Acceptance Criteria

- [ ] No occurrence of "Irha's" anywhere in frontend source files
- [ ] NeonDB product id=1 name = `Irha Oil Control Facewash`
- [ ] Build clean
