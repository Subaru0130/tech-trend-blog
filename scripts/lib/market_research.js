/**
 * 🔍 Market Research Module
 * 
 * ライブWeb検索で最新の製品情報を収雁E
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
 * @param {string} keyword - Search keyword (e.g., "ワイヤレスイヤホン 1丁E�E台 ノイズキャンセリング")
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
                `${keyword} コスチEレビュー`,
                `${keyword} 実機レビュー`,
                `${baseKeyword} 最新モチE�� 評判`
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

        console.log(`   ✁ETotal unique products found so far: ${allProducts.length}`);
    }

    return allProducts;
}

/**
 * Search Bing and collect snippets from trusted sources
 */
async function searchBing(query) {
    // Try remote debugging first, fallback to launch
    let browser;
    let isRemote = false;
    try {
        const http = require('http');
        const wsUrl = await new Promise((resolve, reject) => {
            const req = http.get('http://127.0.0.1:9222/json/version', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        resolve(json.webSocketDebuggerUrl);
                    } catch (e) { reject(e); }
                });
            });
            req.on('error', reject);
            req.setTimeout(3000, () => { req.destroy(); reject(new Error('timeout')); });
        });

        browser = await puppeteer.connect({ browserWSEndpoint: wsUrl, defaultViewport: null });
        isRemote = true;
        // console.log(`      ✁EConnected to Chrome (remote debugging)`);
    } catch (e) {
        // Fallback to headless launch
        // console.log(`      ⚠�E�ERemote debugging unavailable, using headless mode`);
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });
    }

    try {
        const page = await browser.newPage();
        if (!isRemote) {
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        }

        const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&setmkt=ja-JP&setlang=ja`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

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
                if (title.includes("比輁E) || title.includes("レビュー") || title.includes("実橁E) || title.includes("検証")) {
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
        console.log(`      ⚠�E�ESearch failed: ${e.message}`);
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
あなた�E製品調査アシスタントです。以下�Eレビュー記事から、、E{keyword}」に該当する�E体的な製品名を抽出してください、E

【記事コンチE��チE��E
${context.slice(0, 12000)}

【抽出ルール、E
1. 具体的な製品名のみを抽出�E�侁E "Sony WF-1000XM5", "Anker Soundcore Space A40"�E�E
2. ブランド名と型番が�Eかるも�Eを優允E
3. カチE��リ名（侁E "ワイヤレスイヤホン"�E��E除夁E
4. 関連啁E���E�ケース、イヤーピ�Eス等）�E除夁E
5. ${blueprint?.comparison_axis ? `比輁E��、E{blueprint.comparison_axis}」に強く関連し、その性能が高く評価されてぁE��製品を厳選して抽出` : '記事�Eで高く評価されてぁE��製品を優允E}
6. 最大20製品まで

【�E力形式、E
JSON配�Eで出劁E
["製品名1", "製品名2", ...]

製品が見つからなぁE��合�E空配�E [] を返してください、E
`;

    try {
        console.log(`   🤁ECalling Gemini AI for product extraction...`);
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
                console.log(`   🤁EAI extracted ${products.length} product names`);
                return products;
            } catch (parseError) {
                console.log(`   ⚠�E�EJSON parse failed: ${parseError.message}`);
            }
        } else {
            console.log(`   ⚠�E�ENo JSON array found in AI response`);
        }
    } catch (e) {
        console.log(`   ⚠�E�EAI extraction failed: ${e.message}`);
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
あなた�E製品調査アシスタントです。以下�EWeb検索結果から、、E{keyword}」に該当する�E体的な製品名を抽出してください、E

【検索結果、E
${context}

【抽出ルール、E
1. 具体的な製品名のみを抽出�E�侁E "Sony WF-1000XM5", "Anker Soundcore Space A40"�E�E
2. カチE��リ名（侁E "ワイヤレスイヤホン"�E��E除夁E
3. 関連啁E���E�ケース、イヤーピ�Eス等）�E除夁E
4. ${blueprint?.comparison_axis ? `比輁E��、E{blueprint.comparison_axis}」に強く関連し、その性能が高く評価されてぁE��製品を厳選して抽出` : '検索結果で高く評価されてぁE��製品を優允E}
5. 最大20製品まで

【�E力形式、E
JSON配�Eで出劁E
["製品名1", "製品名2", ...]

製品が見つからなぁE��合�E空配�E [] を返してください、E
`;

    try {
        console.log(`   🤁ECalling Gemini AI for product extraction...`);
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
                console.log(`   🤁EAI extracted ${products.length} product names`);
                return products;
            } catch (parseError) {
                console.log(`   ⚠�E�EJSON parse failed: ${parseError.message}`);
                console.log(`   📋 Attempted to parse: ${jsonMatch[0].slice(0, 100)}...`);
            }
        } else {
            console.log(`   ⚠�E�ENo JSON array found in AI response`);
        }
    } catch (e) {
        console.log(`   ⚠�E�EAI extraction failed: ${e.message}`);
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

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
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
 * Sub-categories have different codes (e.g., 完�Eワイヤレス = earphone/2044)
 */
const KAKAKU_CATEGORY_MAP = {
    // ================================================================
    // イヤホン・ヘッド�Eン・オーチE��オ (headphones/audio)
    // ================================================================
    '完�Eワイヤレス': { path: 'headphones', code: '2046' },
    'ワイヤレスイヤホン': { path: 'headphones', code: '2046' },
    'イヤホン': { path: 'headphones', code: '2046' },
    'ヘッド�Eン': { path: 'headphones', code: '2046' },
    'Bluetooth': { path: 'headphones', code: '2046' },
    'カナル': { path: 'headphones', code: '2046' },
    '骨伝封E: { path: 'headphones', code: '2046' },
    'ヘッドセチE��': { path: 'headset', code: '2049' },
    'スピ�Eカー': { path: 'speaker', code: '2047' },
    'Bluetoothスピ�Eカー': { path: 'bluetooth-speaker', code: '7091' },
    'サウンドバー': { path: 'sound-bar', code: '7073' },
    'ホ�Eムシアター': { path: 'home-theater-speaker', code: '2048' },
    'AVアンチE: { path: 'av-amp', code: '2056' },
    'プリメインアンチE: { path: 'pre-main-amp', code: '2059' },
    'ミニコンチE: { path: 'mini-component', code: '2054' },
    'ポ�EタブルオーチE��オ': { path: 'digital-audio-player', code: '2053' },
    'DAP': { path: 'digital-audio-player', code: '2053' },
    'ヘッド�EンアンチE: { path: 'headphone-amp', code: '7020' },

    // ================================================================
    // チE��ビ�E映像機器 (TV/Video)
    // ================================================================
    'チE��チE: { path: 'lcd-tv', code: '2041' },
    '液晶チE��チE: { path: 'lcd-tv', code: '2041' },
    '有機EL': { path: 'lcd-tv', code: '2041' },
    'ブルーレイレコーダー': { path: 'dvd-recorder', code: '2022' },
    'DVDレコーダー': { path: 'dvd-recorder', code: '2022' },
    'ブルーレイプレーヤー': { path: 'dvd-player', code: '2025' },
    'プロジェクタ': { path: 'projector', code: '2024' },
    'チューナ�E': { path: 'dtv-tuner', code: '2071' },

    // ================================================================
    // キチE��ン家電 (Kitchen)
    // ================================================================
    '冷蔵庫': { path: 'freezer', code: '2115' },
    '冷凍庫': { path: 'freezer', code: '2116' },
    'ワインセラー': { path: 'wine-cellar', code: '2119' },
    '炊飯器': { path: 'rice-cooker', code: '2125' },
    'IH炊飯器': { path: 'rice-cooker', code: '2125' },
    '電子レンジ': { path: 'microwave-oven', code: '2117' },
    'オーブンレンジ': { path: 'microwave-oven', code: '2117' },
    'ト�Eスター': { path: 'toaster', code: '2118' },
    'ホ�Eムベ�Eカリー': { path: 'homebakery', code: '2119' },
    'ミキサー': { path: 'mixer', code: '2122' },
    'フ�Eド�EロセチE��ー': { path: 'mixer', code: '2122' },
    '電気�EチE��': { path: 'electric-pot', code: '2120' },
    '電気ケトル': { path: 'electric-pot', code: '2120' },
    'コーヒ�Eメーカー': { path: 'coffee-maker', code: '2121' },
    'エスプレチE��マシン': { path: 'espresso-machine', code: '7019' },
    '食器洗い橁E: { path: 'dish-washer', code: '2124' },
    '食洗橁E: { path: 'dish-washer', code: '2124' },
    'IHクチE��ングヒ�Eター': { path: 'ihcooking-heater', code: '2134' },
    'ホット�EレーチE: { path: 'hot-plate', code: '2131' },
    '圧力鍋': { path: 'pressure-cooker', code: '7074' },
    '電気圧力鍋': { path: 'electric-pressure-cooker', code: '7091' },
    '低温調琁E��': { path: 'low-temperature-cooker', code: '7092' },
    'ノンフライヤー': { path: 'non-fryer', code: '7058' },

    // ================================================================
    // 生活家電 (Living)
    // ================================================================
    '掁E��橁E: { path: 'vacuum', code: '2165' },
    'コードレス掁E��橁E: { path: 'cordless-vacuum', code: '7084' },
    'ロボット掃除橁E: { path: 'robot-vacuum', code: '7032' },
    'ハンチE��掁E��橁E: { path: 'handy-vacuum', code: '2167' },
    '币E��クリーナ�E': { path: 'futon-cleaner', code: '7057' },
    'スチ�Eムクリーナ�E': { path: 'steam-cleaner', code: '7044' },
    '高圧洗流E��E: { path: 'pressure-washer', code: '7027' },
    '洗濯橁E: { path: 'washing-machine', code: '2107' },
    'ドラム式洗濯橁E: { path: 'washing-machine', code: '2107' },
    '縦型洗濯橁E: { path: 'washing-machine', code: '2107' },
    '衣類乾燥橁E: { path: 'clothes-dryer', code: '2109' },
    '币E��乾燥橁E: { path: 'futon-dryer', code: '2186' },
    'アイロン': { path: 'iron', code: '2183' },
    'ミシン': { path: 'sewing-machine', code: '2163' },

    // ================================================================
    // 空調・季節家電 (Air/Season)
    // ================================================================
    'エアコン': { path: 'aircon', code: '2180' },
    'クーラー': { path: 'aircon', code: '2180' },
    '空気渁E��E��E: { path: 'air-purifier', code: '2147' },
    '除湿橁E: { path: 'dehumidifier', code: '2175' },
    '加湿器': { path: 'humidifier', code: '2161' },
    '扁E��橁E: { path: 'fan', code: '2174' },
    'サーキュレーター': { path: 'circulator', code: '7042' },
    'ヒ�Eター': { path: 'heater', code: '2150' },
    'スト�EチE: { path: 'heater', code: '2150' },
    'ファンヒ�Eター': { path: 'fan-heater', code: '2151' },
    'ホットカーペッチE: { path: 'hot-carpet', code: '2156' },
    'こたつ': { path: 'kotatsu', code: '2158' },
    '電気毛币E: { path: 'electric-blanket', code: '2159' },

    // ================================================================
    // 健康・美容家電 (Health/Beauty)
    // ================================================================
    'シェーバ�E': { path: 'shaver', code: '2143' },
    '電気シェーバ�E': { path: 'shaver', code: '2143' },
    '脱毛器': { path: 'epilator', code: '2144' },
    'バリカン': { path: 'hair-clipper', code: '2145' },
    '鼻毛カチE��ー': { path: 'nasal-hair-cutter', code: '7046' },
    '電動歯ブラシ': { path: 'electric-toothbrush', code: '2149' },
    'ヘアドライヤー': { path: 'hair-dryer', code: '2187' },
    'ドライヤー': { path: 'hair-dryer', code: '2187' },
    'ヘアアイロン': { path: 'hair-iron', code: '7028' },
    '美顔器': { path: 'facial-equipment', code: '7047' },
    'マッサージ器': { path: 'massager', code: '2191' },
    'マッサージチェア': { path: 'massage-chair', code: '2192' },
    '体重訁E: { path: 'weight-scale', code: '2148' },
    '体脂肪訁E: { path: 'weight-scale', code: '2148' },
    '体絁E�E訁E: { path: 'weight-scale', code: '2148' },
    '血圧訁E: { path: 'blood-pressure-monitor', code: '2193' },
    '体温訁E: { path: 'thermometer', code: '7048' },

    // ================================================================
    // 惁E��家電 (Info Appliances)
    // ================================================================
    '電子辞書': { path: 'electronic-dictionary', code: '2073' },
    '電話橁E: { path: 'phone', code: '2185' },
    'FAX': { path: 'fax', code: '2198' },
    'ラジオ': { path: 'radio', code: '2055' },

    // ================================================================
    // 電源�Eモバイル (Power/Mobile)
    // ================================================================
    'モバイルバッチE��ー': { path: 'portable-charger', code: '7062' },
    'ポ�Eタブル電溁E: { path: 'portable-power', code: '7089' },
    '允E��器': { path: 'charger', code: '7063' },

    // ================================================================
    // 照昁E(Lighting)
    // ================================================================
    'シーリングライチE: { path: 'ceiling-light', code: '2081' },
    'LEDシーリングライチE: { path: 'led-ceiling-light', code: '7031' },
    'LED電琁E: { path: 'led-light', code: '7030' },
    'チE��クライチE: { path: 'desk-light', code: '2082' },
    'スタンドライチE: { path: 'stand-light', code: '2084' },

    // ================================================================
    // ネットワーク・通信 (Network)
    // ================================================================
    '無線LANルーター': { path: 'wifi-router', code: '2077' },
    'Wi-Fiルーター': { path: 'wifi-router', code: '2077' },
    'ルーター': { path: 'wifi-router', code: '2077' },

    // ================================================================
    // 住宁E��傁E(Home Equipment)
    // ================================================================
    '流E��器': { path: 'water-purifier', code: '2137' },
    'ウォーターサーバ�E': { path: 'water-server', code: '7060' },
    '温水洗流E��座': { path: 'washlet', code: '2136' },
    'ウォシュレチE��': { path: 'washlet', code: '2136' },
    'ガスコンロ': { path: 'gas-stove', code: '2133' },
    '給湯器': { path: 'water-heater', code: '2135' },
    'インターホン': { path: 'intercom', code: '2197' },
    '防犯カメラ': { path: 'network-camera', code: '7035' },
    'ネットワークカメラ': { path: 'network-camera', code: '7035' },

    // ================================================================
    // カメラ (Camera) - section: camera
    // ================================================================
    'チE��タルカメラ': { section: 'camera', path: 'digital-camera', code: '0050' },
    'チE��カメ': { section: 'camera', path: 'digital-camera', code: '0050' },
    'ミラーレス': { section: 'camera', path: 'mirrorless', code: '0049' },
    '一眼レチE: { section: 'camera', path: 'digital-slr', code: '0049' },
    'ビデオカメラ': { section: 'camera', path: 'video-camera', code: '0060' },
    'アクションカメラ': { section: 'camera', path: 'action-camera', code: '7064' },
    'レンズ': { section: 'camera', path: 'camera-lens', code: '1050' },
    '三�E': { section: 'camera', path: 'tripod', code: '1033' },

    // ================================================================
    // PC・パソコン (PC) - section: pc
    // ================================================================
    'ノ�Eトパソコン': { section: 'pc', path: 'note-pc', code: '0020' },
    'ノ�EチEC': { section: 'pc', path: 'note-pc', code: '0020' },
    'チE��クトップPC': { section: 'pc', path: 'desktop-pc', code: '0010' },
    'タブレチE��': { section: 'pc', path: 'tablet', code: '0030' },
    'iPad': { section: 'pc', path: 'tablet', code: '0030' },
    'プリンタ': { section: 'pc', path: 'printer', code: '0060' },
    'モニター': { section: 'pc', path: 'lcd-monitor', code: '0085' },
    'チE��スプレイ': { section: 'pc', path: 'lcd-monitor', code: '0085' },
    'キーボ�EチE: { section: 'pc', path: 'keyboard', code: '0150' },
    'マウス': { section: 'pc', path: 'mouse', code: '0160' },
    'SSD': { section: 'pc', path: 'ssd', code: '0537' },
    'HDD': { section: 'pc', path: 'hdd-35inch', code: '0530' },
    '外付けHDD': { section: 'pc', path: 'external-hdd', code: '0538' },
    'USBメモリ': { section: 'pc', path: 'usb-memory', code: '0536' },
    'SDカーチE: { section: 'pc', path: 'sd-card', code: '0528' },

    // ================================================================
    // カー用品E(Car) - section: car_goods
    // ================================================================
    'カーナビ': { section: 'car_goods', path: 'car-navigation', code: '2010' },
    'ドライブレコーダー': { section: 'car_goods', path: 'drive-recorder', code: '7034' },
    'ドラレコ': { section: 'car_goods', path: 'drive-recorder', code: '7034' },
    'レーダー探知橁E: { section: 'car_goods', path: 'car-radar', code: '2005' },
    'カーオーチE��オ': { section: 'car_goods', path: 'car-audio', code: '2015' },
    'タイヤ': { section: 'car_goods', path: 'tire', code: '7050' },

    // ================================================================
    // ゲーム・ホビー (Game/Hobby)
    // ================================================================
    'ゲーム橁E: { path: 'game-machine', code: '2501' },
    'PlayStation': { path: 'game-machine', code: '2501' },
    'Nintendo': { path: 'game-machine', code: '2501' },
    'Switch': { path: 'game-machine', code: '2501' },
    'PS5': { path: 'game-machine', code: '2501' },
    'Xbox': { path: 'game-machine', code: '2501' },

    // ================================================================
    // ホビー (Hobby) - section: hobby
    // ================================================================
    'フィギュア': { section: 'hobby', path: 'figure', code: '3010' },
    'プラモチE��': { section: 'hobby', path: 'plastic-model', code: '3015' },
    'ラジコン': { section: 'hobby', path: 'radio-control', code: '3020' },
    'ミニ四駁E: { section: 'hobby', path: 'mini-yonku', code: '3025' },
    'ドローン': { section: 'hobby', path: 'drone', code: '7065' },
    '電子ピアチE: { section: 'hobby', path: 'electronic-piano', code: '2570' },
    'キーボ�Eド楽器': { section: 'hobby', path: 'keyboard-instrument', code: '2571' },
    'ギター': { section: 'hobby', path: 'guitar', code: '2575' },
    '電子楽器': { section: 'hobby', path: 'electronic-instrument', code: '2573' },

    // ================================================================
    // スマ�Eトフォン・携帯電話 (Smartphones) - section: keitai
    // ================================================================
    'スマ�Eトフォン': { section: 'keitai', path: 'smartphone', code: '7041' },
    'スマ�E': { section: 'keitai', path: 'smartphone', code: '7041' },
    'iPhone': { section: 'keitai', path: 'smartphone', code: '7041' },
    'Android': { section: 'keitai', path: 'smartphone', code: '7041' },
    '携帯電話': { section: 'keitai', path: 'phs', code: '3147' },
    'スマ�EトウォチE��': { section: 'keitai', path: 'smartwatch', code: '7066' },

    // ================================================================
    // インチE��ア・家具 (Interior/Furniture) - section: interior
    // ================================================================
    'ソファ': { section: 'interior', path: 'sofa', code: '0066' },
    'ソファー': { section: 'interior', path: 'sofa', code: '0066' },
    'ベッチE: { section: 'interior', path: 'bed', code: '0062' },
    'マットレス': { section: 'interior', path: 'mattress', code: '0063' },
    'チE��ク': { section: 'interior', path: 'desk', code: '0010' },
    '机': { section: 'interior', path: 'desk', code: '0010' },
    'チェア': { section: 'interior', path: 'chair', code: '0020' },
    '椁E��E: { section: 'interior', path: 'chair', code: '0020' },
    'オフィスチェア': { section: 'interior', path: 'office-chair', code: '0021' },
    'ゲーミングチェア': { section: 'interior', path: 'gaming-chair', code: '7090' },
    'チE�Eブル': { section: 'interior', path: 'table', code: '0030' },
    'ダイニングチE�Eブル': { section: 'interior', path: 'dining-table', code: '0031' },
    '本棁E: { section: 'interior', path: 'bookshelf', code: '0050' },
    'ラチE��': { section: 'interior', path: 'rack', code: '0051' },
    '収紁E: { section: 'interior', path: 'storage', code: '0052' },
    'カーチE��': { section: 'interior', path: 'curtain', code: '0070' },
    'ブラインチE: { section: 'interior', path: 'blind', code: '0071' },
    'カーペッチE: { section: 'interior', path: 'carpet', code: '0080' },
    'ラグ': { section: 'interior', path: 'rug', code: '0081' },
    'クチE��ョン': { section: 'interior', path: 'cushion', code: '0090' },
    '极E: { section: 'interior', path: 'pillow', code: '0064' },
    '币E��': { section: 'interior', path: 'futon', code: '0065' },

    // ================================================================
    // ファチE��ョン (Fashion) - section: fashion
    // ================================================================
    'バッグ': { section: 'fashion', path: 'bag', code: '0010' },
    'リュチE��': { section: 'fashion', path: 'backpack', code: '0011' },
    'バックパック': { section: 'fashion', path: 'backpack', code: '0011' },
    'ト�EトバチE��': { section: 'fashion', path: 'tote-bag', code: '0012' },
    'ショルダーバッグ': { section: 'fashion', path: 'shoulder-bag', code: '0013' },
    '財币E: { section: 'fashion', path: 'wallet', code: '0020' },
    'サングラス': { section: 'fashion', path: 'sunglasses', code: '0030' },
    'メガチE: { section: 'fashion', path: 'glasses', code: '0031' },
    'ベルチE: { section: 'fashion', path: 'belt', code: '0040' },
    'ネクタイ': { section: 'fashion', path: 'necktie', code: '0041' },
    'マフラー': { section: 'fashion', path: 'muffler', code: '0050' },
    'スト�Eル': { section: 'fashion', path: 'stole', code: '0051' },
    '帽孁E: { section: 'fashion', path: 'hat', code: '0060' },
    'キャチE�E': { section: 'fashion', path: 'cap', code: '0061' },
    '手袁E: { section: 'fashion', path: 'gloves', code: '0070' },
    '傁E: { section: 'fashion', path: 'umbrella', code: '0080' },
    'レインウェア': { section: 'fashion', path: 'rainwear', code: '0081' },

    // ================================================================
    // 靴・シューズ (Shoes) - section: shoes
    // ================================================================
    'スニ�Eカー': { section: 'shoes', path: 'sneakers', code: '0010' },
    'ランニングシューズ': { section: 'shoes', path: 'running-shoes', code: '0011' },
    'ビジネスシューズ': { section: 'shoes', path: 'business-shoes', code: '0020' },
    '革靴': { section: 'shoes', path: 'leather-shoes', code: '0021' },
    'ブ�EチE: { section: 'shoes', path: 'boots', code: '0030' },
    'サンダル': { section: 'shoes', path: 'sandals', code: '0040' },
    'スリチE��': { section: 'shoes', path: 'slippers', code: '0050' },

    // ================================================================
    // 腕時計�Eアクセサリー (Watch/Accessory) - section: watch_accessory
    // ================================================================
    '腕時訁E: { section: 'watch_accessory', path: 'watch', code: '0010' },
    'メンズ腕時訁E: { section: 'watch_accessory', path: 'mens-watch', code: '0011' },
    'レチE��ース腕時訁E: { section: 'watch_accessory', path: 'ladies-watch', code: '0012' },
    'G-SHOCK': { section: 'watch_accessory', path: 'gshock', code: '0013' },
    'スマ�EトウォチE��': { section: 'watch_accessory', path: 'smartwatch', code: '7066' },
    'ネックレス': { section: 'watch_accessory', path: 'necklace', code: '0020' },
    'ブレスレチE��': { section: 'watch_accessory', path: 'bracelet', code: '0021' },
    'リング': { section: 'watch_accessory', path: 'ring', code: '0022' },
    '持E��': { section: 'watch_accessory', path: 'ring', code: '0022' },
    'ピアス': { section: 'watch_accessory', path: 'piercing', code: '0023' },
    'イヤリング': { section: 'watch_accessory', path: 'earring', code: '0024' },

    // ================================================================
    // スポ�EチE(Sports) - section: sports
    // ================================================================
    'ゴルフクラチE: { section: 'sports', path: 'golf-club', code: '0010' },
    'ゴルチE: { section: 'sports', path: 'golf', code: '0010' },
    'ゴルフバチE��': { section: 'sports', path: 'golf-bag', code: '0011' },
    'ゴルフシューズ': { section: 'sports', path: 'golf-shoes', code: '0012' },
    'チE��スラケチE��': { section: 'sports', path: 'tennis-racket', code: '0020' },
    'チE��ス': { section: 'sports', path: 'tennis', code: '0020' },
    '野球': { section: 'sports', path: 'baseball', code: '0030' },
    'グローチE: { section: 'sports', path: 'baseball-glove', code: '0031' },
    'バッチE: { section: 'sports', path: 'baseball-bat', code: '0032' },
    'サチE��ー': { section: 'sports', path: 'soccer', code: '0040' },
    'サチE��ーボ�Eル': { section: 'sports', path: 'soccer-ball', code: '0041' },
    'サチE��ースパイク': { section: 'sports', path: 'soccer-spike', code: '0042' },
    'バスケチE��ボ�Eル': { section: 'sports', path: 'basketball', code: '0050' },
    'バレーボ�Eル': { section: 'sports', path: 'volleyball', code: '0055' },
    '水泳': { section: 'sports', path: 'swimming', code: '0060' },
    '水着': { section: 'sports', path: 'swimwear', code: '0061' },
    'ゴーグル': { section: 'sports', path: 'goggles', code: '0062' },
    'フィチE��ネス': { section: 'sports', path: 'fitness', code: '0070' },
    'トレーニング': { section: 'sports', path: 'training', code: '0071' },
    'ダンベル': { section: 'sports', path: 'dumbbell', code: '0072' },
    'ヨガマッチE: { section: 'sports', path: 'yoga-mat', code: '0073' },
    'プロチE��ン': { section: 'sports', path: 'protein', code: '0074' },
    'スキー': { section: 'sports', path: 'ski', code: '0080' },
    'スノ�Eボ�EチE: { section: 'sports', path: 'snowboard', code: '0081' },
    'ウェア': { section: 'sports', path: 'sports-wear', code: '0090' },

    // ================================================================
    // アウトドア (Outdoor) - section: outdoor
    // ================================================================
    'チE��チE: { section: 'outdoor', path: 'tent', code: '0010' },
    'ターチE: { section: 'outdoor', path: 'tarp', code: '0011' },
    'シュラチE: { section: 'outdoor', path: 'sleeping-bag', code: '0020' },
    '寝袁E: { section: 'outdoor', path: 'sleeping-bag', code: '0020' },
    'キャンチE: { section: 'outdoor', path: 'camp', code: '0001' },
    'キャンプ用品E: { section: 'outdoor', path: 'camp', code: '0001' },
    'アウトドアチェア': { section: 'outdoor', path: 'outdoor-chair', code: '0030' },
    'アウトドアチE�Eブル': { section: 'outdoor', path: 'outdoor-table', code: '0031' },
    'クーラーボックス': { section: 'outdoor', path: 'cooler-box', code: '0040' },
    'バ�Eベキュー': { section: 'outdoor', path: 'bbq', code: '0050' },
    'BBQ': { section: 'outdoor', path: 'bbq', code: '0050' },
    'グリル': { section: 'outdoor', path: 'grill', code: '0051' },
    'ランタン': { section: 'outdoor', path: 'lantern', code: '0060' },
    'ヘッドライチE: { section: 'outdoor', path: 'headlight', code: '0061' },
    '登山': { section: 'outdoor', path: 'mountain', code: '0070' },
    'トレチE��ング': { section: 'outdoor', path: 'trekking', code: '0071' },
    '登山靴': { section: 'outdoor', path: 'trekking-shoes', code: '0072' },
    '釣めE: { section: 'outdoor', path: 'fishing', code: '0080' },
    'フィチE��ング': { section: 'outdoor', path: 'fishing', code: '0080' },
    'ロチE��': { section: 'outdoor', path: 'fishing-rod', code: '0081' },
    'リール': { section: 'outdoor', path: 'fishing-reel', code: '0082' },
    'ルアー': { section: 'outdoor', path: 'lure', code: '0083' },

    // ================================================================
    // 自転軁E(Bicycle) - section: bicycle
    // ================================================================
    '自転軁E: { section: 'bicycle', path: 'bicycle', code: '0001' },
    'ロードバイク': { section: 'bicycle', path: 'road-bike', code: '0010' },
    'クロスバイク': { section: 'bicycle', path: 'cross-bike', code: '0011' },
    'マウンチE��バイク': { section: 'bicycle', path: 'mtb', code: '0012' },
    'MTB': { section: 'bicycle', path: 'mtb', code: '0012' },
    '電動�E転軁E: { section: 'bicycle', path: 'electric-bike', code: '0020' },
    '電動アシスチE: { section: 'bicycle', path: 'electric-bike', code: '0020' },
    '折りたたみ自転軁E: { section: 'bicycle', path: 'folding-bike', code: '0030' },
    'ミニベロ': { section: 'bicycle', path: 'mini-velo', code: '0031' },
    'シチE��サイクル': { section: 'bicycle', path: 'city-cycle', code: '0040' },
    'マ�Eチャリ': { section: 'bicycle', path: 'city-cycle', code: '0040' },
    '子供用自転軁E: { section: 'bicycle', path: 'kids-bike', code: '0050' },
    'ヘルメチE��': { section: 'bicycle', path: 'helmet', code: '0060' },
    'サイクルウェア': { section: 'bicycle', path: 'cycle-wear', code: '0070' },

    // ================================================================
    // ベビー・キチE�� (Baby/Kids) - section: baby
    // ================================================================
    'ベビーカー': { section: 'baby', path: 'baby-car', code: '0010' },
    'チャイルドシーチE: { section: 'baby', path: 'child-seat', code: '0020' },
    'ベビーベッチE: { section: 'baby', path: 'baby-bed', code: '0030' },
    'ベビーチェア': { section: 'baby', path: 'baby-chair', code: '0040' },
    '抱っこ紁E: { section: 'baby', path: 'baby-carrier', code: '0050' },
    'お�Eつ': { section: 'baby', path: 'diaper', code: '0060' },
    'ミルク': { section: 'baby', path: 'baby-milk', code: '0070' },
    '粉ミルク': { section: 'baby', path: 'baby-milk', code: '0070' },
    '哺乳瓶': { section: 'baby', path: 'baby-bottle', code: '0071' },
    'ベビー朁E: { section: 'baby', path: 'baby-wear', code: '0080' },
    'おもちめE: { section: 'baby', path: 'toy', code: '0090' },
    '知育玩具': { section: 'baby', path: 'educational-toy', code: '0091' },
    'キチE��': { section: 'baby', path: 'kids', code: '0100' },
    'ランドセル': { section: 'baby', path: 'school-bag', code: '0101' },

    // ================================================================
    // ペッチE(Pet) - section: pet
    // ================================================================
    'ペッチE: { section: 'pet', path: 'pet', code: '0001' },
    'ドッグフ�EチE: { section: 'pet', path: 'dog-food', code: '0010' },
    '犬': { section: 'pet', path: 'dog', code: '0010' },
    'キャチE��フ�EチE: { section: 'pet', path: 'cat-food', code: '0020' },
    '猫': { section: 'pet', path: 'cat', code: '0020' },
    'ペット用品E: { section: 'pet', path: 'pet-goods', code: '0030' },
    'ペットケージ': { section: 'pet', path: 'pet-cage', code: '0031' },
    'ペットキャリー': { section: 'pet', path: 'pet-carrier', code: '0032' },
    '水槽': { section: 'pet', path: 'fish-tank', code: '0040' },
    'アクアリウム': { section: 'pet', path: 'aquarium', code: '0041' },

    // ================================================================
    // DIY・工具 (DIY/Tools) - section: diy
    // ================================================================
    '電動ドリル': { section: 'diy', path: 'electric-drill', code: '0010' },
    'インパクトドライバ�E': { section: 'diy', path: 'impact-driver', code: '0011' },
    '電動ドライバ�E': { section: 'diy', path: 'electric-driver', code: '0012' },
    '丸ノコ': { section: 'diy', path: 'circular-saw', code: '0020' },
    'チェーンソー': { section: 'diy', path: 'chainsaw', code: '0021' },
    'サンダー': { section: 'diy', path: 'sander', code: '0022' },
    'グラインダー': { section: 'diy', path: 'grinder', code: '0023' },
    '工具セチE��': { section: 'diy', path: 'tool-set', code: '0030' },
    'レンチE: { section: 'diy', path: 'wrench', code: '0031' },
    'ドライバ�EセチE��': { section: 'diy', path: 'driver-set', code: '0032' },
    'ペンキ': { section: 'diy', path: 'paint', code: '0040' },
    '塗料': { section: 'diy', path: 'paint', code: '0040' },
    '溶接橁E: { section: 'diy', path: 'welder', code: '0050' },
    'コンプレチE��ー': { section: 'diy', path: 'compressor', code: '0051' },

    // ================================================================
    // キチE��ン用品E(Kitchen Goods) - section: kitchen
    // ================================================================
    '鍁E: { section: 'kitchen', path: 'pot', code: '0010' },
    'フライパン': { section: 'kitchen', path: 'frying-pan', code: '0011' },
    '圧力鍋': { section: 'kitchen', path: 'pressure-cooker', code: '0012' },
    '匁E��E: { section: 'kitchen', path: 'knife', code: '0020' },
    'まな板': { section: 'kitchen', path: 'cutting-board', code: '0021' },
    '食器': { section: 'kitchen', path: 'tableware', code: '0030' },
    'グラス': { section: 'kitchen', path: 'glass', code: '0031' },
    'マグカチE�E': { section: 'kitchen', path: 'mug', code: '0032' },
    'カトラリー': { section: 'kitchen', path: 'cutlery', code: '0040' },
    '弁当箱': { section: 'kitchen', path: 'lunch-box', code: '0050' },
    '水筁E: { section: 'kitchen', path: 'water-bottle', code: '0051' },
    'タンブラー': { section: 'kitchen', path: 'tumbler', code: '0052' },
    '保存容器': { section: 'kitchen', path: 'storage-container', code: '0060' },

    // ================================================================
    // 生活雑貨 (Household Goods) - section: houseware
    // ================================================================
    '洗剤': { section: 'houseware', path: 'detergent', code: '0010' },
    '柔軟剤': { section: 'houseware', path: 'softener', code: '0011' },
    '掁E��用品E: { section: 'houseware', path: 'cleaning-goods', code: '0020' },
    'タオル': { section: 'houseware', path: 'towel', code: '0030' },
    'バスタオル': { section: 'houseware', path: 'bath-towel', code: '0031' },
    'バスマッチE: { section: 'houseware', path: 'bath-mat', code: '0032' },
    'トイレ用品E: { section: 'houseware', path: 'toilet-goods', code: '0040' },
    '芳香剤': { section: 'houseware', path: 'air-freshener', code: '0050' },
    '消�E剤': { section: 'houseware', path: 'deodorizer', code: '0051' },
    '虫よけ': { section: 'houseware', path: 'insect-repellent', code: '0060' },
    '殺虫剤': { section: 'houseware', path: 'insecticide', code: '0061' },
    'ゴミ箱': { section: 'houseware', path: 'trash-can', code: '0070' },
    '斁E��具': { section: 'houseware', path: 'stationery', code: '0080' },
    'ノ�EチE: { section: 'houseware', path: 'notebook', code: '0081' },
    'ペン': { section: 'houseware', path: 'pen', code: '0082' },

    // ================================================================
    // ビューチE��ー追加 (Beauty/Health Extra) - section: beauty_health
    // ================================================================
    'コスメ': { section: 'beauty_health', path: 'cosmetics', code: '0010' },
    '化粧品E: { section: 'beauty_health', path: 'cosmetics', code: '0010' },
    'ファンチE�Eション': { section: 'beauty_health', path: 'foundation', code: '0011' },
    'リチE�E': { section: 'beauty_health', path: 'lipstick', code: '0012' },
    'アイシャドウ': { section: 'beauty_health', path: 'eyeshadow', code: '0013' },
    'マスカラ': { section: 'beauty_health', path: 'mascara', code: '0014' },
    'スキンケア': { section: 'beauty_health', path: 'skincare', code: '0020' },
    '化粧水': { section: 'beauty_health', path: 'lotion', code: '0021' },
    '乳液': { section: 'beauty_health', path: 'emulsion', code: '0022' },
    '美容液': { section: 'beauty_health', path: 'serum', code: '0023' },
    '日焼け止めE: { section: 'beauty_health', path: 'sunscreen', code: '0024' },
    'シャンプ�E': { section: 'beauty_health', path: 'shampoo', code: '0030' },
    'コンチE��ショナ�E': { section: 'beauty_health', path: 'conditioner', code: '0031' },
    'ボディソーチE: { section: 'beauty_health', path: 'body-soap', code: '0032' },
    '香水': { section: 'beauty_health', path: 'perfume', code: '0040' },
    'サプリメンチE: { section: 'beauty_health', path: 'supplement', code: '0050' },
    'ビタミン': { section: 'beauty_health', path: 'vitamin', code: '0051' },

    // ================================================================
    // 食品・ドリンク (Food/Drink) - section: food / drink
    // ================================================================
    '米': { section: 'food', path: 'rice', code: '0010' },
    'お米': { section: 'food', path: 'rice', code: '0010' },
    'パスタ': { section: 'food', path: 'pasta', code: '0020' },
    '麺': { section: 'food', path: 'noodle', code: '0021' },
    '調味斁E: { section: 'food', path: 'seasoning', code: '0030' },
    '醤油': { section: 'food', path: 'soy-sauce', code: '0031' },
    'オリーブオイル': { section: 'food', path: 'olive-oil', code: '0032' },
    'お菓孁E: { section: 'food', path: 'sweets', code: '0040' },
    'チョコレーチE: { section: 'food', path: 'chocolate', code: '0041' },
    'コーヒ�E豁E: { section: 'food', path: 'coffee-beans', code: '0050' },
    '紁E��': { section: 'food', path: 'tea', code: '0051' },
    '缶詰': { section: 'food', path: 'canned-food', code: '0060' },
    'レトルチE: { section: 'food', path: 'retort', code: '0061' },
    'ミネラルウォーター': { section: 'drink', path: 'water', code: '0010' },
    '水': { section: 'drink', path: 'water', code: '0010' },
    '炭酸水': { section: 'drink', path: 'sparkling-water', code: '0011' },
    'ジュース': { section: 'drink', path: 'juice', code: '0020' },
    'お茶': { section: 'drink', path: 'tea', code: '0030' },
    '緑茶': { section: 'drink', path: 'green-tea', code: '0031' },
    'ビ�Eル': { section: 'drink', path: 'beer', code: '0040' },
    'ワイン': { section: 'drink', path: 'wine', code: '0041' },
    '日本酁E: { section: 'drink', path: 'sake', code: '0042' },
    'ウイスキー': { section: 'drink', path: 'whisky', code: '0043' },
    '焼酁E: { section: 'drink', path: 'shochu', code: '0044' },
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

    // Try remote debugging first (using manually-opened Chrome), fallback to headless
    let browser;
    let isRemote = false;
    try {
        const http = require('http');
        const wsUrl = await new Promise((resolve, reject) => {
            const req = http.get('http://127.0.0.1:9222/json/version', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        resolve(json.webSocketDebuggerUrl);
                    } catch (e) { reject(e); }
                });
            });
            req.on('error', reject);
            req.setTimeout(3000, () => { req.destroy(); reject(new Error('timeout')); });
        });
        browser = await puppeteer.connect({ browserWSEndpoint: wsUrl, defaultViewport: null });
        isRemote = true;
        console.log('   🌐 Connected to remote Chrome for better Amazon compatibility');
    } catch (e) {
        console.log(`   ❁EFailed to connect to Remote Chrome in Market Research: ${e.message}`);
        console.log(`   ⚠�E�EPlease ensure Chrome is open (produce_from_blueprint should have started it).`);
        throw e; // Fail rather than using unconnected headless
        /*
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        */
    }

    try {
        let page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        // Recursive pagination: keep fetching until we have enough products
        const targetCount = options.targetCount || 50; // Target number of filtered products
        const maxPagesLimit = options.maxPages || 20;  // Hard limit to prevent infinite loops
        let pageNum = options.startPage ? options.startPage - 1 : 0; // Initialize with startPage (0-indexed internally)
        let filteredCount = 0;

        // DEBUG BACKDOOR REMOVED


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
                await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
                await new Promise(r => setTimeout(r, 2000));

                // Extract all filter links from the page
                const filterLinks = await page.evaluate(() => {
                    const filters = {};
                    document.querySelectorAll('a').forEach(a => {
                        const href = a.href || '';
                        const text = a.innerText?.trim() || '';
                        // Match filter URLs like: /ranking_2046/spec=002-1/
                        const match = href.match(/\/ranking_\d+\/(spec=[^\/]+)\//);
                        if (match && text && text.length < 30 && !text.includes('人氁E)) {
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
                            console.log(`   ✁EMatched filter: "${feature}" ↁE"${filterName}" (${filterSpec})`);
                            break;
                        }
                    }
                    if (filterUrlSuffix) break;
                }

                if (!filterUrlSuffix) {
                    console.log(`   ⚠�E�ENo matching filter found, using full ranking`);
                }
            } catch (filterErr) {
                console.log(`   ⚠�E�EFilter discovery failed: ${filterErr.message?.slice(0, 30)}`);
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
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
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
                            // Clean up name: remove ranking (e.g., '2佁E), newlines, and normalize
                            let name = rawName
                                .replace(/\d+佁Eg, '')       // Remove ranking number anywhere
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

                // DEBUG BACKDOOR
                // DEBUG BACKDOOR REMOVED


                console.log(`      ✁EPage ${pageNum}: Found ${products.length} raw products. Fetching Amazon links...`);

                // Visit Detail Pages to get Amazon Link (User Request)
                for (let i = 0; i < products.length; i++) {
                    // Optimization: Stop if we've processed enough items for verification
                    if (options.targetCount && i >= options.targetCount) break;

                    const p = products[i];
                    if (!p.kakakuUrl) continue;

                    // Skip if we already have enough candidates in THIS batch (optional optimization)
                    // But we want to filter strictly, so we should check all or most.

                    try {
                        console.log(`         🔎 [${i + 1}/${products.length}] Checking: ${p.name.slice(0, 15)}... (${p.kakakuUrl})`);


                        // Helper: Smart Wait Navigation
                        // Proceeds as soon as selector is found OR navigation completes
                        const smartGoto = async (targetUrl, selector, timeout = 90000) => {
                            // 1. Check if already on page (normalization required)
                            const current = page.url().split('#')[0].split('?')[0];
                            const target = targetUrl.split('#')[0].split('?')[0];
                            if (current === target || (current + '/') === target || current === (target + '/')) {
                                console.log('            ⚡ Smart Wait: Already on page, skipping navigation');
                                return true;
                            }

                            // 2. Race Condition: Goto vs WaitForSelector
                            try {
                                const gotoPromise = page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: timeout });
                                const waitPromise = page.waitForSelector(selector, { timeout: timeout });

                                // Race them!
                                await Promise.race([
                                    gotoPromise.catch(e => { /* mute nav errors in race */ }),
                                    waitPromise
                                ]);

                                // Double check: Did we actually find the content?
                                const exists = await page.$(selector).catch(() => null);
                                if (exists) {
                                    console.log('            ⚡ Smart Wait: Content found early!');
                                    return true;
                                }

                                // If no content, await goto (it might have finished without content?)
                                await gotoPromise;
                                return true;

                            } catch (e) {
                                console.log(`            ⚠�E�ENavigation/Wait failed: ${e.message}`);
                                // Last ditch check
                                const exists = await page.$(selector).catch(() => null);
                                if (exists) {
                                    console.log('            ⚡ Content exists despite error, proceeding.');
                                    return true;
                                }
                                throw e; // Real failure
                            }
                        };

                        // Navigate with Smart Wait (Target: Tab content or Shop List)
                        let navSuccess = false;
                        try {
                            // Retry logic implicit in logic if we wanted, but SmartWait is robust enough
                            // We use .p-PTShopList_item (Shop List) OR .c-productCard_name (Product Page fallback)
                            // If we rely on #tab, we expect shop list 
                            await smartGoto(p.kakakuUrl + '#tab', '.p-PTShopList_item, table[class*="shopTable"], .p-PTShopList_body', 60000);
                            navSuccess = true;
                        } catch (navErr) {
                            console.log(`         🔄 Smart Navigation failed, retrying once...`);
                            try {
                                await new Promise(r => setTimeout(r, 2000));
                                await smartGoto(p.kakakuUrl + '#tab', '.p-PTShopList_item, table[class*="shopTable"]', 60000);
                                navSuccess = true;
                            } catch (retryErr) {
                                console.log(`         ❁ENavigation failed: ${retryErr.message}`);
                                continue; // Skip product
                            }
                        }

                        await new Promise(r => setTimeout(r, 1000)); // Brief settle time

                        // Try to find Amazon on multiple pages if needed
                        let amazonInfo = null;
                        for (let shopPage = 1; shopPage <= 3 && !amazonInfo; shopPage++) {
                            const shopUrl = shopPage === 1
                                ? p.kakakuUrl + '#tab'
                                : p.kakakuUrl + '?page=' + shopPage + '#tab';

                            try {
                                // Smart Wait for Shop List Items
                                if (shopPage > 1) { // Only navigate if not already handled by initial nav
                                    await smartGoto(shopUrl, '.p-PTShopList_item, table[class*="shopTable"]', 60000);
                                }
                            } catch (e) {
                                console.log(`            ⚠�E�EShop page ${shopPage} load failed, stopping pager.`);
                                break;
                            }

                            // Scan for Amazon
                            amazonInfo = await page.evaluate((options) => {
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
                                                const match = priceText.match(/[¥�E�]?([\d,]+)/);
                                                if (match) price = parseInt(match[1].replace(/,/g, ''), 10);
                                            }
                                        }

                                        // Fallback: search nearby for any price-like number
                                        if (price === 0) {
                                            const parent = link.parentElement?.parentElement;
                                            if (parent) {
                                                const txt = parent.innerText;
                                                const match = txt.match(/[¥�E�]([\d,]+)/);
                                                if (match) price = parseInt(match[1].replace(/,/g, ''), 10);
                                            }
                                        }

                                        // ☁EEARLY PRICE FILTER ☁E
                                        // If we know the price now, reject it immediately if out of range to save time
                                        if (price > 0 && options && (options.minPrice || options.maxPrice)) {
                                            if (options.minPrice && price < options.minPrice) return null; // Too cheap
                                            if (options.maxPrice && price > options.maxPrice) return null; // Too expensive
                                        }

                                        return { url: href, price: price };
                                    }
                                }
                                return null;
                            }, { minPrice: options.minPrice, maxPrice: options.maxPrice }); // Pass options to browser context

                            if (amazonInfo) {
                                console.log(`            ✁EAmazon Shop Found (Page ${shopPage}): ¥${amazonInfo.price || '?'}`);
                            }
                        }

                        if (amazonInfo) {
                            // === STEP 2: Navigate to shop page and get forwarder link ===
                            console.log(`            🔄 Following redirect to get actual Amazon URL...`);
                            try {
                                await page.goto(amazonInfo.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
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
                                    // === STEP 3: Follow forwarder to Amazon (Smart Redirect) ===
                                    // Kakaku uses: c.kakaku.com/forwarder ↁEkakaku.com/pt/ard.asp ↁEamazon.co.jp
                                    let finalUrl = '';
                                    try {
                                        console.log(`            ⚡ Smart Redirect: Accessing ${forwarderUrl.slice(0, 40)}...`);

                                        // Start navigation - Relaxed wait condition
                                        page.goto(forwarderUrl, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => { });

                                        // Polling Loop: Check URL every 500ms
                                        // This allows us to "see" the redirect happen and exit IMMEDIATELY when Amazon is reached
                                        const maxWait = 45000;
                                        const startTime = Date.now();
                                        let lastLoggedUrl = '';

                                        while (Date.now() - startTime < maxWait) {
                                            const currentUrl = page.url();

                                            // Log URL changes for visibility
                                            if (currentUrl !== lastLoggedUrl) {
                                                // Ignore minor hash changes if needed, but showing everything is safer for debug
                                                if (currentUrl !== 'about:blank') {
                                                    console.log(`            🔄 Redirecting... ${currentUrl.slice(0, 80)}`);
                                                }
                                                lastLoggedUrl = currentUrl;
                                            }

                                            // Success condition: Reached Amazon
                                            if (currentUrl.includes('amazon.co.jp') && !currentUrl.includes('kakaku.com')) {
                                                console.log(`            ✨ Amazon reachable! Stopping wait.`);
                                                break;
                                            }

                                            // Manual Click Handling (Fallback for "Click here" pages)
                                            // Check every ~2 seconds
                                            if ((Date.now() - startTime) % 2000 < 500) {
                                                try {
                                                    const hasManualLink = await page.evaluate(() => {
                                                        const a = document.querySelector('a');
                                                        return a && (a.innerText.includes('こちめE) || a.innerText.includes('Click') || a.innerText.includes('Amazon'));
                                                    });
                                                    if (hasManualLink) {
                                                        console.log(`            👆 Found manual redirect link, clicking...`);
                                                        await page.click('a');
                                                    }
                                                } catch (evalErr) {
                                                    // Ignore evaluation errors (timeouts, etc.) during navigation
                                                    // console.log(`            ⚠�E�EManual link check skipped: ${evalErr.message}`);
                                                }
                                            }

                                            await new Promise(r => setTimeout(r, 500));
                                        }


                                        // === SMART WAIT: Wait for actual product content ===
                                        console.log(`            ⚡ Smart Wait: Waiting for Amazon product content to load...`);

                                        // Helper checks for "loaded" state - defined inside evaluate typically, but here we pass function body if using page.waitForFunction(fn)
                                        // Actually waitForFunction takes a function to run in page context.
                                        try {
                                            // Wait for ANY of these good indicators that the page is useful
                                            await page.waitForFunction(() => {
                                                const body = document.body;
                                                if (!body) return false;

                                                // 1. Specific key elements for product page
                                                const hasTitle = !!document.querySelector('#productTitle') || !!document.querySelector('#title');
                                                const hasPrice = !!document.querySelector('.a-price') || !!document.querySelector('#priceblock_ourprice');
                                                const hasAvailability = !!document.querySelector('#availability') || !!document.querySelector('#add-to-cart-button');

                                                // 2. Fallback: Body length check
                                                const bodyLength = body.innerText.length;
                                                const readyState = document.readyState;

                                                // Must be interactive/complete AND have some content
                                                if (readyState === 'loading') return false;

                                                return (hasTitle && bodyLength > 800) || hasAvailability || (hasPrice && bodyLength > 1000) || bodyLength > 3000;
                                            }, { timeout: 20000 }); // Increased to 20s
                                            console.log(`            ✁EContent Loaded (Smart Wait passed)`);
                                        } catch (waitErr) {
                                            console.log(`            ⚠�E�ESmart Wait 1 timeout. Page might be hung. ReadyState: ${await page.evaluate(() => document.readyState)}`);

                                            // Attempt 2: Reload and Wait
                                            try {
                                                console.log(`            🔄 Retrying with page reload...`);
                                                await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
                                                await new Promise(r => setTimeout(r, 2000)); // Settle

                                                await page.waitForFunction(() => {
                                                    const body = document.body;
                                                    if (!body) return false;
                                                    const bodyLength = body.innerText.length;
                                                    const hasTitle = !!document.querySelector('#productTitle');
                                                    return (hasTitle && bodyLength > 800) || bodyLength > 3000;
                                                }, { timeout: 20000 });
                                                console.log(`            ✁EContent Loaded after reload!`);
                                            } catch (reloadErr) {
                                                console.log(`            ⚠�E�ESmart Wait failed after reload: ${reloadErr.message}`);
                                            }
                                        }


                                    } catch (navErr) {
                                        console.log(`            ⚠�E�ENavigation flow error: ${navErr.message?.slice(0, 40)}`);
                                    }

                                    finalUrl = page.url(); // Final URL check
                                    if (finalUrl.includes('amazon.co.jp')) {
                                        // Extract ASIN from URL
                                        const asinMatch = finalUrl.match(/\/dp\/([A-Z0-9]{10})/);

                                        // === STEP 4: Check stock availability AND price on Amazon ===
                                        const stockInfo = await page.evaluate(() => {
                                            // Enhanced Debug Info
                                            const debug = {
                                                hasBody: !!document.body,
                                                bodyLength: document.body ? document.body.innerText.length : 0,
                                                readyState: document.readyState,
                                                title: document.title,
                                                url: window.location.href
                                            };

                                            if (!document.body) return { inStock: false, hasAddToCart: false, hasOutOfStockText: false, amazonPrice: 0, debug };

                                            const bodyText = document.body.innerText || '';

                                            // Check for in-stock indicators
                                            const inStockIndicators = [
                                                '在庫あり',
                                                'カートに入れる',
                                                '今すぐ買ぁE,
                                                'Add to Cart',
                                                'Buy Now'
                                            ];
                                            const hasInStock = inStockIndicators.some(t => bodyText.includes(t));



                                            // Check for out-of-stock indicators  
                                            const outOfStockIndicators = [
                                                '現在在庫刁E��でぁE,
                                                '在庫刁E��',
                                                'Currently unavailable',
                                                'こ�E啁E��は現在お取り扱ぁE��きません',
                                                '一時的に在庫刁E��',
                                                '入荷時期は未定でぁE,
                                                '出品老E��らお求めぁE��だけまぁE,
                                                '要件を満たす出品�Eありません'
                                            ];
                                            let hasOutOfStock = outOfStockIndicators.some(t => bodyText.includes(t));

                                            // Explicit Availability Status Check (Detailed)
                                            const availabilityEl = document.querySelector('#availability');
                                            if (availabilityEl) {
                                                const availText = availabilityEl.innerText.trim();
                                                if (availText.includes('在庫刁E��') || availText.includes('unavailable') || availText.includes('Not available')) {
                                                    hasOutOfStock = true;
                                                }
                                            }

                                            // Check for add-to-cart button
                                            const addToCartBtn = document.querySelector('#add-to-cart-button, #buy-now-button, [name="submit.add-to-cart"]');

                                            // Check for "See All Buying Options" (implies no main cart, often effectively OOS for primary price)
                                            const seeAllBuyingChoices = document.querySelector('#buybox-see-all-buying-choices, a[href*="offer-listing"]');

                                            // If we have "See All Buying Options" but no "Add to Cart", it's effectively OOS for the main price
                                            // But for our purpose (tracking availability), it technically IS available from reliable sellers?
                                            // Kakaku usually lists the cheapest. If Amazon lists it, it counts. 
                                            // But if "Amazon" is the seller, it usually has a cart button.
                                            // If only 3rd party, it might show "See All". 
                                            // Let's rely on hasOutOfStock text primarily. 
                                            // If we have NO cart button AND NO "See All", it's definitely OOS.
                                            // If we have "See All" but no cart, it's "Marketplace".
                                            const hasBuyingOptions = !!addToCartBtn || !!seeAllBuyingChoices;

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
                                                    const match = priceText.match(/[¥�E�]?([\d,]+)/);
                                                    if (match) {
                                                        amazonPrice = parseInt(match[1].replace(/,/g, ''), 10);
                                                        if (amazonPrice > 100) break; // Valid price found
                                                    }
                                                }
                                            }

                                            return {
                                                inStock: hasInStock && !hasOutOfStock && hasBuyingOptions, // Require some buying option
                                                hasAddToCart: hasBuyingOptions,
                                                hasOutOfStockText: hasOutOfStock,
                                                amazonPrice: amazonPrice,
                                                debug: debug
                                            };
                                        });

                                        if (stockInfo && stockInfo.inStock) {
                                            p.amazonUrl = finalUrl;
                                            p.inStock = true;
                                            if (asinMatch) {
                                                p.asin = asinMatch[1];
                                                console.log(`            ✁EIn Stock: ASIN ${p.asin}`);
                                            } else {
                                                console.log(`            ✁EIn Stock (Amazon URL obtained)`);
                                            }
                                        } else if (stockInfo && (stockInfo.hasOutOfStockText || (!stockInfo.inStock && stockInfo.debug?.bodyLength > 800))) {
                                            console.log(`            ❁EOut of Stock on Amazon (Explicit or No Buy Button)`);
                                            p.amazonUrl = null; // Clear so it gets skipped
                                            p.inStock = false;
                                        } else {
                                            // Ambiguous or failed extraction - might be available
                                            // Log debug info and take screenshot
                                            console.log(`            ⚠�E�EStock uncertain. Debug: ${JSON.stringify(stockInfo?.debug)}`);

                                            // Screenshot for debugging
                                            try {
                                                const fs = require('fs');
                                                const path = require('path');
                                                // Save to artifacts directory or project root
                                                const debugDir = path.resolve(__dirname, '../../debug_screenshots');
                                                if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });

                                                const screenshotPath = path.join(debugDir, `stock_uncertain_${p.asin || 'unknown'}_${Date.now()}.png`);
                                                await page.screenshot({ path: screenshotPath, fullPage: false });
                                                console.log(`            📸 Saved debug screenshot: ${screenshotPath}`);
                                            } catch (err) {
                                                console.log(`            ⚠�E�EScreenshot failed: ${err.message}`);
                                            }

                                            p.amazonUrl = finalUrl;
                                            p.inStock = stockInfo ? stockInfo.hasAddToCart : false;
                                            if (asinMatch) p.asin = asinMatch[1];
                                        }
                                    } else {
                                        console.log(`            ⚠�E�ERedirect did not reach Amazon: ${finalUrl.slice(0, 50)}...`);
                                        // Don't set amazonUrl - we didn't get to Amazon, so no valid link
                                    }
                                } else {
                                    console.log(`            ⚠�E�ENo forwarder link found`);
                                    // Don't set amazonUrl - no valid Amazon link
                                }
                            } catch (redirectErr) {
                                console.log(`            ⚠�E�ERedirect failed: ${redirectErr.message?.slice(0, 30)}`);
                                // Don't set amazonUrl on failure - no valid Amazon link
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
                            console.log(`            ❁ENo Amazon link (checked 3 pages)`);
                        }

                        // --- SPEC PAGE SCRAPING (ENHANCED) ---
                        // Get structured specs from /spec/ page for accurate filtering
                        console.log(`            📋 Checking specs for ${p.name.slice(0, 15)}...`);
                        try {
                            const specUrl = p.kakakuUrl.replace(/#.*$/, '').replace(/\?.*$/, '') + 'spec/';
                            // Relaxed wait for spec page
                            await page.goto(specUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => { });
                            await new Promise(r => setTimeout(r, 1000));

                            const specData = await page.evaluate(() => {
                                const specs = {};

                                // Kakaku spec tables have 4-column structure:
                                // <tr><th>スペック吁E</th><td>値1</td><th>スペック吁E</th><td>値2</td></tr>
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
                                console.log(`            ⚠�E�ENo spec attributes found on page`);
                            }
                        } catch (specErr) {
                            console.log(`            ⚠�E�ESpec extraction error: ${specErr.message?.slice(0, 30)}`);
                            p.kakakuSpecs = {};
                        }

                        // Longer delay to avoid rate limiting and bans
                        await new Promise(r => setTimeout(r, 1500));

                    } catch (e) {
                        console.log(`         ⚠�E�EDetail check failed: ${e.message}`);
                        // Critical recovery: If page crashed (detached/closed), recreate it
                        if (e.message.includes('detached Frame') || e.message.includes('Target closed') || e.message.includes('Session closed')) {
                            console.log(`         🔄 Browser tab crashed. Recreating page to continue...`);
                            try { await page.close(); } catch (clErr) { }
                            page = await browser.newPage();
                            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
                        }
                    }
                }

                allProducts.push(...products);

                // Stop if no products found on this page (end of listing)
                if (products.length === 0) {
                    console.log(`      ⚠�E�ENo more products, stopping pagination`);
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
                console.log(`      ⚠�E�EPage ${pageNum} failed: ${pageError.message}`);
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

        console.log(`   ✁ETotal: ${filtered.length} products from Kakaku.com (${allProducts.length} raw, ${uniqueProducts.length} unique)`);
        return filtered;

    } catch (e) {
        console.log(`   ⚠�E�EKakaku scraping failed: ${e.message}`);
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
        try {
            // Try connecting to existing Chrome (port 9222) first
            const http = require('http');
            try {
                const wsUrl = await new Promise((resolve, reject) => {
                    const req = http.get('http://127.0.0.1:9222/json/version', (res) => {
                        let data = '';
                        res.on('data', chunk => data += chunk);
                        res.on('end', () => {
                            try {
                                const json = JSON.parse(data);
                                resolve(json.webSocketDebuggerUrl);
                            } catch (e) { reject(e); }
                        });
                    });
                    req.on('error', reject);
                    req.setTimeout(2000, () => { req.destroy(); reject(new Error('timeout')); });
                });
                browser = await puppeteer.connect({ browserWSEndpoint: wsUrl, defaultViewport: null });
            } catch (connectErr) {
                console.log(`   ⚠�E�ECould not connect to shared Chrome, falling back to new instance: ${connectErr.message}`);
                // Fallback: Launch new (headless) - might fail if profile is locked, but standard behavior
                browser = await puppeteer.launch({
                    headless: 'new',
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
                });
            }

            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

            // Search MyBest for the keyword
            const searchUrl = `https://my-best.com/search?q=${encodeURIComponent(keyword)}`;
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

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
            console.log(`   ✁EFound ${products.length} products from MyBest.jp`);
            return products;

        } catch (e) {
            console.log(`   ⚠�E�EMyBest scraping failed: ${e.message}`);
            if (browser) await browser.close();
            return [];
        }
    } catch (finalErr) {
        console.log(`   ⚠�E�EMyBest outer error: ${finalErr.message}`);
        return [];
    }
}

