/**
 * 🔍 Market Research Module
 * 
 * ライブWeb検索で最新の製品情報を収集
 * AI学習データに依存せず、常に最新の市場トレンドを反映
 */

// Load environment variables with proper path resolution
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Gemini API for product extraction
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Trusted sources with priority scores
const TRUSTED_SOURCES = [
    { domain: 'kakaku.com', priority: 10, name: '価格.com' },
    { domain: 'my-best.com', priority: 9, name: 'mybest' },
    { domain: 'av.watch.impress.co.jp', priority: 8, name: 'AV Watch' },
    { domain: 'e-earphone.blog', priority: 7, name: 'eイヤホン' },
    { domain: 'ascii.jp', priority: 6, name: 'ASCII' },
    { domain: 'gizmodo.jp', priority: 5, name: 'Gizmodo Japan' },
    { domain: 'phileweb.com', priority: 5, name: 'PHILE WEB' }
];

/**
 * Discover products from the market (web search)
 * @param {string} keyword - Search keyword (e.g., "ワイヤレスイヤホン 1万円台 ノイズキャンセリング")
 * @param {object} blueprint - Blueprint with target_reader, comparison_axis, etc.
 * @returns {Promise<Array>} - Array of { name, marketScore, sources: [], mentionCount }
 */
/**
 * Discover products from the market (web search)
 * @param {string} keyword - Search keyword
 * @param {object} blueprint - Blueprint
 * @param {number} targetCount - Minimum products to find (default: 20)
 * @returns {Promise<Array>} - Array of found products
 */
async function discoverProducts(keyword, blueprint, targetCount = 20) {
    console.log(`\n🔍 Market Research: Discovering products for "${keyword}" (Target: ${targetCount})...`);

    const baseKeyword = keyword.replace(/最強/g, '').replace(/おすすめ/g, '').trim();
    let allProducts = [];
    let seenNames = new Set();

    // Retry Loop Configuration
    const MAX_RETRIES = 3;
    let attempt = 0;

    while (allProducts.length < targetCount && attempt < MAX_RETRIES) {
        attempt++;
        console.log(`\n🔄 Market Discovery Attempt ${attempt}/${MAX_RETRIES} (Current: ${allProducts.length})`);

        // Dynamic Query Generation based on attempt
        let currentQueries = [];
        if (attempt === 1) {
            currentQueries = [
                `${keyword} おすすめ 2025`,
                `${keyword} ランキング`,
                `${keyword} 徹底比較`
            ];
        } else if (attempt === 2) {
            currentQueries = [
                `${keyword} コスパ レビュー`,
                `${keyword} 実機レビュー`,
                `${baseKeyword} 最新モデル 評判`
            ];
        } else {
            // Broaden search or use English terms & Site-specific deep dive
            currentQueries = [
                `site:my-best.com ${baseKeyword} 比較`,
                `site:rentio.jp ${baseKeyword}`,
                `site:the360.life ${baseKeyword}`,
                `${baseKeyword} Best 2025 Japan`,
                `${baseKeyword} 価格.com ランキング`
            ];
        }

        let allUrls = [];
        // Search and collect URLs
        for (const query of currentQueries) {
            console.log(`   🌐 Searching: "${query}"`);
            const snippets = await searchBing(query);
            for (const snippet of snippets) {
                // Lower priority threshold in later attempts
                const minPriority = attempt === 1 ? 3 : 2;
                if (snippet.priority >= minPriority && !allUrls.find(u => u.url === snippet.url)) {
                    allUrls.push({ url: snippet.url, source: snippet.source, priority: snippet.priority });
                }
            }
        }

        console.log(`   📄 Found ${allUrls.length} URLs to scrape`);

        // Scrape logic: Increase pages in later attempts
        let allContent = [];
        const maxPages = Math.min(allUrls.length, attempt === 1 ? 10 : 20);

        for (let i = 0; i < maxPages; i++) {
            const urlInfo = allUrls[i];
            if (i % 5 === 0) console.log(`   📖 Scraping [${i + 1}/${maxPages}]...`); // Reduce log noise

            try {
                const content = await scrapePageContent(urlInfo.url);
                if (content && content.length > 100) {
                    allContent.push({
                        source: urlInfo.source,
                        priority: urlInfo.priority,
                        content: content.slice(0, 5000)
                    });
                }
            } catch (e) { }
        }

        if (allContent.length > 0) {
            console.log(`   📝 Extracting products from ${allContent.length} articles with AI...`);
            const products = await extractProductsFromArticles(allContent, keyword, blueprint);

            // Deduplicate and Add
            const scored = calculateMarketScore(products, allContent);

            for (const p of scored) {
                // Normalize name for duplication check
                const normName = p.name.toLowerCase().replace(/\s+/g, '');
                // Simple duplication check
                const isDup = Array.from(seenNames).some(seen =>
                    seen.includes(normName) || normName.includes(seen)
                );

                if (!isDup) {
                    seenNames.add(normName);
                    allProducts.push(p);
                }
            }
        }

        console.log(`   ✅ Total unique products found so far: ${allProducts.length}`);
    }

    return allProducts;
}

/**
 * Search Bing and collect snippets from trusted sources
 */
async function searchBing(query) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&setmkt=ja-JP&setlang=ja`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));

        const results = await page.evaluate((trustedDomains) => {
            const snippets = [];
            document.querySelectorAll('li.b_algo').forEach(li => {
                const titleEl = li.querySelector('h2');
                const linkEl = li.querySelector('a');
                const snippetEl = li.querySelector('.b_caption p') || li.querySelector('.b_snippet');

                if (!titleEl || !linkEl) return;

                const url = linkEl.href || '';
                const title = titleEl.innerText || '';
                const snippet = snippetEl?.innerText || '';

                // Check if from trusted source
                // Check if from trusted source
                const domain = trustedDomains.find(d => url.includes(d.domain));
                let sourcePriority = domain ? domain.priority : 1;

                // Boost priority for good content indicators in title (e.g. detailed reviews)
                if (title.includes("比較") || title.includes("レビュー") || title.includes("実機") || title.includes("検証")) {
                    sourcePriority += 3;
                }
                const sourceName = domain ? domain.name : new URL(url).hostname;

                // Exclude Amazon/Rakuten - we want external opinions
                if (url.includes('amazon') || url.includes('rakuten')) return;

                snippets.push({
                    title,
                    url,
                    snippet,
                    source: sourceName,
                    priority: sourcePriority,
                    fullText: `${title} ${snippet}`
                });
            });
            return snippets.slice(0, 10);
        }, TRUSTED_SOURCES);

        await browser.close();
        return results;

    } catch (e) {
        console.log(`      ⚠️ Search failed: ${e.message}`);
        if (browser) await browser.close();
        return [];
    }
}

/**
 * Extract product names from scraped article content using AI
 */
async function extractProductsFromArticles(articles, keyword, blueprint) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Combine all article content
    const context = articles.map(a => `[${a.source}]\n${a.content}`).join('\n\n---\n\n');

    const prompt = `
あなたは製品調査アシスタントです。以下のレビュー記事から、「${keyword}」に該当する具体的な製品名を抽出してください。

【記事コンテンツ】
${context.slice(0, 12000)}

【抽出ルール】
1. 具体的な製品名のみを抽出（例: "Sony WF-1000XM5", "Anker Soundcore Space A40"）
2. ブランド名と型番が分かるものを優先
3. カテゴリ名（例: "ワイヤレスイヤホン"）は除外
4. 関連商品（ケース、イヤーピース等）は除外
5. ${blueprint?.comparison_axis ? `比較軸「${blueprint.comparison_axis}」に強く関連し、その性能が高く評価されている製品を厳選して抽出` : '記事内で高く評価されている製品を優先'}
6. 最大20製品まで

【出力形式】
JSON配列で出力:
["製品名1", "製品名2", ...]

製品が見つからない場合は空配列 [] を返してください。
`;

    try {
        console.log(`   🤖 Calling Gemini AI for product extraction...`);
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        console.log(`   📝 AI Response (first 300 chars): ${text.slice(0, 300)}...`);

        // Clean markdown code blocks if present
        text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

        // Parse JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                const products = JSON.parse(jsonMatch[0]);
                console.log(`   🤖 AI extracted ${products.length} product names`);
                return products;
            } catch (parseError) {
                console.log(`   ⚠️ JSON parse failed: ${parseError.message}`);
            }
        } else {
            console.log(`   ⚠️ No JSON array found in AI response`);
        }
    } catch (e) {
        console.log(`   ⚠️ AI extraction failed: ${e.message}`);
    }

    return [];
}

/**
 * Use Gemini to extract product names from collected snippets
 */
async function extractProductsWithAI(snippets, keyword, blueprint) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Combine all snippets into context
    const context = snippets.map(s => `[${s.source}] ${s.fullText}`).join('\n\n');

    const prompt = `
あなたは製品調査アシスタントです。以下のWeb検索結果から、「${keyword}」に該当する具体的な製品名を抽出してください。

【検索結果】
${context}

【抽出ルール】
1. 具体的な製品名のみを抽出（例: "Sony WF-1000XM5", "Anker Soundcore Space A40"）
2. カテゴリ名（例: "ワイヤレスイヤホン"）は除外
3. 関連商品（ケース、イヤーピース等）は除外
4. ${blueprint?.comparison_axis ? `比較軸「${blueprint.comparison_axis}」に強く関連し、その性能が高く評価されている製品を厳選して抽出` : '検索結果で高く評価されている製品を優先'}
5. 最大20製品まで

【出力形式】
JSON配列で出力:
["製品名1", "製品名2", ...]

製品が見つからない場合は空配列 [] を返してください。
`;

    try {
        console.log(`   🤖 Calling Gemini AI for product extraction...`);
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        console.log(`   📝 AI Response (first 200 chars): ${text.slice(0, 200)}...`);

        // Clean markdown code blocks if present
        text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

        // Parse JSON from response - use greedy matching for the full array
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                const products = JSON.parse(jsonMatch[0]);
                console.log(`   🤖 AI extracted ${products.length} product names`);
                return products;
            } catch (parseError) {
                console.log(`   ⚠️ JSON parse failed: ${parseError.message}`);
                console.log(`   📋 Attempted to parse: ${jsonMatch[0].slice(0, 100)}...`);
            }
        } else {
            console.log(`   ⚠️ No JSON array found in AI response`);
        }
    } catch (e) {
        console.log(`   ⚠️ AI extraction failed: ${e.message}`);
    }

    return [];
}

/**
 * Calculate market score based on:
 * - Mention count across sources
 * - Source priority (価格.com > random blogs)
 */
function calculateMarketScore(productNames, articles) {
    const productScores = {};

    for (const name of productNames) {
        // Extract key parts of product name (brand + model)
        const normalizedName = name.toLowerCase();
        const nameParts = name.split(/[\s\-\/]+/).filter(p => p.length > 2);

        productScores[name] = {
            name,
            marketScore: 5, // Base score for being mentioned by AI
            mentionCount: 1, // Count AI extraction as 1 mention
            sources: ['AI']
        };

        for (const article of articles) {
            // Handle both snippet format (fullText) and article format (content)
            const text = (article.fullText || article.content || '').toLowerCase();

            // More flexible matching - check if key parts of product name appear
            const matchScore = nameParts.filter(part => text.includes(part.toLowerCase())).length;
            const matchRatio = nameParts.length > 0 ? matchScore / nameParts.length : 0;

            if (matchRatio >= 0.5) { // At least 50% of name parts match
                productScores[name].mentionCount++;
                productScores[name].marketScore += article.priority || 1;
                if (!productScores[name].sources.includes(article.source)) {
                    productScores[name].sources.push(article.source);
                }
            }
        }
    }

    // Sort by market score - no filtering (keep all products)
    const sorted = Object.values(productScores)
        .sort((a, b) => b.marketScore - a.marketScore);

    console.log(`   📊 Top products by market score:`);
    sorted.slice(0, 5).forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.name} (Score: ${p.marketScore}, Mentions: ${p.mentionCount})`);
    });

    return sorted;
}

