---
id: "0033"
title: Add Facewash Category SDD Correction
stage: general
date: 2026-03-01
surface: agent
model: claude-sonnet-4-6
feature: 004-nextjs-storefront
branch: 004-nextjs-storefront
user: PC
command: correct missing facewash category across all SDD artifacts
labels: ["correction","facewash","category","spec","data-model","plan"]
links:
  spec: specs/004-nextjs-storefront/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-nextjs-storefront/spec.md (updated)
  - specs/004-nextjs-storefront/data-model.md (updated)
  - specs/004-nextjs-storefront/plan.md (updated)
tests:
  - none (SDD artifact corrections only)
---

## Prompt

before deploy i notice one big blunder we forget to add facewash category. eventhough we only offer facewash for now. but we dont have facewash category. so please give me the prompt for facewash category then i generate image and will put it in public folder until then you'll update all sdd artifacts.

## Response snapshot

**The blunder identified:**
- `STATIC_CATEGORIES` had: Shampoo (active), Hair Oils (coming-soon), Fragrance (coming-soon) — NO Facewash
- `FEATURED_PRODUCTS` had: "Irha's Oil Control Facewash" with `category: "facewash"` — product category had no matching Category entry
- `spec.md` incorrectly stated "Irha Argan Shampoo at PKR 1,800" and Shampoo as the active category
- All SDD artifacts were corrected to reflect Facewash as the ONLY active category

**Image prompts provided (2 images needed):**
- `facewash_category.png` — luxury skincare flat lay, white/gold bottle, jasmine petals, marble, square format
- `facewash_banner.png` — wide cinematic hero banner, botanical elements, cream/gold palette, 3:1 ratio

**SDD artifacts updated:**
1. `spec.md`:
   - User Story 1: changed active category from Shampoo → Facewash
   - Slides: 3 → 4 (added Facewash)
   - FR-001: 3 slides → 4 slides
   - FR-003: added /categories/facewash
   - FR-004: 3 categories → 4 categories
   - FR-007: Shampoo → Facewash as the live category page
   - FR-008: added Shampoo to coming-soon list
   - Key Entities: slug list updated to include facewash
   - SC-004: 3 banners → 4 banners
   - Assumptions: corrected product to "Irha's Oil Control Facewash at PKR 499"

2. `data-model.md`:
   - Category interface: slug comment updated to include facewash
   - Product interface: price example 1800 → 499, image filenames corrected
   - Slide interface: category comment updated, example values updated
   - Seed data: Facewash added as active, Shampoo changed to coming-soon
   - Static data section added documenting STATIC_CATEGORIES and SLIDES expected values

3. `plan.md`:
   - Scale/Scope: "3 categories" → "4 categories (facewash active; shampoo/oils/fragrance coming-soon)"
   - Category page comment: shampoo=live → facewash=live

**Code changes pending** (after user adds images to public/):
- `frontend/lib/static-data.ts` — add Facewash category entry, change Shampoo to coming-soon
- `frontend/lib/slides.ts` — add Facewash slide as first slide

## Outcome

- ✅ Impact: All SDD artifacts now accurately reflect the actual product (Facewash) and category structure
- 🧪 Tests: None — SDD corrections only
- 📁 Files: 3 spec files updated (spec.md, data-model.md, plan.md)
- 🔁 Next prompts: User generates images → places in public/ → code update (static-data.ts + slides.ts)
- 🧠 Reflection: The original spec was written around "Shampoo" as a placeholder product before the actual product (Facewash) was finalised. The static-data.ts code was correct (had Facewash product) but the categories array was never updated. Always verify product-category alignment before deploy.

## Evaluation notes (flywheel)

- Failure modes observed: spec/code drift — spec said Shampoo, code said Facewash, categories had neither Facewash
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): after image added, update static-data.ts + slides.ts in one targeted edit
