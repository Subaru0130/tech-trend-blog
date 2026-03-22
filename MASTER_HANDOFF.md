# MASTER HANDOFF DOCUMENT: ChoiceGuide

**Last Updated**: 2026-03-18  
**Status**: Current production handoff / canonical overview

---

## 1. What This Project Actually Is

ChoiceGuide is a **Next.js 16 (App Router)** affiliate content site that publishes:

- ranking/comparison articles
- individual product review pages
- category hubs and search pages

The current real business flow is:

**Blue Ocean / Situation Mining -> Blueprint JSON -> Product Discovery + Validation -> Ranking Article Generation -> Individual Review Generation -> Static Export / Deploy**

Primary monetization is:

- Amazon Associates
- Rakuten Affiliate

This repo still contains many older experiments, debug assets, and legacy scripts, but the blueprint-driven pipeline is the current core.

---

## 2. Canonical Truth vs Old Docs

Treat this file as the current canonical overview.

Older documents are useful only as historical context:

- `PROJECT_CONTEXT_SUMMARY.md`: partially stale
- `docs/README.md`: old pipeline (`content/posts`) and no longer accurate
- `README.md`: older pre-blueprint generation explanation
- `COMMANDS.md`: closer to current ops, but still incomplete

Very important:

- `npm run generate` now points to `scripts/produce_from_blueprint.js`
- `npm run generate:legacy` preserves the old `scripts/generate-post.mjs` flow
- the **current main production flow** is `produce_from_blueprint.js` / `batch_produce.js`

---

## 3. End-to-End Current Workflow

### Phase A. Demand / Situation Mining

Main entry:

- `node scripts/universal_miner_situation_v1.js "<seed keyword>"`

What it does:

1. starts from a seed keyword such as `ワイヤレスイヤホン`
2. expands situation-oriented suffixes using Google Suggest and AI
3. optionally inspects filterable specs from market data
4. generates approved blueprint candidates
5. writes them to root-level files like `SITUATION_BLUEPRINTS_ワイヤレスイヤホン.json`

There is also a broader market-mining branch:

- `scripts/blue_ocean_miner_universal.js`

That script is useful for niche discovery, but the strongest current operational path is the **situation blueprint** flow.

### Phase B. Article Production From Blueprint

Main entries:

- `node scripts/produce_from_blueprint.js <BLUEPRINT.json> "<keyword>"`
- `node scripts/batch_produce.js`

`produce_from_blueprint.js` is the center of the system. For a single keyword it:

1. loads the matching blueprint from a `SITUATION_BLUEPRINTS_*.json` file
2. ensures Chrome remote debugging is available when needed
3. discovers candidate products from market sources
4. validates/expands products with Amazon scraping and review/spec gathering
5. writes the ranking article body and review bodies with AI
6. downloads/processes product images when possible
7. syncs products into `src/data/products.json`
8. updates `src/data/articles.json`
9. writes article markdown into `src/content/articles/`
10. writes review markdown into `src/content/reviews/`
11. cleans orphaned reviews
12. runs a quality check

Key helper modules:

- `scripts/lib/market_research.js`
- `scripts/lib/amazon_scout.js`
- `scripts/lib/ai_writer.js`
- `scripts/lib/generator.js`
- `scripts/lib/spec_normalizer.js`
- `scripts/lib/affiliate_processor.js`

### Phase C. Frontend Rendering

The site is rendered from a combination of **structured JSON** and **generated markdown**.

#### Rankings

- structured metadata / lineup / routing: `src/data/articles.json`
- long-form article body: `src/content/articles/*.md`
- page route: `src/app/rankings/[slug]/page.tsx`

#### Reviews

- structured product master: `src/data/products.json`
- long-form review body: `src/content/reviews/*.md`
- page route: `src/app/reviews/[slug]/page.tsx`

#### Category / Search

- categories: `src/app/categories/`
- search: `src/app/search/page.tsx`

### Phase D. Search Console Monitoring

Search Console monitoring is scriptable from this repo after a Google service account is added to the target property.

Main entries:

- `npm run gsc:sites`
- `npm run gsc:analytics`
- `npm run gsc:inspect`
- `npm run gsc:report`