/**
 * Scrape detailed content from a specific URL
 * For getting more detailed product info from trusted sources
 */
async function scrapePageContent(url) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        const content = await page.evaluate(() => {
            // Remove scripts, styles, nav, footer
            document.querySelectorAll('script, style, nav, footer, header, aside').forEach(el => el.remove());
            return document.body.innerText.slice(0, 10000); // Limit to 10k chars
        });

        await browser.close();
        return content;

    } catch (e) {
        if (browser) await browser.close();
        return '';
    }
}

/**
 * Kakaku.com Category URL Mapping (Verified URLs)
 * Maps keywords to the correct Kakaku.com ranking page URLs
 * 
 * Note: Kakaku.com URL structure is: /kaden/{category}/ranking_{code}/
 * Sub-categories have different codes (e.g., 完全ワイヤレス = earphone/2044)
 */
const KAKAKU_CATEGORY_MAP = {
    // ================================================================
    // イヤホン・ヘッドホン・オーディオ (headphones/audio)
    // ================================================================
    '完全ワイヤレス': { path: 'headphones', code: '2046' },
    'ワイヤレスイヤホン': { path: 'headphones', code: '2046' },
    'イヤホン': { path: 'headphones', code: '2046' },
    'ヘッドホン': { path: 'headphones', code: '2046' },
    'Bluetooth': { path: 'headphones', code: '2046' },
    'カナル': { path: 'headphones', code: '2046' },
    '骨伝導': { path: 'headphones', code: '2046' },
    'ヘッドセット': { path: 'headset', code: '2049' },
    'スピーカー': { path: 'speaker', code: '2047' },
    'Bluetoothスピーカー': { path: 'bluetooth-speaker', code: '7091' },
    'サウンドバー': { path: 'sound-bar', code: '7073' },
    'ホームシアター': { path: 'home-theater-speaker', code: '2048' },
    'AVアンプ': { path: 'av-amp', code: '2056' },
    'プリメインアンプ': { path: 'pre-main-amp', code: '2059' },
    'ミニコンポ': { path: 'mini-component', code: '2054' },
    'ポータブルオーディオ': { path: 'digital-audio-player', code: '2053' },
    'DAP': { path: 'digital-audio-player', code: '2053' },
    'ヘッドホンアンプ': { path: 'headphone-amp', code: '7020' },

    // ================================================================
    // テレビ・映像機器 (TV/Video)
    // ================================================================
    'テレビ': { path: 'lcd-tv', code: '2041' },
    '液晶テレビ': { path: 'lcd-tv', code: '2041' },
    '有機EL': { path: 'lcd-tv', code: '2041' },
    'ブルーレイレコーダー': { path: 'dvd-recorder', code: '2022' },
    'DVDレコーダー': { path: 'dvd-recorder', code: '2022' },
    'ブルーレイプレーヤー': { path: 'dvd-player', code: '2025' },
    'プロジェクタ': { path: 'projector', code: '2024' },
    'チューナー': { path: 'dtv-tuner', code: '2071' },

    // ================================================================
    // キッチン家電 (Kitchen)
    // ================================================================
    '冷蔵庫': { path: 'freezer', code: '2115' },
    '冷凍庫': { path: 'freezer', code: '2116' },
    'ワインセラー': { path: 'wine-cellar', code: '2119' },
    '炊飯器': { path: 'rice-cooker', code: '2125' },
    'IH炊飯器': { path: 'rice-cooker', code: '2125' },
    '電子レンジ': { path: 'microwave-oven', code: '2117' },
    'オーブンレンジ': { path: 'microwave-oven', code: '2117' },
    'トースター': { path: 'toaster', code: '2118' },
    'ホームベーカリー': { path: 'homebakery', code: '2119' },
    'ミキサー': { path: 'mixer', code: '2122' },
    'フードプロセッサー': { path: 'mixer', code: '2122' },
    '電気ポット': { path: 'electric-pot', code: '2120' },
    '電気ケトル': { path: 'electric-pot', code: '2120' },
    'コーヒーメーカー': { path: 'coffee-maker', code: '2121' },
    'エスプレッソマシン': { path: 'espresso-machine', code: '7019' },
    '食器洗い機': { path: 'dish-washer', code: '2124' },
    '食洗機': { path: 'dish-washer', code: '2124' },
    'IHクッキングヒーター': { path: 'ihcooking-heater', code: '2134' },
    'ホットプレート': { path: 'hot-plate', code: '2131' },
    '圧力鍋': { path: 'pressure-cooker', code: '7074' },
    '電気圧力鍋': { path: 'electric-pressure-cooker', code: '7091' },
    '低温調理器': { path: 'low-temperature-cooker', code: '7092' },
    'ノンフライヤー': { path: 'non-fryer', code: '7058' },

    // ================================================================
    // 生活家電 (Living)
    // ================================================================
    '掃除機': { path: 'vacuum', code: '2165' },
    'コードレス掃除機': { path: 'cordless-vacuum', code: '7084' },
    'ロボット掃除機': { path: 'robot-vacuum', code: '7032' },
    'ハンディ掃除機': { path: 'handy-vacuum', code: '2167' },
    '布団クリーナー': { path: 'futon-cleaner', code: '7057' },
    'スチームクリーナー': { path: 'steam-cleaner', code: '7044' },
    '高圧洗浄機': { path: 'pressure-washer', code: '7027' },
    '洗濯機': { path: 'washing-machine', code: '2107' },
    'ドラム式洗濯機': { path: 'washing-machine', code: '2107' },
    '縦型洗濯機': { path: 'washing-machine', code: '2107' },
    '衣類乾燥機': { path: 'clothes-dryer', code: '2109' },
    '布団乾燥機': { path: 'futon-dryer', code: '2186' },
    'アイロン': { path: 'iron', code: '2183' },
    'ミシン': { path: 'sewing-machine', code: '2163' },

    // ================================================================
    // 空調・季節家電 (Air/Season)
    // ================================================================
    'エアコン': { path: 'aircon', code: '2180' },
    'クーラー': { path: 'aircon', code: '2180' },
    '空気清浄機': { path: 'air-purifier', code: '2147' },
    '除湿機': { path: 'dehumidifier', code: '2175' },
    '加湿器': { path: 'humidifier', code: '2161' },
    '扇風機': { path: 'fan', code: '2174' },
    'サーキュレーター': { path: 'circulator', code: '7042' },
    'ヒーター': { path: 'heater', code: '2150' },
    'ストーブ': { path: 'heater', code: '2150' },
    'ファンヒーター': { path: 'fan-heater', code: '2151' },
    'ホットカーペット': { path: 'hot-carpet', code: '2156' },
    'こたつ': { path: 'kotatsu', code: '2158' },
    '電気毛布': { path: 'electric-blanket', code: '2159' },

    // ================================================================
    // 健康・美容家電 (Health/Beauty)
    // ================================================================
    'シェーバー': { path: 'shaver', code: '2143' },
    '電気シェーバー': { path: 'shaver', code: '2143' },
    '脱毛器': { path: 'epilator', code: '2144' },
    'バリカン': { path: 'hair-clipper', code: '2145' },
    '鼻毛カッター': { path: 'nasal-hair-cutter', code: '7046' },
    '電動歯ブラシ': { path: 'electric-toothbrush', code: '2149' },
    'ヘアドライヤー': { path: 'hair-dryer', code: '2187' },
    'ドライヤー': { path: 'hair-dryer', code: '2187' },
    'ヘアアイロン': { path: 'hair-iron', code: '7028' },
    '美顔器': { path: 'facial-equipment', code: '7047' },
    'マッサージ器': { path: 'massager', code: '2191' },
    'マッサージチェア': { path: 'massage-chair', code: '2192' },
    '体重計': { path: 'weight-scale', code: '2148' },
    '体脂肪計': { path: 'weight-scale', code: '2148' },
    '体組成計': { path: 'weight-scale', code: '2148' },
    '血圧計': { path: 'blood-pressure-monitor', code: '2193' },
    '体温計': { path: 'thermometer', code: '7048' },

    // ================================================================
    // 情報家電 (Info Appliances)
    // ================================================================
    '電子辞書': { path: 'electronic-dictionary', code: '2073' },
    '電話機': { path: 'phone', code: '2185' },
    'FAX': { path: 'fax', code: '2198' },
    'ラジオ': { path: 'radio', code: '2055' },

    // ================================================================
    // 電源・モバイル (Power/Mobile)
    // ================================================================
    'モバイルバッテリー': { path: 'portable-charger', code: '7062' },
    'ポータブル電源': { path: 'portable-power', code: '7089' },
    '充電器': { path: 'charger', code: '7063' },

    // ================================================================
    // 照明 (Lighting)
    // ================================================================
    'シーリングライト': { path: 'ceiling-light', code: '2081' },
    'LEDシーリングライト': { path: 'led-ceiling-light', code: '7031' },
    'LED電球': { path: 'led-light', code: '7030' },
    'デスクライト': { path: 'desk-light', code: '2082' },
    'スタンドライト': { path: 'stand-light', code: '2084' },

    // ================================================================
    // ネットワーク・通信 (Network)
    // ================================================================
    '無線LANルーター': { path: 'wifi-router', code: '2077' },
    'Wi-Fiルーター': { path: 'wifi-router', code: '2077' },
    'ルーター': { path: 'wifi-router', code: '2077' },

    // ================================================================
    // 住宅設備 (Home Equipment)
    // ================================================================
    '浄水器': { path: 'water-purifier', code: '2137' },
    'ウォーターサーバー': { path: 'water-server', code: '7060' },
    '温水洗浄便座': { path: 'washlet', code: '2136' },
    'ウォシュレット': { path: 'washlet', code: '2136' },
    'ガスコンロ': { path: 'gas-stove', code: '2133' },
    '給湯器': { path: 'water-heater', code: '2135' },
    'インターホン': { path: 'intercom', code: '2197' },
    '防犯カメラ': { path: 'network-camera', code: '7035' },
    'ネットワークカメラ': { path: 'network-camera', code: '7035' },

    // ================================================================
    // カメラ (Camera) - section: camera
    // ================================================================
    'デジタルカメラ': { section: 'camera', path: 'digital-camera', code: '0050' },
    'デジカメ': { section: 'camera', path: 'digital-camera', code: '0050' },
    'ミラーレス': { section: 'camera', path: 'mirrorless', code: '0049' },
    '一眼レフ': { section: 'camera', path: 'digital-slr', code: '0049' },
    'ビデオカメラ': { section: 'camera', path: 'video-camera', code: '0060' },
    'アクションカメラ': { section: 'camera', path: 'action-camera', code: '7064' },
    'レンズ': { section: 'camera', path: 'camera-lens', code: '1050' },
    '三脚': { section: 'camera', path: 'tripod', code: '1033' },

    // ================================================================
    // PC・パソコン (PC) - section: pc
    // ================================================================
    'ノートパソコン': { section: 'pc', path: 'note-pc', code: '0020' },
    'ノートPC': { section: 'pc', path: 'note-pc', code: '0020' },
    'デスクトップPC': { section: 'pc', path: 'desktop-pc', code: '0010' },
    'タブレット': { section: 'pc', path: 'tablet', code: '0030' },
    'iPad': { section: 'pc', path: 'tablet', code: '0030' },
    'プリンタ': { section: 'pc', path: 'printer', code: '0060' },
    'モニター': { section: 'pc', path: 'lcd-monitor', code: '0085' },
    'ディスプレイ': { section: 'pc', path: 'lcd-monitor', code: '0085' },
    'キーボード': { section: 'pc', path: 'keyboard', code: '0150' },
    'マウス': { section: 'pc', path: 'mouse', code: '0160' },
    'SSD': { section: 'pc', path: 'ssd', code: '0537' },
    'HDD': { section: 'pc', path: 'hdd-35inch', code: '0530' },
    '外付けHDD': { section: 'pc', path: 'external-hdd', code: '0538' },
    'USBメモリ': { section: 'pc', path: 'usb-memory', code: '0536' },
    'SDカード': { section: 'pc', path: 'sd-card', code: '0528' },

    // ================================================================
    // カー用品 (Car) - section: car_goods
    // ================================================================
    'カーナビ': { section: 'car_goods', path: 'car-navigation', code: '2010' },
    'ドライブレコーダー': { section: 'car_goods', path: 'drive-recorder', code: '7034' },
    'ドラレコ': { section: 'car_goods', path: 'drive-recorder', code: '7034' },
    'レーダー探知機': { section: 'car_goods', path: 'car-radar', code: '2005' },
    'カーオーディオ': { section: 'car_goods', path: 'car-audio', code: '2015' },
    'タイヤ': { section: 'car_goods', path: 'tire', code: '7050' },

    // ================================================================
    // ゲーム・ホビー (Game/Hobby)
    // ================================================================
    'ゲーム機': { path: 'game-machine', code: '2501' },
    'PlayStation': { path: 'game-machine', code: '2501' },
    'Nintendo': { path: 'game-machine', code: '2501' },
    'Switch': { path: 'game-machine', code: '2501' },
    'PS5': { path: 'game-machine', code: '2501' },
    'Xbox': { path: 'game-machine', code: '2501' },

    // ================================================================
    // ホビー (Hobby) - section: hobby
    // ================================================================
    'フィギュア': { section: 'hobby', path: 'figure', code: '3010' },
    'プラモデル': { section: 'hobby', path: 'plastic-model', code: '3015' },
    'ラジコン': { section: 'hobby', path: 'radio-control', code: '3020' },
    'ミニ四駆': { section: 'hobby', path: 'mini-yonku', code: '3025' },
    'ドローン': { section: 'hobby', path: 'drone', code: '7065' },
    '電子ピアノ': { section: 'hobby', path: 'electronic-piano', code: '2570' },
    'キーボード楽器': { section: 'hobby', path: 'keyboard-instrument', code: '2571' },
    'ギター': { section: 'hobby', path: 'guitar', code: '2575' },
    '電子楽器': { section: 'hobby', path: 'electronic-instrument', code: '2573' },

    // ================================================================
    // スマートフォン・携帯電話 (Smartphones) - section: keitai
    // ================================================================
    'スマートフォン': { section: 'keitai', path: 'smartphone', code: '7041' },
    'スマホ': { section: 'keitai', path: 'smartphone', code: '7041' },
    'iPhone': { section: 'keitai', path: 'smartphone', code: '7041' },
    'Android': { section: 'keitai', path: 'smartphone', code: '7041' },
    '携帯電話': { section: 'keitai', path: 'phs', code: '3147' },
    'スマートウォッチ': { section: 'keitai', path: 'smartwatch', code: '7066' },

    // ================================================================
    // インテリア・家具 (Interior/Furniture) - section: interior
    // ================================================================
    'ソファ': { section: 'interior', path: 'sofa', code: '0066' },
    'ソファー': { section: 'interior', path: 'sofa', code: '0066' },
    'ベッド': { section: 'interior', path: 'bed', code: '0062' },
    'マットレス': { section: 'interior', path: 'mattress', code: '0063' },
    'デスク': { section: 'interior', path: 'desk', code: '0010' },
    '机': { section: 'interior', path: 'desk', code: '0010' },
    'チェア': { section: 'interior', path: 'chair', code: '0020' },
    '椅子': { section: 'interior', path: 'chair', code: '0020' },
    'オフィスチェア': { section: 'interior', path: 'office-chair', code: '0021' },
    'ゲーミングチェア': { section: 'interior', path: 'gaming-chair', code: '7090' },
    'テーブル': { section: 'interior', path: 'table', code: '0030' },
    'ダイニングテーブル': { section: 'interior', path: 'dining-table', code: '0031' },
    '本棚': { section: 'interior', path: 'bookshelf', code: '0050' },
    'ラック': { section: 'interior', path: 'rack', code: '0051' },
    '収納': { section: 'interior', path: 'storage', code: '0052' },
    'カーテン': { section: 'interior', path: 'curtain', code: '0070' },
    'ブラインド': { section: 'interior', path: 'blind', code: '0071' },
    'カーペット': { section: 'interior', path: 'carpet', code: '0080' },
    'ラグ': { section: 'interior', path: 'rug', code: '0081' },
    'クッション': { section: 'interior', path: 'cushion', code: '0090' },
    '枕': { section: 'interior', path: 'pillow', code: '0064' },
    '布団': { section: 'interior', path: 'futon', code: '0065' },

    // ================================================================
    // ファッション (Fashion) - section: fashion
    // ================================================================
    'バッグ': { section: 'fashion', path: 'bag', code: '0010' },
    'リュック': { section: 'fashion', path: 'backpack', code: '0011' },
    'バックパック': { section: 'fashion', path: 'backpack', code: '0011' },
    'トートバッグ': { section: 'fashion', path: 'tote-bag', code: '0012' },
    'ショルダーバッグ': { section: 'fashion', path: 'shoulder-bag', code: '0013' },
    '財布': { section: 'fashion', path: 'wallet', code: '0020' },
    'サングラス': { section: 'fashion', path: 'sunglasses', code: '0030' },
    'メガネ': { section: 'fashion', path: 'glasses', code: '0031' },
    'ベルト': { section: 'fashion', path: 'belt', code: '0040' },
    'ネクタイ': { section: 'fashion', path: 'necktie', code: '0041' },
    'マフラー': { section: 'fashion', path: 'muffler', code: '0050' },
    'ストール': { section: 'fashion', path: 'stole', code: '0051' },
    '帽子': { section: 'fashion', path: 'hat', code: '0060' },
    'キャップ': { section: 'fashion', path: 'cap', code: '0061' },
    '手袋': { section: 'fashion', path: 'gloves', code: '0070' },
    '傘': { section: 'fashion', path: 'umbrella', code: '0080' },
    'レインウェア': { section: 'fashion', path: 'rainwear', code: '0081' },

    // ================================================================
    // 靴・シューズ (Shoes) - section: shoes
    // ================================================================
    'スニーカー': { section: 'shoes', path: 'sneakers', code: '0010' },
    'ランニングシューズ': { section: 'shoes', path: 'running-shoes', code: '0011' },
    'ビジネスシューズ': { section: 'shoes', path: 'business-shoes', code: '0020' },
    '革靴': { section: 'shoes', path: 'leather-shoes', code: '0021' },
    'ブーツ': { section: 'shoes', path: 'boots', code: '0030' },
    'サンダル': { section: 'shoes', path: 'sandals', code: '0040' },
    'スリッパ': { section: 'shoes', path: 'slippers', code: '0050' },

    // ================================================================
    // 腕時計・アクセサリー (Watch/Accessory) - section: watch_accessory
    // ================================================================
    '腕時計': { section: 'watch_accessory', path: 'watch', code: '0010' },
    'メンズ腕時計': { section: 'watch_accessory', path: 'mens-watch', code: '0011' },
    'レディース腕時計': { section: 'watch_accessory', path: 'ladies-watch', code: '0012' },
    'G-SHOCK': { section: 'watch_accessory', path: 'gshock', code: '0013' },
    'スマートウォッチ': { section: 'watch_accessory', path: 'smartwatch', code: '7066' },
    'ネックレス': { section: 'watch_accessory', path: 'necklace', code: '0020' },
    'ブレスレット': { section: 'watch_accessory', path: 'bracelet', code: '0021' },
    'リング': { section: 'watch_accessory', path: 'ring', code: '0022' },
    '指輪': { section: 'watch_accessory', path: 'ring', code: '0022' },
    'ピアス': { section: 'watch_accessory', path: 'piercing', code: '0023' },
    'イヤリング': { section: 'watch_accessory', path: 'earring', code: '0024' },

    // ================================================================
    // スポーツ (Sports) - section: sports
    // ================================================================
    'ゴルフクラブ': { section: 'sports', path: 'golf-club', code: '0010' },
    'ゴルフ': { section: 'sports', path: 'golf', code: '0010' },
    'ゴルフバッグ': { section: 'sports', path: 'golf-bag', code: '0011' },
    'ゴルフシューズ': { section: 'sports', path: 'golf-shoes', code: '0012' },
    'テニスラケット': { section: 'sports', path: 'tennis-racket', code: '0020' },
    'テニス': { section: 'sports', path: 'tennis', code: '0020' },
    '野球': { section: 'sports', path: 'baseball', code: '0030' },
    'グローブ': { section: 'sports', path: 'baseball-glove', code: '0031' },
    'バット': { section: 'sports', path: 'baseball-bat', code: '0032' },
    'サッカー': { section: 'sports', path: 'soccer', code: '0040' },
    'サッカーボール': { section: 'sports', path: 'soccer-ball', code: '0041' },
    'サッカースパイク': { section: 'sports', path: 'soccer-spike', code: '0042' },
    'バスケットボール': { section: 'sports', path: 'basketball', code: '0050' },
    'バレーボール': { section: 'sports', path: 'volleyball', code: '0055' },
    '水泳': { section: 'sports', path: 'swimming', code: '0060' },
    '水着': { section: 'sports', path: 'swimwear', code: '0061' },
    'ゴーグル': { section: 'sports', path: 'goggles', code: '0062' },
    'フィットネス': { section: 'sports', path: 'fitness', code: '0070' },
    'トレーニング': { section: 'sports', path: 'training', code: '0071' },
    'ダンベル': { section: 'sports', path: 'dumbbell', code: '0072' },
    'ヨガマット': { section: 'sports', path: 'yoga-mat', code: '0073' },
    'プロテイン': { section: 'sports', path: 'protein', code: '0074' },
    'スキー': { section: 'sports', path: 'ski', code: '0080' },
    'スノーボード': { section: 'sports', path: 'snowboard', code: '0081' },
    'ウェア': { section: 'sports', path: 'sports-wear', code: '0090' },

    // ================================================================
    // アウトドア (Outdoor) - section: outdoor
    // ================================================================
    'テント': { section: 'outdoor', path: 'tent', code: '0010' },
    'タープ': { section: 'outdoor', path: 'tarp', code: '0011' },
    'シュラフ': { section: 'outdoor', path: 'sleeping-bag', code: '0020' },
    '寝袋': { section: 'outdoor', path: 'sleeping-bag', code: '0020' },
    'キャンプ': { section: 'outdoor', path: 'camp', code: '0001' },
    'キャンプ用品': { section: 'outdoor', path: 'camp', code: '0001' },
    'アウトドアチェア': { section: 'outdoor', path: 'outdoor-chair', code: '0030' },
    'アウトドアテーブル': { section: 'outdoor', path: 'outdoor-table', code: '0031' },
    'クーラーボックス': { section: 'outdoor', path: 'cooler-box', code: '0040' },
    'バーベキュー': { section: 'outdoor', path: 'bbq', code: '0050' },
    'BBQ': { section: 'outdoor', path: 'bbq', code: '0050' },
    'グリル': { section: 'outdoor', path: 'grill', code: '0051' },
    'ランタン': { section: 'outdoor', path: 'lantern', code: '0060' },
    'ヘッドライト': { section: 'outdoor', path: 'headlight', code: '0061' },
    '登山': { section: 'outdoor', path: 'mountain', code: '0070' },
    'トレッキング': { section: 'outdoor', path: 'trekking', code: '0071' },
    '登山靴': { section: 'outdoor', path: 'trekking-shoes', code: '0072' },
    '釣り': { section: 'outdoor', path: 'fishing', code: '0080' },
    'フィッシング': { section: 'outdoor', path: 'fishing', code: '0080' },
    'ロッド': { section: 'outdoor', path: 'fishing-rod', code: '0081' },
    'リール': { section: 'outdoor', path: 'fishing-reel', code: '0082' },
    'ルアー': { section: 'outdoor', path: 'lure', code: '0083' },

    // ================================================================
    // 自転車 (Bicycle) - section: bicycle
    // ================================================================
    '自転車': { section: 'bicycle', path: 'bicycle', code: '0001' },
    'ロードバイク': { section: 'bicycle', path: 'road-bike', code: '0010' },
    'クロスバイク': { section: 'bicycle', path: 'cross-bike', code: '0011' },
    'マウンテンバイク': { section: 'bicycle', path: 'mtb', code: '0012' },
    'MTB': { section: 'bicycle', path: 'mtb', code: '0012' },
    '電動自転車': { section: 'bicycle', path: 'electric-bike', code: '0020' },
    '電動アシスト': { section: 'bicycle', path: 'electric-bike', code: '0020' },
    '折りたたみ自転車': { section: 'bicycle', path: 'folding-bike', code: '0030' },
    'ミニベロ': { section: 'bicycle', path: 'mini-velo', code: '0031' },
    'シティサイクル': { section: 'bicycle', path: 'city-cycle', code: '0040' },
    'ママチャリ': { section: 'bicycle', path: 'city-cycle', code: '0040' },
    '子供用自転車': { section: 'bicycle', path: 'kids-bike', code: '0050' },
    'ヘルメット': { section: 'bicycle', path: 'helmet', code: '0060' },
    'サイクルウェア': { section: 'bicycle', path: 'cycle-wear', code: '0070' },

    // ================================================================
    // ベビー・キッズ (Baby/Kids) - section: baby
    // ================================================================
    'ベビーカー': { section: 'baby', path: 'baby-car', code: '0010' },
    'チャイルドシート': { section: 'baby', path: 'child-seat', code: '0020' },
    'ベビーベッド': { section: 'baby', path: 'baby-bed', code: '0030' },
    'ベビーチェア': { section: 'baby', path: 'baby-chair', code: '0040' },
    '抱っこ紐': { section: 'baby', path: 'baby-carrier', code: '0050' },
    'おむつ': { section: 'baby', path: 'diaper', code: '0060' },
    'ミルク': { section: 'baby', path: 'baby-milk', code: '0070' },
    '粉ミルク': { section: 'baby', path: 'baby-milk', code: '0070' },
    '哺乳瓶': { section: 'baby', path: 'baby-bottle', code: '0071' },
    'ベビー服': { section: 'baby', path: 'baby-wear', code: '0080' },
    'おもちゃ': { section: 'baby', path: 'toy', code: '0090' },
    '知育玩具': { section: 'baby', path: 'educational-toy', code: '0091' },
    'キッズ': { section: 'baby', path: 'kids', code: '0100' },
    'ランドセル': { section: 'baby', path: 'school-bag', code: '0101' },

    // ================================================================
    // ペット (Pet) - section: pet
    // ================================================================
    'ペット': { section: 'pet', path: 'pet', code: '0001' },
    'ドッグフード': { section: 'pet', path: 'dog-food', code: '0010' },
    '犬': { section: 'pet', path: 'dog', code: '0010' },
    'キャットフード': { section: 'pet', path: 'cat-food', code: '0020' },
    '猫': { section: 'pet', path: 'cat', code: '0020' },
    'ペット用品': { section: 'pet', path: 'pet-goods', code: '0030' },
    'ペットケージ': { section: 'pet', path: 'pet-cage', code: '0031' },
    'ペットキャリー': { section: 'pet', path: 'pet-carrier', code: '0032' },
    '水槽': { section: 'pet', path: 'fish-tank', code: '0040' },
    'アクアリウム': { section: 'pet', path: 'aquarium', code: '0041' },

    // ================================================================
    // DIY・工具 (DIY/Tools) - section: diy
    // ================================================================
    '電動ドリル': { section: 'diy', path: 'electric-drill', code: '0010' },
    'インパクトドライバー': { section: 'diy', path: 'impact-driver', code: '0011' },
    '電動ドライバー': { section: 'diy', path: 'electric-driver', code: '0012' },
    '丸ノコ': { section: 'diy', path: 'circular-saw', code: '0020' },
    'チェーンソー': { section: 'diy', path: 'chainsaw', code: '0021' },
    'サンダー': { section: 'diy', path: 'sander', code: '0022' },
    'グラインダー': { section: 'diy', path: 'grinder', code: '0023' },
    '工具セット': { section: 'diy', path: 'tool-set', code: '0030' },
    'レンチ': { section: 'diy', path: 'wrench', code: '0031' },
    'ドライバーセット': { section: 'diy', path: 'driver-set', code: '0032' },
    'ペンキ': { section: 'diy', path: 'paint', code: '0040' },
    '塗料': { section: 'diy', path: 'paint', code: '0040' },
    '溶接機': { section: 'diy', path: 'welder', code: '0050' },
    'コンプレッサー': { section: 'diy', path: 'compressor', code: '0051' },

    // ================================================================
    // キッチン用品 (Kitchen Goods) - section: kitchen
    // ================================================================
    '鍋': { section: 'kitchen', path: 'pot', code: '0010' },
    'フライパン': { section: 'kitchen', path: 'frying-pan', code: '0011' },
    '圧力鍋': { section: 'kitchen', path: 'pressure-cooker', code: '0012' },
    '包丁': { section: 'kitchen', path: 'knife', code: '0020' },
    'まな板': { section: 'kitchen', path: 'cutting-board', code: '0021' },
    '食器': { section: 'kitchen', path: 'tableware', code: '0030' },
    'グラス': { section: 'kitchen', path: 'glass', code: '0031' },
    'マグカップ': { section: 'kitchen', path: 'mug', code: '0032' },
    'カトラリー': { section: 'kitchen', path: 'cutlery', code: '0040' },
    '弁当箱': { section: 'kitchen', path: 'lunch-box', code: '0050' },
    '水筒': { section: 'kitchen', path: 'water-bottle', code: '0051' },
    'タンブラー': { section: 'kitchen', path: 'tumbler', code: '0052' },
    '保存容器': { section: 'kitchen', path: 'storage-container', code: '0060' },

    // ================================================================
    // 生活雑貨 (Household Goods) - section: houseware
    // ================================================================
    '洗剤': { section: 'houseware', path: 'detergent', code: '0010' },
    '柔軟剤': { section: 'houseware', path: 'softener', code: '0011' },
    '掃除用品': { section: 'houseware', path: 'cleaning-goods', code: '0020' },
    'タオル': { section: 'houseware', path: 'towel', code: '0030' },
    'バスタオル': { section: 'houseware', path: 'bath-towel', code: '0031' },
    'バスマット': { section: 'houseware', path: 'bath-mat', code: '0032' },
    'トイレ用品': { section: 'houseware', path: 'toilet-goods', code: '0040' },
    '芳香剤': { section: 'houseware', path: 'air-freshener', code: '0050' },
    '消臭剤': { section: 'houseware', path: 'deodorizer', code: '0051' },
    '虫よけ': { section: 'houseware', path: 'insect-repellent', code: '0060' },
    '殺虫剤': { section: 'houseware', path: 'insecticide', code: '0061' },
    'ゴミ箱': { section: 'houseware', path: 'trash-can', code: '0070' },
    '文房具': { section: 'houseware', path: 'stationery', code: '0080' },
    'ノート': { section: 'houseware', path: 'notebook', code: '0081' },
    'ペン': { section: 'houseware', path: 'pen', code: '0082' },

    // ================================================================
    // ビューティー追加 (Beauty/Health Extra) - section: beauty_health
    // ================================================================
    'コスメ': { section: 'beauty_health', path: 'cosmetics', code: '0010' },
    '化粧品': { section: 'beauty_health', path: 'cosmetics', code: '0010' },
    'ファンデーション': { section: 'beauty_health', path: 'foundation', code: '0011' },
    'リップ': { section: 'beauty_health', path: 'lipstick', code: '0012' },
    'アイシャドウ': { section: 'beauty_health', path: 'eyeshadow', code: '0013' },
    'マスカラ': { section: 'beauty_health', path: 'mascara', code: '0014' },
    'スキンケア': { section: 'beauty_health', path: 'skincare', code: '0020' },
    '化粧水': { section: 'beauty_health', path: 'lotion', code: '0021' },
    '乳液': { section: 'beauty_health', path: 'emulsion', code: '0022' },
    '美容液': { section: 'beauty_health', path: 'serum', code: '0023' },
    '日焼け止め': { section: 'beauty_health', path: 'sunscreen', code: '0024' },
    'シャンプー': { section: 'beauty_health', path: 'shampoo', code: '0030' },
    'コンディショナー': { section: 'beauty_health', path: 'conditioner', code: '0031' },
    'ボディソープ': { section: 'beauty_health', path: 'body-soap', code: '0032' },
    '香水': { section: 'beauty_health', path: 'perfume', code: '0040' },
    'サプリメント': { section: 'beauty_health', path: 'supplement', code: '0050' },
    'ビタミン': { section: 'beauty_health', path: 'vitamin', code: '0051' },

    // ================================================================
    // 食品・ドリンク (Food/Drink) - section: food / drink
    // ================================================================
    '米': { section: 'food', path: 'rice', code: '0010' },
    'お米': { section: 'food', path: 'rice', code: '0010' },
    'パスタ': { section: 'food', path: 'pasta', code: '0020' },
    '麺': { section: 'food', path: 'noodle', code: '0021' },
    '調味料': { section: 'food', path: 'seasoning', code: '0030' },
    '醤油': { section: 'food', path: 'soy-sauce', code: '0031' },
    'オリーブオイル': { section: 'food', path: 'olive-oil', code: '0032' },
    'お菓子': { section: 'food', path: 'sweets', code: '0040' },
    'チョコレート': { section: 'food', path: 'chocolate', code: '0041' },
    'コーヒー豆': { section: 'food', path: 'coffee-beans', code: '0050' },
    '紅茶': { section: 'food', path: 'tea', code: '0051' },
    '缶詰': { section: 'food', path: 'canned-food', code: '0060' },
    'レトルト': { section: 'food', path: 'retort', code: '0061' },
    'ミネラルウォーター': { section: 'drink', path: 'water', code: '0010' },
    '水': { section: 'drink', path: 'water', code: '0010' },
    '炭酸水': { section: 'drink', path: 'sparkling-water', code: '0011' },
    'ジュース': { section: 'drink', path: 'juice', code: '0020' },
    'お茶': { section: 'drink', path: 'tea', code: '0030' },
    '緑茶': { section: 'drink', path: 'green-tea', code: '0031' },
    'ビール': { section: 'drink', path: 'beer', code: '0040' },
    'ワイン': { section: 'drink', path: 'wine', code: '0041' },
    '日本酒': { section: 'drink', path: 'sake', code: '0042' },
    'ウイスキー': { section: 'drink', path: 'whisky', code: '0043' },
    '焼酎': { section: 'drink', path: 'shochu', code: '0044' },
};

