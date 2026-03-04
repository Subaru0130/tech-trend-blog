/**
 * 🏭 Produce Article from Blueprint (Enhanced Auto-Discovery Version)
 * * [役割]
 * 指定されたBlueprint（JSON）に従って、記事を全自動生成します。
 * 
 * * [ユーザーの要望への対応]
 * 1. "generate_full_ranking.js" のロジックをベースにしています。
 * 2. データ不足時のみ、裏で "amazon_scout" (旧 search_amazon_candidates相当) を呼び出して商品を補充します。
 * 3. 1万円台、骨伝導などの条件を厳密に守ります。
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { execSync, spawn } = require('child_process');
const ai_writer = require('./lib/ai_writer');
const { scoutAmazonProducts, scrapeProductReviews, scrapeAmazonProductSpecs } = require('./lib/amazon_scout'); // ★ The "Missing Link"
const { generateRankingArticle, generateReviewPage, updateDatabase, keywordToEnglishSlug } = require('./lib/generator');
const { processAffiliateLinks, processAmazonLink } = require('./lib/affiliate_processor'); // ★ Affiliate tag processor
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { normalizeSpecs } = require('./lib/spec_normalizer.js');
const http = require('http');

// ★ Auto-start Chrome with Remote Debugging if not running
let chromeProcess = null;

async function ensureChromeDebugMode() {
    // Helper to check debug port
    const checkPort = () => new Promise((resolve) => {
        const req = http.get('http://127.0.0.1:9222/json/version', (res) => {
            resolve(true);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(2000, () => { req.destroy(); resolve(false); });
    });

    // First check
    if (await checkPort()) {
        console.log('✅ Chrome remote debugging already active');
        return true;
    }

    // Not available - try to start Chrome with Main Profile (Robust Method)
    console.log('🚀 Starting Chrome with remote debugging (Main Profile)...');

    // kill existing chrome to ensure port 9222 ownership and no profile locks
    try {
        const stdout = execSync('tasklist /FI "IMAGENAME eq chrome.exe" /NH').toString();
        if (stdout.includes('chrome.exe')) {
            console.log('      ⚠️ Standard Chrome might be running. Killing to ensure Debug Mode...');
            try { execSync('taskkill /F /IM chrome.exe'); } catch (e) { }
            await new Promise(r => setTimeout(r, 2000));
        }
    } catch (e) { /* ignore */ }

    // Launch with Default Profile via Batch File (Robust method)
    // This avoids all quoting issues with Node.js -> PowerShell
    console.log("   🚀 Launching Chrome via scripts\\start_chrome_quiet.bat...");
    const batPath = path.join(__dirname, 'start_chrome_quiet.bat');
    try {
        execSync(`"${batPath}"`, { stdio: 'inherit' });
    } catch (e) {
        console.log(`   ⚠️ Startup script warning: ${e.message}`);
    }

    // Wait for Chrome to start
    console.log('   ⏳ Waiting for Chrome to start (timeout: 90s)...');
    for (let i = 0; i < 90; i++) {
        await new Promise(r => setTimeout(r, 1000));
        if (await checkPort()) {
            console.log('✅ Chrome started with remote debugging on port 9222');
            return true;
        }
    }

    console.log('❌ Failed to start Chrome in debug mode.');
    return false;
}


// Gemini AI for product filtering
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const filterModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); // Fast model for filtering

// 1. Configuration
const JSON_FILE = process.argv[2];
const TARGET_KEYWORD = process.argv[3];
const FORCE_REVIEWS = process.argv.includes('--force-reviews'); // ★ Force regeneration of review pages
const PRODUCTS_JSON_PATH = path.resolve(__dirname, '../src/data/products.json');

if (!JSON_FILE || !TARGET_KEYWORD) {
    console.error("❌ Usage: node scripts/produce_from_blueprint.js <JSON_FILE> <KEYWORD> [--force-reviews]");
    process.exit(1);
}

// 2. Load Blueprint Data
console.log(`\n📂 Loading Blueprint for: "${TARGET_KEYWORD}"`);
let blueprints = [];
try {
    blueprints = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
} catch (e) {
    console.error("Error loading JSON:", e.message);
    process.exit(1);
}

const targetEntry = blueprints.find(b => b.keyword === TARGET_KEYWORD);
if (!targetEntry) {
    console.error("❌ Blueprint not found in JSON.");
    process.exit(1);
}
const BLUEPRINT = targetEntry.blueprint;
console.log(`   Target Reader: ${BLUEPRINT.target_reader}`);
console.log(`   Hook: ${BLUEPRINT.sales_hook}`);


// Deduce Target Spec Labels (for AI to generate consistent columns)
const { generateDefaultLabels, generateSitemap } = require('./lib/generator');
const targetLabels = generateDefaultLabels(TARGET_KEYWORD, BLUEPRINT);
console.log(`🎯 Target Spec Labels: ${JSON.stringify(targetLabels)}`);

// ★ CRITICAL: Override Blueprint Title to ensure honesty
// Remove "Pro approved", "Expert", "Definitive Edition" if they are not true
// Enforce the specific situation in the title
if (BLUEPRINT.title) {
    let safeTitle = BLUEPRINT.title;
    const bannedPhrases = ['プロも認めた', '専門家が選ぶ', '徹底取材', '決定版'];
    bannedPhrases.forEach(phrase => {
        if (safeTitle.includes(phrase)) {
            console.log(`   ⚠️ Removing fake authority claim: "${phrase}"`);
            safeTitle = safeTitle.replace(phrase, '【必見】');
        }
    });
    // Ensure situation is in title
    if (BLUEPRINT.situation_category && !safeTitle.includes(BLUEPRINT.situation_category)) {
        console.log(`   ⚠️ Injecting situation into title: "${BLUEPRINT.situation_category}"`);
        safeTitle = `【${BLUEPRINT.situation_category}】${safeTitle}`;
    }
    BLUEPRINT.title = safeTitle;
    console.log(`   📝 Final Title: ${BLUEPRINT.title}`);
}

/**
 * Auto-detect product category from keyword for universal category support
 */