/**
 * Scrape MONOQLO/家電批詁Erankings
 * Known for honest, unbiased product testing
 * @param {string} keyword - Search keyword
 * @returns {Promise<Array>} - Array of { name, monoqloRank, source }
 */
async function scrapeMONOQLO(keyword) {
    console.log(`   📰 Searching MONOQLO/家電批詁Efor "${keyword}"...`);

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
                const client = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });

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
                                    source: 'MONOQLO/家電批詁E
                                });
                            }
                        });
                    }
                } catch (e) {
                    // Continue without this snippet
                }
            }
        }

        console.log(`   ✁EFound ${products.length} products from MONOQLO`);
        return products.slice(0, 15);

    } catch (e) {
        console.log(`   ⚠�E�EMONOQLO search failed: ${e.message}`);
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
        // Try connecting to existing Chrome (port 9222) first
        const http = require('http');
        try {
            const wsUrl = await new Promise((resolve, reject) => {
                const req = http.get('http://127.0.0.1:9222/json/version', (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try {
                            const json = JSON.parse(data);
                            resolve(json.webSocketDebuggerUrl);
                        } catch (e) { reject(e); }
                    });
                });
                req.on('error', reject);
                req.setTimeout(2000, () => { req.destroy(); reject(new Error('timeout')); });
            });
            browser = await puppeteer.connect({ browserWSEndpoint: wsUrl, defaultViewport: null });
        } catch (connectErr) {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        // Amazon bestseller ranking URL
        const url = `https://www.amazon.co.jp/gp/bestsellers/electronics/${category}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
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

        console.log(`   ✁EFound ${filtered.length} products from Amazon Bestseller (filtered from ${products.length})`);
        return filtered;

    } catch (e) {
        console.log(`   ⚠�E�EAmazon Bestseller scraping failed: ${e.message}`);
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
        console.log(`   ⚠�E�EKakaku.com failed: ${e.message}`);
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
        console.log(`   ⚠�E�EMyBest failed: ${e.message}`);
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
        console.log(`   ⚠�E�EMarket research failed: ${e.message}`);
    }

    // 4. Amazon Bestseller (verified product names)
    try {
        // Category 3477981 = イヤホン・ヘッド�Eン
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
        console.log(`   ⚠�E�EAmazon Bestseller failed: ${e.message}`);
    }

    // 5. MONOQLO/家電批詁E(trusted expert reviews)
    try {
        const monoqloProducts = await scrapeMONOQLO(keyword);
        monoqloProducts.forEach(p => {
            const key = p.name.toLowerCase();
            if (allProducts.has(key)) {
                allProducts.get(key).sources.push('MONOQLO/家電批詁E);
            } else {
                allProducts.set(key, { ...p, sources: ['MONOQLO/家電批詁E], sourceScores: {} });
            }
        });
    } catch (e) {
        console.log(`   ⚠�E�EMONOQLO failed: ${e.message}`);
    }

    // Convert to array and calculate combined score
    const products = Array.from(allProducts.values()).map(p => ({
        ...p,
        mentionCount: p.sources?.length || 1,
        combinedScore: calculateCombinedScore(p)
    }));

    // Sort by combined score
    products.sort((a, b) => b.combinedScore - a.combinedScore);

    console.log(`   ✁EMulti-source discovery found ${products.length} unique products`);
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
    if (product.sources?.includes('MONOQLO/家電批詁E)) {
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

            console.log(`   ✁EFound Amazon.co.jp link! Shop ID: ${shopId}`);
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
                console.log(`   ✁EFound Amazon.co.jp on page 2!`);
                return {
                    found: true,
                    amazonUrl: amazonInfoPage2.href,
                    shopId: shopIdMatch ? shopIdMatch[1] : null
                };
            }
        }

        await browser.close();
        console.log(`   ⚠�E�EAmazon.co.jp not found in shop list`);
        return { found: false, amazonUrl: null, shopId: null };

    } catch (e) {
        console.log(`   ⚠�E�EError extracting Amazon link: ${e.message}`);
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
        console.log('   ⚠�E�ENo products found from ranking');
        return [];
    }

    // Step 2: Enrich each product with Amazon link (limit to avoid too many requests)
    const maxEnrich = options.maxEnrich || 30; // Limit enrichment to top N products
    const productsToEnrich = products.slice(0, maxEnrich);

    console.log(`\n🔗 Enriching ${productsToEnrich.length} products with Amazon links...`);

    let browser;
    let isConnected = false;
    try {
        // Try connecting to existing Chrome (port 9222) first (Unified Session)
        const http = require('http');
        try {
            const wsUrl = await new Promise((resolve, reject) => {
                const req = http.get('http://127.0.0.1:9222/json/version', (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try {
                            const json = JSON.parse(data);
                            resolve(json.webSocketDebuggerUrl);
                        } catch (e) { reject(e); }
                    });
                });
                req.on('error', reject);
                req.setTimeout(2000, () => { req.destroy(); reject(new Error('timeout')); });
            });
            browser = await puppeteer.connect({ browserWSEndpoint: wsUrl, defaultViewport: null });
            isConnected = true;
            console.log(`   🔌 Connected to shared Chrome session`);
        } catch (connectErr) {
            console.log(`   🚀 Launching dedicated headless browser for Kakaku...`);
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            isConnected = false;
        }

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
                    console.log(`      ✁EAmazon.co.jp found`);
                } else {
                    product.hasAmazon = false;
                    console.log(`      ⚠�E�ENo Amazon.co.jp`);
                }

                // === ENHANCED: Scrape dedicated spec page for structured data ===
                const specUrl = baseUrl + 'spec/';
                try {
                    await page.goto(specUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
                    await new Promise(r => setTimeout(r, 1000));

                    const specData = await page.evaluate(() => {
                        const specs = {};

                        // Kakaku spec tables have consistent structure:
                        // <tr><th>スペック吁E/th><td>値</td></tr>
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
                    console.log(`      ⚠�E�ESpec page error: ${specError.message?.slice(0, 30)}`);
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
                console.log(`      ⚠�E�EError: ${e.message}`);
            }

            // Rate limiting - be nice to Kakaku.com
            await new Promise(r => setTimeout(r, 500));
        }

        if (isConnected) await browser.disconnect();
        else await browser.close();

    } catch (e) {
        console.log(`   ⚠�E�EEnrichment failed: ${e.message}`);
        if (browser) {
            if (isConnected) await browser.disconnect();
            else await browser.close();
        }
    }

    // Summary
    const withAmazon = productsToEnrich.filter(p => p.hasAmazon).length;
    console.log(`\n✁EKakaku Market Research Complete:`);
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
