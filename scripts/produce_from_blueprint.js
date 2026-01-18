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
const { scoutAmazonProducts } = require('./lib/amazon_scout'); // ★ The "Missing Link"
const { generateRankingArticle, generateReviewPage, updateDatabase } = require('./lib/generator');
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

    // Not available - try to start Chrome with user profile
    console.log('🚀 Starting Chrome with remote debugging...');
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const userDataDir = process.env.LOCALAPPDATA + '\\Google\\Chrome\\User Data';

    chromeProcess = spawn(chromePath, [
        '--remote-debugging-port=9222',
        `--user-data-dir=${userDataDir}`,
        '--profile-directory=Default'
    ], {
        detached: true,
        stdio: 'ignore'
    });
    chromeProcess.unref();

    // Wait for Chrome to start
    console.log('   ⏳ Waiting for Chrome to start...');
    await new Promise(r => setTimeout(r, 4000));

    // Check again
    if (await checkPort()) {
        console.log('✅ Chrome started with remote debugging on port 9222');
        return true;
    }

    // Still not available - Chrome might already be running without debug mode
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║  ⚠️ Chrome remote debugging not available                          ║');
    console.log('╠════════════════════════════════════════════════════════════════════╣');
    console.log('║  Amazonレビュー取得にはデバッグモードのChromeが必要です             ║');
    console.log('║                                                                    ║');
    console.log('║  【手順】                                                          ║');
    console.log('║  1. すべてのChromeウィンドウを閉じる                               ║');
    console.log('║  2. 以下のコマンドをPowerShellで実行:                              ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('Start-Process "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" -ArgumentList "--remote-debugging-port=9222","--user-data-dir=$env:LOCALAPPDATA\\Google\\Chrome\\User Data","--profile-directory=Default"');
    console.log('');
    console.log('🔄 Falling back to headless mode (Amazonレビューは取得できない可能性あり)');
    console.log('');
    return false;
}

// Gemini AI for product filtering
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const filterModel = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); // Fast model for filtering

// 1. Configuration
const JSON_FILE = process.argv[2];
const TARGET_KEYWORD = process.argv[3];
const PRODUCTS_JSON_PATH = path.resolve(__dirname, '../src/data/products.json');

