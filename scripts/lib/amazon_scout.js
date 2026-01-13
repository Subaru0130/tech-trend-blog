const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scoutAmazonProducts(keyword, maxCount = 5, pageNumber = 1) {
    console.log(`\n🕵️‍♂️ Market Scout: Searching Amazon for "${keyword}" (Page ${pageNumber})...`);

    const browser = await puppeteer.launch({
        headless: "new", // Use new Headless mode (safer/faster)
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        // Go to search page directly to avoid search box issues
        const searchUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}&page=${pageNumber}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for results
        // Try multiple selectors as Amazon changes them often
        const selectors = [
            'div[data-component-type="s-search-result"]',
            '.s-result-item',
            'div.s-result-list'
        ];

        let foundSelector = null;
        for (const s of selectors) {
            if (await page.$(s)) {
                foundSelector = s;
                break;
            }
        }

        if (!foundSelector) {
            console.log("   ❌ Error: Product list selector not found. Checking page content...");
            const title = await page.title();
            console.log(`   Page Title: ${title}`);
            await page.screenshot({ path: 'scout_debug_error.png' });

            // Check for CAPTCHA
            const content = await page.content();
            if (content.includes("robot") || title.includes("CAPTCHA")) {
                console.log("   🚨 DETECTED CAPTCHA! Amazon is blocking us.");
            }

            await browser.close();
            return [];
        }

        // Extract Items
        const items = await page.evaluate(() => {
            const results = [];
            // Robust Strategy: Find ANYTHING with a data-asin attribute that isn't empty
            const nodes = document.querySelectorAll('div[data-asin]');

            nodes.forEach(node => {
                const asin = node.getAttribute('data-asin');
                if (!asin || asin.length < 5) return; // Skip empty/short ASINs

                // Try multiple title selectors
                const titleEl = node.querySelector('h2') || node.querySelector('span.a-text-normal');
                const priceEl = node.querySelector('.a-price-whole');
                const imgEl = node.querySelector('img.s-image');
                const linkEl = node.querySelector('a.a-link-normal'); // Any link in the card

                // Rating & Review Count
                const ratingEl = node.querySelector('span[aria-label*="5つ星のうち"]');
                const reviewCountEl = node.querySelector('span[aria-label*="個の評価"]');

                if (titleEl && imgEl) {
                    const title = titleEl.innerText.trim();
                    const priceRaw = priceEl ? priceEl.innerText : "0";
                    const priceVal = parseInt(priceRaw.replace(/[^0-9]/g, ''), 10);

                    // --- FILTER: Junk Removal (Cases, Cables, Accessories) ---
                    const lowerTitle = title.toLowerCase();
                    const junkKeywords = ["ケース", "カバー", "保護", "case", "cover", "cable", "ケーブル", "フィルム", "イヤーピース"];
                    if (junkKeywords.some(kw => lowerTitle.includes(kw))) {
                        // Double check: does it explicitly say "Earphone" AND "Case"?
                        // If it says "Wireless Earphones Charging Case", that's junk.
                        // If it says "Wireless Earphones with Charging Case", that's good.
                        // Simple heuristic: If "Case" is present, it's 90% risk. 
                        // But "Waterproof Case" might be a feature. 
                        // Safest: If "for AirPods" or "用" (for) is present with Case/Cover.
                        if (lowerTitle.includes("用") || lowerTitle.includes("for")) return;

                        // If title starts with "Case", it's junk.
                        if (lowerTitle.startsWith("case") || lowerTitle.startsWith("ケース")) return;
                    }

                    results.push({
                        id: `scout-${asin}`,
                        name: title,
                        brand: "Unknown",
                        price: `¥${priceRaw}`,
                        priceVal: priceVal,
                        image: imgEl.src,
                        itemUrl: linkEl ? linkEl.href : `https://www.amazon.co.jp/dp/${asin}`,
                        asin: asin,
                        rating: ratingEl ? parseFloat(ratingEl.getAttribute('aria-label').split('5つ星のうち')[1]) : 4.0,
                        reviewCount: reviewCountEl ? parseInt(reviewCountEl.getAttribute('aria-label').replace(/[^0-9]/g, '')) : 0,
                        subCategory: "wireless-earphones",
                        affiliateLinks: { amazon: `https://www.amazon.co.jp/dp/${asin}` },
                        description: "", // Will be populated by AI or spec scraping
                        specs: [{ label: "価格", value: `¥${priceRaw}` }]
                    });
                }
            });
            return results;
        });

        console.log(`   ✅ Scout found ${items.length} candidates.`);
        await browser.close();
        return items.slice(0, maxCount);

    } catch (e) {
        console.error(`   ❌ Scout Error: ${e.message}`);
        await browser.close();
        return [];
    }
}