Required local env:

- `GSC_SERVICE_ACCOUNT_KEY_FILE`
- `GSC_SITE_URL`
- `GSC_PUBLIC_BASE_URL`

Important:

- the service account email must be added to the Search Console property first
- `GSC_SITE_URL` must match the actual property identifier, for example `https://choiceguide.jp/` or `sc-domain:choiceguide.jp`
- list/filter UI is driven mainly from `articles.json`

### Phase D. Build / Export / Deploy

Current build command:

- `npm run build`

This runs:

1. `next build`
2. `node scripts/generate_redirects.js`
3. `next-sitemap`

Important current behavior:

- `next.config.ts` uses `output: 'export'`
- build output is static-export oriented (`out/`)
- `generate_redirects.js` creates `out/link/index.php` and `.htaccess` for cloaked affiliate redirects

This means the current config is **static-hosting / Xserver-oriented**, even though some older docs still talk about Vercel.

---

## 4. Real Source Of Truth

If you need to understand what the live site will show, trust these in order:

### Article Routing / Article Metadata

- `src/data/articles.json`

Contains:

- ranking article id/slug
- title/description
- category mapping
- ranking items
- buying guide metadata
- thumbnail / publish data

### Product Master

- `src/data/products.json`

Contains:

- product ids
- ASINs
- prices
- images
- ratings
- review counts
- specs
- pros/cons
- affiliate links

### Long-Form Bodies

- `src/content/articles/*.md`
- `src/content/reviews/*.md`

Use these for:

- article/review body text
- frontmatter that complements structured data

### Frontend Data Gateway

- `src/lib/data.ts`

This is the main read layer used by the app for products, articles, category lookups, and slug resolution.

---

## 5. Important Directories

### Core

- `src/app/`: Next.js routes
- `src/components/`: UI components
- `src/lib/`: frontend data / affiliate helpers
- `src/types/`: shared types

### Generated Content

- `src/content/articles/`: ranking article markdown
- `src/content/reviews/`: review markdown
- `src/data/articles.json`: structured article DB
- `src/data/products.json`: structured product DB

### Automation / Pipeline

- `scripts/`: production scripts, helpers, audits, debug utilities
- `scripts/lib/`: key reusable pipeline modules

### Build / Assets

- `public/`: static assets
- `out/`: static export output
- `.cache/`: reusable scraping cache

### Root-Level Operational Inputs

- `SITUATION_BLUEPRINTS_*.json`: blueprint sets to generate from
- `mining_result.json`: miner output snapshot

---

## 6. Current Operational Commands

### Generate situation blueprints

```bash
node scripts/universal_miner_situation_v1.js "ワイヤレスイヤホン"
```

### Generate one keyword from one blueprint file

```bash
node scripts/produce_from_blueprint.js SITUATION_BLUEPRINTS_ワイヤレスイヤホン.json "ワイヤレスイヤホン ASMR"
```

### Resume generation using cache

```bash
node scripts/produce_from_blueprint.js SITUATION_BLUEPRINTS_ワイヤレスイヤホン.json "ワイヤレスイヤホン ASMR" --use-cache
```

### Force review regeneration

```bash
node scripts/produce_from_blueprint.js SITUATION_BLUEPRINTS_ワイヤレスイヤホン.json "ワイヤレスイヤホン ASMR" --force-reviews
```

### Batch produce all pending blueprint entries

```bash
node scripts/batch_produce.js
```

### Batch produce one blueprint file only

```bash
node scripts/batch_produce.js SITUATION_BLUEPRINTS_ワイヤレスイヤホン.json
```

### Resume a stopped batch after quota or scraping failure

```bash
node scripts/batch_produce.js SITUATION_BLUEPRINTS_ワイヤレスイヤホン.json --use-cache
```

### Local dev server

```bash
npm run dev
```

### Production build / export

```bash
npm run build
```

### Quality check only

```bash
node scripts/check-quality.mjs
```

---

## 7. Environment Variables And External Dependencies

### Required

- `GEMINI_API_KEY` or `GOOGLE_API_KEY`
- `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG`
- `NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID`

