import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyProducts, getHeroImage } from './verify_products.mjs';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY or GOOGLE_API_KEY is not set in .env.local");
  process.exit(1);
}
const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Import Spec Normalizer
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { normalizeObjectSpecs } = require('./lib/spec_normalizer.js');
const { injectAiMetadata, closeExifTool } = require('./lib/image_metadata.js');


// --- Helper Functions ---

async function downloadImage(url, filename) {
  if (!url || !url.startsWith('http')) return null;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 1000) {
      console.warn(`[Imager] Skipped small image (${buffer.length} bytes): ${url}`);
      return null;
    }

    const relativePath = `/images/products/${filename}`;
    const filepath = path.join(process.cwd(), 'public', relativePath);

    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(filepath, buffer);
    console.log(`[Imager] Saved: ${filename}`);

    // INJECT METADATA
    await injectAiMetadata(filepath);

    return relativePath;
  } catch (error) {
    console.warn(`[Imager] Failed to download ${url}: ${error.message}`);
    return null;
  }
}



// --- Main Logic ---

import { getRisingKeywords } from './trend_hunter.mjs';

async function generateArticle(topic) {
  console.log(`\n🚀 Starting Generation Pipeline for: ${topic}`);

  // PHASE 0: Trend Analysis
  console.log("Phase 0: Hunting Trends...");
  const trends = await getRisingKeywords(topic);
  const trendContext = trends.length > 0 ? `
    **TRENDING KEYWORDS (MUST INTEGRATE):**
    ${trends.join(', ')}
    
    Instruction: Ensure these keywords appear naturally in headings or "Pro Tips".
  ` : "";
  console.log(`Trends injected: ${trends.join(', ')}`);

  // PHASE 1: Candidate Selection
  console.log("Phase 1: Selecting Candidates (AI)...");
  const selectionPrompt = `
    You are a commercial editor for a home appliance magazine.
    Task: Select 8 top-tier "${topic}" available on Amazon Japan.
    
    CRITICAL CONSTRAINTS:
    1. META-ANALYSIS: Simulate a cross-check of "Kakaku.com" and "MyBest". Select products that appear in Top 20 on multiple sites.
    2. USE CASES: ensuring variety (e.g. diff types, prices).
    3. DATA: You must provide the specific ASIN for the main current model.
    4. EXCLUDE: Cartridges/Accessories only. Must be the main unit.
    
    Return STRICT JSON array of strings only (Product Names).
    Example: ["BrandA ModelX", "BrandB ModelY"]
    `;

  let candidates = [];
  try {
    const selectionResp = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: selectionPrompt }] }],
      config: {
        thinkingConfig: { thinkingLevel: "high" }
      }
    });

    const selectionText = selectionResp.candidates[0].content.parts[0].text;
    candidates = JSON.parse(selectionText.replace(/```json/g, '').replace(/```/g, '').trim());
    console.log(`Candidates: ${candidates.join(', ')}`);
  } catch (e) {
    console.error("Failed to select candidates:", e);
    throw e;
  }

  // PHASE 2: Verification (Yahoo Search -> ASIN)
  console.log("Phase 2: Verifying ASINs via Yahoo Search...");
  let topProducts = [];
  try {
    const verifiedItems = await verifyProducts(candidates);
    // STRICT FILTER: Only use products where we successfully scraped an image
    topProducts = verifiedItems.filter(p => p.image).slice(0, 5);
  } catch (e) {
    console.error("Verification script failed:", e);
    throw e;
  }

  console.log(`Verified ${topProducts.length} products having ASINs AND Images.`);
  if (topProducts.length < 3) {
    // Retry logic or just proceed? Throwing error stops everything.
    // Let's optimize: if < 3, maybe try one more time? For now, throw.
    throw new Error("Failed to verify enough products with images. Check scraper.");
  }

  // PHASE 3: Content Generation with VERIFIED Data
  console.log("Phase 3: Writing Article with Verified Data...");

  const productsContext = topProducts.map((p, i) => `
    Rank ${i + 1}:
    Name: ${p.verifiedName} (Original: ${p.originalName})
    ASIN: ${p.asin}
    ImageURL: ${p.image}
    `).join('\n');

  const prompt = `
    **ROLE: Expert Specialist & Veteran Editor in "${topic}".**
    
    **Dynamic Persona Instruction:**
    - If the topic is Home Appliances -> Act as a "Veteran Appliance Tester".
    - If the topic is Finance -> Act as a "Certified Financial Planner".
    - If the topic is Beauty -> Act as a "Professional Makeup Artist/Dermatologist".
    - **Identify the most authoritative expert role for "${topic}" and BECOME THAT PERSON.**
    
    **GOAL: Create content that satisfies Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).**
    Target Reader: Someone suffering from "Analysis Paralysis" who wants a definitive, trustworthy answer.
    
    **KEYWORD STRATEGY:**
    - Main Keyword: "${topic}"
    - Rising Trends (User Needs): ${trends.join(', ') || "General high-intent queries"}
    
    **CRITICAL THINKING PROCESS (Drafting Phase):**
    1.  **Competitor Gap Analysis**: What are generic sites (mybest, kakaku) missing? (e.g. "Real noise frequency," "Cleaning pain points"). -> *Include these!*
    2.  **Experience Injection**: Do not just list specs. Describe the *experience* from your expert perspective.
        - Bad: "It is quiet."
        - Good (Appliance Expert): "Even while watching a movie at volume 10, the sound is unnoticeable."
    3.  **Structuring**: Follow the provided MDX structure strictly, but fill it with "Original Insight".

    **Task:** Write a high-converting ranking article for "${topic}".
    
    **CRITICAL: USE THESE VERIFIED PRODUCTS (MATCHES REAL MARKET DATA 2025):**
    ${productsContext}
    
    ${trendContext}
    
    **Output Guidelines:**


    Use the provided ImageURLs below for these specific ASINs.
    
    ${productsContext}

    **Structure & Requirements (MDX)**:
    1.  **Frontmatter**:
        - title: "SEO Optimized Title"
          - **MUST FOLLOW THIS PATTERN**: "【Topic】Recommendation Ranking N Selection【BrandA vs BrandB vs BrandC】"
          - **CRITICAL**: The TOPIC (${topic}) MUST be the VERY FIRST word.
          - **Example**: "【加湿器】おすすめ人気ランキング5選【象印・ダイニチ・パナソニック徹底比較】"
          - **Example**: "【ドライヤー】美容師おすすめ5選【パナソニック・ダイソン・リファ比較】"
          - Include concrete brand names of the top 3 products.
        - date: ${(new Date()).toISOString().split('T')[0]}
        - description: "Generate a compelling, click-worthy meta description (max 120 chars). Mention the benefits of reading this verification. Ex: '彻底比較10選...結論はこれだ'"
        - image: /images/hero-water.png
        - category: "Kitchen"

    2.  **Imports**:
        - \`import { RankingCard } from '@/components/affiliate/RankingCard';\`
        - \`import { ComparisonTable } from '@/components/affiliate/ComparisonTable';\`
        - \`import { QuickSummary } from '@/components/affiliate/QuickSummary';\`
        - \`import { FloatingCTA } from '@/components/ui/FloatingCTA';\`

    3.  **QuickSummary**:
        - Use \`<QuickSummary products={[...]} />\`.
        - **Fields**: rank, name, image, rating, price, id, asin.

    4.  **Intro**: 
        - Hook: Relatable problem statement related to "${topic}".
        - Benefit: The "Ideal Life" gained by choosing the right product.

    5.  **Buying Guide**: 
        - Explain "3 Critical Failure Points" when choosing a "${topic}".
        - **Must be specific to the category** (e.g. for Coffee Maker: "Mill Type", "Cleaning", "Size").

     7.  **The Ranking (1 to 5)**:
        - **IMPORTANT**: Section Header MUST be "### 第N位: Product Name" (Do NOT use "Rank N").
        - Use \`<RankingCard ... />\` for each product.
        - **Props**:
          - rank={N}
          - name="Product Name (Japanese Official Name if possible)"
          - image="The Amazon Image URL provided"
          - rating={4.x}
          - ratings={{ filtration: N, taste: N, flow: N, cost: N, ease: N, design: N }} (1-5 scale)
           - description="Sales Copy: Focus on the experience. Do NOT use markdown (no bold/italic). Write in natural, professional Japanese. (200-300 chars)"
          - bestFor="Target Persona (e.g. '子育て世帯', '料理好き')"
          - pros={["Benefit 1 in Japanese", "Benefit 2 in Japanese", "Benefit 3 in Japanese"]}
          - cons={["Drawback 1 in Japanese", "Drawback 2 in Japanese"]}
          - affiliateLinks={{ amazon: "SEARCH:Product Name", rakuten: "SEARCH:Product Name" }}
          - asin="THE VERIFIED ASIN"

        **RATING KEYS** (Use these exact keys): filtration, taste, flow, cost, ease, design.

        **CRITICAL REQUIREMENT: AFTER EACH <RankingCard/>, you MUST write a "360° Expert Analysis" block.**
        This is what separates us from generic summary sites. You act as a Data Analyst + Veteran User.
        
        **Structure for each product (REQUIRED):**
        1. **<RankingCard ... />** (The summary card)
        2. **Angle 1: Situation Fit ("How it changes your life")**
           - Headline: \`#### 🌅 【生活が変わる】\${Target Persona}での使い心地\`
           - Content: Describe a specific scenario where this product shines. (e.g. "For commuters, physical buttons > touch sensors").
        3. **Angle 2: Competitor Checkmate ("Why this wins")**
           - Headline: \`#### 🆚 【ライバル比較】同価格帯の定番機と比べて\`
           - Content: Why buy this over the most popular competitor? Be specific.
        4. **Angle 3: Data-Driven Deep Knowledge ("The AI Advantage")**
           - Headline: \`#### 📊 【データ分析】1,000件のレビューから判明した事実\`
           - Content: Cite specific patterns from mass data. (e.g. "While experts praise sound, 30% of users report hinge issues.").
        5. **Honest Caution**
           - Headline: \`#### ⚠️ ここは妥協が必要\`
           - Content: A brutal but helpful truth about what this product lacks.

     8.  **Comparison Table**:
        - \`<ComparisonTable specLabels={{...}} products={[...]} />\`
        - **specLabels**: Select 4 most important specs for "${topic}" (e.g. Size, Weight, Power, Cost). 
        - **Keys**: Use English keys (key1, key2, key3, key4) or descriptive keys.
        - **Values**: Must be in Japanese.
        - **Example**:
          \`\`\`js
          specLabels: { size: "サイズ", weight: "重量", power: "消費電力", cost: "コスパ" }
          products={[
            { rank: 1, name: "製品名", image: "...", asin: "B00xxxx", specs: { size: "Compact", weight: "500g", power: "1200W", cost: "◎" } },
          ]}
          \`\`\`

    9.  **Floating CTA**:
        - \`<FloatingCTA productName="Rank 1 Name" affiliateLink="SEARCH:Rank 1 Name" asin="RANK 1 ASIN" />\`
        - Only for Rank 1 product.

    10. **Conclusion**: 
        - Final recommendation ONLY.
        - **CRITICAL**: Do NOT use bolding (**) anywhere. Plain text only.
        - **CRITICAL**: Every time you mention a product name here, you **MUST** format it as a link to Amazon.
          - **Good**: "静音性なら [ダイニチ HD-RX500A](SEARCH:Dainichi HD-RX500A) がおすすめです。"
        - Include at least links to the Rank 1, 2, and 3 products in the text.
    `;

  const result = await client.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      thinkingConfig: { thinkingLevel: "high" }
    }
  });

  if (!result.candidates || result.candidates.length === 0 || !result.candidates[0].content) {
    console.error("❌ Gemini Generation Failed: No candidates returned.");
    if (result.promptFeedback) {
      console.error("Prompt Feedback:", JSON.stringify(result.promptFeedback, null, 2));
    }
    throw new Error("Gemini API refused to generate content. Safety block?");
  }

  let mdxContent = result.candidates[0].content.parts[0].text;

  // Clean MDX: Extract content from markdown code blocks if present
  const codeBlockMatch = mdxContent.match(/```(?:markdown|mdx)?\n([\s\S]*?)```/);
  if (codeBlockMatch) {
    mdxContent = codeBlockMatch[1];
  }

  // Fallback: If no code blocks, look for the first '---' (start of frontmatter)
  const frontmatterStart = mdxContent.indexOf('---');
  if (frontmatterStart !== -1) {
    mdxContent = mdxContent.substring(frontmatterStart);
  }

  // Final trim
  mdxContent = mdxContent.trim();

  // Strip imports (Next-MDX-Remote handles components via props)
  mdxContent = mdxContent.replace(/^import\s+.*?from\s+['"].*?['"];?\n?/gm, '');

  // --- POST-PROCESSING: Ensure Comparison Table has ASINs ---
  // The AI sometimes forgets to add ASINs to the table. We extract them from RankingCards and inject them.
  const rankToAsin = {};
  const cardRegex = /rank=\{?(\d+)\}?[\s\S]*?asin="([^"]+)"/g;
  let cardMatch;
  while ((cardMatch = cardRegex.exec(mdxContent)) !== null) {
    rankToAsin[cardMatch[1]] = cardMatch[2];
  }

  // Inject into ComparisonTable
  mdxContent = mdxContent.replace(/<ComparisonTable[\s\S]*?\/>/, (tableBlock) => {
    return tableBlock.replace(/rank:\s*(\d+),/g, (match, rank) => {
      if (rankToAsin[rank]) {
        return `rank: ${rank},\n      asin: "${rankToAsin[rank]}",`;
      }
      return match;
    });
  });
  console.log("Fixed ComparisonTable ASINs using RankingCard data.");


  // --- POST-PROCESSING: Normalize Specs using Generic Logic ---
  try {
    mdxContent = mdxContent.replace(/<ComparisonTable([\s\S]*?)\/>/g, (match, props) => {
      // 1. Extract specLabels
      const labelMatch = props.match(/specLabels=\{\{([\s\S]*?)\}\}/);
      const labelsStr = labelMatch ? `{${labelMatch[1]}}` : null;

      // 2. Extract products
      const productsMatch = props.match(/products=\{([\s\S]*?)\}/); // Assumes products={[...]} or products={variable}
      const productsStr = productsMatch ? productsMatch[1] : null;

      if (labelsStr && productsStr) {
        try {
          // Dangerous eval is acceptable here for local AI output parsing
          // We wrap in parentheses to ensure expression evaluation
          const labels = eval(`(${labelsStr})`);
          const products = eval(`(${productsStr})`);

          if (Array.isArray(products)) {
            console.log("Normalizing specs in ComparisonTable...");
            const normalizedProducts = normalizeObjectSpecs(products, labels);

            // Reconstruct the component string
            // Note: JSON.stringify will quote keys, which is fine for JSX prop values if inside {}
            return `<ComparisonTable specLabels={${JSON.stringify(labels)}} products={${JSON.stringify(normalizedProducts)}} />`;
          }
        } catch (e) {
          console.warn("Failed to parse/normalize ComparisonTable props:", e.message);
        }
      }
      return match; // Return original if failed
    });
  } catch (e) {
    console.error("Spec normalization error:", e);
  }


  // CRITICAL: Strip all bold markers (**) to prevent "AI-like" formatting
  mdxContent = mdxContent.replace(/\*\*/g, '');
  console.log("Stripped all markdown bold markers (**).");

  // PHASE 4: Image Download & Replacement
  console.log("Phase 4: Downloading Images & Finalizing... (Semantic Naming Enabled)");

  // Helper for slugify
  const slugify = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\-\.]+/g, '') // Remove non-word chars (allow Japanese)
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start
      .replace(/-+$/, ''); // Trim - from end
  };

  const urlMap = new Map(); // Map originalURL -> filename

  // 1. Extract from RankingCard (Highest Priority for Naming)
  const imgCardRegex = /<RankingCard([\s\S]*?)\/>/g;
  let imgCardMatch;
  while ((imgCardMatch = imgCardRegex.exec(mdxContent)) !== null) {
    const props = imgCardMatch[1];
    const nameMatch = props.match(/name="([^"]+)"/);
    const imageMatch = props.match(/image="(https?:\/\/[^"]+)"/);

    if (nameMatch && imageMatch) {
      const name = nameMatch[1];
      const url = imageMatch[1];
      // Create semantic filename: "rank-1-feature-name.jpg" or just "product-name.jpg"
      // We add a short hash to ensure uniqueness if names are duplicates
      const hash = Math.random().toString(36).substring(2, 6);
      const safeName = slugify(name).substring(0, 50); // Limit length
      const filename = `${safeName}-${hash}.jpg`;

      if (!urlMap.has(url)) {
        urlMap.set(url, filename);
      }
    }
  }

  // 2. Extract remaining images (Fallback)
  const fallbackRegex = /image="(https?:\/\/[^"]+)"/g;
  let fallbackMatch;
  while ((fallbackMatch = fallbackRegex.exec(mdxContent)) !== null) {
    const url = fallbackMatch[1];
    if (!urlMap.has(url)) {
      console.log("  ⚠️ Image found without product name association. Using generic name.");
      const filename = `misc-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      urlMap.set(url, filename);
    }
  }

  // 3. Download and Replace
  const uniqueDownloads = Array.from(urlMap.entries()); // [[url, filename], ...]

  for (const [originalUrl, filename] of uniqueDownloads) {
    const localPath = await downloadImage(originalUrl, filename);
    if (localPath) {
      mdxContent = mdxContent.split(originalUrl).join(`${localPath}?v=${Date.now()}`);
    }
  }

  // --- POST-PROCESSING: Replace SEARCH: links in body with Amazon URLs ---
  mdxContent = mdxContent.replace(/\]\(SEARCH:(.*?)\)/g, (match, query) => {
    const encoded = encodeURIComponent(query);
    const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || "demo-22";
    return `](https://www.amazon.co.jp/s?k=${encoded}&tag=${tag})`;
  });

  // Hero Image (Safe Selection)
  const heroUrl = await getHeroImage(topic);
  if (heroUrl) {
    const heroFilename = `hero-${topProducts[0] ? 'custom' : topic}.png`.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    // Actually simplicity is better: `hero-${topic-safe}.png`
    const safeTopicName = topic.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    // But better to trust the AI's intuition or frontmatter? 
    // The AI put `hero-humidifier.png` in frontmatter.
    // Let's match what we put in frontmatter. 
    // But we don't parse frontmatter here easily. 
    // Let's just use `hero-${safeTopic}.png` and Assume AI does same? 
    // No, AI is unpredictable. 
    // Best: We overwrite the `image:` frontmatter field with OUR filename.

    const safeHeroName = `hero-${Date.now()}.png`; // Unique to avoid collision
    const localHeroPath = await downloadImage(heroUrl, safeHeroName);

    if (localHeroPath) {
      mdxContent = mdxContent.replace(/image:.*\n/, `image: /images/products/${safeHeroName}\n`);
    } else {
      console.warn("[Generator] Hero image download failed. Using default.");
      // Optional: Set to default if needed, or leave as is (which might be broken URL if AI put one)
      // Better to explicitly set a working placeholder if download failed.
      // But wait, the prompt asks AI to put `/images/hero-water.png`.
      // If we don't replace it, it stays as that default.
      // So we are safe.
    }
  }

  return mdxContent;
}

async function saveArticle(content, topic) {
  const dateStr = new Date().toISOString().split('T')[0];
  const safeTopic = topic.replace(/[^a-z0-9\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\s]/gi, '').trim().replace(/\s+/g, '-');
  const filename = `${dateStr}-${safeTopic}.mdx`;
  const filepath = path.join(process.cwd(), 'content', 'posts', filename);

  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`Saved article to ${filepath}`);
}


// Import verification script
import { verifyMdxFiles } from './verify-mdx.mjs';

async function main() {
  const topic = process.argv[2] || '加湿器';

  try {
    await saveArticle(await generateArticle(topic), topic);

    // Run STRICT Quality Gate
    console.log("--- Running Strict Quality Gate ---");
    const { execSync } = await import('child_process');
    execSync('node scripts/check-quality.mjs', { stdio: 'inherit' });
    console.log("✅ Generation & Verification Complete.");
  } catch (e) {
    console.error("❌ GENERATION / VERIFICATION FAILED:", e);
    process.exit(1);
  } finally {
    // Cleanup ExifTool
    if (typeof closeExifTool === 'function') {
      await closeExifTool();
    }
  }
}

main();
