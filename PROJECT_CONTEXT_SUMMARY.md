
# 📁 PROJECT_CONTEXT_SUMMARY.md

## 🚨 CRITICAL INSTRUCTIONS FOR AI AGENTS
**You must adhere to the following rules strictly.**

### 1. Image Generation Policy
*   **Tool**: ALWAYS use `gemini-3-pro-image-preview` (represented as `generate_image` in your toolset if available, or request access).
*   **Model**: **Imagen 3** is MANTATORY.
*   **Subject**: **Japanese Models** (日本人モデル) are REQUIRED for any human subjects.
*   **Style**: High-quality, photorealistic, tech-blog aesthetic.

### 2. System Configuration
*   **Framework**: Next.js 15+ (App Router)
*   **Platform**: Vercel (Deployed)
*   **Data Source**: `src/data/articles.json` (Content), `src/data/products.json` (Products).
*   **Affiliate**: Amazon Associate & Rakuten Affiliate. Link generation logic in `src/lib/affiliate.ts`.
*   **Styling**: Tailwind CSS.

### 3. Current State (As of Handover)
*   **Search**: Implemented at `/search`.
*   **Categories**: `/categories` hub page active.
*   **Images**:
    *   Articles use `thumbnail` path (local or remote).
    *   Products use `image` path (Amazon URL preferred).
    *   Algorithm: `fetch-product-data.mjs` retrieves Amazon data.
*   **Fixes Applied**:
    *   Resolving missing/placeholder images in `articles.json`.
    *   Fixed `object-contain` CSS for Ranking Tables.
    *   Added affiliate links to Comparison Tables.

## 🔗 End of Context