/**
 * Scrape Amazon Product Reviews
 * 商品詳細ページ (/dp/ASIN) からレビューを取得 - scoutAmazonProductsと同じアプローチ
 * シチュエーション・キーワードを含むレビューを優先的に抽出
 */
async function scrapeProductReviews(asin, maxReviews = 10) {
    console.log(`\n📖 Scraping Reviews for ASIN: ${asin}...`);
    const situationKeywords = ['電車', '通勤', 'カフェ', 'ジム', 'ランニング', '風切り音', 'オフィス', '飛行機', '地下鉄', '会議', 'テレワーク', '在宅'];

    // Use the SAME approach as scoutAmazonProducts (which works!)
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    try {
        const page = await browser.newPage();
        // Improved UA and Headers for Bot Evasion
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Referer': 'https://www.google.com/',
            'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        });

        // KEY CHANGE: Try dedicated page first, but fail fast if blocked
        const reviewUrl = `https://www.amazon.co.jp/product-reviews/${asin}?reviewerType=all_reviews`;
        console.log(`   🔗 Fetching review page: ${reviewUrl}`);

        // Pagination Loop
        let allReviews = [];
        let currentPage = 1;
        const maxPages = Math.ceil(maxReviews / 10);

        // Relaxed timeout to 25s (was 15s) to reduce false positives on slow connections
        try {
            await page.goto(reviewUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
            // Wait for review list OR valid error message (to confirm it's not just slow)
            await page.waitForSelector('[data-hook="review"]', { timeout: 10000 });
        } catch (e) {
            console.log(`   ⚠️ Timeout or Blocked on review page (${e.message}). Switching to Product Page Fallback immediately.`);
            await page.screenshot({ path: 'review_fail.png' });
            console.log("      📸 Debug Screenshot saved to 'review_fail.png'");
        }

        while (allReviews.length < maxReviews && currentPage <= maxPages) {
            await new Promise(r => setTimeout(r, 1500)); // Be nice

            // Extract reviews from current page
            const pageReviews = await page.evaluate((keywords) => {
                const results = [];
                const reviewEls = document.querySelectorAll('[data-hook="review"]');

                reviewEls.forEach(reviewEl => {
                    const ratingEl = reviewEl.querySelector('[data-hook="review-star-rating"]');
                    const bodyEl = reviewEl.querySelector('[data-hook="review-body"]');
                    const titleEl = reviewEl.querySelector('[data-hook="review-title"]');

                    if (!bodyEl) return;

                    const ratingText = ratingEl?.innerText || ratingEl?.getAttribute('class') || '';
                    let rating = 3;
                    if (ratingText.includes('5')) rating = 5;
                    else if (ratingText.includes('4')) rating = 4;
                    else if (ratingText.includes('3')) rating = 3;
                    else if (ratingText.includes('2')) rating = 2;
                    else if (ratingText.includes('1')) rating = 1;

                    const body = bodyEl.innerText.trim();
                    const title = titleEl?.innerText.trim().replace(/^\d\.0\s+/, '') || ''; // Clean star text from title

                    results.push({ rating, title, text: body, body });
                });
                return results;
            }, situationKeywords);

            if (pageReviews.length === 0) break;

            allReviews = allReviews.concat(pageReviews);
            console.log(`      📄 Page ${currentPage}: Found ${pageReviews.length} reviews`);

            // Check if we have enough
            if (allReviews.length >= maxReviews) break;

            // Go to next page
            const nextButton = await page.$('.a-pagination .a-last a');
            if (nextButton) {
                currentPage++;
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
                    nextButton.click()
                ]);
            } else {
                break; // No more pages
            }
        }

        // Fallback: If 0 reviews found on Review Page, try Product Page
        if (allReviews.length === 0) {
            console.log("   ⚠️ No reviews on dedicated page. Falling back to Product Page...");
            try {
                await page.goto(`https://www.amazon.co.jp/dp/${asin}`, { waitUntil: 'networkidle2', timeout: 45000 });
                await new Promise(r => setTimeout(r, 2000));

                // Scroll down to trigger lazy loading of reviews
                await page.evaluate(async () => {
                    window.scrollBy(0, window.innerHeight);
                    await new Promise(r => setTimeout(r, 1000));
                    window.scrollBy(0, window.innerHeight);
                    await new Promise(r => setTimeout(r, 1000));
                    window.scrollBy(0, window.innerHeight);
                    const reviewSection = document.getElementById('reviewsMedley') || document.getElementById('cm_cr-review_list');
                    if (reviewSection) reviewSection.scrollIntoView();
                });
                await new Promise(r => setTimeout(r, 2000));

                const dpReviews = await page.evaluate((keywords) => {
                    const results = [];
                    // Selectors for DP page reviews
                    const reviewEls = document.querySelectorAll('[data-hook="review"], .review, #cm_cr-review_list .a-section');

                    reviewEls.forEach(reviewEl => {
                        const ratingEl = reviewEl.querySelector('[data-hook="review-star-rating"], .review-rating, i[class*="star"]');
                        const bodyEl = reviewEl.querySelector('[data-hook="review-body"], .review-text, .review-text-content');
                        const titleEl = reviewEl.querySelector('[data-hook="review-title"], .review-title');

                        if (bodyEl) {
                            const ratingText = ratingEl?.innerText || ratingEl?.getAttribute('class') || '';
                            let rating = 3;
                            if (ratingText.includes('5')) rating = 5;
                            else if (ratingText.includes('4')) rating = 4;
                            else if (ratingText.includes('3')) rating = 3;
                            else if (ratingText.includes('2')) rating = 2;
                            else if (ratingText.includes('1')) rating = 1;

                            results.push({
                                rating,
                                title: titleEl?.innerText.trim().replace(/^\d\.0\s+/, '') || '',
                                text: bodyEl.innerText.trim(),
                                body: bodyEl.innerText.trim()
                            });
                        }
                    });
                    return results;
                }, situationKeywords);

                allReviews = dpReviews;
                console.log(`      📄 Product Page Fallback: Found ${allReviews.length} reviews`);
            } catch (e) {
                console.log(`      ⚠️ Fallback failed: ${e.message}`);
            }
        }

        // Process results
        const reviews = { positive: [], negative: [], situational: [] };
        allReviews.forEach(r => {
            const hasSituation = situationKeywords.some(kw => r.text.includes(kw) || r.title.includes(kw));
            if (hasSituation) reviews.situational.push(r);
            if (r.rating >= 4) reviews.positive.push(r);
            else if (r.rating <= 3) reviews.negative.push(r);
        });

        // Summary stats
        const summaryEl = await page.$('#acrCustomerReviewText'); // Might be missing on review page
        const totalCount = allReviews.length;

        // Return logic
        await browser.close();

        const output = {
            situational: reviews.situational.slice(0, 10),
            positive: reviews.positive.slice(0, 10),
            negative: reviews.negative.slice(0, 10),
            summary: {
                totalFound: totalCount,
                situationalCount: reviews.situational.length,
            }
        };
        console.log(`   ✅ Reviews scraped: ${output.summary.totalFound} total (${output.summary.situationalCount} situational)`);
        return output;

    } catch (e) {
        console.error(`   ❌ Review Scrape Error: ${e.message}`);
        if (browser) await browser.close();
        return { situational: [], positive: [], negative: [], summary: { totalFound: 0, situationalCount: 0 } };
    }
}

