# Design System: Lifestyle Comparison Media

Based on the "High-Quality Comparison/Ranking Site" specification.

## 1. Core Concept & Tone
- **Concept**: "Fail-proof Selection" (失敗しない選び方)
- **Tone**: Trustworthy, Objective, Clean, Professional.
- **Keywords**: Authority (専門性), Verification (検証), Clarity (分かりやすさ).
- **Target**: Users who want the "correct answer" quickly without failure.

## 2. Color Palette
- **Base**: White (`#ffffff`), Slate-50 (`#f8fafc`)
- **Primary (Trust)**: Navy Blue (`#0f172a`) or Deep Blue (`#1e40af`)
- **Accent (Attention)**: Vivid Red (`#ef4444`) or Orange (`#f97316`) for "No.1" and CTAs.
- **Rating Colors**:
  - High (4.5-5.0): Gold/Yellow (`#eab308`)
  - Good (3.5-4.4): Blue (`#3b82f6`)
  - Average (2.5-3.4): Gray (`#94a3b8`)
  - Bad (0-2.4): Red (`#ef4444`)

## 3. Typography
- **Font Family**: System UI (San Francisco, BlinkMacSystemFont, YuGothic) for maximum readability.
- **Weights**:
  - **Bold**: Headings, Scores, "No.1" badges.
  - **Regular**: Body text.
- **Rules**:
  - Numerical data (specs, prices) must use monospaced or tabular figures for comparison.
  - Line height should be relaxed (1.6-1.8) for readability.

## 4. Layout Rules (Mobile First)
- **Container**: Max-width 1200px (Desktop), 100% (Mobile) with 16px padding.
- **Spacing**:
  - Sections: `py-12` to `py-16` (48px-64px)
  - Cards: `gap-4` to `gap-6`
- **Sticky Elements**:
  - Mobile: "Back to Top" or "Check No.1" button fixed at bottom.
  - Desktop: Table header fixed on scroll.

## 5. UI Components

### A. Hero Section
- **Elements**:
  - Title: Clear, benefit-driven copy (e.g., "Find the Best [Category]").
  - Background: High-quality product collection photo (Realism).
  - Search/Filter: "Search by Price", "Search by Spec".
  - **Note**: Avoid excessive "Authority" badges unless necessary. Focus on utility.

### B. Ranking Card (The Core)
- **Layout**:
  - **Rank 1-3**: Special styling (Crown icon, Gold/Silver/Bronze borders).
  - **Image**: Left side (Desktop) or Top (Mobile). High-quality cutout.
    - **Overlay**: "Amazon" button with icon at bottom-right of image (mybest style).
  - **Score**: Top Right. Large font.
  - **Score Bars**: Detailed rating bars using `bg-sky-500` for visibility.
  - **Pros/Cons**: Bullet points with Green Check/Gray X icons.
  - **Footer**: "Action Footer" with 3-column grid for Amazon/Rakuten/Yahoo buttons.
  - **Price**: Prominent display with "参考価格" label.

### C. Comparison Matrix
- **Behavior**: Horizontal scroll on mobile. Sticky first column (Product Name).
- **Highlight**: Best values in **Bold Red**.



## 6. Implementation Steps
1.  **Refactor `page.tsx`**: Implement the new Hero and Category sections.
2.  **Update `RankingCard.tsx`**: Add Radar Chart (using Recharts or CSS/SVG) and improve layout.
3.  **Update `ComparisonTable.tsx`**: Implement Sticky First Column and improved mobile scrolling.