if (!JSON_FILE || !TARGET_KEYWORD) {
    console.error("❌ Usage: node scripts/produce_from_blueprint.js <JSON_FILE> <KEYWORD>");
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
async function filterProductsWithAI(products, keyword, blueprint) {
    console.log(`   🤖 AI Filtering ${products.length} products for "${keyword}"...`);

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
タイプ: ${p.kakakuSpecs?.['タイプ'] || p.kakakuSpecs?.['装着方式'] || '不明'}
接続: ${p.kakakuSpecs?.['接続タイプ'] || p.kakakuSpecs?.['Bluetooth'] || '不明'}
---
`).join('')}

判定基準（カテゴリ一致のみ）:
1. 「イヤホン」記事 → ヘッドホン/ヘッドセットは不可、イヤホンのみ可
2. 「ワイヤレス」記事 → 有線のみの商品は不可
3. 「完全ワイヤレス」記事 → 左右一体型や有線は不可

注意: ノイズキャンセリングの有無などの「機能」は判定しないでください。
機能フィルタは別途行われます。カテゴリ（商品タイプ）のみで判定してください。

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

        if (batch.length === 0) {
            console.log("   ⚠️ No products found on this page. Stopping search.");
            break;
        }

        console.log(`   📦 Found ${batch.length} candidates. Filtering...`);

        // 1.5 AI Filter: Remove products that don't match article theme
        // (e.g., headphones from earphone search, wired from wireless search)
        const filteredBatch = await filterProductsWithAI(batch, TARGET_KEYWORD, BLUEPRINT);
        console.log(`   🤖 AI Filter: ${filteredBatch.length}/${batch.length} passed`);

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

                // Ensure image exists. If missing, fetch it via ASIN using scrapeAmazonProductSpecs
                if (!verifiedItem.image) {
                    console.log(`      ⚠️ Image missing for pre-verified item. Fetching via ASIN...`);
                    const specsData = await scrapeAmazonProductSpecs(verifiedItem.asin);
                    if (specsData && specsData.image) {
                        verifiedItem.image = specsData.image;
                        console.log(`      ✅ Image recovered: ${verifiedItem.image}`);
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

                // --- D. Full Enrichment (Specs) ---
                console.log(`   🔍 Enriching Specs: ${verifiedItem.name}...`);
                const externalSpecs = await searchProductSpecs(verifiedItem.name);
                const enrichedData = await genSpecs(verifiedItem.name, { target_reader: BLUEPRINT.target_reader, comparison_axis: BLUEPRINT.comparison_axis }, verifiedItem.asin, externalSpecs, Object.values(targetLabels));
                Object.assign(verifiedItem, enrichedData);

                // --- E. Feature Filter (Generic for any category) ---
                const requiredFeatures = BLUEPRINT.required_features || [];
                let featureMissing = false;
                if (requiredFeatures.length > 0) {
                    for (const feature of requiredFeatures) {
                        const featureLower = feature.toLowerCase();
                        // Create alternative search terms (e.g., ノイズキャンセリング -> NC, ノイキャン)
                        const searchTerms = [featureLower];
                        if (featureLower.includes('ノイズ')) searchTerms.push('nc', 'ノイキャン', 'anc');
                        if (featureLower.includes('防水')) searchTerms.push('ipx', 'ip6', 'ip7', 'ip8');
                        if (featureLower.includes('省エネ')) searchTerms.push('省電力', 'エコ');

                        // Check kakakuSpecs for the feature (key OR value contains keywords)
                        const hasInKakakuSpecs = verifiedItem.kakakuSpecs && Object.entries(verifiedItem.kakakuSpecs).some(([k, v]) => {
                            const keyLower = k.toLowerCase();
                            const valLower = typeof v === 'string' ? v.toLowerCase() : '';
                            // Check if any search term is in key or value
                            const keyMatch = searchTerms.some(term => keyLower.includes(term));
                            const valMatch = searchTerms.some(term => valLower.includes(term));
                            // For key match, still require value to indicate presence (○, 対応, etc)
                            const valueIndicatesPresence = typeof v === 'string' && (v === '○' || v.includes('対応') || v.includes('あり') || v.includes('搭載'));
                            return (keyMatch && valueIndicatesPresence) || valMatch;
                        });

                        // Check name and description
                        const textToSearch = (verifiedItem.name + ' ' + (verifiedItem.description || '')).toLowerCase();
                        const hasInText = searchTerms.some(term => textToSearch.includes(term));

                        const hasFeature = hasInKakakuSpecs || hasInText;

                        if (!hasFeature) {
                            console.log(`   ❌ Missing feature [${feature}]: ${verifiedItem.name}`);
                            featureMissing = true;
                            break;
                        }
                    }
                }
                if (featureMissing) continue;

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
                            const aiSpecsData = await ai_writer.generateProductSpecsAndProsCons(
                                { name: verifiedItem.name, realSpecs: { specs: verifiedItem.specs } },
                                { comparison_axis: BLUEPRINT.comparison_axis },
                                verifiedItem.asin,
                                rawSpecContext,
                                targetLabels ? Object.values(targetLabels) : null // <--- The Key Fix
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
                            }
                        } catch (aiSpecErr) {
                            console.log(`      ⚠️ AI Grade Gen failed: ${aiSpecErr.message}`);
                        }
                    }

                } catch (specErr) {
                    console.log(`      ⚠️ Spec enrichment failed: ${specErr.message?.slice(0, 30)}`);
                }

                // --- H. Review Collection: Get Amazon & Kakaku Reviews for Insights ---
                // FORCE: Always collect reviews to ensure quality, even if pros/cons exist
                if (verifiedItem.asin) {
                    console.log(`   📖 Collecting reviews for: ${verifiedItem.name.slice(0, 25)}...`);
                    try {
                        // 1. Amazon Reviews
                        const reviewData = await scrapeProductReviews(verifiedItem.asin, 10); // Amazon: 10件（ページネーション不安定のため）

                        // 2. Kakaku Reviews
                        console.log(`   📝 Collecting 価格.com口コミ...`);
                        const kakakuUrl = verifiedItem.kakakuUrl || null;
                        const kakakuReviews = await scrapeKakakuReviews(verifiedItem.name, kakakuUrl, 50); // 価格.com: 50件

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
                        const kkCount = kakakuReviews?.summary?.totalFound || 0;
                        console.log(`      ✅ Got reviews: Amazon(${azCount}) + Kakaku(${kkCount})`);

                        if (azCount > 0 || kkCount > 0) {
                            // --- I. AI Analysis: Generate pros/cons from REAL reviews (SEO value!) ---
                            try {
                                // Merge data for AI (positive/negative only)
                                const combinedData = {
                                    positive: [...(reviewData?.positive || []), ...(kakakuReviews?.positive || [])],
                                    negative: [...(reviewData?.negative || []), ...(kakakuReviews?.negative || [])]
                                };



                                console.log(`      ⚡️ PASSING REVIEWS TO AI: Pos(${combinedData.positive.length}), Neg(${combinedData.negative.length})`);

                                const insights = await analyzeReviewsForInsights(
                                    verifiedItem.name,
                                    combinedData,
                                    BLUEPRINT.comparison_axis || ''
                                );
                                if (insights) {
                                    verifiedItem.pros = insights.enhancedPros || verifiedItem.pros;
                                    verifiedItem.cons = insights.enhancedCons || verifiedItem.cons;
                                    verifiedItem.editorComment = insights.editorComment;
                                    console.log(`      ✅ AI generated review-based pros/cons (Dual Source)`);
                                }
                            } catch (aiErr) {
                                console.log(`      ⚠️ AI review analysis failed: ${aiErr.message?.slice(0, 30)}`);
                            }
                        }
                    } catch (reviewErr) {
                        console.log(`      ⚠️ Review collection failed: ${reviewErr.message?.slice(0, 30)}`);
                    }
                }

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

                // Fallback: If direct link fails, search by product name
                if (!result.found) {
                    console.log(`      🔄 Direct link failed, searching by name...`);
                    resultJson = execSync(`node scripts/verify_amazon_product.js "${candidate.name.replace(/"/g, '\\"')}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
                    result = JSON.parse(resultJson);
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

            // --- D. Full Enrichment (Specs) ---
            console.log(`   🔍 Enriching Specs: ${verifiedItem.name}...`);
            const externalSpecs = await searchProductSpecs(verifiedItem.name);
            const enrichedData = await genSpecs(verifiedItem.name, { target_reader: BLUEPRINT.target_reader, comparison_axis: BLUEPRINT.comparison_axis }, verifiedItem.asin, externalSpecs, Object.values(targetLabels));

            verifiedItem = { ...verifiedItem, ...enrichedData };

            // --- E. Generic Feature Filter (required_features from Blueprint) ---
            // Works for any category: NC earphones, waterproof watches, reclining chairs, etc.
            const requiredFeatures = BLUEPRINT.required_features || [];
            if (requiredFeatures.length > 0) {
                const missingFeatures = [];

                for (const feature of requiredFeatures) {
                    const featureLower = feature.toLowerCase();
                    // Create alternative search terms
                    const searchTerms = [featureLower];
                    if (featureLower.includes('ノイズ')) searchTerms.push('nc', 'ノイキャン', 'anc');
                    if (featureLower.includes('防水')) searchTerms.push('ipx', 'ip6', 'ip7', 'ip8');
                    if (featureLower.includes('省エネ')) searchTerms.push('省電力', 'エコ');

                    // Check multiple sources for feature presence (Generic)
                    const hasFeature =
                        // 1. Check kakakuSpecs - key OR value contains keywords
                        (verifiedItem.kakakuSpecs && Object.entries(verifiedItem.kakakuSpecs).some(([k, v]) => {
                            const keyLower = k.toLowerCase();
                            const valLower = typeof v === 'string' ? v.toLowerCase() : '';
                            const keyMatch = searchTerms.some(term => keyLower.includes(term));
                            const valMatch = searchTerms.some(term => valLower.includes(term));
                            const valueIndicatesPresence = typeof v === 'string' && (v === '○' || v.includes('対応') || v.includes('あり') || v.includes('搭載'));
                            return (keyMatch && valueIndicatesPresence) || valMatch;
                        })) ||
                        // 2. Check specs array from Amazon/external
                        (verifiedItem.specs && verifiedItem.specs.some(s =>
                            typeof s === 'string' && searchTerms.some(term => s.toLowerCase().includes(term))
                        )) ||
                        // 3. Check product name and description
                        searchTerms.some(term => (verifiedItem.name + ' ' + (verifiedItem.description || '')).toLowerCase().includes(term)) ||
                        // 4. Check realFeatures from Amazon verification
                        (verifiedItem.realFeatures && verifiedItem.realFeatures.some(f =>
                            searchTerms.some(term => f.toLowerCase().includes(term))
                        ));

                    if (!hasFeature) {
                        missingFeatures.push(feature);
                    }
                }

                if (missingFeatures.length > 0) {
                    console.log(`   ❌ Missing features [${missingFeatures.join(', ')}]: ${verifiedItem.name}`);
                    continue;
                }
            }

            // --- Review Collection Insertion Point ---
            // FORCE: Always collect reviews to ensure quality, even if pros/cons exist
            if (verifiedItem.asin) {
                console.log(`   📖 Collecting reviews for: ${verifiedItem.name.slice(0, 25)}...`);
                try {
                    // 1. Amazon Reviews
                    const reviewData = await scrapeProductReviews(verifiedItem.asin, 10); // Amazon: 10件

                    // 2. Kakaku Reviews
                    console.log(`   📝 Collecting 価格.com口コミ...`);
                    const kakakuUrl = verifiedItem.kakakuUrl || null;
                    const kakakuReviews = await scrapeKakakuReviews(verifiedItem.name, kakakuUrl, 50); // 価格.com: 50件

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
                    const kkCount = kakakuReviews?.summary?.totalFound || 0;
                    console.log(`      ✅ Got reviews: Amazon(${azCount}) + Kakaku(${kkCount})`);

                    if (azCount > 0 || kkCount > 0) {
                        // --- I. AI Analysis: Generate pros/cons from REAL reviews (SEO value!) ---
                        try {
                            // Merge data for AI
                            const combinedData = {
                                ...reviewData,
                                situational: [...(reviewData?.situational || []), ...(kakakuReviews?.all || [])],
                                positive: [...(reviewData?.positive || []), ...(kakakuReviews?.positive || [])],
                                negative: [...(reviewData?.negative || []), ...(kakakuReviews?.negative || [])]
                            };



                            console.log(`      ⚡️ PASSING REVIEWS TO AI (Legacy Path): Situational(${combinedData.situational.length}), Pos(${combinedData.positive.length}), Neg(${combinedData.negative.length})`);

                            const insights = await analyzeReviewsForInsights(
                                verifiedItem.name,
                                combinedData,
                                BLUEPRINT.comparison_axis || ''
                            );
                            if (insights) {
                                verifiedItem.pros = insights.enhancedPros || verifiedItem.pros;
                                verifiedItem.cons = insights.enhancedCons || verifiedItem.cons;
                                verifiedItem.editorComment = insights.editorComment;
                                console.log(`      ✅ AI generated review-based pros/cons (Dual Source)`);
                            }
                        } catch (aiErr) {
                            console.log(`      ⚠️ AI review analysis failed: ${aiErr.message?.slice(0, 30)}`);
                        }
                    }
                } catch (reviewErr) {
                    console.log(`      ⚠️ Review collection failed: ${reviewErr.message?.slice(0, 30)}`);
                }
            }

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
            rating: product.calculatedRating || 4.5,
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
            editorComment: product.editorComment || ''
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
    const buyingGuideBody = await ai_writer.generateBuyingGuideBody(TARGET_KEYWORD, validatedLineup, BLUEPRINT);

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
            const p = path.resolve(__dirname, '../public/images/articles');
            if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
            const f = `${TARGET_KEYWORD.replace(/\s/g, '_')}.jpg`;
            fs.writeFileSync(path.join(p, f), Buffer.from(b64, 'base64'));
            thumbPath = `/images/articles/${f}`;
            console.log(`   ✅ Thumbnail saved: ${thumbPath}`);
        } else {
            console.log(`   ⚠️ Thumbnail generation returned null, using product image as fallback`);
        }
    } catch (e) {
        console.log(`   ⚠️ Thumbnail generation failed: ${e.message}`);
    }

    // 4. Generate Ranking Page
    generateRankingArticle(TARGET_KEYWORD, validatedLineup, productsData, buyingGuideBody, seoMetadata, thumbPath);

    // 5. Generate Reviews
    console.log("\n--> Generating Individual Reviews...");
    for (let i = 0; i < validatedLineup.length; i++) {
        const p = validatedLineup[i]; // Verified items are already the source of truth
        const nextItem = validatedLineup[i + 1] || validatedLineup[0];

        // Ensure description/pros/cons are set (they should be from enrichment)
        if (!p.description) {
            const pros = p.pros || [];
            p.description = `${p.name}は${pros[0] || '注目'}の製品です。`;
        }

        try {
            console.log(`   ✍️ Review: ${p.name}...`);
            const body = await ai_writer.generateReviewBody(p, nextItem.name, BLUEPRINT);
            generateReviewPage(p, body);
        } catch (reviewError) {
            console.log(`   ⚠️ Failed to generate review for "${p.name}": ${reviewError.message}`);
        }
    }

    // 6. Update DB
    updateDatabase(TARGET_KEYWORD, validatedLineup, productsData, seoMetadata, BLUEPRINT, thumbPath);

    // 7. Auto-generate Sitemap (idempotent - safe to run multiple times)
    console.log('\n🗺️  Generating Sitemap...');
    try {
        generateSitemap();
    } catch (e) {
        console.error('   ⚠️ Sitemap generation failed:', e.message);
    }

    // 8. Save Enriched Data to Master JSON
    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(productsData, null, 4));
    console.log(`\n🎉 Article Generated: src/content/articles/${TARGET_KEYWORD}.md`);

    // Ensure clean exit
    process.exit(0);

})();




