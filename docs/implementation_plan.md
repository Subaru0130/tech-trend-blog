- **`src/app`**:## Design Overhaul: "Affiliate Media Style" (LDK/mybest inspired)
**Goal:** A trustworthy, magazine-style ranking site for 20-40s women/housewives.
**Keywords:** Trust, Clarity, Lifestyle, Comparison, Ranking.

### Structure (Home Page)
1.  **Header:** "2025 Best Gadgets Ranking" + "Verified by Editors" badge.
2.  **Intro:** "No time? We tested everything for you." (Empathy).
3.  **Comparison Table:** Horizontal scroll, Stars/Double Circles (◎/◯).
4.  **Ranking Section:**
    *   Rank 1-3 (Gold/Silver/Bronze).
    *   Product Image (Left) + Details (Right).
    *   CV Buttons: Amazon (Orange), Rakuten (Red), Yahoo (Yellow).
5.  **How to Choose:** Simple 3 points.
6.  **Footer:** Related links.

### Visual Style
*   **Colors:** White Base, Pastel Blue/Mint Green Accents, Coral/Orange for CV.
*   **Typography:** Gothic (Noto Sans JP), Readable, Trustworthy.
*   **UI:** "Magazine" feel, clear borders, badges. feel.
- **`scripts/generator`**: Node.js scripts to fetch trends and call Gemini.
- **`content/posts`**: Directory where generated MDX files are stored.

### Dependencies
- Run `npm run generate` locally to verify Gemini generates a valid MDX file.
- Run `npm run build` to ensure Next.js can build the static site with the new content.

### Manual Verification
- Check generated article quality (Hallucinations? Formatting?).
- Verify UI responsiveness and "Premium" design feel.