### Optional but important

- `ANTHROPIC_API_KEY`
- `ARTICLE_AI_PROVIDER=claude` or `gemini`

Current article-writing behavior:

- `scripts/lib/ai_writer.js` prefers Claude when `ARTICLE_AI_PROVIDER=claude` and `ANTHROPIC_API_KEY` exist
- otherwise it falls back to Gemini

### Browser / Scraping Dependency

Some scraping flows depend on:

- Chrome
- Puppeteer
- Chrome remote debugging on port `9222`

Several scripts try to auto-start Chrome, but this is still a common failure point when the environment is unstable.

---

## 8. Current Observed Repo State (2026-03-18)

At the time of this handoff:

- `SITUATION_BLUEPRINTS_*.json` files at root: **4**
- ranking article markdown files in `src/content/articles/`: **22**
- review markdown files in `src/content/reviews/`: **50**

The most visibly developed content cluster is:

- wireless earphones / audio

There are also blueprint files for at least:

- wireless earphones
- office chairs

The repo root contains many non-canonical artifacts:

- debug screenshots
- log files
- test dumps
- one-off recovery scripts

These are useful for troubleshooting history, but they are not the primary source of truth for the product pipeline.

---

## 9. Known Traps And Gotchas

### 1. `npm run generate` Now Uses The Main Pipeline

This now calls `scripts/produce_from_blueprint.js`.

Use alongside:

- `scripts/universal_miner_situation_v1.js`
- `scripts/produce_from_blueprint.js`
- `scripts/batch_produce.js`

### 2. Static Export Is The Real Current Build Mode

Even if some docs mention Vercel, the current config is built around:

- `output: 'export'`
- `out/` output
- PHP redirect generation for `/link/*`

### 3. Rankings And Reviews Use Dual Storage

The system is intentionally split:

- JSON for structured routing/listing/product metadata
- markdown for long-form body content

If something looks wrong on a page, check both.

### 4. Homepage Is Not Fully Dynamic

The homepage is partially curated:

- `src/components/home/RankingPreview.tsx` hardcodes featured product IDs

So changes to article data do not automatically control every homepage element.

### 5. Category / Search Pages Are List UIs Over Existing Article Data

They do not generate content. They mainly filter and present what already exists in `articles.json`.

### 6. Affiliate Redirects Are Build-Time Generated

`scripts/generate_redirects.js` reads `products.json` and generates the cloaked redirect endpoint under:

- `out/link/index.php`
- `out/link/.htaccess`

If affiliate behavior breaks after a content update, rebuild and inspect the redirect map.

### 7. Shell Output May Show Mojibake

Some Japanese text appears garbled in terminal output depending on shell encoding. Do not assume the business logic is broken just because console text looks messy. Verify by reading file structure and behavior, not console appearance alone.

---

## 10. Recommended Resume Flow For A New Session

If another AI or developer resumes work, start here:

1. read this file first
2. inspect the newest `SITUATION_BLUEPRINTS_*.json`
3. decide whether the task is mining, generation, frontend, or repair
4. if generating content, prefer `batch_produce.js --use-cache` for resumability
5. verify outputs in:
   - `src/content/articles/`
   - `src/content/reviews/`
   - `src/data/articles.json`
   - `src/data/products.json`
6. run `npm run build` if you need final export integrity

For debugging content mismatches:

- article page issue -> check `articles.json` + `src/content/articles/*.md`
- review page issue -> check `products.json` + `src/content/reviews/*.md`
- affiliate issue -> check `src/lib/affiliate.ts` + generated redirect map
- missing product quality -> check `market_research.js`, `amazon_scout.js`, `produce_from_blueprint.js`

---

## 11. Bottom Line

This project is no longer just a generic "AI blog generator."

It is now a **blueprint-driven affiliate publishing system** with:

- keyword mining
- situation-aware article planning
- multi-source product discovery
- Amazon validation/review/spec enrichment
- structured article/product databases
- markdown long-form output
- static export deployment

When in doubt, think in this order:

**Blueprint -> Products -> JSON DB -> Markdown -> Frontend Route -> Static Export**