/**
 * Category-specific keyword filters
 * Products must contain at least one of these keywords to be valid
 */
const CATEGORY_KEYWORDS = {
    'wireless-earphones': ['イヤホン', 'イヤフォン', 'earphone', 'earbuds', 'earbud', 'ワイヤレス', 'tws', 'buds'],
    'wireless-headphones': ['ヘッドホン', 'ヘッドフォン', 'headphone', 'headset', 'オーバーイヤー'],
    'bone-conduction': ['骨伝導', 'bone', 'shokz', 'オープンイヤー', 'open ear', 'openrun']
};

/**
 * Check if product title matches expected category
 */
function matchesCategory(title, category) {
    const keywords = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS['wireless-earphones'];
    const lowerTitle = title.toLowerCase();
    return keywords.some(kw => lowerTitle.includes(kw.toLowerCase()));
}

/**
 * Verify a specific product exists on Amazon
 * Used for market-discovered products to get Amazon links
 * 
 * @param {string} productName - Exact product name (e.g., "Sony WF-1000XM5")
 * @param {string} category - Expected category for validation
 * @returns {Promise<object|null>} - Product data with ASIN, link, price, image or null if not found
 */
async function verifyProductOnAmazon(productName, category = 'wireless-earphones') {
    console.log(`   🔍 Verifying on Amazon: "${productName}"`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        // Search Amazon with exact product name
        const searchUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(productName)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        await new Promise(r => setTimeout(r, 1500));

        // Find the best matching result
        const result = await page.evaluate((expectedName, catKeywords) => {
            const nodes = document.querySelectorAll('div[data-asin]');
            const expectedLower = expectedName.toLowerCase();

            for (const node of nodes) {
                const asin = node.getAttribute('data-asin');
                if (!asin || asin.length < 5) continue;

                const titleEl = node.querySelector('h2') || node.querySelector('span.a-text-normal');
                const priceEl = node.querySelector('.a-price-whole');
                const imgEl = node.querySelector('img.s-image');
                const linkEl = node.querySelector('a.a-link-normal');
                const ratingEl = node.querySelector('span[aria-label*="5つ星のうち"]');
                const reviewCountEl = node.querySelector('span[aria-label*="個の評価"]');

                if (!titleEl) continue;

                const title = titleEl.innerText.trim();
                const lowerTitle = title.toLowerCase();

                // Check if this result matches our product name
                // Either the title contains the product name, or the product name contains key parts of the title
                const nameParts = expectedLower.split(/[\s\-\/\(\)]+/).filter(w => w.length > 2);
                const matchedParts = nameParts.filter(word => lowerTitle.includes(word.toLowerCase()));
                const matchRatio = nameParts.length > 0 ? matchedParts.length / nameParts.length : 0;

                // Strong match: >60% of name parts match
                const strongMatch = matchRatio >= 0.6;
                // Weak match: exact name in title
                const weakMatch = lowerTitle.includes(expectedLower);

                if (!strongMatch && !weakMatch) continue;

                // Category validation - only for weak matches (strong matches are already validated by market research)
                if (!strongMatch) {
                    const hasCategory = catKeywords.some(kw => lowerTitle.includes(kw.toLowerCase()));
                    if (!hasCategory) continue;
                }

                // Exclude junk (cases, cables, etc.)
                const junkKeywords = ["ケース用", "カバー", "保護", "case for", "cover for", "cable", "ケーブル", "フィルム", "イヤーピース"];
                if (junkKeywords.some(kw => lowerTitle.includes(kw))) continue;

                return {
                    amazonTitle: title,
                    asin: asin,
                    price: priceEl ? `¥${priceEl.innerText}` : null,
                    image: imgEl ? imgEl.src : null,
                    link: `https://www.amazon.co.jp/dp/${asin}`,
                    rating: ratingEl ? parseFloat(ratingEl.getAttribute('aria-label').split('5つ星のうち')[1]) : null,
                    reviewCount: reviewCountEl ? parseInt(reviewCountEl.getAttribute('aria-label').replace(/[^0-9]/g, '')) : 0
                };
            }
            return null;
        }, productName, CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS['wireless-earphones']);

        await browser.close();

        if (result) {
            console.log(`      📦 Amazon result: ${result.amazonTitle.slice(0, 60)}...`);

            // AI Verification: Confirm this is the correct product
            const isMatch = await verifyProductMatchWithAI(productName, result.amazonTitle);

            if (isMatch) {
                console.log(`      ✅ AI confirmed: Correct product`);
                // Use market research name (authoritative), not Amazon title
                result.name = productName;
                return result;
            } else {
                console.log(`      ⚠️ AI rejected: Not the same product`);
                // Consider retry here too? For now just return null allows fallback below
            }
        }

        // Fallback: Try searching for model number only
        const modelNumberMatch = productName.match(/[a-zA-Z0-9-]{4,}/g);
        if (modelNumberMatch) {
            const candidates = modelNumberMatch.sort((a, b) => b.length - a.length); // Longest first
            const bestCandidate = candidates[0];

            if (bestCandidate && bestCandidate !== productName && bestCandidate.length >= 5) {
                console.log(`      ⚠️ Amazon verification retry: searching for model number "${bestCandidate}"...`);
                // Recursive call or simplified search?
                // Let's do a simplified search logic directly or just return null to let calling function handle?
                // Calling scoutAmazonProducts might be easier but we want verify logic.
                // Let's run the search loop again with new keyword.

                await page.goto('https://www.amazon.co.jp/', { waitUntil: 'domcontentloaded' });
                await page.waitForSelector('#twotabsearchtextbox', { timeout: 15000 });
                await page.type('#twotabsearchtextbox', bestCandidate);
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
                    page.click('#nav-search-submit-button')
                ]);

                // ... reuse the parsing logic? 
                // It's better to refactor, but for now copying the parsing block is safer for inline edit.
                // Actually, let's just make one attempt with bestCandidate.

                const retryNodes = await page.$$('[data-component-type="s-search-result"]');
                // (Repeat parsing logic - abbreviated for safety, just getting first match)
                for (const node of retryNodes) {
                    const asin = await node.evaluate(el => el.getAttribute('data-asin'));
                    if (!asin) continue;
                    const title = await node.evaluate(el => el.querySelector('h2')?.innerText.trim());
                    if (!title) continue;

                    // Weak match verification
                    if (title.toLowerCase().includes(bestCandidate.toLowerCase())) {
                        console.log(`      ✅ Retrieval successful with model number: ${title.slice(0, 50)}...`);
                        const img = await node.evaluate(el => el.querySelector('.s-image')?.src);
                        const price = await node.evaluate(el => el.querySelector('.a-price-whole')?.innerText);

                        return {
                            amazonTitle: title,
                            name: productName, // Keep original name
                            asin: asin,
                            price: price ? `¥${price}` : null,
                            image: img,
                            link: `https://www.amazon.co.jp/dp/${asin}`,
                            rating: null, // skip rating
                            reviewCount: 0
                        };
                    }
                }
            }
        }

        console.log(`      ❌ Not found on Amazon`);
        return null;

    } catch (e) {
        console.error(`      ❌ Amazon verification error: ${e.message}`);
        if (browser) await browser.close();
        return null;
    }
}