/**
 * Scrape Kakaku.com ranking page with dynamic category detection and multi-page support
 * @param {string} keyword - Search keyword to determine category (e.g., "ワイヤレスイヤホン")
 * @param {object} options - { minPrice, maxPrice, keywords, maxPages }
 * @returns {Promise<Array>} - Array of { name, price, rating, reviewCount, kakakuUrl, source }
 */
async function scrapeKakakuRanking(keyword = 'イヤホン', options = {}) {
    console.log(`\n📊 Scraping Kakaku.com Ranking for "${keyword}"...`);

    // Determine category from keyword
    let categoryInfo = null;
    let useSearchMode = options.searchMode || false;

    for (const [key, value] of Object.entries(KAKAKU_CATEGORY_MAP)) {
        if (key !== 'default' && keyword.includes(key)) {
            categoryInfo = value;
            break;
        }
    }

    // If no category found, automatically switch to search mode (supports ANY product type)
    if (!categoryInfo) {
        console.log(`   🔍 Category not in map, using search mode for "${keyword}"`);
        useSearchMode = true;
    }

    const maxPages = options.maxPages || 10; // Default: scrape 10 pages (200+ products)
    const allProducts = [];

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        // Recursive pagination: keep fetching until we have enough products
        const targetCount = options.targetCount || 50; // Target number of filtered products
        const maxPagesLimit = options.maxPages || 20;  // Hard limit to prevent infinite loops
        let pageNum = options.startPage ? options.startPage - 1 : 0; // Initialize with startPage (0-indexed internally)
        let filteredCount = 0;

        console.log(`   🎯 Target: ${targetCount} products (max ${maxPagesLimit} pages)`);

        // === DYNAMIC FILTER URL DISCOVERY ===
        // If we have required_features from blueprint, try to find matching filter URLs
        let filterUrlSuffix = '';
        const requiredFeatures = options.requiredFeatures || [];

        if (requiredFeatures.length > 0 && !useSearchMode && categoryInfo) {
            console.log(`   🔍 Looking for filter URLs matching: ${requiredFeatures.join(', ')}`);

            try {
                // First, access the base ranking page to extract filter links
                const section = categoryInfo.section || 'kaden';
                const baseUrl = `https://kakaku.com/${section}/${categoryInfo.path}/ranking_${categoryInfo.code}/`;
                await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await new Promise(r => setTimeout(r, 2000));

                // Extract all filter links from the page
                const filterLinks = await page.evaluate(() => {
                    const filters = {};
                    document.querySelectorAll('a').forEach(a => {
                        const href = a.href || '';
                        const text = a.innerText?.trim() || '';
                        // Match filter URLs like: /ranking_2046/spec=002-1/
                        const match = href.match(/\/ranking_\d+\/(spec=[^\/]+)\//);
                        if (match && text && text.length < 30 && !text.includes('人気')) {
                            filters[text] = match[1];
                        }
                    });
                    return filters;
                });

                console.log(`   📋 Found ${Object.keys(filterLinks).length} filter options`);

                // Try to match required_features with available filters
                for (const feature of requiredFeatures) {
                    const featureLower = feature.toLowerCase();
                    for (const [filterName, filterSpec] of Object.entries(filterLinks)) {
                        if (filterName.toLowerCase().includes(featureLower) ||
                            featureLower.includes(filterName.toLowerCase())) {
                            filterUrlSuffix = filterSpec + '/';
                            console.log(`   ✅ Matched filter: "${feature}" → "${filterName}" (${filterSpec})`);
                            break;
                        }
                    }
                    if (filterUrlSuffix) break;
                }

                if (!filterUrlSuffix) {
                    console.log(`   ⚠️ No matching filter found, using full ranking`);
                }
            } catch (filterErr) {
                console.log(`   ⚠️ Filter discovery failed: ${filterErr.message?.slice(0, 30)}`);
            }
        }

        // Keep fetching pages until we have enough filtered products
        while (filteredCount < targetCount && pageNum < maxPagesLimit) {
            pageNum++;

            let url;
            if (useSearchMode) {
                // === SEARCH MODE: Use Kakaku search with filters ===
                // Build search query from keyword and options
                let searchTerms = keyword.replace(/\s+/g, '+');
                // Add feature keywords if provided
                if (options.keywords && options.keywords.length > 0) {
                    searchTerms += '+' + options.keywords.join('+');
                }

                // Build price filter params
                const priceParams = [];
                if (options.minPrice) priceParams.push(`minpr=${options.minPrice}`);
                if (options.maxPrice) priceParams.push(`maxpr=${options.maxPrice}`);
                const priceQuery = priceParams.length > 0 ? '&' + priceParams.join('&') : '';

                const pageParam = pageNum > 1 ? `&page=${pageNum}` : '';
                url = `https://kakaku.com/search_results/${encodeURIComponent(searchTerms)}/?pdf_so=p1${priceQuery}${pageParam}`;
                // pdf_so=p1 means sort by popularity (recommended)
            } else {
                // === RANKING MODE: Use category ranking page (original behavior) ===
                const pageParam = pageNum > 1 ? `?page=${pageNum}` : '';
                // Support section field for camera/pc/car_goods categories (default: kaden)
                const section = categoryInfo.section || 'kaden';
                // Include filter suffix if discovered (e.g., spec=002-1/ for ノイズキャンセリング)
                url = `https://kakaku.com/${section}/${categoryInfo.path}/ranking_${categoryInfo.code}/${filterUrlSuffix}${pageParam}`;
            }

            console.log(`   🔗 Page ${pageNum}: ${url}`);

            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await new Promise(r => setTimeout(r, 2000));

                const products = await page.evaluate((pageNum) => {
                    const items = [];
                    // Working selectors for Kakaku.com ranking pages
                    // Note: Broad selectors may match duplicates, but we deduplicate by URL
                    const selectors = [
                        '[class*="rkgBox"]',                // Matches ranking box elements
                        'a[href*="/item/"]',                // Product links as fallback
                        '.p-result_item'                    // Search result items
                    ];

                    const seenUrls = new Set();  // Deduplicate by product URL
                    let rankCounter = (pageNum - 1) * 40 + 1; // Track rank position

                    let productElements = [];
                    for (const selector of selectors) {
                        productElements = document.querySelectorAll(selector);
                        if (productElements.length > 0) break;
                    }

                    productElements.forEach(el => {
                        // Try multiple name selectors
                        const nameEl = el.querySelector('.itemName a, .p-result_title a, a[class*="name"], h3 a, .c-productCard_name a, a');
                        // Try multiple price selectors
                        const priceEl = el.querySelector('.price, .p-result_price, [class*="price"], .c-productCard_price');
                        const ratingEl = el.querySelector('.star, .p-result_rating, [class*="rating"]');

                        // Extract Image (High Resolution Priority)
                        const imgEl = el.querySelector('.p-result_item_image img, .c-productCard_image img, .itemImg img, img');
                        let imageUrl = null;
                        if (imgEl) {
                            imageUrl = imgEl.src || imgEl.getAttribute('data-src') || imgEl.getAttribute('data-original');
                            if (imageUrl) {
                                if (imageUrl.startsWith('//')) {
                                    imageUrl = 'https:' + imageUrl;
                                }
                                // Kakaku image hack: Convert /m/ (medium) to /l/ (large)
                                imageUrl = imageUrl.replace('/m/', '/l/');
                            }
                        }

                        if (nameEl) {
                            let rawName = nameEl.innerText?.trim() || '';
                            // Clean up name: remove ranking (e.g., '2位'), newlines, and normalize
                            let name = rawName
                                .replace(/\d+位/g, '')       // Remove ranking number anywhere
                                .replace(/\n+/g, ' ')       // Replace newlines with space
                                .replace(/\s+/g, ' ')       // Normalize whitespace
                                .trim();

                            if (name && name.length > 3) {
                                const priceText = priceEl?.innerText || '';
                                const priceMatch = priceText.match(/[\d,]+/);
                                const productUrl = nameEl.href || '';

                                // Skip if already seen this product URL
                                if (productUrl && seenUrls.has(productUrl)) {
                                    return; // Skip duplicate
                                }
                                if (productUrl) seenUrls.add(productUrl);

                                items.push({
                                    name: name,
                                    kakakuUrl: productUrl,
                                    kakakuRank: rankCounter++, // Track global rank
                                    price: priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0,
                                    rating: parseFloat(ratingEl?.innerText || '0') || 0,
                                    image: imageUrl, // Extracted image
                                    source: 'Kakaku.com'
                                });
                            }
                        }
                    });
                    return items;
                }, pageNum);

                console.log(`      ✅ Page ${pageNum}: Found ${products.length} raw products. Fetching Amazon links...`);

                // Visit Detail Pages to get Amazon Link (User Request)
                for (let i = 0; i < products.length; i++) {
                    const p = products[i];
                    if (!p.kakakuUrl) continue;

                    // Skip if we already have enough candidates in THIS batch (optional optimization)
                    // But we want to filter strictly, so we should check all or most.

                    try {
                        console.log(`         🔎 [${i + 1}/${products.length}] Checking: ${p.name.slice(0, 15)}... (${p.kakakuUrl})`);
                        await page.goto(p.kakakuUrl + '#tab', { waitUntil: 'networkidle2', timeout: 30000 });
                        await new Promise(r => setTimeout(r, 2000)); // Wait for dynamic shop list

                        // Try to find Amazon on multiple pages if needed
                        let amazonInfo = null;
                        for (let shopPage = 1; shopPage <= 3 && !amazonInfo; shopPage++) {
                            const shopUrl = shopPage === 1
                                ? p.kakakuUrl + '#tab'
                                : p.kakakuUrl + '?page=' + shopPage + '#tab';

                            await page.goto(shopUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                            await new Promise(r => setTimeout(r, 2000));

                            amazonInfo = await page.evaluate(() => {
                                // Search ALL links on the page for Amazon
                                const allLinks = Array.from(document.querySelectorAll('a'));
                                for (const link of allLinks) {
                                    const href = link.href || '';
                                    const text = link.innerText || '';

                                    // Check if this is an Amazon shop link
                                    if (text.includes('Amazon') && href.includes('kakaku.com/shop/')) {
                                        // Find price - look in the same row/container
                                        let price = 0;
                                        // Try multiple parent selectors
                                        const row = link.closest('tr') ||
                                            link.closest('.p-PTShopList_item') ||
                                            link.closest('[class*="shopList"]') ||
                                            link.closest('[class*="Shop"]');

                                        if (row) {
                                            // Look for price elements with various class names
                                            const priceEl = row.querySelector('[class*="price"], [class*="Price"], .p-PTShopList_priceValue');
                                            if (priceEl) {
                                                const priceText = priceEl.innerText;
                                                const match = priceText.match(/[¥￥]?([\d,]+)/);
                                                if (match) price = parseInt(match[1].replace(/,/g, ''), 10);
                                            }
                                        }

                                        // Fallback: search nearby for any price-like number
                                        if (price === 0) {
                                            const parent = link.parentElement?.parentElement;
                                            if (parent) {
                                                const allText = parent.innerText;
                                                const priceMatch = allText.match(/¥([\d,]+)/);
                                                if (priceMatch) price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
                                            }
                                        }

                                        return { url: href, price };
                                    }
                                }
                                return null;
                            });

                            if (amazonInfo) {
                                console.log(`            ✅ Amazon Shop Found (Page ${shopPage}): ¥${amazonInfo.price || '?'}`);
                            }
                        }

                        if (amazonInfo) {
                            // === STEP 2: Navigate to shop page and get forwarder link ===
                            console.log(`            🔄 Following redirect to get actual Amazon URL...`);
                            try {
                                await page.goto(amazonInfo.url, { waitUntil: 'networkidle2', timeout: 30000 });
                                await new Promise(r => setTimeout(r, 2000));

                                // Find the forwarder link (売り場へ行く button)
                                const forwarderUrl = await page.evaluate(() => {
                                    const allLinks = Array.from(document.querySelectorAll('a'));
                                    for (const link of allLinks) {
                                        if (link.href && link.href.includes('forwarder/forward.aspx')) {
                                            return link.href;
                                        }
                                    }
                                    return null;
                                });

                                if (forwarderUrl) {
                                    // === STEP 3: Follow forwarder to Amazon ===
                                    await page.goto(forwarderUrl, { waitUntil: 'networkidle0', timeout: 30000 });
                                    await new Promise(r => setTimeout(r, 3000)); // Wait for final redirect

                                    const finalUrl = page.url();
                                    if (finalUrl.includes('amazon.co.jp')) {
                                        // Extract ASIN from URL
                                        const asinMatch = finalUrl.match(/\/dp\/([A-Z0-9]{10})/);

                                        // === STEP 4: Check stock availability AND price on Amazon ===
                                        const stockInfo = await page.evaluate(() => {
                                            const bodyText = document.body.innerText || '';

                                            // Check for in-stock indicators
                                            const inStockIndicators = [
                                                '在庫あり',
                                                'カートに入れる',
                                                '今すぐ買う',
                                                'Add to Cart',
                                                'Buy Now'
                                            ];
                                            const hasInStock = inStockIndicators.some(t => bodyText.includes(t));

                                            // Check for out-of-stock indicators  
                                            const outOfStockIndicators = [
                                                '現在在庫切れです',
                                                '在庫切れ',
                                                'Currently unavailable',
                                                'この商品は現在お取り扱いできません'
                                            ];
                                            const hasOutOfStock = outOfStockIndicators.some(t => bodyText.includes(t));

                                            // Check for add-to-cart button
                                            const addToCartBtn = document.querySelector('#add-to-cart-button, #buy-now-button, [name="submit.add-to-cart"]');

                                            // === EXTRACT PRICE FROM AMAZON ===
                                            let amazonPrice = 0;
                                            // Try multiple price selectors
                                            const priceSelectors = [
                                                '.a-price .a-offscreen',
                                                '#priceblock_ourprice',
                                                '#priceblock_dealprice',
                                                '#corePrice_feature_div .a-offscreen',
                                                '.a-price-whole',
                                                '#tp_price_block_total_price_ww .a-offscreen',
                                                '[data-a-color="price"] .a-offscreen'
                                            ];

                                            for (const selector of priceSelectors) {
                                                const el = document.querySelector(selector);
                                                if (el) {
                                                    const priceText = el.innerText || el.textContent || '';
                                                    // Extract numbers from price like "¥45,830" or "45,830"
                                                    const match = priceText.match(/[¥￥]?([\d,]+)/);
                                                    if (match) {
                                                        amazonPrice = parseInt(match[1].replace(/,/g, ''), 10);
                                                        if (amazonPrice > 100) break; // Valid price found
                                                    }
                                                }
                                            }

                                            return {
                                                inStock: hasInStock && !hasOutOfStock && !!addToCartBtn,
                                                hasAddToCart: !!addToCartBtn,
                                                hasOutOfStockText: hasOutOfStock,
                                                amazonPrice: amazonPrice
                                            };
                                        });

                                        if (stockInfo.inStock) {
                                            p.amazonUrl = finalUrl;
                                            p.inStock = true;
                                            if (asinMatch) {
                                                p.asin = asinMatch[1];
                                                console.log(`            ✅ In Stock: ASIN ${p.asin}`);
                                            } else {
                                                console.log(`            ✅ In Stock (Amazon URL obtained)`);
                                            }
                                        } else if (stockInfo.hasOutOfStockText) {
                                            console.log(`            ❌ Out of Stock on Amazon`);
                                            p.amazonUrl = null; // Clear so it gets skipped
                                            p.inStock = false;
                                        } else {
                                            // Ambiguous - might be available, keep URL for later verification
                                            p.amazonUrl = finalUrl;
                                            p.inStock = stockInfo.hasAddToCart; // Best guess
                                            if (asinMatch) p.asin = asinMatch[1];
                                            console.log(`            ⚠️ Stock uncertain, keeping URL`);
                                        }
                                    } else {
                                        console.log(`            ⚠️ Redirect did not reach Amazon: ${finalUrl.slice(0, 50)}...`);
                                        p.amazonUrl = amazonInfo.url; // Keep Kakaku shop URL as fallback
                                    }
                                } else {
                                    console.log(`            ⚠️ No forwarder link found, keeping shop URL`);
                                    p.amazonUrl = amazonInfo.url;
                                }
                            } catch (redirectErr) {
                                console.log(`            ⚠️ Redirect failed: ${redirectErr.message?.slice(0, 30)}`);
                                p.amazonUrl = amazonInfo.url; // Keep original as fallback
                            }

                            // Prefer Amazon page price (accurate) over Kakaku shop list price (truncated)
                            // Note: stockInfo is only defined inside the amazon redirect block
                            if (typeof stockInfo !== 'undefined' && stockInfo && stockInfo.amazonPrice > 100) {
                                p.amazonPrice = stockInfo.amazonPrice;
                                p.price = stockInfo.amazonPrice; // Also update main price
                            } else if (amazonInfo.price > 100) {
                                p.amazonPrice = amazonInfo.price;
                            }
                        } else {
                            console.log(`            ❌ No Amazon link (checked 3 pages)`);
                        }

                        // --- SPEC PAGE SCRAPING (ENHANCED) ---
                        // Get structured specs from /spec/ page for accurate filtering
                        console.log(`            📋 Checking specs for ${p.name.slice(0, 15)}...`);
                        try {
                            const specUrl = p.kakakuUrl.replace(/#.*$/, '').replace(/\?.*$/, '') + 'spec/';
                            await page.goto(specUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
                            await new Promise(r => setTimeout(r, 1000));

                            const specData = await page.evaluate(() => {
                                const specs = {};

                                // Kakaku spec tables have 4-column structure:
                                // <tr><th>スペック名1</th><td>値1</td><th>スペック名2</th><td>値2</td></tr>
                                document.querySelectorAll('table tr, .specList tr, [class*="spec"] tr').forEach(row => {
                                    const ths = row.querySelectorAll('th, dt, .specName');
                                    const tds = row.querySelectorAll('td, dd, .specValue');

                                    // Handle 4-column structure: pair each th with corresponding td
                                    ths.forEach((th, i) => {
                                        const td = tds[i];
                                        if (th && td) {
                                            const key = th.innerText?.trim().replace(/\s+/g, ' ') || '';
                                            const value = td.innerText?.trim().replace(/\s+/g, ' ') || '';
                                            if (key && value && key.length < 50 && value !== '　' && value !== '') {
                                                specs[key] = value;
                                            }
                                        }
                                    });
                                });

                                // Also try definition lists
                                document.querySelectorAll('dl').forEach(dl => {
                                    const dts = dl.querySelectorAll('dt');
                                    const dds = dl.querySelectorAll('dd');
                                    dts.forEach((dt, i) => {
                                        if (dds[i]) {
                                            const key = dt.innerText?.trim() || '';
                                            const value = dds[i].innerText?.trim() || '';
                                            if (key && value && key.length < 50) {
                                                specs[key] = value;
                                            }
                                        }
                                    });
                                });

                                return specs;
                            });

                            p.kakakuSpecs = specData;
                            const specCount = Object.keys(specData).length;

                            if (specCount > 0) {
                                console.log(`            📋 Specs found: ${specCount} items`);
                                // All specs are stored in p.kakakuSpecs for generic feature filtering
                                // Feature detection is handled by produce_from_blueprint.js using blueprint's required_features
                            } else {
                                console.log(`            ⚠️ No spec attributes found on page`);
                            }
                        } catch (specErr) {
                            console.log(`            ⚠️ Spec extraction error: ${specErr.message?.slice(0, 30)}`);
                            p.kakakuSpecs = {};
                        }

                        // Short delay to avoid ban
                        await new Promise(r => setTimeout(r, 500));

                    } catch (e) {
                        console.log(`         ⚠️ Detail check failed: ${e.message}`);
                    }
                }

                allProducts.push(...products);

                // Stop if no products found on this page (end of listing)
                if (products.length === 0) {
                    console.log(`      ⚠️ No more products, stopping pagination`);
                    break;
                }

                // Calculate current filtered count to check if we need more pages
                // IMPORTANT: Count UNIQUE filtered products, not raw (includes duplicates)
                const seenNamesTemp = new Set();
                const uniqueFiltered = allProducts.filter(p => {
                    // Deduplicate by name first
                    const key = p.name.toLowerCase().slice(0, 30);
                    if (seenNamesTemp.has(key)) return false;
                    seenNamesTemp.add(key);

                    // Then apply price filter
                    if (options.minPrice && p.price > 0 && p.price < options.minPrice) return false;
                    if (options.maxPrice && p.price > 0 && p.price > options.maxPrice) return false;
                    return true;
                });
                filteredCount = uniqueFiltered.length;
                console.log(`      📊 Current filtered count: ${filteredCount}/${targetCount} (unique, price-filtered)`);

            } catch (pageError) {
                console.log(`      ⚠️ Page ${pageNum} failed: ${pageError.message}`);
            }
        }

        console.log(`   📄 Scraped ${pageNum} pages, ${allProducts.length} raw products`);


        await browser.close();

        // Deduplicate by name
        const uniqueProducts = [];
        const seenNames = new Set();
        for (const p of allProducts) {
            const key = p.name.toLowerCase().slice(0, 30);
            if (!seenNames.has(key)) {
                seenNames.add(key);
                uniqueProducts.push(p);
            }
        }

        // Filter by price range if specified
        let filtered = uniqueProducts;
        if (options.minPrice || options.maxPrice) {
            filtered = uniqueProducts.filter(p => {
                if (p.price === 0) return true; // Keep items without price (will verify on Amazon)
                if (options.minPrice && p.price < options.minPrice) return false;
                if (options.maxPrice && p.price > options.maxPrice) return false;
                return true;
            });
        }

        // Filter by keywords (e.g., ノイズキャンセリング)  
        if (options.keywords && options.keywords.length > 0) {
            filtered = filtered.filter(p => {
                const name = p.name.toLowerCase();
                return options.keywords.some(kw => name.includes(kw.toLowerCase()));
            });
        }

        console.log(`   ✅ Total: ${filtered.length} products from Kakaku.com (${allProducts.length} raw, ${uniqueProducts.length} unique)`);
        return filtered;

    } catch (e) {
        console.log(`   ⚠️ Kakaku scraping failed: ${e.message}`);
        if (browser) await browser.close();
        return [];
    }
}

/**
 * Scrape MyBest.jp ranking page
 * MyBest is a trusted review site with expert evaluations
 * @param {string} keyword - Search keyword
 * @returns {Promise<Array>} - Array of { name, mybestRank, mybestScore, source }
 */
async function scrapeMyBestRanking(keyword) {
    console.log(`   🏆 Scraping MyBest.jp for "${keyword}"...`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        // Search MyBest for the keyword
        const searchUrl = `https://my-best.com/search?q=${encodeURIComponent(keyword)}`;
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // Extract product rankings from search results
        const products = await page.evaluate(() => {
            const items = [];

            // MyBest ranking items
            document.querySelectorAll('.p-search-result-item, .p-ranking-item').forEach((item, index) => {
                const nameEl = item.querySelector('h2, h3, .c-product-name, .title');
                const scoreEl = item.querySelector('.score, .c-rating-score');

                if (nameEl) {
                    items.push({
                        name: nameEl.textContent.trim(),
                        mybestRank: index + 1,
                        mybestScore: scoreEl ? parseFloat(scoreEl.textContent) : null,
                        source: 'MyBest'
                    });
                }
            });

            return items.slice(0, 20);
        });

        await browser.close();
        console.log(`   ✅ Found ${products.length} products from MyBest.jp`);
        return products;

    } catch (e) {
        console.log(`   ⚠️ MyBest scraping failed: ${e.message}`);
        if (browser) await browser.close();
        return [];
    }
}

/**
 * Scrape MONOQLO/家電批評 rankings
 * Known for honest, unbiased product testing
 * @param {string} keyword - Search keyword
 * @returns {Promise<Array>} - Array of { name, monoqloRank, source }
 */
async function scrapeMONOQLO(keyword) {
    console.log(`   📰 Searching MONOQLO/家電批評 for "${keyword}"...`);

    // MONOQLO is behind paywall, so we search via Bing for MONOQLO articles
    const query = `site:the360.life OR site:monoqlo.me ${keyword} おすすめ`;

    try {
        const snippets = await searchBing(query);

        // Extract product mentions from MONOQLO articles
        const products = [];
        for (const snippet of snippets) {
            if (snippet.source.includes('360') || snippet.source.includes('monoqlo')) {
                // Try to extract product names from snippet
                const model = require('@google/generative-ai');
                const genAI = new model.GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
                const client = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

                const prompt = `Extract product names from this MONOQLO article snippet:\n"${snippet.fullText}"\n\nOutput only product names, one per line. If no clear product names, output NONE.`;

                try {
                    const response = await client.generateContent(prompt);
                    const text = response.response.text().trim();

                    if (text !== 'NONE') {
                        text.split('\n').forEach((name, i) => {
                            if (name.trim().length > 3) {
                                products.push({
                                    name: name.trim(),
                                    monoqloRank: products.length + 1,
                                    source: 'MONOQLO/家電批評'
                                });
                            }
                        });
                    }
                } catch (e) {
                    // Continue without this snippet
                }
            }
        }

        console.log(`   ✅ Found ${products.length} products from MONOQLO`);
        return products.slice(0, 15);

    } catch (e) {
        console.log(`   ⚠️ MONOQLO search failed: ${e.message}`);
        return [];
    }
}

/**
 * Scrape Amazon Bestseller Official Ranking
 * Products from this source have VERIFIED accurate names (official Amazon data)
 * @param {string} category - Category node ID (e.g., "3477981" for イヤホン)
 * @param {object} options - { minPrice, maxPrice }
 * @returns {Promise<Array>} - Array of { name, price, rating, asin, source }
 */
async function scrapeAmazonBestseller(category = '3477981', options = {}) {
    console.log(`   🏆 Scraping Amazon Bestseller for category ${category}...`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        // Amazon bestseller ranking URL
        const url = `https://www.amazon.co.jp/gp/bestsellers/electronics/${category}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 3000));

        const products = await page.evaluate(() => {
            const items = [];

            // Amazon bestseller items
            document.querySelectorAll('[data-asin]').forEach(el => {
                const asin = el.getAttribute('data-asin');
                if (!asin || asin.length < 5) return;

                const nameEl = el.querySelector('.p13n-sc-truncate, .a-link-normal span, .a-size-base-plus');
                const priceEl = el.querySelector('.p13n-sc-price, .a-price .a-offscreen');
                const ratingEl = el.querySelector('.a-icon-alt, .a-icon-star-small');
                const rankEl = el.querySelector('.zg-badge-text');

                if (nameEl) {
                    const priceText = priceEl?.innerText || '';
                    const priceMatch = priceText.match(/[\d,]+/);
                    const ratingText = ratingEl?.innerText || '';
                    const ratingMatch = ratingText.match(/(\d+\.?\d*)/);

                    items.push({
                        name: nameEl.innerText.trim().slice(0, 100),
                        asin: asin,
                        price: priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0,
                        rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
                        rank: parseInt(rankEl?.innerText?.replace(/[#,]/g, '') || '99'),
                        source: 'Amazon Bestseller'
                    });
                }
            });

            return items.slice(0, 50);
        });

        await browser.close();

        // Filter by price range if specified
        let filtered = products;
        if (options.minPrice || options.maxPrice) {
            filtered = products.filter(p => {
                if (p.price === 0) return false;
                if (options.minPrice && p.price < options.minPrice) return false;
                if (options.maxPrice && p.price > options.maxPrice) return false;
                return true;
            });
        }

        console.log(`   ✅ Found ${filtered.length} products from Amazon Bestseller (filtered from ${products.length})`);
        return filtered;

    } catch (e) {
        console.log(`   ⚠️ Amazon Bestseller scraping failed: ${e.message}`);
        if (browser) await browser.close();
        return [];
    }
}

/**
 * Multi-source product discovery
 * Combines results from multiple sources to reduce Amazon dependency
 * @param {string} keyword - Search keyword
 * @param {Object} blueprint - Article blueprint
 * @param {Object} options - { includeAmazon: false }
 * @returns {Promise<Array>} - Combined product list with source info
 */
async function discoverProductsMultiSource(keyword, blueprint, options = {}) {
    console.log(`\n🌐 Multi-Source Product Discovery for "${keyword}"...`);

    const allProducts = new Map(); // Use Map to dedupe by product name

    // 1. Kakaku.com (highest priority)
    try {
        const kakakuProducts = await scrapeKakakuRanking(keyword, {
            keywords: keyword.includes('ノイズ') ? ['nc', 'anc', 'ノイズ'] : [],
            maxPages: 5  // Scrape 5 pages for 100+ products
        });
        kakakuProducts.forEach(p => {
            const key = p.name.toLowerCase();
            if (!allProducts.has(key)) {
                allProducts.set(key, { ...p, sources: ['Kakaku.com'], sourceScores: { kakaku: p.rating || 4.0 } });
            }
        });
    } catch (e) {
        console.log(`   ⚠️ Kakaku.com failed: ${e.message}`);
    }

    // 2. MyBest.jp
    try {
        const mybestProducts = await scrapeMyBestRanking(keyword);
        mybestProducts.forEach(p => {
            const key = p.name.toLowerCase();
            if (allProducts.has(key)) {
                allProducts.get(key).sources.push('MyBest');
                allProducts.get(key).sourceScores.mybest = p.mybestScore;
            } else {
                allProducts.set(key, { ...p, sources: ['MyBest'], sourceScores: { mybest: p.mybestScore } });
            }
        });
    } catch (e) {
        console.log(`   ⚠️ MyBest failed: ${e.message}`);
    }

    // 3. Web search (Bing) for additional sources
    try {
        const targetCount = options.targetCount || 20;
        const marketProducts = await discoverProducts(keyword, blueprint, targetCount);
        marketProducts.forEach(p => {
            const key = p.name.toLowerCase();
            if (allProducts.has(key)) {
                allProducts.get(key).sources.push(...(p.sources || []));
                allProducts.get(key).marketScore = p.marketScore;
            } else {
                allProducts.set(key, { ...p });
            }
        });
    } catch (e) {
        console.log(`   ⚠️ Market research failed: ${e.message}`);
    }

    // 4. Amazon Bestseller (verified product names)
    try {
        // Category 3477981 = イヤホン・ヘッドホン
        const priceRange = { minPrice: 10000, maxPrice: 20000 }; // Adjust based on keyword
        const amazonProducts = await scrapeAmazonBestseller('3477981', priceRange);
        amazonProducts.forEach(p => {
            const key = p.name.toLowerCase().slice(0, 40); // Use first 40 chars as key
            if (allProducts.has(key)) {
                allProducts.get(key).sources.push('Amazon Bestseller');
                allProducts.get(key).asin = p.asin;
                allProducts.get(key).amazonRank = p.rank;
            } else {
                allProducts.set(key, { ...p, sources: ['Amazon Bestseller'], sourceScores: {} });
            }
        });
    } catch (e) {
        console.log(`   ⚠️ Amazon Bestseller failed: ${e.message}`);
    }

    // 5. MONOQLO/家電批評 (trusted expert reviews)
    try {
        const monoqloProducts = await scrapeMONOQLO(keyword);
        monoqloProducts.forEach(p => {
            const key = p.name.toLowerCase();
            if (allProducts.has(key)) {
                allProducts.get(key).sources.push('MONOQLO/家電批評');
            } else {
                allProducts.set(key, { ...p, sources: ['MONOQLO/家電批評'], sourceScores: {} });
            }
        });
    } catch (e) {
        console.log(`   ⚠️ MONOQLO failed: ${e.message}`);
    }

    // Convert to array and calculate combined score
    const products = Array.from(allProducts.values()).map(p => ({
        ...p,
        mentionCount: p.sources?.length || 1,
        combinedScore: calculateCombinedScore(p)
    }));

    // Sort by combined score
    products.sort((a, b) => b.combinedScore - a.combinedScore);

    console.log(`   ✅ Multi-source discovery found ${products.length} unique products`);
    console.log(`   📊 Top 5: ${products.slice(0, 5).map(p => p.name).join(', ')}`);

    return products;
}

/**
 * Calculate combined score from multiple sources
 */
function calculateCombinedScore(product) {
    let score = 0;

    // Source diversity bonus
    score += (product.sources?.length || 1) * 5;

    // Kakaku.com rating (high weight)
    if (product.sourceScores?.kakaku) {
        score += product.sourceScores.kakaku * 5;
    }

    // MyBest score
    if (product.sourceScores?.mybest) {
        score += product.sourceScores.mybest * 3;
    }

    // Market research score
    if (product.marketScore) {
        score += product.marketScore * 2;
    }

    // MONOQLO mention
    if (product.sources?.includes('MONOQLO/家電批評')) {
        score += 10;
    }

    return score;
}

/**
 * Extract Amazon.co.jp product link from Kakaku.com product page
 * Navigates to the shop list page and finds Amazon.co.jp entry
 * Supports pagination across multiple shop list pages
 * 
 * @param {string} kakakuUrl - Kakaku.com product URL (e.g., https://kakaku.com/item/K0001709588/)
 * @returns {Promise<{found: boolean, amazonUrl: string|null, shopId: string|null}>}
 */
async function extractAmazonLinkFromKakaku(kakakuUrl) {
    if (!kakakuUrl || !kakakuUrl.includes('kakaku.com')) {
        return { found: false, amazonUrl: null, shopId: null };
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        // Normalize URL - ensure it ends without #tab or other fragments
        let baseUrl = kakakuUrl.split('#')[0].split('?')[0];
        if (!baseUrl.endsWith('/')) baseUrl += '/';

        // Try shop list page first (has all shops)
        const shopUrl = baseUrl + 'shop/';
        console.log(`   🔍 Checking Kakaku shop list: ${shopUrl}`);

        await page.goto(shopUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        // Find Amazon.co.jp in shop list
        const amazonInfo = await page.evaluate(() => {
            let result = { found: false, href: null, shopName: null };

            document.querySelectorAll('a').forEach(a => {
                const text = a.innerText?.trim() || '';
                const href = a.href || '';

                // Look for "Amazon.co.jp" specifically (not "amazon pay", etc.)
                if (text === 'Amazon.co.jp' || text.toLowerCase() === 'amazon.co.jp') {
                    result = {
                        found: true,
                        href: href,
                        shopName: text
                    };
                }
            });

            return result;
        });

        if (amazonInfo.found) {
            await browser.close();

            // Extract shop ID from href (e.g., /shop/1208/)
            const shopIdMatch = amazonInfo.href.match(/shop\/(\d+)/);
            const shopId = shopIdMatch ? shopIdMatch[1] : null;

            console.log(`   ✅ Found Amazon.co.jp link! Shop ID: ${shopId}`);
            return {
                found: true,
                amazonUrl: amazonInfo.href,
                shopId: shopId
            };
        }

        // Check for pagination - "次へ" or page links
        const hasMorePages = await page.evaluate(() => {
            let nextPage = null;
            document.querySelectorAll('a').forEach(a => {
                const text = a.innerText?.trim() || '';
                if (text === '次へ' || text.match(/^2$/)) {
                    nextPage = a.href;
                }
            });
            return nextPage;
        });

        if (hasMorePages) {
            console.log(`   📄 Checking next page for Amazon.co.jp...`);
            await page.goto(hasMorePages, { waitUntil: 'networkidle2', timeout: 20000 });
            await new Promise(r => setTimeout(r, 1500));

            const amazonInfoPage2 = await page.evaluate(() => {
                let result = { found: false, href: null };
                document.querySelectorAll('a').forEach(a => {
                    const text = a.innerText?.trim() || '';
                    if (text === 'Amazon.co.jp' || text.toLowerCase() === 'amazon.co.jp') {
                        result = { found: true, href: a.href };
                    }
                });
                return result;
            });

            if (amazonInfoPage2.found) {
                await browser.close();
                const shopIdMatch = amazonInfoPage2.href.match(/shop\/(\d+)/);
                console.log(`   ✅ Found Amazon.co.jp on page 2!`);
                return {
                    found: true,
                    amazonUrl: amazonInfoPage2.href,
                    shopId: shopIdMatch ? shopIdMatch[1] : null
                };
            }
        }

        await browser.close();
        console.log(`   ⚠️ Amazon.co.jp not found in shop list`);
        return { found: false, amazonUrl: null, shopId: null };

    } catch (e) {
        console.log(`   ⚠️ Error extracting Amazon link: ${e.message}`);
        if (browser) await browser.close();
        return { found: false, amazonUrl: null, shopId: null };
    }
}

/**
     * Scrape Kakaku.com ranking AND enrich each product with Amazon link + details
     * This is the main function for Kakaku-based market research.
     * Uses a single browser session for efficiency.
     * 
     * @param {string} keyword - Search keyword to determine category
     * @param {object} options - { minPrice, maxPrice, targetCount, maxProducts }
     * @returns {Promise<Array>} - Array of enriched products with amazonUrl
     */
async function scrapeKakakuRankingWithEnrichment(keyword = 'イヤホン', options = {}) {
    console.log(`\n📊 Kakaku.com Full Market Research for "${keyword}"...`);

    // Step 1: Get products from ranking page
    const products = await scrapeKakakuRanking(keyword, options);

    if (products.length === 0) {
        console.log('   ⚠️ No products found from ranking');
        return [];
    }

    // Step 2: Enrich each product with Amazon link (limit to avoid too many requests)
    const maxEnrich = options.maxEnrich || 30; // Limit enrichment to top N products
    const productsToEnrich = products.slice(0, maxEnrich);

    console.log(`\n🔗 Enriching ${productsToEnrich.length} products with Amazon links...`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        for (let i = 0; i < productsToEnrich.length; i++) {
            const product = productsToEnrich[i];

            if (!product.kakakuUrl || !product.kakakuUrl.includes('/item/')) {
                continue;
            }

            try {
                // Navigate to shop list page
                let baseUrl = product.kakakuUrl.split('#')[0].split('?')[0];
                if (!baseUrl.endsWith('/')) baseUrl += '/';
                const shopUrl = baseUrl + 'shop/';

                console.log(`   [${i + 1}/${productsToEnrich.length}] ${product.name.slice(0, 40)}...`);

                await page.goto(shopUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
                await new Promise(r => setTimeout(r, 1500));

                // Find Amazon.co.jp link
                const amazonInfo = await page.evaluate(() => {
                    let result = { found: false, href: null };
                    document.querySelectorAll('a').forEach(a => {
                        const text = a.innerText?.trim() || '';
                        if (text === 'Amazon.co.jp' || text.toLowerCase() === 'amazon.co.jp') {
                            result = { found: true, href: a.href };
                        }
                    });
                    return result;
                });

                if (amazonInfo.found) {
                    product.amazonKakakuUrl = amazonInfo.href;
                    product.hasAmazon = true;
                    console.log(`      ✅ Amazon.co.jp found`);
                } else {
                    product.hasAmazon = false;
                    console.log(`      ⚠️ No Amazon.co.jp`);
                }

                // === ENHANCED: Scrape dedicated spec page for structured data ===
                const specUrl = baseUrl + 'spec/';
                try {
                    await page.goto(specUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
                    await new Promise(r => setTimeout(r, 1000));

                    const specData = await page.evaluate(() => {
                        const specs = {};

                        // Kakaku spec tables have consistent structure:
                        // <tr><th>スペック名</th><td>値</td></tr>
                        document.querySelectorAll('table tr, .specList tr, [class*="spec"] tr').forEach(row => {
                            const th = row.querySelector('th, dt, .specName');
                            const td = row.querySelector('td, dd, .specValue');
                            if (th && td) {
                                const key = th.innerText?.trim().replace(/\s+/g, ' ') || '';
                                const value = td.innerText?.trim().replace(/\s+/g, ' ') || '';
                                if (key && value && key.length < 50) {
                                    specs[key] = value;
                                }
                            }
                        });

                        // Also try definition lists
                        document.querySelectorAll('dl').forEach(dl => {
                            const dts = dl.querySelectorAll('dt');
                            const dds = dl.querySelectorAll('dd');
                            dts.forEach((dt, i) => {
                                if (dds[i]) {
                                    const key = dt.innerText?.trim() || '';
                                    const value = dds[i].innerText?.trim() || '';
                                    if (key && value && key.length < 50) {
                                        specs[key] = value;
                                    }
                                }
                            });
                        });

                        return specs;
                    });

                    product.kakakuSpecs = specData;
                    const specCount = Object.keys(specData).length;
                    if (specCount > 0) {
                        console.log(`      📋 Kakaku specs: ${specCount} items`);
                        // All specs stored in product.kakakuSpecs for generic feature filtering
                    }
                } catch (specError) {
                    console.log(`      ⚠️ Spec page error: ${specError.message?.slice(0, 30)}`);
                    product.kakakuSpecs = {};
                }

                // Also get description from main page
                try {
                    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
                    await new Promise(r => setTimeout(r, 800));

                    const details = await page.evaluate(() => {
                        const descEl = document.querySelector('.itemInfo, .description, [class*="desc"]');
                        return { description: descEl?.innerText?.slice(0, 300)?.trim() || '' };
                    });
                    product.kakakuDescription = details.description;
                } catch (e) {
                    product.kakakuDescription = '';
                }

            } catch (e) {
                console.log(`      ⚠️ Error: ${e.message}`);
            }

            // Rate limiting - be nice to Kakaku.com
            await new Promise(r => setTimeout(r, 500));
        }

        await browser.close();

    } catch (e) {
        console.log(`   ⚠️ Enrichment failed: ${e.message}`);
        if (browser) await browser.close();
    }

    // Summary
    const withAmazon = productsToEnrich.filter(p => p.hasAmazon).length;
    console.log(`\n✅ Kakaku Market Research Complete:`);
    console.log(`   📦 Total products: ${products.length}`);
    console.log(`   🔗 With Amazon link: ${withAmazon}/${productsToEnrich.length}`);

    return products; // Return all products, enriched ones have amazonKakakuUrl
}

module.exports = {
    discoverProducts,
    discoverProductsMultiSource,
    scrapePageContent,
    scrapeKakakuRanking,
    scrapeKakakuRankingWithEnrichment,
    scrapeMyBestRanking,
    scrapeMONOQLO,
    scrapeAmazonBestseller,
    extractAmazonLinkFromKakaku
};
