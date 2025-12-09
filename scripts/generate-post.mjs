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
    return relativePath;
  } catch (error) {
    console.warn(`[Imager] Failed to download ${url}: ${error.message}`);
    return null;
  }
}

// --- Main Logic ---

async function generateArticle(topic) {
  console.log(`\n🚀 Starting Generation Pipeline for: ${topic}`);

  // PHASE 1: Candidate Selection
  console.log("Phase 1: Selecting Candidates (AI)...");
  const selectionPrompt = `
    You are a commercial editor for a home appliance magazine.
    Task: Select 8 top-tier "Countertop/Faucet Water Purifiers (浄水器)" available on Amazon Japan.
    
    CRITICAL CONSTRAINTS:
    1. META-ANALYSIS: Simulate a cross-check of "Kakaku.com" and "MyBest". Select products that appear in Top 20 on multiple sites.
    2. USE CASES: ensuring variety:
       - Faucet Mount (e.g. Cleansui, Toray)
       - Pot Type (e.g. Brita)
       - High Performance/Long Life (e.g. Panasonic)
    3. DATA: You must provide the specific ASIN for the main current model.
    4. EXCLUDE: Cartridges only. Must be the main unit.
    
    Return STRICT JSON array of strings only (Product Names).
    Example: ["Panasonic TK-CJ12", "Mitsubishi Cleansui CSP901"]
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
    You are an expert affiliate marketer and copywriter using Gemini 3 Pro.
    
    **YOUR MISSION: Create the Ultimate "Safe & Tasty Water" Ranking.**
    Select items based on **"Use Case"**:
    - High filtration performance (Cleansui/Toray)
    - Easy to use/Pot type (Brita)
    - Long cartridge life (Panasonic)
    
    **Thinking Process (Implicit):**
    1.  Compare specs: Filtration capacity (L), Cartridge life (months), Flow rate.
    2.  Analyze "Real" reviews: Look for "Taste," "Ease of installation," "Flow speed."
    3.  Create a "Meta-Ranking" that balances Cost vs Safety.

    **Task:** Write a high-converting ranking article for "${topic}".
    
    **CRITICAL: USE THESE VERIFIED PRODUCTS (MATCHES REAL MARKET DATA 2025):**
    ${productsContext}
    
    **Output Guidelines:**


    Use the provided ImageURLs below for these specific ASINs.
    
    ${productsContext}

    **Structure & Requirements (MDX)**:
    1.  **Frontmatter**:
        - title: "High CTR Title" (e.g., 【2025年版】水道水が激変！本当に美味しい浄水器おすすめ5選【コスパ最強】)
        - date: ${(new Date()).toISOString().split('T')[0]}
        - description: "Are you buying bottled water? Stop. We compared Mitsubishi, Panasonic, and Brita to find the best water purifier for taste and cost."
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
        - Hook: "Heavy bottles, plastic waste... isn't it time to graduate from bottled water?"
        - Benefit: "Delicious water for cooking and coffee, straight from the tap."

    5.  **Buying Guide**: 
        - **Type**: Faucet vs Pot.
        - **Removal Capacity**: 13+ substances is the standard (JIS S 3201).
        - **Running Cost**: Cost per liter is key (vs bottles).

    6.  **The Ranking (1 to 5)**:
        - Use \`<RankingCard ... />\` for each product.
        - **Props**:
          - rank={N}
          - name="Clean Product Name (e.g. Panasonic TK-CJ12, Cleansui CSP901)"
          - image="The Amazon Image URL provided"
          - rating={4.x}
          - ratings={{ filtration: N, taste: N, flow: N, cost: N, ease: N, design: N }} (1-5 scale)
          - description="**SALES COPY**: Focus on the experience. 'Taste is unrecognizable.' 'Coffee tastes better.' (200-300 chars)"
          - bestFor="Target Persona (e.g. 'Families', 'Cooking lovers')"
          - pros={["Removes 17 substances", "Digital display", "High flow rate"]}
          - cons={["Cartridge is expensive", "Hard to install"]}
          - affiliateLinks={{ amazon: "SEARCH:Product Name", rakuten: "SEARCH:Product Name" }}
          - asin="THE VERIFIED ASIN"

        **RATING KEYS** (Use these exact keys): filtration, taste, flow, cost, ease, design.

    8.  **Comparison Table**:
        - \`<ComparisonTable specLabels={{...}} products={[...]} />\`
        - specLabels: { type: "タイプ", capacity: "ろ過水量", life: "カートリッジ寿命", cost: "ランニングコスト" }
        - **IMPORTANT**: Each product object MUST include the \`asin\` field.
        - **Example**:
          \`\`\`js
          products={[
            { rank: 1, name: "Model A", image: "...", asin: "B00xxxx", specs: {...} },
            { rank: 2, name: "Model B", image: "...", asin: "B00yyyy", specs: {...} }
          ]}
          \`\`\`

    9.  **Floating CTA**:
        - \`<FloatingCTA productName="Rank 1 Name" affiliateLink="SEARCH:Rank 1 Name" asin="RANK 1 ASIN" />\`
        - Only for Rank 1 product.

    10. **Conclusion**: 
        - Final recommendation.
        - **MANDATORY**: Include a text-based link to the Rank 1 product in the body text (e.g. "If you are unsure, [Product Name] is the best choice.").
    `;

  const result = await client.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      thinkingConfig: { thinkingLevel: "low" }
    }
  });

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

  // PHASE 4: Image Download & Replacement
  console.log("Phase 4: Downloading Images & Finalizing...");

  const urlRegex = /image="(https?:\/\/[^"]+)"/g;
  let match;
  const downloads = [];
  while ((match = urlRegex.exec(mdxContent)) !== null) {
    const originalUrl = match[1];
    const filename = `prod-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    downloads.push({ originalUrl, filename });
  }

  const uniqueDownloads = [...new Map(downloads.map(item => [item.originalUrl, item])).values()];

  for (const { originalUrl, filename } of uniqueDownloads) {
    const localPath = await downloadImage(originalUrl, filename);
    if (localPath) {
      mdxContent = mdxContent.split(originalUrl).join(`${localPath}?v=${Date.now()}`);
    }
  }

  // Hero Image for Water Purifier
  const heroUrl = await getHeroImage("modern kitchen water faucet purifier clean water glass");
  if (heroUrl) {
    await downloadImage(heroUrl, 'hero-water.png');
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
  await saveArticle(await generateArticle('家庭用浄水器'), '家庭用浄水器');

  // Run verification
  console.log("--- Running Final Verification ---");
  verifyMdxFiles();
}

main();