/**
 * Use AI to verify that Amazon search result matches the market research product
 */
async function verifyProductMatchWithAI(marketResearchName, amazonTitle) {
    const path = require('path');
    require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `
製品マッチング確認タスク:

市場調査で見つかった製品名: "${marketResearchName}"
Amazonの検索結果タイトル: "${amazonTitle}"

質問: これらは同じ製品ですか？

判断基準:
- ブランド名が一致するか
- モデル番号/型番が一致するか
- 色違いや容量違いは「同じ製品」とする
- 全く別のモデル（例: Ear(a) vs Ear(2)）は「別製品」

回答形式: "YES" または "NO" のみ
`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim().toUpperCase();
        return text.includes('YES');
    } catch (e) {
        console.log(`      ⚠️ AI verification failed: ${e.message}`);
        // If AI fails, fall back to accepting the match (conservative)
        return true;
    }
}

/**
 * Scrape product specs directly from Amazon product detail page
 * @param {string} asin - Amazon product ASIN
 * @returns {Promise<object>} - { specs: [], features: [], description: "", source: "" }
 */
async function scrapeAmazonProductSpecs(asin) {
    if (!asin) return null;

    console.log(`   📋 Scraping Amazon specs for ASIN: ${asin}`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        // Go directly to product page using ASIN
        const productUrl = `https://www.amazon.co.jp/dp/${asin}`;
        await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        // Extract specs and features
        const data = await page.evaluate(() => {
            const specs = [];
            const features = [];
            let description = '';

            // 1. Extract from product specifications table
            document.querySelectorAll('#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr, table.a-keyvalue tr').forEach(row => {
                const label = row.querySelector('th, td:first-child')?.innerText?.trim();
                const value = row.querySelector('td:last-child')?.innerText?.trim();
                if (label && value && label !== value) {
                    specs.push({ label: label.replace(/\s+/g, ' '), value: value.replace(/\s+/g, ' ') });
                }
            });

            // 2. Extract from technical details table
            document.querySelectorAll('#tech-specs-desktop tr, .a-section.a-spacing-base tbody tr').forEach(row => {
                const label = row.querySelector('td:first-child, th')?.innerText?.trim();
                const value = row.querySelector('td:last-child')?.innerText?.trim();
                if (label && value && label !== value && !specs.find(s => s.label === label)) {
                    specs.push({ label: label.replace(/\s+/g, ' '), value: value.replace(/\s+/g, ' ') });
                }
            });

            // 3. Extract feature bullets
            document.querySelectorAll('#feature-bullets li, #featurebullets_feature_div li').forEach(li => {
                const text = li.innerText?.trim();
                if (text && text.length > 5 && text.length < 500) {
                    features.push(text);
                }
            });

            // 4. Extract product description
            const descEl = document.querySelector('#productDescription p, #aplus .aplus-module');
            if (descEl) {
                description = descEl.innerText?.trim()?.slice(0, 1000) || '';
            }

            // 5. Extract Structured Identity Info (Brand, Model Name, Model Number) from specs
            const structured = {
                brand: specs.find(s => s.label.match(/Brand|ブランド|メーカー/i))?.value,
                modelName: specs.find(s => s.label.match(/Model Name|モデル名/i))?.value,
                modelNumber: specs.find(s => s.label.match(/Model Number|Item model number|型番|モデル番号|部品番号/i))?.value,
            };

            // STRICT VALIDATION: Filter out generic/invalid values
            const INVALID_VALUES = ['Audio', 'Wireless', 'Bluetooth', 'Earphones', 'Headphones', 'Electronics', 'Unknown', 'N/A', 'Generic', 'Brand', 'True Wireless'];
            const isValid = (val) => val && val.length > 2 && !INVALID_VALUES.some(inv => val.toLowerCase() === inv.toLowerCase());

            if (!isValid(structured.brand)) structured.brand = null;
            if (!isValid(structured.modelName)) structured.modelName = null;
            if (!isValid(structured.modelNumber)) structured.modelNumber = null;

            // 6. Extract Main Image (HIGH-RES STRATEGY)
            const getBestImage = () => {
                // Priority 1: Dynamic Image (High Res) via data attribute on landing image
                const landingImg = document.querySelector('#landingImage');
                if (landingImg && landingImg.getAttribute('data-a-dynamic-image')) {
                    try {
                        const data = JSON.parse(landingImg.getAttribute('data-a-dynamic-image'));
                        // keys are URLs, values are [width, height]. We want the largest.
                        // Actually, keys are URLs. We can sort by size or just take the last one (usually highest).
                        // Let's sort simply by string length of URL or assume convention. 
                        // The structure is usually {"url": [w, h], ...}
                        // Sort by width (first element of array)
                        const entries = Object.entries(data);
                        if (entries.length > 0) {
                            entries.sort((a, b) => b[1][0] - a[1][0]);
                            return entries[0][0]; // Best URL
                        }
                    } catch (e) { }
                }

                // Priority 2: Simple src from main candidates
                const imgCandidates = document.querySelectorAll('#landingImage, #imgTagWrapperId img, .a-dynamic-image, #main-image');
                for (const img of imgCandidates) {
                    const src = img.src;
                    if (src && !src.includes('Prime_Logo') && !src.includes('/marketing/') && !src.includes('nav-logo')) {
                        return src;
                    }
                }
                return null;
            };

            const image = getBestImage();
            return { specs, features, description, url: window.location.href, structured, image };
        });

        await browser.close();

        if (data.specs.length > 0 || data.features.length > 0 || data.image) {
            console.log(`      ✅ Found ${data.specs.length} specs, ${data.features.length} features from Amazon`);
            // Clean up structured data
            if (data.structured) {
                if (data.structured.brand) console.log(`      🏷️  Brand: ${data.structured.brand}`);
                if (data.structured.modelName) console.log(`      🏷️  Model: ${data.structured.modelName}`);
            }
            if (data.image) {
                console.log(`      🖼️  Image found: ${data.image.slice(0, 50)}...`);
            }
            return {
                specs: data.specs,
                features: data.features.slice(0, 10), // Limit to 10 features
                description: data.description,
                source: data.url,
                structured: data.structured, // Return structured identity info
                image: data.image // Return image
            };
        }

        console.log(`      ⚠️ No specs found on Amazon page`);
        return null;

    } catch (e) {
        console.log(`      ⚠️ Amazon spec scrape failed: ${e.message}`);
        if (browser) await browser.close();
        return null;
    }
}

module.exports = { scoutAmazonProducts, scrapeProductReviews, verifyProductOnAmazon, matchesCategory, scrapeAmazonProductSpecs };