function detectCategoryFromKeyword(keyword) {
    const kw = keyword.toLowerCase();

    // Audio
    if (kw.match(/イヤホン|ヘッドホン|earphone|headphone|スピーカー|speaker/)) return 'audio';

    // Home Appliances
    if (kw.match(/冷蔵庫|洗濯機|エアコン|掃除機|炊飯器|電子レンジ|ドライヤー|空気清浄機/)) return 'home-appliances';

    // Camera
    if (kw.match(/カメラ|camera|レンズ|lens|一眼/)) return 'camera';

    // Electronics
    if (kw.match(/pc|パソコン|laptop|タブレット|スマホ|モニター|キーボード/)) return 'electronics';

    // Beauty & Health
    if (kw.match(/美容|ドライヤー|シェーバー|脱毛|マッサージ/)) return 'beauty-health';

    return 'general';
}


// 3. Helper Functions (Filtering Logic)

function parsePrice(priceStr) {
    if (!priceStr) return 999999;
    if (typeof priceStr === 'number') return priceStr;
    return parseInt(priceStr.toString().replace(/[^0-9]/g, ''), 10);
}

function filterProductsByPrice(products, keyword) {
    let filtered = products;
    const underMatch = keyword.match(/(\d+)円以下/);
    if (underMatch) {
        const limit = parseInt(underMatch[1], 10);
        filtered = filtered.filter(p => {
            // Allow market research products to pass (price verified later)
            if (p.marketScore && p.marketScore > 0) return true;
            return parsePrice(p.price) <= limit;
        });
    }

    const underManMatch = keyword.match(/(\d+)万円以下/);
    if (underManMatch) {
        const limit = parseInt(underManMatch[1], 10) * 10000;
        filtered = filtered.filter(p => {
            if (p.marketScore && p.marketScore > 0) return true;
            return parsePrice(p.price) <= limit;
        });
    }

    const rangeMatch = keyword.match(/(\d+)万円台/);
    if (rangeMatch) {
        const base = parseInt(rangeMatch[1], 10) * 10000;
        const lower = base;
        const upper = base + 9999;
        filtered = filtered.filter(p => {
            const price = parsePrice(p.price) || p.priceVal || 0;

            // If price is unknown (0 or very high default), allow through for later verification
            if (price === 0 || price === 999999) {
                console.log(`   🔍 Price unknown: "${p.name?.slice(0, 30)}..." - allowing for later check`);
                return true;
            }

            // For products WITH known price, apply strict range check
            const inRange = price >= lower && price <= upper;
            if (!inRange) {
                console.log(`   ❌ Price out of range: "${p.name?.slice(0, 30)}..." ¥${price}`);
            }
            return inRange;
        });
        console.log(`   ✅ Price filter (${lower}〜${upper}円): ${filtered.length} products remain`);
    }
    return filtered;
}

/**
 * 🤖 Generic AI Product Filter
 * Works for ANY category: earphones, headphones, refrigerators, etc.
 * No hardcoded rules - AI decides based on keyword, title, and specs.
 */
async function filterProductsWithAI(products, keyword, blueprint, requiredFeatures = []) {
    console.log(`   🤖 AI Filtering ${products.length} products for "${keyword}"...`);
    if (requiredFeatures.length > 0) {
        console.log(`      Criteria: Must have [${requiredFeatures.join(', ')}]`);
    }

    if (products.length === 0) return [];

    const approved = [];
    const batchSize = 5; // Process in batches to reduce API calls

    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);

        const prompt = `
あなたは商品カテゴリフィルタリングの専門家です。記事テーマと商品カテゴリが一致しない商品を除外してください。

【記事キーワード】${keyword}

以下の商品それぞれについて、カテゴリが記事テーマと一致するか判定してください。

${batch.map((p, idx) => `
---
商品${idx + 1}:
名前: ${p.name || 'Unknown'}
スペック情報: ${JSON.stringify(p.kakakuSpecs || {}, null, 0).slice(0, 1000)}
---
`).join('')}

判定基準:
1. **カテゴリ一致**: 記事テーマ「${keyword}」にふさわしいカテゴリか？
   - 「イヤホン」ならヘッドホンは不可。
   - 「ワイヤレス」なら有線は不可。
2. **必須機能の有無**: 以下の機能を持っているか？
   【必須機能リスト】: ${requiredFeatures.length > 0 ? requiredFeatures.join(', ') : '特になし'}
   - スペック情報から推測してください（例: "IPX4" → "防水あり"と判断してOK）。
   - 家具や家電の場合も、スペック値から判断してください。

回答形式 (JSON配列のみ):
[true, false, true, true, false]

回答形式 (JSON配列のみ):
[true, false, true, true, false]

各要素は対応する商品が記事のカテゴリに一致する(true)か不一致(false)かを示します。
必ず${batch.length}個の要素を含む配列を返してください。
`;

        try {
            const result = await filterModel.generateContent(prompt);
            let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

            // Parse the JSON array
            const decisions = JSON.parse(text);

            for (let j = 0; j < batch.length; j++) {
                if (decisions[j] === true) {
                    approved.push(batch[j]);
                } else {
                    console.log(`      ❌ AI Rejected: ${batch[j].name?.slice(0, 40)}...`);
                }
            }
        } catch (e) {
            // If AI fails, include all products in batch (fail-safe)
            console.log(`      ⚠️ AI filter error, including batch: ${e.message?.slice(0, 30)}`);
            approved.push(...batch);
        }

        // Small delay between batches
        if (i + batchSize < products.length) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    console.log(`   ✅ AI approved ${approved.length}/${products.length} products`);
    return approved;
}

// Legacy function kept for compatibility but now just calls AI filter
async function filterProductsByType(products, keyword, blueprint) {
    return filterProductsWithAI(products, keyword, blueprint);
}

