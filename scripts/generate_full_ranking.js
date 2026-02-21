const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Configuration
const TARGET_KEYWORD = process.argv[2] || "best-wireless-headphones-2025";
const PRODUCTS_JSON_PATH = path.resolve(__dirname, '../src/data/products.json');

// 2. Dynamic Selection Logic (Theme-Based)
function getScore(product, specLabel) {
    const spec = product.specs.find(s => s.label === specLabel);
    if (!spec) return 0;
    const val = spec.value;
    if (val.includes('SS')) return 6;
    if (val.includes('S+')) return 5.5;
    if (val.includes('S')) return 5;
    if (val.includes('A')) return 4;
    if (val.includes('B')) return 3;
    if (val.includes('C')) return 2;
    return 3; // Default
}

function selectDynamicLineup(keywordArg, products) {
    const keyword = keywordArg.toLowerCase();
    console.log(`\n剥 Analyzing Theme for: "${keywordArg}"...`);
    let weights = { sound: 1, anc: 1, battery: 1, comfort: 1 }; // Default Balance

    // Theme Detection
    if (keyword.includes('騾壼共') || keyword.includes('髮ｻ霆・) || keyword.includes('commute')) {
        console.log("  痩 Theme Detected: [Commuting] (Prioritizing ANC & Comfort)");
        weights.anc = 2.0;     // Noise Cancelling is King
        weights.comfort = 1.5; // Long wear
    } else if (keyword.includes('髻ｳ雉ｪ') || keyword.includes('music')) {
        console.log("  痩 Theme Detected: [Audiophile] (Prioritizing Sound Quality)");
        weights.sound = 2.0;
    } else if (keyword.includes('莨夊ｭｰ') || keyword.includes('meeting') || keyword.includes('zoom')) {
        console.log("  痩 Theme Detected: [Work/Zoom] (Prioritizing Mic & Comfort)");
        // Note: We don't have explicit 'Mic' spec in JSON yet, so proxy with 'comfort' + specific models if we had 'mic' tag
        weights.comfort = 2.0;
    }

    // Filter & Score
    const scoredProducts = products
        .filter(p => p.subCategory === 'wireless-headphones') // Hardcoded for now, ideally dynamic
        .map(p => {
            const sSound = getScore(p, '髻ｳ雉ｪ');
            const sAnc = getScore(p, '繝弱う繧ｭ繝｣繝ｳ');
            const sBat = getScore(p, '繝舌ャ繝・Μ繝ｼ');

            // Calculate Weighted Score
            const score = (sSound * weights.sound) + (sAnc * weights.anc) + (sBat * weights.battery);

            return { ...p, _score: score };
        })
        .sort((a, b) => b._score - a._score) // Descending
        .slice(0, 5); // Top 5

    console.log(`  笨・Selected Top 5 Products based on Score:`);
    scoredProducts.forEach((p, i) => console.log(`    ${i + 1}. ${p.name} (Score: ${p._score})`));

    return scoredProducts.map(p => ({ name: p.name, id: p.id }));
}

// Load Products
let productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf-8'));
console.log(`Debug: Loaded ${productsData.length} products.`);
const xm6 = productsData.find(p => p.id === 'sony-wh-1000xm6');
if (xm6) console.log("Debug: Found XM6 in data:", xm6.name);
else console.log("Debug: XM6 NOT FOUND in data.");

const TARGET_LINEUP = selectDynamicLineup(TARGET_KEYWORD, productsData);

console.log(`\n=== 噫 Starting Full Generation for: ${TARGET_KEYWORD} ===\n`);

// 3. Verification Phase
console.log("--> Phase 1: Amazon Direct Verification (High Profit Mode)...");

let verifiedCount = 0;
const validatedLineup = [];

for (const item of TARGET_LINEUP) {
    console.log(`\nVerifying: ${item.name}...`);
    try {
        // Run the verify script we created
        // Note: Using node to run the script synchronously
        const resultJson = execSync(`node scripts/verify_amazon_product.js "${item.name}"`).toString();
        const result = JSON.parse(resultJson);

        if (result.found) {
            console.log(`  笨・FOUND! ASIN: ${result.asin}`);
            console.log(`  萄 Image: ${result.imageUrl}`);

            // 4. Update JSON Database immediately
            const productIndex = productsData.findIndex(p => p.id === item.id);
            if (productIndex !== -1) {
                productsData[productIndex].affiliateLinks.amazon = result.link;
                if (!productsData[productIndex].image.startsWith('/')) {
                    // Only overwrite if not a local image, OR if we want to force Amazon image
                    productsData[productIndex].image = result.imageUrl;
                }
                // Force Amazon Image for 'High Profit' (User request)
                productsData[productIndex].image = result.imageUrl;
                productsData[productIndex].asin = result.asin;
                validatedLineup.push(item); // Add to validated list
                // Store scraped real data for AI Context (Phase 6: Recursive Research)
                productsData[productIndex].realFeatures = result.features || [];
                productsData[productIndex].realDescription = result.description || "";
                productsData[productIndex].realSpecs = result.specs || {};

                // Ensure Affiliate Link is valid (Phase 6)
                if (!productsData[productIndex].affiliateLinks) productsData[productIndex].affiliateLinks = {};
                productsData[productIndex].affiliateLinks.amazon = `https://www.amazon.co.jp/dp/${result.asin}?tag=bestchoice-22`;
            } else {
                console.warn(`  笞・・Product ID ${item.id} not found in JSON. Skipping update.`);
            }
            verifiedCount++;
        } else {
            console.log(`  笶・NOT FOUND on Amazon. (Reason: ${result.reason})`);
            // Strategy: "No Amazon, No Ranking" -> User said "Exclude".
            // For now, we warn. Implementation detail: Remove from list?
        }
    } catch (e) {
        console.error(`  笞・・Script Error: ${e.message}`);
    }
}

// Save Updated JSON
fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(productsData, null, 4));
console.log("\n--> Phase 1 Complete. Products database updated.");

