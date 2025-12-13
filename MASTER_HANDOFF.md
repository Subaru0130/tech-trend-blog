# MASTER HANDOFF DOCUMENT: ChoiceGuide (formerly Tech Trend Blog)

**Last Updated**: 2025-12-13
**Status**: Phase 2 (UI Migration) Complete / Phase 3 (Componentization) Ready

---

## 1. Project Overview
**Name**: チョイスガイド (ChoiceGuide)
**Goal**: Automated "Best Buy" Review Media ensuring high visual fidelity and monetization.
**Tech Stack**:
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 (Custom Config)
- **Deployment**: Vercel
- **Automation**: Node.js Scripts (`scripts/`)
- **Monetization**: Amazon Associates, Rakuten Affiliate

---

## 2. Visual Design System (New Implementation)
We have successfully migrated closely to the `newdesign_2` standard.

### Core Rules
- **Font Stack**:
    - **English/Numerics**: `Manrope` (Priority 1) - Gives the "sharp" look.
    - **Japanese**: `Noto Sans JP` (Priority 2)
    - **Implementation**: Hardcoded CDN links in `src/app/layout.tsx` + `globals.css` rule.
- **Colors**:
    - `Primary`: `#3E3B38` (Charcoal/Dark Brown)
    - `Accent`: `#5E8C6A` (Sage Green)
    - `Background`: `#F9F9F8` (Warm White) + `.hero-pattern` (Dot Grid)
- **Key Files**:
    - `src/app/layout.tsx`: **HEAD contains critical Google Fonts CDN links.**
    - `src/app/globals.css`: Contains crucial `@theme` overrides and `.hero-pattern`.

### Prototype Pages (Reference)
- **Home**: `src/app/page.tsx`
- **Category List**: `src/app/categories/prototype/page.tsx`
- **Ranking Detail**: `src/app/rankings/prototype/page.tsx`
- **Review Detail**: `src/app/reviews/prototype/page.tsx`

---

## 3. Automated Operations Foundation
The backend logic for generating content exists in the `scripts/` directory.

### A. Content Generation
To generate a new ranking article automatically:
```bash
# Usage: node scripts/generate-post.mjs "[Product Keyword]"
node scripts/generate-post.mjs "洗濯機"
```
*Note: Currently generates generic MDX. Needs update to output "New Design" compatible JSON/Components.*

### B. Deployment
Pushing to the `main` branch automatically triggers Vercel deployment.
```bash
git add .
git commit -m "update content"
git push
```

### C. Affiliate Management
Affiliate IDs are managed via Vercel Environment Variables.
- **Amazon Ref**: `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG`
- **Rakuten Ref**: `NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID`
*See `AFFILIATE_INSTRUCTIONS.md` for details on how to obtain these.*

---

## 4. Immediate Roadmap (Next Session)
The UI is visually ready ("Hari-bote" / Facade), but the internals need wiring.

### [ ] Phase 3: Componentization (Priority)
Break down the huge prototype files into reusable React components.
- `src/components/shared/Header.tsx`
- `src/components/shared/Footer.tsx`
- `src/components/rankings/RankingCard.tsx`
- `src/components/reviews/ProductSpec.tsx`

### [ ] Phase 4: Data Connection
- Create `src/data/categories.json` etc. to replace hardcoded prototype HTML.
- Update `scripts/generate-post.mjs` to output data compatible with these new components.

---

## 5. Troubleshooting (Known Issues)
- **Server Stops**: `next dev` sometimes hangs. Restart with `Ctrl+C` then `npm run dev`.
- **Background Color**: If the background looks "Plain White" instead of "Dots", check if a `bg-white` class was accidentally added to a section. It should usually be transparent to let `body` background show through.

---

*Use this document as the prompt context for the next AI session.*
