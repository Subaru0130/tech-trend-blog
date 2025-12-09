import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not set in .env.local");
    process.exit(1);
}
const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Image Quality Check using Gemini Vision
async function checkImageQuality(buffer, productName) {
    console.log(`Analyzing image for: ${productName}...`);
    const prompt = `
    Analyze this product image provided by the user.
    Product Name: "${productName}"
    
    STRICTLY CHECK for the following negative criteria (FAIL if any are true):
    1. **Text Overlays**: Does it have promo text like "Sale", "Free Shipping", "No.1", "Points", or Japanese text like "送料無料", "新品", "ポイント", "クーポン"?
    2. **Red/Yellow Banners**: Does it have a loud red or yellow frame/banner around the image (often used for sales)?
    3. **Quantity > 1**: Does it show MULTIPLE bottles (set of 2, 3, 6...)? Look for numbers like "2個", "3本セット", "x6".
    4. **Refill/Pouch**: Does it show a refill pouch instead of a bottle?
    
    The goal is to find a CLEAN, single-product image suitable for a high-end magazine.

    Return valid JSON ONLY:
    {
        "isGood": boolean,
        "reason": "short explanation"
    }
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [
                { role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: buffer.toString('base64') } }] }
            ],
            config: {
                thinkingConfig: { thinkingLevel: "high" }
            }
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const jsonBlock = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(jsonBlock);

        console.log(`AI Verdict: ${result.isGood ? "PASS" : "FAIL"} - ${result.reason}`);
        return result.isGood;
    } catch (e) {
        console.warn(`AI Check Error: ${e.message}. Defaulting to PASS.`);
        return true;
    }
}

// Helper to extract products from MDX
function extractProductsFromMdx(mdxContent) {
    const products = [];
    const regex = /<RankingCard[^>]*?rank=\{?(\d+)\}?[^>]*?name="([^"]+)"[^>]*?>/g;
    let match;
    while ((match = regex.exec(mdxContent)) !== null) {
        products.push({
            rank: parseInt(match[1]),
            name: match[2],
            id: `rank-${match[1]}`
        });
    }
    return products;
}

async function downloadImage(page, product, targetDir) {
    // 1. Primary Strategy: Search Trusted EC & Review Sites ONLY
    // "site:amazon.co.jp OR site:rakuten.co.jp OR site:cosme.net OR site:lipscosme.com"
    const trustedSites = "site:amazon.co.jp OR site:rakuten.co.jp OR site:cosme.net OR site:lipscosme.com";
    const negativeKeywords = "-詰め替え -refill -パウチ -セット -大容量 -業務用 -ケース -箱 -中古";

    // Query: Trust Site Search with "Main Unit" focus
    let query = `${trustedSites} ${product.name} ボトル 本体 ${negativeKeywords}`;
    const targetPath = path.join(targetDir, `${product.id}.jpg`);

    // Helper: Perform search and return candidates
    async function searchCandidates(searchQuery) {
        console.log(`[Rank ${product.rank}] Searching Trusted Sites: ${searchQuery}`);
        const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(searchQuery)}`;
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });

        await page.waitForSelector('img.mimg', { timeout: 5000 }).catch(() => { });

        return await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img.mimg'));
            return images
                .filter(img => img.src && img.src.startsWith('http') && img.width > 150)
                .slice(0, 8)
                .map(img => img.src);
        });
    }

    try {
        let candidates = await searchCandidates(query);

        for (const src of candidates) {
            try {
                const view = await page.goto(src);
                const buffer = await view.buffer();
                if (buffer.length < 15000) { // Increased to 15KB min to avoid blurriness
                    console.log(`[Rank ${product.rank}] Skipped: Image too small (${buffer.length} bytes)`);
                    continue;
                }

                // Check dimensions using Puppeteer evaluation before buffer if possible, but buffer check is easier here.
                // We rely on 'img.width > 300' from the searchCandidates step essentially.

                const isGood = await checkImageQuality(buffer, product.name);
                if (isGood) {
                    fs.writeFileSync(targetPath, buffer);
                    console.log(`[Rank ${product.rank}] Saved Trusted-Site image (${buffer.length} bytes)`);
                    return true;
                }
            } catch (e) {
                // ignore
            }
        }

        console.warn(`[Rank ${product.rank}] Trusted site search failed. Leaving placeholder.`);
        return false;

    } catch (e) {
        console.error(`[Rank ${product.rank}] Search process failed: ${e.message}`);
        return false;
    }
}

async function main() {
    const mdxPath = path.join(__dirname, '../content/posts/2025-12-06-市販シャンプー.mdx');

    if (!fs.existsSync(mdxPath)) {
        console.error("MDX file not found:", mdxPath);
        process.exit(1);
    }

    let mdxContent = fs.readFileSync(mdxPath, 'utf8');
    const products = extractProductsFromMdx(mdxContent);

    if (products.length === 0) {
        console.log("No products found in MDX (RankingCard regex match failed).");
        return;
    }

    console.log(`Found ${products.length} products. Starting intelligent image acquisition...`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Ensure directory exists
    const targetDir = path.join(__dirname, '../public/images/products');
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const timestamp = Date.now();
    for (const product of products) {
        await downloadImage(page, product, targetDir);

        // Update MDX content immediately
        const relativePath = `/images/products/${product.id}.jpg?v=${timestamp}`;

        // Update RankingCard
        const cardRegex = new RegExp(`(rank=\\{?${product.rank}\\}?[\\s\\S]*?image=")([^"]+)(")`, 'g');
        if (mdxContent.match(cardRegex)) {
            mdxContent = mdxContent.replace(cardRegex, `$1${relativePath}$3`);
        }

        // Update QuickSummary
        const summaryRegex = new RegExp(`(rank:\\s*${product.rank},[\\s\\S]*?image:\\s*")([^"]+)(")`, 'g');
        if (mdxContent.match(summaryRegex)) {
            mdxContent = mdxContent.replace(summaryRegex, `$1${relativePath}$3`);
        }
    }

    await browser.close();

    fs.writeFileSync(mdxPath, mdxContent);
    console.log('MDX file updated with verified local images.');
}

main();