// Helper: Clean Amazon Titles
// Enhanced: With known brand, extract "Brand + Model" pattern
function cleanProductName(rawName, knownBrand = null) {
    if (!rawName) return "Unknown Product";

    // If brand is known, extract "Brand + Model" pattern from Amazon title
    if (knownBrand) {
        const brandLower = knownBrand.toLowerCase();
        const rawLower = rawName.toLowerCase();

        // Find where brand appears in title
        const brandIdx = rawLower.indexOf(brandLower);
        if (brandIdx !== -1) {
            const afterBrand = rawName.slice(brandIdx + knownBrand.length).trim();

            // Remove leading punctuation/whitespace
            const cleanAfter = afterBrand.replace(/^[\s,\-:]+/, '');

            // Extract model name (first 2-5 words, stop at comma/bracket/descriptor)
            const modelMatch = cleanAfter.match(/^([A-Za-z0-9\s\-]+?)(?:[,\(\[（【]|Wireless|Bluetooth|ワイヤレス|イヤホン|Earbuds|Headphones|$)/i);
            if (modelMatch && modelMatch[1].trim().length > 2) {
                const modelName = modelMatch[1].trim()
                    .replace(/\s+/g, ' ')
                    .replace(/^[\-\s]+|[\-\s]+$/g, ''); // Trim dashes
                if (modelName.length > 2 && modelName.length < 50) {
                    return `${knownBrand} ${modelName}`;
                }
            }
        }
    }

    // Fallback: Original cleaning logic
    // 1. Remove 【】brackets and their contents first
    let clean = rawName.replace(/【.*?】/g, '').trim();

    // 2. Split by common separators and take first meaningful part
    const parts = clean.split(/[-\/｜|,、]/);
    clean = parts[0].trim();

    // 3. If still too long (>40 chars), try to find brand + model pattern
    if (clean.length > 40) {
        // Look for patterns like "Brand ModelName" or "Brand Model123"
        const brandModelMatch = clean.match(/^([A-Za-z]+\s+[A-Za-z0-9\-]+)/);
        if (brandModelMatch) {
            clean = brandModelMatch[1];
        } else {
            // Truncate at first Japanese descriptor word
            const descriptorMatch = clean.match(/^(.+?)(ワイヤレス|イヤホン|ヘッドホン|Bluetooth|完全)/);
            if (descriptorMatch) {
                clean = descriptorMatch[1].trim();
            }
        }
    }

    // 4. Remove common spammy keywords
    clean = clean
        .replace(/ワイヤレスイヤホン/g, '')
        .replace(/Bluetooth/gi, '')
        .replace(/5\.3/g, '')
        .replace(/完全ワイヤレス/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // 5. If empty or too short, use truncated original
    if (clean.length < 3) {
        clean = rawName.substring(0, 30).replace(/【.*?】/g, '').trim();
    }

    return clean;
}


// 4. Main Workflow
(async () => {
    // ★ Ensure Chrome is running with remote debugging
    await ensureChromeDebugMode();

    let productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf-8'));

    // --- PHASE 0: MARKET DISCOVERY (Market-First, Multi-Source Approach) ---
    // Discover products from multiple trusted web sources (価格.com, MyBest, MONOQLO, etc.)
    // Amazon is used ONLY for affiliate link generation, not for product selection

    const { discoverProducts, discoverProductsMultiSource, scrapeKakakuRankingWithEnrichment, scrapeKakakuRanking } = require('./lib/market_research');
    const { scrapeProductSpecs, scrapeKakakuReviews } = require('./lib/spec_scraper');
    const { verifyProductOnAmazon, matchesCategory, scoutAmazonProducts, scrapeProductReviews, scrapeAmazonProductSpecs } = require('./lib/amazon_scout');
    const { evaluateAndRankProducts } = require('./lib/ai_rating_evaluator'); // AI-based theme rating
    const { generateProductSpecsAndProsCons: genSpecs, analyzeReviewsForInsights } = require('./lib/ai_writer');
    const { searchReviewSummaries, searchProductSpecs } = require('./lib/google_scout');

    console.log('\n' + '='.repeat(60));
    console.log('📊 PHASE 0: KAKAKU.COM PRIMARY MARKET DISCOVERY');
    console.log('='.repeat(60));

    // PRIMARY: Kakaku.com with Amazon link enrichment
    // Use Kakaku.com as the primary source - official product names + Amazon links
    const TARGET_RANKING_COUNT = BLUEPRINT.ranking_count || 10;

    // Parse price range from keyword (e.g., "1万円台" -> 10000-19999)
    const priceRange = { minPrice: null, maxPrice: null };
    const rangeMatch = TARGET_KEYWORD.match(/(\d+)万円台/);
    if (rangeMatch) {
        const base = parseInt(rangeMatch[1], 10) * 10000;
        priceRange.minPrice = base;
        priceRange.maxPrice = base + 9999;
    }
    const underMatch = TARGET_KEYWORD.match(/(\d+)円以下/);
    if (underMatch) {
        priceRange.maxPrice = parseInt(underMatch[1], 10);
    }
    const underManMatch = TARGET_KEYWORD.match(/(\d+)万円以下/);
    if (underManMatch) {
        priceRange.maxPrice = parseInt(underManMatch[1], 10) * 10000;
    }

    console.log(`   💰 Price range: ¥${priceRange.minPrice || 0} - ¥${priceRange.maxPrice || '∞'}`);

    // NC keywords if blueprint requires noise cancelling
    const ncKeywords = BLUEPRINT.comparison_axis?.includes('ノイズ') ? ['nc', 'anc', 'ノイズ', 'noise'] : [];

    // Scrape Kakaku.com with enrichment (gets Amazon.co.jp links)
    // STRATEGY: Recursive fetch with price filter - keeps getting more pages until enough products match

    // --- PHASE 1: RECURSIVE SOURCING LOOP ---
    console.log("\n--> Phase 1: Recursive Sourcing Loop (Amazon First)...");

    let validatedLineup = [];
    let processedIds = new Set();
    let currentPage = 1;
    const MAX_SEARCH_PAGES = 10;

    // Determine Target Count (default 10)
    const targetCount = TARGET_RANKING_COUNT;
    console.log(`🎯 Target: ${targetCount} confirmed products`);

    // TRACKING STATS FOR E-E-A-T METHODOLOGY
    let statsTotalScanned = 0;
    let statsCandidates = 0;

    // Main Sourcing Loop
    while (validatedLineup.length < targetCount && currentPage <= MAX_SEARCH_PAGES) {
        console.log(`\n📄 Processing Page ${currentPage}... (Current: ${validatedLineup.length}/${targetCount})`);

        // 1. Fetch Batch from Kakaku (1 page at a time)
        // We set maxPages to currentPage to ensure loop condition in market_research works: startPage-1 < maxPages
        const batch = await scrapeKakakuRanking(TARGET_KEYWORD, {
            startPage: currentPage,
            maxPages: currentPage,
            targetCount: 100, // Don't stop internally
            minPrice: priceRange.minPrice,
            maxPrice: priceRange.maxPrice,
            requiredFeatures: BLUEPRINT.required_features || [] // Pass to enable dynamic filter URL discovery
        });

        // Update Stats
        statsTotalScanned += batch.length;

        if (batch.length === 0) {
            console.log("   ⚠️ No products found on this page. Stopping search.");
            break;
        }

        console.log(`   📦 Found ${batch.length} candidates. Filtering...`);

        // 1.4 PRE-FILTER: Remove products without Amazon links early
        // (No point running AI filter on products we can't use)
        const amazonLinkedBatch = batch.filter(p => p.asin || p.amazonUrl);
        const noAmazonCount = batch.length - amazonLinkedBatch.length;
        if (noAmazonCount > 0) {
            console.log(`   🔗 Amazon Link Filter: ${amazonLinkedBatch.length}/${batch.length} have Amazon links (${noAmazonCount} skipped)`);
        }

        // 1.5 AI Filter: Remove products that don't match article theme
        // (e.g., headphones from earphone search, wired from wireless search)
        // 1.5 AI Filter: Remove products that don't match article theme OR missing features
        const filteredBatch = await filterProductsWithAI(amazonLinkedBatch, TARGET_KEYWORD, BLUEPRINT, BLUEPRINT.required_features);
        console.log(`   🤖 AI Filter: ${filteredBatch.length}/${amazonLinkedBatch.length} passed`);

        // 2. Process Candidates (Amazon Verification & Enrichment)
        for (const candidate of filteredBatch) {
            if (validatedLineup.length >= targetCount) break;

            // --- A. ID Deduplication (Early) ---
            const tempId = candidate.name;
            if (processedIds.has(tempId)) continue;
            processedIds.add(tempId);

            // --- B. REQUIRE Amazon Data (ASIN or URL) ---
            // Priority: If market_research already extracted ASIN, use it directly (no re-verification needed)
            if (candidate.asin && candidate.amazonUrl && candidate.amazonUrl.includes('amazon.co.jp')) {
                // Market research already verified this product - use directly
                console.log(`   ✅ Pre-verified (ASIN ${candidate.asin}): ${candidate.name}`);

                const verifiedItem = {
                    ...candidate,
                    id: `scout-${candidate.asin}`,
                    affiliateLinks: { amazon: candidate.amazonUrl },
                    price: candidate.amazonPrice || candidate.price || 0
                };

                // Always prefer Amazon image (higher quality, no CORS issues)
                // Kakaku images are often low-res or placeholder
                const isAmazonImage = verifiedItem.image && verifiedItem.image.includes('media-amazon.com');
                if (!isAmazonImage) {
                    console.log(`      🖼️ Fetching Amazon image (current: ${verifiedItem.image ? 'Kakaku' : 'None'})...`);
                    const specsData = await scrapeAmazonProductSpecs(verifiedItem.asin);
                    if (specsData && specsData.image) {
                        verifiedItem.image = specsData.image;
                        console.log(`      ✅ Amazon image applied: ${verifiedItem.image.slice(0, 50)}...`);
                    }
                }

                // Skip to enrichment (no verification needed)
                // --- C. Price Filter (moved inline for pre-verified items) ---
                const minPrice = BLUEPRINT.price_min ?? 0;
                const maxPrice = BLUEPRINT.price_max ?? Infinity;
                const price = verifiedItem.price;

                if (minPrice > 0 || maxPrice < Infinity) {
                    if (price < minPrice || price > maxPrice) {
                        console.log(`   💰 Price Mismatch: ¥${price} (Target: ¥${minPrice}-¥${maxPrice})`);
                        continue;
                    }
                }

                // --- D. Review Collection (MOVED BEFORE SPECS for High Quality Pros/Cons) ---
                // Collect reviews FIRST so AI can use them for Spec/Grade generation
                if (verifiedItem.asin) {
                    console.log(`   📖 Collecting reviews for: ${verifiedItem.name.slice(0, 25)}...`);
                    try {
                        // 1. Kakaku Reviews (First)
                        console.log(`   📝 Collecting 価格.com口コミ...`);
                        const kakakuUrl = verifiedItem.kakakuUrl || null;
                        const kakakuReviews = await scrapeKakakuReviews(verifiedItem.name, kakakuUrl, 50);
                        const kkCount = kakakuReviews?.summary?.totalFound || 0;

                        // 2. Amazon Reviews (Dynamic Target: Total 60)
                        const targetTotal = 60;
                        const amazonTarget = Math.max(10, targetTotal - kkCount);
                        console.log(`   📖 Collecting Amazon reviews (Target: ${amazonTarget}, Kakaku: ${kkCount})...`);
                        const reviewData = await scrapeProductReviews(verifiedItem.asin, amazonTarget);

                        // Store Raw Data used for Dual Source Analysis
                        verifiedItem.reviewInsights = reviewData?.summary;
                        verifiedItem.rawReviews = {
                            positive: reviewData?.positive?.slice(0, 5) || [],
                            negative: reviewData?.negative?.slice(0, 3) || [],
                            situational: reviewData?.situational?.slice(0, 5) || [],
                            kakaku: kakakuReviews && kakakuReviews.summary.totalFound > 0 ? {
                                positive: kakakuReviews.positive || [],
                                negative: kakakuReviews.negative || [],
                                all: kakakuReviews.all || []
                            } : null
                        };

                        const azCount = reviewData?.summary?.totalFound || 0;
                        console.log(`      ✅ Got reviews: Amazon(${azCount}) + Kakaku(${kkCount})`);

                    } catch (reviewErr) {
                        console.log(`      ⚠️ Review collection failed: ${reviewErr.message}`);
                    }
                }

                // --- E. Full Enrichment (Specs) ---
                console.log(`   🔍 Enriching Specs: ${verifiedItem.name}...`);
                const externalSpecs = await searchProductSpecs(verifiedItem.name);
                const enrichedData = await genSpecs(
                    verifiedItem.name,
                    { target_reader: BLUEPRINT.target_reader, comparison_axis: BLUEPRINT.comparison_axis },
                    verifiedItem.asin,
                    externalSpecs,
                    Object.values(targetLabels),
                    verifiedItem.rawReviews // <--- PASSING REVIEWS TO AI
                );
                Object.assign(verifiedItem, enrichedData);

                // --- F. Duplicate Check ---
                const isDuplicate = validatedLineup.some(p => p.id === verifiedItem.id || p.asin === verifiedItem.asin);
                if (isDuplicate) {
                    console.log(`   🔄 Duplicate ASIN: ${verifiedItem.name}`);
                    continue;
                }

                // --- G. Enrichment: Collect specs from Amazon + Kakaku ---
                console.log(`   🔍 Enriching Specs: ${verifiedItem.name}...`);
                try {
                    const specData = await scrapeProductSpecs(verifiedItem.name, verifiedItem.asin);

                    // Start with kakakuSpecs (Japanese) if available - convert to array format
                    let mergedSpecs = [];
                    if (verifiedItem.kakakuSpecs && Object.keys(verifiedItem.kakakuSpecs).length > 0) {
                        mergedSpecs = Object.entries(verifiedItem.kakakuSpecs).map(([label, value]) => ({
                            label: label,
                            value: String(value),
                            source: 'kakaku'
                        }));
                        console.log(`      ✅ Using ${mergedSpecs.length} specs from 価格.com`);
                    }

                    // Add Amazon/external specs (avoid duplicates by label)
                    if (specData && specData.specs && specData.specs.length > 0) {
                        for (const spec of specData.specs) {
                            // Check if similar label already exists (ignore case)
                            const labelLower = spec.label?.toLowerCase() || '';
                            const exists = mergedSpecs.some(s =>
                                s.label?.toLowerCase() === labelLower ||
                                s.label?.includes(spec.label) ||
                                spec.label?.includes(s.label)
                            );
                            if (!exists && spec.label && spec.value) {
                                mergedSpecs.push({ ...spec, source: 'amazon' });
                            }
                        }
                        if (specData.features) verifiedItem.features = specData.features;

                        // FIX: Force update image if high-res one is found via Amazon Scout
                        if (specData.image) {
                            verifiedItem.image = specData.image;
                            console.log(`      🖼️  Updated to High-Res Image from Amazon`);
                        }

                        console.log(`      ✅ Merged specs from ${specData.source || 'Amazon'}`);
                    }

                    verifiedItem.specs = normalizeSpecs(mergedSpecs);
                    console.log(`      📋 Total specs: ${mergedSpecs.length} (Kakaku + Amazon merged)`);

                    // --- NEW: Generate Subjective Grades for Comparison Table using AI ---
                    if (targetLabels) {
                        console.log(`      🧠 Generating Subjective Grades for Comparison Table...`);
                        try {
                            // Combine raw specs into a context string for the AI
                            const rawSpecContext = verifiedItem.specs.map(s => `${s.label}: ${s.value}`).join('\n');

                            // Call AI with targetLabels to enforce S/A/B/C grades
                            // NOW PASSING RAW REVIEWS as the 6th argument!
                            const aiSpecsData = await ai_writer.generateProductSpecsAndProsCons(
                                { name: verifiedItem.name, realSpecs: { specs: verifiedItem.specs } },
                                { comparison_axis: BLUEPRINT.comparison_axis },
                                verifiedItem.asin,
                                rawSpecContext,
                                targetLabels ? Object.values(targetLabels) : null,
                                verifiedItem.rawReviews // <--- NEW ARGUMENT: Real Scraped Reviews
                            );

                            if (aiSpecsData && aiSpecsData.specs && aiSpecsData.specs.length > 0) {

                                // Prepend AI specs (Grades) to the spec list so they are picked up first by generator.js
                                // Or better: Replace specs that match the target labels?
                                // generator.js maps spec1 -> specs[0], spec2 -> specs[1]... logic is a bit weak there.
                                // Actually generator.js does:
                                //   const specsObj = {}; data.specs.forEach((s, i) => { specsObj[`spec${i+1}`] = s.value; });
                                // So order matters!

                                // The AI returns specs in the EXACT ORDER of Label 1, Label 2, Label 3, Label 4.
                                // So we should strictly use these 4 specs as the PRIMARY specs.
                                console.log(`      ✅ AI Generated Grades: ${aiSpecsData.specs.map(s => s.value).join(', ')}`);

                                // We keep other specs as backup, but put these 4 at the top.
                                verifiedItem.specs = [
                                    ...aiSpecsData.specs,
                                    ...verifiedItem.specs.filter(s => !aiSpecsData.specs.some(ai => ai.label === s.label))
                                ];

                                // ASSIGN PROS/CONS (Review-based)
                                if (aiSpecsData.pros && aiSpecsData.pros.length > 0) {
                                    verifiedItem.pros = aiSpecsData.pros;
                                    verifiedItem.cons = aiSpecsData.cons;
                                    console.log(`      ✨ Applied Review-Based Pros/Cons from AI`);
                                }
                            }
                        } catch (aiSpecErr) {
                            console.log(`      ⚠️ AI Grade Gen failed: ${aiSpecErr.message}`);
                        }
                    }

                } catch (specErr) {
                    console.log(`      ⚠️ Spec enrichment failed: ${specErr.message?.slice(0, 30)}`);
                }

                // (Old Step H/I Removed - Logic moved to F.5)


                // Apply our affiliate tags before saving
                const processedItem = processAffiliateLinks(verifiedItem);
                validatedLineup.push(processedItem);
                console.log(`   🎉 ADDED: ${processedItem.name} (${validatedLineup.length}/${targetCount})`);
                continue; // Skip legacy verification path
            }

            // Legacy path: No ASIN yet, need to verify via URL or search
            if (!candidate.amazonUrl) {
                console.log(`   ⏭️ Skipped (No Amazon Link): ${candidate.name}`);
                continue;
            }

            console.log(`      🔗 Verifying via Direct Link: ${candidate.name.slice(0, 25)}...`);

            let verifiedItem = null;
            try {
                // First try: Verify the direct link
                let resultJson = execSync(`node scripts/verify_amazon_product.js "${candidate.amazonUrl}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
                let result = JSON.parse(resultJson);

                // CRITICAL: If blocked by Amazon (Captcha/503), DO NOT SEARCH BY NAME.
                // Searching by name when we are already blocked will likely fail or yield garbage.
                if (result.error === 'BLOCKED') {
                    console.log(`      🛑 BLOCKED by Amazon (${result.reason}). Skipping fallback search to prevent errors.`);
                    continue; // Skip this product safely
                }

                // Fallback: If direct link fails (and NOT blocked), search by product name
                if (!result.found) {
                    console.log(`      🔄 Direct link failed, searching by name...`);
                    resultJson = execSync(`node scripts/verify_amazon_product.js "${candidate.name.replace(/"/g, '\\"')}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
                    result = JSON.parse(resultJson);

                    // Check block again after search
                    if (result.error === 'BLOCKED') {
                        console.log(`      🛑 BLOCKED during name search. Skipping.`);
                        continue;
                    }
                }

                if (result.found && result.asin) { // Just need ASIN, don't check hasPrice
                    verifiedItem = {
                        ...candidate,
                        id: `scout-${result.asin}`,
                        asin: result.asin,
                        price: candidate.amazonPrice || (typeof result.price === 'number' ? result.price : candidate.price),
                        affiliateLinks: { amazon: result.link || `https://www.amazon.co.jp/dp/${result.asin}` },
                        image: result.imageUrl,
                        realFeatures: result.features,
                        realSpecs: result.specs
                    };
                    console.log(`   ✅ Verified: ${candidate.name} (¥${verifiedItem.price})`);
                } else {
                    console.log(`   ❌ Verification Failed: ${candidate.name}`);
                    continue;
                }
            } catch (e) {
                console.log(`   ⚠️ Verify Error: ${candidate.name} - ${e.message}`);
                continue;
            }

            // --- C. Price Filter (Strict Amazon Price) ---
            // Handle null values for products without price constraints
            const minPrice = BLUEPRINT.price_min ?? 0;
            const maxPrice = BLUEPRINT.price_max ?? Infinity;
            const price = verifiedItem.price;

            if (minPrice > 0 || maxPrice < Infinity) {
                if (price < minPrice || price > maxPrice) {
                    console.log(`   💰 Price Mismatch: ¥${price} (Target: ¥${minPrice}-¥${maxPrice})`);
                    continue;
                }
            }

            // Always prefer Amazon image (same fix as pre-verified path)
            const isAmazonImage = verifiedItem.image && verifiedItem.image.includes('media-amazon.com');
            if (!isAmazonImage && verifiedItem.asin) {
                console.log(`      🖼️ Fetching Amazon image (current: ${verifiedItem.image ? 'Kakaku' : 'None'})...`);
                const specsData = await scrapeAmazonProductSpecs(verifiedItem.asin);
                if (specsData && specsData.image) {
                    verifiedItem.image = specsData.image;
                    console.log(`      ✅ Amazon image applied: ${verifiedItem.image.slice(0, 50)}...`);
                }
            }

            // --- Review Collection (MOVED UP FOR AI) ---
            // FORCE: Always collect reviews to ensure quality, even if pros/cons exist
            if (verifiedItem.asin) {
                console.log(`   📖 Collecting reviews for: ${verifiedItem.name.slice(0, 25)}...`);
                try {
                    // 1. Kakaku Reviews (First)
                    console.log(`   📝 Collecting 価格.com口コミ...`);
                    const kakakuUrl = verifiedItem.kakakuUrl || null;
                    const kakakuReviews = await scrapeKakakuReviews(verifiedItem.name, kakakuUrl, 50); // 価格.com: 50件
                    const kkCount = kakakuReviews?.summary?.totalFound || 0;

                    // 2. Amazon Reviews (Dynamic Target: Total 60)
                    const targetTotal = 60;
                    const amazonTarget = Math.max(10, targetTotal - kkCount);
                    console.log(`   📖 Collecting Amazon reviews (Target: ${amazonTarget}, Kakaku: ${kkCount})...`);
                    const reviewData = await scrapeProductReviews(verifiedItem.asin, amazonTarget);

                    // Store Raw Data
                    verifiedItem.reviewInsights = reviewData?.summary;
                    verifiedItem.rawReviews = {
                        positive: reviewData?.positive?.slice(0, 5) || [],
                        negative: reviewData?.negative?.slice(0, 3) || [],
                        situational: reviewData?.situational?.slice(0, 5) || []
                    };

                    if (kakakuReviews && kakakuReviews.summary.totalFound > 0) {
                        verifiedItem.rawReviews.kakaku = {
                            positive: kakakuReviews.positive || [],
                            negative: kakakuReviews.negative || [],
                            all: kakakuReviews.all || []
                        };
                    }

                    const azCount = reviewData?.summary?.totalFound || 0;
                    console.log(`      ✅ Got reviews: Amazon(${azCount}) + Kakaku(${kkCount})`);

                } catch (reviewErr) {
                    console.log(`      ⚠️ Review collection failed: ${reviewErr.message?.slice(0, 30)}`);
                }
            }

            // --- D. Full Enrichment (Specs & AI Analysis using Reviews) ---
            console.log(`   🔍 Enriching Specs: ${verifiedItem.name}...`);
            const externalSpecs = await searchProductSpecs(verifiedItem.name);
            // NOW we pass the reviews we just collected!
            const enrichedData = await genSpecs(
                verifiedItem.name,
                { target_reader: BLUEPRINT.target_reader, comparison_axis: BLUEPRINT.comparison_axis },
                verifiedItem.asin,
                externalSpecs,
                Object.values(targetLabels),
                verifiedItem.rawReviews // <--- PASSING REVIEWS TO AI
            );

            verifiedItem = { ...verifiedItem, ...enrichedData };

            // --- F. Final Duplicate Check (ID) ---
            const isDuplicate = validatedLineup.some(p => p.id === verifiedItem.id || p.asin === verifiedItem.asin);
            if (isDuplicate) {
                console.log(`   🔄 Duplicate ASIN: ${verifiedItem.name}`);
                continue;
            }

            // --- SUCCESS ---
            const processedItem = processAffiliateLinks(verifiedItem);
            validatedLineup.push(processedItem);
            console.log(`   🎉 ADDED: ${processedItem.name} (${validatedLineup.length}/${targetCount})`);
        }
        currentPage++;
    }

    if (validatedLineup.length === 0) {
        console.error("❌ CRITICAL: No valid products found after recursive search. Aborting.");
        process.exit(1);
    }

    // --- CRITICAL: AI-based theme evaluation and ranking ---
    console.log(`\n🎯 AI Theme Evaluation for "${BLUEPRINT.comparison_axis || TARGET_KEYWORD}"...`);
    validatedLineup = await evaluateAndRankProducts(validatedLineup, BLUEPRINT);
    console.log(`   ✅ Products ranked by AI theme score based on "${BLUEPRINT.comparison_axis || 'general performance'}"`);
    validatedLineup.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name.slice(0, 30)}... Score: ${p.themeScore}/10 Rating: ${p.calculatedRating}`);
    });

    // --- CRITICAL: Sync validated products to products.json ---
    // This is required for the frontend to display the products
    console.log(`\n📦 Syncing ${validatedLineup.length} products to products.json...`);

    for (const product of validatedLineup) {
        // Check if product already exists (by ID or ASIN)
        const existingIndex = productsData.findIndex(p =>
            p.id === product.id ||
            (p.asin && p.asin === product.asin)
        );

        // Prepare product data for storage
        // IMPORTANT: Use amazonPrice for accurate price (Kakaku shop price was truncated)
        const actualPrice = product.amazonPrice || product.price || 0;

        // Build specs array from kakakuSpecs if not already present
        // CRITICAL: Apply normalizeSpecs to ensure ○× → A/S conversion
        let specsArray = product.specs || [];
        if (specsArray.length === 0 && product.kakakuSpecs) {
            const rawSpecs = Object.entries(product.kakakuSpecs).slice(0, 8).map(([label, value]) => ({
                label: label,
                value: value
            }));
            specsArray = normalizeSpecs(rawSpecs);
        }


        const productEntry = {
            id: product.id,
            name: product.name,
            asin: product.asin,
            price: typeof actualPrice === 'number' ? `¥${actualPrice.toLocaleString()}` : actualPrice,
            priceVal: typeof actualPrice === 'number' ? actualPrice : parseInt(String(actualPrice).replace(/[^0-9]/g, '')) || 0,
            // Prefer actual image URLs (Amazon, etc.) over non-existent local paths
            image: product.image && product.image.startsWith('http')
                ? product.image
                : (product.asin ? `https://images-na.ssl-images-amazon.com/images/P/${product.asin}.01.LZZZZZZZ.jpg` : '/images/placeholder.jpg'),
            rating: product.rating || product.calculatedRating || 4.0,
            reviewCount: product.reviewCount || 0,
            description: product.description || '',
            brand: product.brand || '',
            category: BLUEPRINT.category || detectCategoryFromKeyword(TARGET_KEYWORD),
            affiliateLinks: product.affiliateLinks || {},
            specs: specsArray,
            pros: product.pros || [],
            cons: product.cons || [],
            badge: product.badge || 'おすすめ',
            tags: {},
            kakakuSpecs: product.kakakuSpecs || {},
            themeScore: product.themeScore || 0,
            themeReason: product.themeReason || '',
            costPerformance: product.costPerformance || 0,
            costReason: product.costReason || '',
            rawReviews: product.rawReviews || null,
            reviewInsights: product.reviewInsights || null,
            editorComment: product.editorComment || '',
            specVerification: product.specVerification || '',
            userScenario: product.userScenario || ''
        };

        if (existingIndex >= 0) {
            // Update existing product
            productsData[existingIndex] = { ...productsData[existingIndex], ...productEntry };
        } else {
            // Add new product
            productsData.push(productEntry);
        }
    }

    console.log(`   ✅ Products synced. Total in database: ${productsData.length}`);

    // Save valid data
    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(productsData, null, 4));

    // --- PHASE 3: CONTENT GENERATION ---
    console.log("\n--> Phase 3: Generating Content...");

    // 1. Buying Guide Body
    const filteringStats = {
        totalScanned: statsTotalScanned,
        candidates: statsCandidates,
        finalCount: validatedLineup.length
    };
    const buyingGuideBody = await ai_writer.generateBuyingGuideBody(TARGET_KEYWORD, validatedLineup, BLUEPRINT, filteringStats);

    // 2. SEO Metadata - Use Blueprint title if available
    let seoMetadata;
    if (BLUEPRINT.title) {
        // Use Blueprint's pre-defined title
        seoMetadata = {
            title: BLUEPRINT.title,
            description: BLUEPRINT.intro ? BLUEPRINT.intro.slice(0, 150) + "..." : `プロが選ぶ${TARGET_KEYWORD}のおすすめ人気ランキング。選び方や比較ポイントも解説。`,
            keywords: [TARGET_KEYWORD, "おすすめ", "ランキング", "比較"]
        };
        console.log(`   ✅ Using Blueprint Title: ${BLUEPRINT.title}`);
    } else {
        seoMetadata = await ai_writer.generateSeoMetadata(TARGET_KEYWORD, validatedLineup);
    }

    // 3. Thumbnail Generation
    let thumbPath = '/images/placeholder.jpg';
    try {
        console.log(`   🎨 Attempting AI Thumbnail Generation...`);
        // Use the title for the thumbnail prompt
        const thumbPrompt = seoMetadata.title || `Best ${TARGET_KEYWORD} Selection`;
        const b64 = await ai_writer.generateBlogThumbnail(thumbPrompt);
        if (b64) {
            // Use our new Helper for consistency if needed, but here we have base64.
            // Manually save for now as it returns b64, not URL.
            const p = path.resolve(__dirname, '../public/images/articles');
            if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
            const slug = keywordToEnglishSlug(TARGET_KEYWORD);
            const f = `${slug}.jpg`;
            const fullPath = path.join(p, f);
            fs.writeFileSync(fullPath, Buffer.from(b64, 'base64'));

            // Inject Metadata into Thumbnail too!
            const { injectAiMetadata } = require('./lib/image_metadata');
            await injectAiMetadata(fullPath);

            thumbPath = `/images/articles/${f}`;
            console.log(`   ✅ Thumbnail saved & tagged: ${thumbPath}`);
        } else {
            console.log(`   ⚠️ Thumbnail generation returned null, using product image as fallback`);
        }
    } catch (e) {
        console.log(`   ⚠️ Thumbnail generation failed: ${e.message}`);
    }


    // --- NEW: Process Product Images (Download & Inject Metadata) ---
    console.log(`\n   📸 Processing Product Images (SEO & Metadata)...`);
    const { downloadImage, generateSemanticFilename } = require('./lib/image_downloader');

    for (const product of validatedLineup) {
        if (!product.image || !product.image.startsWith('http')) continue;

        try {
            // Generate SEO filename: "sony-wf-1000xm5-beef.jpg"
            const filename = generateSemanticFilename(product.name, product.id || product.asin);

            // Download and Inject Metadata
            const localPath = await downloadImage(product.image, filename);

            if (localPath) {
                product.image = localPath; // Update object with local path
                // console.log(`      ✅ Saved: ${product.name.slice(0, 20)}... -> ${filename}`);
            }
        } catch (imgErr) {
            console.log(`      ⚠️ Image download failed for ${product.name}: ${imgErr.message}`);
            // Keep original URL as fallback
        }
    }
    console.log(`   ✅ All product images processed.`);

    // 4. Generate Ranking Page
    generateRankingArticle(TARGET_KEYWORD, validatedLineup, productsData, buyingGuideBody, seoMetadata, thumbPath);

    // 5. Generate Reviews
    console.log("\n--> Generating Individual Reviews...");
    const reviewDir = path.resolve(__dirname, '../src/content/reviews');
    for (let i = 0; i < validatedLineup.length; i++) {
        const p = validatedLineup[i]; // Verified items are already the source of truth
        const nextItem = validatedLineup[i + 1] || validatedLineup[0];

        // Ensure description/pros/cons are set (they should be from enrichment)
        if (!p.description) {
            const pros = p.pros || [];
            p.description = `${p.name}は${pros[0] || '注目'}の製品です。`;
        }

        // ★ Skip if review already exists (unless --force-reviews is set)
        const reviewFilePath = path.join(reviewDir, `${p.id}.md`);
        if (fs.existsSync(reviewFilePath) && !FORCE_REVIEWS) {
            console.log(`   ⏭️ Review already exists: ${p.name} (skipping, use --force-reviews to overwrite)`);
            continue;
        }
        if (fs.existsSync(reviewFilePath) && FORCE_REVIEWS) {
            console.log(`   🔄 Force-regenerating review: ${p.name}`);
        }

        try {
            console.log(`   ✍️ Review: ${p.name}...`);
            const body = await ai_writer.generateReviewBody(p, nextItem.name, BLUEPRINT);
            // Set rankingKeyword so generateReviewPage() can build correct ranking_url
            p.rankingKeyword = TARGET_KEYWORD;
            generateReviewPage(p, body);
        } catch (reviewError) {
            console.log(`   ⚠️ Failed to generate review for "${p.name}": ${reviewError.message}`);
        }
    }

    // 6. Update DB (and sync to products.json)
    // --- CRITICAL: Sync validated products to products.json ---
    // MOVED AFTER IMAGE PROCESSING to ensure local paths are saved
    console.log(`\n📦 Syncing ${validatedLineup.length} products to products.json...`);

    for (const product of validatedLineup) {
        // Check if product already exists (by ID or ASIN)
        const existingIndex = productsData.findIndex(p =>
            p.id === product.id ||
            (p.asin && p.asin === product.asin)
        );

        // Prepare product data for storage
        // IMPORTANT: Use amazonPrice for accurate price (Kakaku shop price was truncated)
        const actualPrice = product.amazonPrice || product.price || 0;

        // Build specs array from kakakuSpecs if not already present
        // CRITICAL: Apply normalizeSpecs to ensure ○× → A/S conversion
        let specsArray = product.specs || [];
        if (specsArray.length === 0 && product.kakakuSpecs) {
            const rawSpecs = Object.entries(product.kakakuSpecs).slice(0, 8).map(([label, value]) => ({
                label: label,
                value: value
            }));
            specsArray = normalizeSpecs(rawSpecs);
        }

        const productEntry = {
            id: product.id,
            name: product.name,
            asin: product.asin,
            price: typeof actualPrice === 'number' ? `¥${actualPrice.toLocaleString()}` : actualPrice,
            priceVal: typeof actualPrice === 'number' ? actualPrice : parseInt(String(actualPrice).replace(/[^0-9]/g, '')) || 0,
            // Prefer actual image URLs (Amazon, etc.) over non-existent local paths
            image: product.image && (product.image.startsWith('http') || product.image.startsWith('/'))
                ? product.image
                : (product.asin ? `https://images-na.ssl-images-amazon.com/images/P/${product.asin}.01.LZZZZZZZ.jpg` : '/images/placeholder.jpg'),
            rating: product.rating || product.calculatedRating || 4.0,
            reviewCount: product.reviewCount || 0,
            description: product.description || '',
            brand: product.brand || '',
            category: BLUEPRINT.category || detectCategoryFromKeyword(TARGET_KEYWORD),
            affiliateLinks: product.affiliateLinks || {},
            specs: specsArray,
            pros: product.pros || [],
            cons: product.cons || [],
            badge: product.badge || 'おすすめ',
            tags: {},
            kakakuSpecs: product.kakakuSpecs || {},
            themeScore: product.themeScore || 0,
            themeReason: product.themeReason || '',
            costPerformance: product.costPerformance || 0,
            costReason: product.costReason || '',
            rawReviews: product.rawReviews || null,
            reviewInsights: product.reviewInsights || null,
            editorComment: product.editorComment || '',
            specVerification: product.specVerification || '',
            userScenario: product.userScenario || ''
        };

        if (existingIndex >= 0) {
            // ★ Merge carefully: preserve existing rating/themeScore (don't overwrite with different article context)
            const existing = productsData[existingIndex];
            productsData[existingIndex] = {
                ...existing,
                ...productEntry,
                // Preserve first-written values (don't let later articles overwrite)
                rating: existing.rating || productEntry.rating,
                themeScore: existing.themeScore || productEntry.themeScore,
                themeReason: existing.themeReason || productEntry.themeReason,
                // Always update price/specs (these are factual, not context-dependent)
                price: productEntry.price || existing.price,
                specs: productEntry.specs?.length > 0 ? productEntry.specs : existing.specs,
            };
        } else {
            // Add new product
            productsData.push(productEntry);
        }
    }

    updateDatabase(TARGET_KEYWORD, validatedLineup, productsData, seoMetadata, BLUEPRINT, thumbPath);

    // 7. Sitemap is auto-generated by next-sitemap during `next build` postbuild
    // Do NOT manually generate public/sitemap.xml here (causes dual-sitemap conflict)
    console.log('🗺️  Sitemap will be generated by next-sitemap during build.');

    // 8. Cleanup Orphaned Reviews (remove reviews not used in any article)
    console.log('\n🧹 Cleaning up orphaned reviews...');
    try {
        execSync('node scripts/cleanup_orphaned_reviews.js', { stdio: 'inherit' });
    } catch (e) {
        console.warn('   ⚠️ Cleanup failed:', e.message);
    }

    // 9. Save Enriched Data to Master JSON
    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(productsData, null, 4));
    console.log(`\n🎉 Article Generated: src/content/articles/${TARGET_KEYWORD}.md`);

    // --- NEW: Strict Quality Gate ---
    console.log('\n🛡️ Running Strict Quality Gate...');
    try {
        execSync('node scripts/check-quality.mjs', { stdio: 'inherit' });
        console.log('✅ Quality Gate Passed.');
    } catch (e) {
        console.warn('⚠️ Quality Gate flagged issues. Please review components manually.');
        // We don't exit(1) here to allow the process to finish "successfully" as the file is saved,
        // but we warn the user.
    }

    // Ensure clean exit
    process.exit(0);

})();