// Define FINAL_LINEUP for Phase 2
const FINAL_LINEUP = validatedLineup;
console.log(`Debug: Validated ${FINAL_LINEUP.length} products for generation.`);


// 5. Content Generation Phase (Using AI Persona Strategy)
console.log("\n--> Phase 2: Generating Content (AI Persona Strategy)...");


const { generateRankingArticle, generateReviewPage, updateDatabase } = require('./lib/generator');
const ai_writer = require('./lib/ai_writer');

// Reload products data to get the latest (verified) state (This reload is now less critical as productsData was updated in place)
productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf-8'));

// 5a. Generate Main Ranking Article (Buying Guide)
// Wrap in async function to handle await in CommonJS
(async () => {
    try {
        console.log(`  Generating SEO Metadata for: ${TARGET_KEYWORD}...`);
        // Use NULL for productName to trigger "General/Ranking" context in ai_writer
        const seoMetadata = await ai_writer.generateSeoMetadata(TARGET_KEYWORD, null);
        console.log(`  笨ｨ SEO Title: ${seoMetadata.title}`);

        console.log(`  Generating Ranking Article (Buying Guide): ${TARGET_KEYWORD}...`);

        // Filter products to ONLY pass the FINAL_LINEUP to the AI Writer
        const targetProductsData = FINAL_LINEUP.map(t => productsData.find(p => p.id === t.id)).filter(Boolean);

        const buyingGuideBody = await ai_writer.generateBuyingGuideBody(TARGET_KEYWORD, targetProductsData);

        // --- AI Thumbnail Generation (Phase 7) ---
        let finalThumbnailPath = null;
        try {
            console.log(`  耳 Requesting AI Thumbnail for "${TARGET_KEYWORD}"...`);
            const base64Image = await ai_writer.generateBlogThumbnail(TARGET_KEYWORD);

            if (base64Image) {
                const publicImgDir = path.resolve(__dirname, '../public/images/articles');
                if (!fs.existsSync(publicImgDir)) fs.mkdirSync(publicImgDir, { recursive: true });

                const imgFileName = `${TARGET_KEYWORD}-thumbnail.jpg`;
                const imgFullPath = path.join(publicImgDir, imgFileName);

                // Write Base64 to file
                fs.writeFileSync(imgFullPath, Buffer.from(base64Image, 'base64'));
                finalThumbnailPath = `/images/articles/${imgFileName}`;
                console.log(`  萄 AI Thumbnail Saved: ${finalThumbnailPath}`);
            } else {
                console.log("  笞・・AI Thumbnail skipped (No data returned), using Top Product Image.");
            }
        } catch (imgError) {
            console.warn("  笞・・AI Thumbnail Workflow Failed:", imgError.message);
        }

        generateRankingArticle(TARGET_KEYWORD, FINAL_LINEUP, productsData, buyingGuideBody, seoMetadata, finalThumbnailPath);

        // 5b. Generate Individual Review Pages
        console.log(`  Generating ${FINAL_LINEUP.length} Review Pages...`);
        for (let i = 0; i < FINAL_LINEUP.length; i++) {
            const item = FINAL_LINEUP[i];
            const productData = productsData.find(p => p.id === item.id);

            if (productData) {
                // Competitor: Next rank in FINAL_LINEUP, or Rank 1 if last
                const competitorId = FINAL_LINEUP[i + 1] ? FINAL_LINEUP[i + 1].id : FINAL_LINEUP[0].id;
                const competitorProduct = productsData.find(p => p.id === competitorId);
                const competitor = competitorProduct ? competitorProduct.name : "Unknown Competitor";

                console.log(`  generating review for ${productData.name}...`);
                const reviewBody = await ai_writer.generateReviewBody(productData, competitor);
                generateReviewPage(productData, reviewBody);
            }
        }

        // 5c. Update Database
        console.log(`  Updating Database...`);
        updateDatabase(TARGET_KEYWORD, FINAL_LINEUP, productsData, seoMetadata);

        console.log(`\n=== 脂 All Done. Validated ${FINAL_LINEUP.length} products & Generated 6 Articles & DB Updated. ===\n`);
    } catch (e) {
        console.error("笶・Fatal Error in Async Generation:", e);
        process.exit(1);
    }
})();
