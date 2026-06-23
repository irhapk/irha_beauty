---
id: "0038"
title: Hero Carousel Mobile Banner Fix
stage: green
date: 2026-03-03
surface: agent
model: claude-sonnet-4-6
feature: 008-content-fixes
branch: 005-admin-dashboard
user: irhapk
command: "dont touch the laptop styling. now it's perfect but on mobile it looks unprofessional. so fix for mobilee"
labels: ["ui","hero","carousel","mobile","responsive","next-image"]
links:
  spec: specs/008-content-fixes/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - frontend/components/home/HeroCarousel.tsx
  - frontend/app/page.tsx
tests:
  - npm run build → clean (17/17 pages)
---

## Prompt

dont touch the laptop styling. now it's perfect but on mobile it looks unprofessional. so fix for mobilee

## Response snapshot

Dual-image approach in `HeroCarousel.tsx`:

**Mobile** (`md:hidden`):
```tsx
<div className="relative h-[85vh] w-full md:hidden">
  <Image src={slide.bannerImage} alt={slide.headline} fill priority
    sizes="100vw" placeholder="blur" blurDataURL={BLUR_DATA_URL}
    className="object-cover object-center" />
</div>
```
- `fill` prop fills the fixed-height container
- `h-[85vh]` gives full-screen presence on mobile
- `object-cover object-center` crops to show the center of the portrait image

**Desktop** (`hidden md:block`) — untouched:
```tsx
<Image src={slide.bannerImage} alt={slide.headline} width={1080} height={1920}
  priority placeholder="blur" blurDataURL={BLUR_DATA_URL}
  className="hidden w-full h-auto md:block" />
```
- Natural aspect ratio, shows full image

Shared overlay (`absolute inset-0 bg-black/50`) and text content work for both because `motion.div` is `relative w-full` and both image variants are in document flow (fill inside fixed-height container, or w-full h-auto).

`app/page.tsx` retains `<div className="pt-[104px]">` wrapper around `<HeroCarousel />` to push section below fixed header.

## Outcome

- ✅ Impact: Mobile hero now shows full-height (85vh) cover image; desktop unchanged; banner no longer looks short/horizontal on mobile
- 🧪 Tests: npm run build → clean, 17/17 pages, TypeScript pass
- 📁 Files: 1 file changed (HeroCarousel.tsx — 19 insertions, 3 deletions)
- 🔁 Next prompts: NeonDB SQL seed for Phase 6 schema extension; future admin UI features
- 🧠 Reflection: Portrait images (1080×1920) need different treatment on mobile vs desktop — fill+object-cover for mobile, w-full h-auto for desktop; dual rendering is the cleanest solution

## Evaluation notes (flywheel)

- Failure modes observed: previous attempts (object-contain, mt offsets, single Image with h-auto) all failed on mobile; dual-image approach resolved it cleanly
- Graders run and results (PASS/FAIL): build PASS
- Prompt variant (if applicable): null
- Next experiment: try object-position: 20% 10% to favor bottle top on mobile if needed
