import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyProducts, getHeroImage } from './verify_products.mjs';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is not set in .env.local");
  process.exit(1);
}
const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// --- Helper Functions ---

async function downloadImage(url, filename) {
  if (!url || !url.startsWith('http')) return null;
  try {
    // Basic Fetch with simple headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Filter out 1x1 pixels (usually < 100 bytes)
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
    return relativePath;
  } catch (error) {
    console.warn(`[Imager] Failed to download ${url}: ${error.message}`);
    return null;
  }
}

import { verifyProducts, getHeroImage } from './verify_products.mjs';

// ... (previous imports)

// ...

async function generateHeroImage(topic) {
  try {
    const heroUrl = await getHeroImage(topic);
    if (heroUrl) {
      const filename = `hero-${topic.replace(/\s+/g, '-')}.jpg`;
      const localPath = await downloadImage(heroUrl, filename);
      if (localPath) return localPath;
    }
    console.warn("Failed to download hero image, using fallback.");
    return "/images/hero-shampoo.png"; // Ultimate fallback
  } catch (e) {
    console.warn("Hero generation failed:", e);
    return "/images/hero-shampoo.png";
  }
}

// --- Main Logic ---

async function generateArticle(topic) {
  console.log(`\n🚀 Starting Generation Pipeline for: ${topic}`);

  // PHASE 1: Candidate Selection
  console.log("Phase 1: Selecting Candidates (AI)...");
  const selectionPrompt = `
    You are a commercial editor for a high-end electronics magazine.
    Task: Select 8 top-tier "High-Spec Hair Dryers" available on Amazon Japan.
    
    CRITICAL CONSTRAINTS:
    1. META-ANALYSIS: Simulate a cross-check of "Kakaku.com" and "MyBest". Select products that appear in Top 20 on multiple sites.
    2. USE CASES: ensuring variety:
       - Speed Freak (e.g. Dyson, Panasonic Nanocare)
       - Damage Care/Gloss (e.g. ReFa, Bioprogramming/Repronizer)
       - Lightweight/Travel (e.g. Kinijo, Salonia)
    3. DATA: You must provide the specific ASIN for the main current model (JP Plug).
    
    Return STRICT JSON array of strings only (Product Names).
    Example: ["Panasonic Nanocare EH-NA0J", "Dyson Supersonic Shine"]
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
    throw new Error("Failed to verify enough products with images. Check scraper.");
  }

  // PHASE 3: Content Generation with VERIFIED Data
  console.log("Phase 3: Writing Article with Verified Data...");

  // Construct context string
  // Use image from scraper (Guaranteed to be present now)
  const productsContext = topProducts.map((p, i) => `
    Rank ${i + 1}:
    Name: ${p.verifiedName} (Original: ${p.originalName})
    ASIN: ${p.asin}
    ImageURL: ${p.image}
    `).join('\n');

  const prompt = `
    You are an expert affiliate marketer and copywriter using Gemini 3 Pro.
    
    **YOUR MISSION: Create the Ultimate "Fail-Proof" Hair Dryer Ranking.**
    Do not just list popular items. Select items based on **"Use Case"**:
    - Speed freak (Dyson/Panasonic)
    - Damage care (Bioprogramming/ReFa)
    - Lightweight/Travel (Kinijo/Salonia)
    
    **Thinking Process (Implicit):**
    1.  Compare specs: Airflow (m3/min), Weight (g), Temp Control.
    2.  Analyze "Real" reviews: Ignore paid influencers. Look for "Heavy," "Loud," "Buttons hard to press."
    3.  Create a "Meta-Ranking" that balances Performance vs Price.

    **Task:** Write a high-converting ranking article for "${topic}".
    
    **CRITICAL: USE THESE VERIFIED PRODUCTS ONLY.**
    Do NOT invent products. Do NOT change the ASINs. Use the provided ImageURLs.
    
    ${productsContext}

    **Structure & Requirements (MDX)**:
    1.  **Frontmatter**:
        - title: "High CTR Title" (e.g., 【2025年最新】美容師が選ぶ！速乾＆ツヤ髪ドライヤー神7選【比較】)
        - date: ${(new Date()).toISOString().split('T')[0]}
        - description: "Compare top models from Panasonic, Dyson, ReFa. Speed, Weight, and Finish verified."
        - image: /images/hero-dryer.png

    2.  **Imports**:
        - \`import { RankingCard } from '@/components/affiliate/RankingCard';\`
        - \`import { ComparisonTable } from '@/components/affiliate/ComparisonTable';\`
        - \`import { QuickSummary } from '@/components/affiliate/QuickSummary';\`
        - \`import { FloatingCTA } from '@/components/ui/FloatingCTA';\`

    3.  **QuickSummary**:
        - Use \`<QuickSummary products={[...]} />\`.
        - **Fields**: rank, name, image, rating, price, id, asin.

    4.  **Intro**: 
        - Hook: "Does drying hair take forever?" "Is heat damaging your ends?"

    5.  **Buying Guide**: 
        - **Airflow**: 1.5m3/min+ is standards.
        - **Weight**: Under 500g is best for long hair.
        - **Technology**: Ion, Far Infrared, etc.

    6.  **The Ranking (1 to 5)**:
        - Use \`<RankingCard ... />\` for each product.
        - **Props**:
          - rank={N}
          - name="Clean Product Name (e.g. Panasonic Nanocare NE0E, ReFa Beautech)"
          - image="The Amazon Image URL provided"
          - rating={4.x}
          - ratings={{ airflow: N, weight: N, heatControl: N, care: N, quietness: N, design: N }} (1-5 scale)
          - description="**SALES COPY**: Focus on the experience. 'Dries in 3 mins.' 'Salon finish at home.' (200-300 chars)"
          - bestFor="Target Persona (e.g. 'Long hair users', 'Frizzy hair')"
          - pros={["Quick Dry", "Lightweight", "Scalp Mode"]}
          - cons={["Expensive", "Code length", "Loud"]}
          - affiliateLinks={{ amazon: "SEARCH:Product Name", rakuten: "SEARCH:Product Name" }}
          - asin="THE VERIFIED ASIN"

        **RATING KEYS MAPPING**: airflow(風量), weight(軽さ), heatControl(温度調節), care(ケア効果), quietness(静音性), design(デザイン)

    7.  **Comparison Table**:
        - \`<ComparisonTable specLabels={{...}} products={[...]} />\`
        - specLabels: { airflow: "風量", weight: "重量", mode: "モード", price: "価格" }
        - products objects must match RankingCard data.
        - **specs**: { airflow: "1.6m3", weight: "550g", mode: "Scalp/Hot/Cold", price: "¥38,000" } (Use strings for specs)

    8.  **Floating CTA**:
        - \`<FloatingCTA productName="Rank 1 Name" affiliateLink="SEARCH:Rank 1 Name" asin="RANK 1 ASIN" />\`
        - Only for Rank 1 product.

    9.  **Conclusion**: Final recommendation.
    `;

  const result = await client.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      thinkingConfig: { thinkingLevel: "low" }
    }
  });

  let mdxContent = result.candidates[0].content.parts[0].text;

  // Clean MDX
  mdxContent = mdxContent.replace(/^```(markdown|mdx)?\n/, '').replace(/\n```$/, '');

  // PHASE 4: Image Download & Replacement
  console.log("Phase 4: Downloading Images & Finalizing...");

  // 4a. Hero Image Strategy
  // 4a. Hero Image Strategy
  // const heroPath = await generateHeroImage(topic);
  // if (heroPath) {
  //   // Replace the placeholder in frontmatter
  //   mdxContent = mdxContent.replace(/image: \/images\/hero-.*\.png/, `image: ${heroPath}`);
  // }

  const urlRegex = /image="(https?:\/\/[^"]+)"/g;
  let match;
  const downloads = [];
  while ((match = urlRegex.exec(mdxContent)) !== null) {
    const originalUrl = match[1];
    const filename = `prod-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    downloads.push({ originalUrl, filename });
  }

  // Deduplicate downloads
  const uniqueDownloads = [...new Map(downloads.map(item => [item.originalUrl, item])).values()];

  for (const { originalUrl, filename } of uniqueDownloads) {
    const localPath = await downloadImage(originalUrl, filename);
    if (localPath) {
      // Replace ALL occurrences of this URL
      mdxContent = mdxContent.split(originalUrl).join(`${localPath}?v=${Date.now()}`);
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

async function main() {
  await saveArticle(await generateArticle('最新ヘアドライヤー'), '最新ヘアドライヤー');
}

main();
