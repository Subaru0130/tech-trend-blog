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

            await browser.disconnect();
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
                    const lowerKeyword = keyword.toLowerCase();
                    const junkKeywords = ["ケース", "カバー", "保護", "case", "cover", "cable", "ケーブル", "フィルム", "イヤーピース", "skin", "sticker", "ear hooks", "replacement"];

                    if (junkKeywords.some(kw => lowerTitle.includes(kw))) {
                        // Double check: does it explicitly say "Earphone" AND "Case"?
                        // If it says "Wireless Earphones Charging Case", that's junk.
                        // If it says "Wireless Earphones with Charging Case", that's good.
                        // Simple heuristic: If "Case" is present, it's 90% risk. 
                        // But "Waterproof Case" might be a feature. 
                        // Safest: If "for AirPods" or "用" (for) is present with Case/Cover.
                        if (lowerTitle.includes("用") || lowerTitle.includes("for") || lowerTitle.includes("compatible with")) return;

                        // If title starts with "Case", it's junk.
                        if (lowerTitle.startsWith("case") || lowerTitle.startsWith("ケース")) return;

                        // If title contains "sticker" or "skin", it's junk
                        if (lowerTitle.includes("sticker") || lowerTitle.includes("skin")) return;
                    }

                    // --- STRICT MATCH VALIDATION ---
                    // If we are searching for a specific model (e.g. "WF-C510"), the result MUST contain that model string.
                    const modelMatch = keyword.match(/[A-Za-z0-9-]{4,}/); // Find model-like string (e.g. WF-C510)
                    if (modelMatch) {
                        const modelId = modelMatch[0].toLowerCase();
                        if (!lowerTitle.includes(modelId)) {
                            // console.log(`   ⚠️ Skipping "${title}" - Does not contain model ID "${modelId}"`);
                            return;
                        }
                    } else {
                        // General strictness: The result must contain at least one part of the keyword
                        const keywordParts = lowerKeyword.split(' ').filter(p => p.length > 2);
                        if (keywordParts.length > 0 && !keywordParts.some(p => lowerTitle.includes(p))) {
                            return;
                        }
                    }

                    results.push({
                        id: `scout-${asin}`,
                        name: title,
                        brand: "Unknown",
                        price: `¥${priceRaw}`,
                        priceVal: priceVal,
                        image: imgEl.src.replace(/\._AC_.*(\.[^\.]+)$/, '$1').replace(/\._SX.*(\.[^\.]+)$/, '$1').replace(/\._SY.*(\.[^\.]+)$/, '$1'),
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
        await browser.disconnect();
        return items.slice(0, maxCount);

    } catch (e) {
        console.error(`   ❌ Scout Error: ${e.message}`);
        await browser.disconnect();
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

    // HELPER: Scrape logic to be reused for initial attempt and retry
    const doScrape = async (isRetry = false) => {
        console.log(isRetry ? `   🔄 Retry Attempt: Connecting to existing Chrome...` : `   🚀 Initial Attempt: Connecting to existing Chrome...`);

        // Connect to existing Chrome instance via Remote Debugging
        // Chrome must be started with: chrome.exe --remote-debugging-port=9222
        let browser;
        try {
            // First, get the WebSocket URL from Chrome's debugging endpoint
            const http = require('http');
            const wsUrl = await new Promise((resolve, reject) => {
                http.get('http://127.0.0.1:9222/json/version', (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try {
                            const json = JSON.parse(data);
                            resolve(json.webSocketDebuggerUrl);
                        } catch (e) { reject(e); }
                    });
                }).on('error', reject);
            });

            console.log(`   🔌 WebSocket URL: ${wsUrl}`);
            browser = await puppeteer.connect({
                browserWSEndpoint: wsUrl,
                defaultViewport: null
            });
            console.log("   ✅ Connected to existing Chrome instance!");
        } catch (e) {
            console.log(`   ⚠️ Failed to connect to Chrome: ${e.message}`);
            console.log("   🚀 Attempting to auto-start Chrome with remote debugging...");

            // Try to auto-start Chrome with remote debugging port
            let chromeStarted = false;
            try {
                const { spawn, execSync } = require('child_process');
                const os = require('os');
                const path = require('path');
                const fs = require('fs');

                const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

                // Check if Chrome is running
                let isChromeRunning = false;
                try {
                    const stdout = execSync('tasklist /FI "IMAGENAME eq chrome.exe" /NH').toString();
                    if (stdout.includes('chrome.exe')) isChromeRunning = true;
                } catch (e) { /* ignore */ }

                if (isChromeRunning) {
                    console.log('      ⚠️ Standard Chrome is running but not debuggable. Restarting in Debug Mode...');
                    console.log('      🔪 Closing existing Chrome processes (with retries)...');
                    // Try multiple times with /T flag (kills child processes too)
                    for (let retry = 0; retry < 3; retry++) {
                        try {
                            execSync('taskkill /F /T /IM chrome.exe', { stdio: 'ignore' });
                        } catch (e) { /* ignore */ }
                        await new Promise(r => setTimeout(r, 1500));
                    }
                    console.log('      ✅ Chrome processes terminated.');
                }

                // Launch with Default Profile via PowerShell (Robust method)
                const userDataPath = process.env.LOCALAPPDATA + "\\Google\\Chrome\\User Data";
                // Launch with Default Profile via Batch File (Robust method)
                console.log("   🚀 Launching Chrome via scripts\\start_chrome_quiet.bat...");
                const batPath = path.join(__dirname, '..', 'start_chrome_quiet.bat'); // Note: ../ relative path
                try {
                    execSync(`"${batPath}"`, { stdio: 'inherit' });
                } catch (e) {
                    console.log(`   ⚠️ Startup script warning: ${e.message}`);
                }


                // No process ref needed for execSync
                // chromeStarted = true; // REMOVED: Only set true AFTER connection succeeds

                // Wait for Chrome to be ready (poll for up to 60 seconds)
                console.log("   ⏳ Waiting for Chrome to start (timeout: 60s)...");
                for (let i = 0; i < 120; i++) {
                    await new Promise(r => setTimeout(r, 500));
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
                            req.setTimeout(1000, () => { req.destroy(); reject(new Error('timeout')); });
                        });

                        console.log(`   🔌 Chrome started! WebSocket URL: ${wsUrl}`);
                        browser = await puppeteer.connect({
                            browserWSEndpoint: wsUrl,
                            defaultViewport: null
                        });
                        console.log("   ✅ Connected to auto-started Chrome!");
                        chromeStarted = true;
                        break;
                    } catch (pollErr) {
                        // Still waiting...
                    }
                }
            } catch (startErr) {
                console.log(`   ⚠️ Chrome auto-start failed: ${startErr.message}`);
            }

            // Final fallback: headless browser -> REMOVED to avoid Login Wall
            if (!chromeStarted) {
                console.log("   ❌ Failed to connect to Remote Chrome. Aborting review scrape to avoid Login Wall.");
                console.log("   ⚠️ Please ensure Chrome is running with: --remote-debugging-port=9222");
                throw new Error("Remote debugging connection failed");
                /* 
                console.log("   🔄 Falling back to internal headless browser...");
                try {
                    browser = await puppeteer.launch({
                        headless: "new",
                        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
                    });
                } catch (launchError) {
                    console.error("   ❌ Failed to launch fallback browser:", launchError.message);
                    throw new Error("Browser unavailable");
                }
                */
            }
        }

        // Create a new page
        const page = await browser.newPage();
        let shouldClosePage = true;

        try {
            // ... (rest of logic)
            // No need to set User-Agent or headers - we use the browser's existing session!

            // WARMUP: Essential for bypassing auth wall
            // Longer wait on retry
            const warmupWait = isRetry ? 5000 : 2000;
            console.log(`   🏠 Warmup: Visiting Amazon Home Page (wait ${warmupWait}ms)...`);
            try {
                // FORCE DESKTOP UA: Even with remote debugging, explicit UA helps avoid mobile layout or bot flags
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

                await page.goto('https://www.amazon.co.jp/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => { });
                await new Promise(r => setTimeout(r, warmupWait + Math.random() * 1000));

                // SCROLL TRIGGER: Some pages lazy load content
                try {
                    await page.evaluate(() => window.scrollBy(0, 500));
                    await new Promise(r => setTimeout(r, 1000));
                } catch (e) { }


                // On retry, scroll a bit to look human
                if (isRetry) {
                    await page.evaluate(() => window.scrollBy(0, 300));
                    await new Promise(r => setTimeout(r, 1000));
                }
            } catch (e) {
                console.log(`      ⚠️ Warmup issue: ${e.message}`);
            }

            const reviewUrl = `https://www.amazon.co.jp/product-reviews/${asin}?reviewerType=all_reviews`;

            // STRATEGY: Direct for initial, Indirect (via Product Page) for retry
            let allReviews = [];
            let currentPage = 1;
            const maxPages = Math.ceil(maxReviews / 10);
            let blocked = false;
            let navSuccess = false;

            if (!isRetry) {
                // Initial: Try fast direct link
                console.log(`   🔗 Fetching review page (Direct): ${reviewUrl}`);
                try {
                    await page.goto(reviewUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log(`      ⚠️ Nav timeout ignored`));
                    const currentUrl = page.url();
                    const pageTitle = await page.title();
                    if (currentUrl.includes('signin') || pageTitle.includes('Sign-In') || pageTitle.includes('ログイン')) {
                        console.log("   🚨 Redirected to Sign-In page! Blocking detected.");
                        blocked = true;
                    } else {
                        // We're not blocked, so assume success even if reviews don't appear immediately
                        navSuccess = true;
                        try { await page.waitForSelector('[data-hook="review"]', { timeout: 8000 }); } catch (e) {
                            console.log("      ⚠️ Review selector not found immediately, continuing anyway...");
                        }
                    }
                } catch (e) {
                    console.log(`      ⚠️ Nav error: ${e.message}`);
                }
            } else {
                // Retry: Go via Product Page (Natural flow)
                console.log(`   🔗 Fetching review page (Via Product Page): https://www.amazon.co.jp/dp/${asin}`);
                try {
                    await page.goto(`https://www.amazon.co.jp/dp/${asin}`, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => { });
                    await new Promise(r => setTimeout(r, 2000));

                    // Click "See all reviews"
                    const seeAll = await page.$('a[data-hook="see-all-reviews-link-foot"], a[href*="product-reviews"]');
                    if (seeAll) {
                        console.log("   🔗 Following 'See All Reviews' link...");
                        await Promise.all([
                            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
                            seeAll.click()
                        ]).catch(() => console.log("   ⚠️ Click nav timeout"));

                        // Check for block again
                        const currentUrl = page.url();
                        if (currentUrl.includes('signin')) {
                            console.log("   🚨 Redirected to Sign-In after click!");
                            blocked = true;
                        } else {
                            navSuccess = true;
                            try { await page.waitForSelector('[data-hook="review"]', { timeout: 8000 }); } catch (e) { }
                        }
                    } else {
                        console.log("   ⚠️ 'See all reviews' link not found on Product Page.");
                        // Treat as not blocked, but standard fallback will handle scraping from main page
                    }
                } catch (e) { console.log(`      ⚠️ Indirect nav failed: ${e.message}`); }
            }

            // PAGINATION LOOP (Only if we successfully reached a review list)
            if (navSuccess && !blocked) {
                while (allReviews.length < maxReviews && currentPage <= maxPages) {
                    await new Promise(r => setTimeout(r, 1500));
                    const pageReviews = await page.evaluate((keywords) => {
                        const results = [];
                        // Robust Selector Strategy: Try data-hook first, then classes/IDs
                        let reviewEls = document.querySelectorAll('[data-hook="review"]');
                        if (reviewEls.length === 0) reviewEls = document.querySelectorAll('.review');
                        if (reviewEls.length === 0) reviewEls = document.querySelectorAll('div[id^="customer_review-"]');

                        reviewEls.forEach(reviewEl => {
                            // Robust Child Selectors
                            const ratingEl = reviewEl.querySelector('[data-hook="review-star-rating"]') ||
                                reviewEl.querySelector('.a-icon-star') ||
                                reviewEl.querySelector('.a-icon-alt'); // Often hidden text

                            const bodyEl = reviewEl.querySelector('[data-hook="review-body"]') ||
                                reviewEl.querySelector('.review-text-content') ||
                                reviewEl.querySelector('.review-text');

                            const titleEl = reviewEl.querySelector('[data-hook="review-title"]') ||
                                reviewEl.querySelector('.review-title-content') ||
                                reviewEl.querySelector('.review-title');

                            if (!bodyEl) return;

                            // Extract Rating
                            let rating = 3; // Default
                            const ratingText = (ratingEl?.innerText || ratingEl?.getAttribute('class') || '').toLowerCase();
                            if (ratingText.includes('5') || ratingText.includes('five')) rating = 5;
                            else if (ratingText.includes('4') || ratingText.includes('four')) rating = 4;
                            else if (ratingText.includes('3') || ratingText.includes('three')) rating = 3;
                            else if (ratingText.includes('2') || ratingText.includes('two')) rating = 2;
                            else if (ratingText.includes('1') || ratingText.includes('one')) rating = 1;

                            // Extract Text
                            const title = titleEl?.innerText.trim().replace(/^\d\.0\s+/, '') || '';
                            const text = bodyEl.innerText.trim();

                            results.push({ rating, title, text, body: text });
                        });
                        return results;
                    }, situationKeywords);

                    if (pageReviews.length === 0) break;
                    allReviews = allReviews.concat(pageReviews);
                    console.log(`      📄 Page ${currentPage}: Found ${pageReviews.length} reviews`);
                    if (allReviews.length >= maxReviews) break;

                    // Add timeout to prevent hanging on next button search
                    let nextButton = null;
                    try {
                        nextButton = await Promise.race([
                            page.$('.a-pagination .a-last a'),
                            new Promise((resolve) => setTimeout(() => resolve(null), 5000))
                        ]);
                    } catch (e) { console.log("      ⚠️ Next button search error"); }
                    console.log(`      🔍 Next button found: ${!!nextButton}`);
                    if (nextButton) {
                        currentPage++;
                        console.log(`      📄 Navigating to Page ${currentPage}...`);
                        try {
                            await Promise.race([
                                Promise.all([
                                    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
                                    nextButton.click()
                                ]),
                                new Promise((_, reject) => setTimeout(() => reject(new Error('pagination timeout')), 15000))
                            ]);
                            console.log(`      ✅ Page ${currentPage} loaded`);
                        } catch (e) {
                            console.log(`      ⚠️ Pagination nav issue: ${e.message}. Stopping pagination.`);
                            break;
                        }
                    } else {
                        console.log("      📄 No more pages available");
                        break;
                    }
                }
            }

            // FALLBACK TO PRODUCT PAGE
            if (allReviews.length === 0 && !blocked) {
                console.log("   ⚠️ No reviews on dedicated page. Falling back to Product Page...");
                await page.goto(`https://www.amazon.co.jp/dp/${asin}`, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => { });
                await new Promise(r => setTimeout(r, 2000));

                // Try "See all reviews" link first
                const seeAll = await page.$('a[data-hook="see-all-reviews-link-foot"]');
                if (seeAll) {
                    console.log("   🔗 Following 'See All Reviews'...");
                    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), seeAll.click()]).catch(() => { });
                    // Reuse pagination loop code? For simplicity, we'll just scrape current page here
                    // Ideally we refactor, but for now let's just scrape what's visible
                }

                // Scrape current page (either review list or product page body)
                const fallbackReviews = await page.evaluate(() => {
                    const results = [];
                    const reviewEls = document.querySelectorAll('[data-hook="review"], .review, #cm_cr-review_list .a-section');
                    reviewEls.forEach(reviewEl => {
                        const bodyEl = reviewEl.querySelector('[data-hook="review-body"], .review-text-content');
                        if (bodyEl) results.push({
                            rating: 3, // simplified
                            title: '',
                            text: bodyEl.innerText.trim(),
                            body: bodyEl.innerText.trim()
                        });
                    });
                    return results;
                });
                allReviews = fallbackReviews;
                console.log(`      📄 Fallback found ${allReviews.length} reviews`);
            }

            // Close the page
            await page.close();

            // If we launched a fallback browser (browser.isConnected() returns true mostly, but we can check if it was remote)
            // Simpler check: If we launched it via puppeteer.launch, we own it. 
            // However, distinguishing 'connected' vs 'launched' variable is tricky inside doScrape without extra var.
            // But we know 'browser' variable. 
            // If it's a remote connection, closing browser disconnects but doesn't kill process?
            // Actually, puppeteer.connect().close() just disconnects. puppeteer.launch().close() kills it.
            // We want to kill it if we launched it. We want to disconnect if we connected.
            // For now, let's always close() - for remote it disconnects (fine), for launch it closes (good).
            // WAIT - if we disconnect remote, we might lose the instance for next calls? 
            // No, scrapeProductReviews calls doScrape which creates a fresh connection each time.
            // So closing is safe and correct for both.
            // For remote debugging, we MUST use disconnect() to keep Chrome alive for next task
            // If we closed it, the next product would fail to connect (ECONNREFUSED)
            await browser.disconnect();

            // Return results AND block status
            return { reviews: allReviews, blocked };

        } catch (e) {
            if (page) await page.close().catch(() => { }); // Close page on error
            return { reviews: [], blocked: false, error: e };
        }
    };

    // EXECUTION FLOW
    let result = await doScrape(false); // Initial

    // RETRY LOGIC
    if (result.blocked || result.reviews.length === 0) {
        console.log(`   ⚠️ Initial scrape failed (Blocked: ${result.blocked}, Count: ${result.reviews.length}). Initiating RETRY with enhanced warmup...`);
        result = await doScrape(true); // Retry
    }

    // PROCESS RESULTS
    const allReviews = result.reviews || [];
    const reviews = { positive: [], negative: [] };

    allReviews.forEach(r => {
        if (r.rating >= 4) reviews.positive.push(r);
        else if (r.rating <= 3) reviews.negative.push(r);
    });

    const output = {
        positive: reviews.positive.slice(0, 10),
        negative: reviews.negative.slice(0, 10),
        situational: [], // Legacy: kept for compatibility but no longer populated
        summary: {
            totalFound: allReviews.length,
        }
    };
    console.log(`   ✅ Reviews scraped: ${output.summary.totalFound} total`);
    return output;
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
        console.log(`      ✅ Connected to Chrome (remote debugging)`);
    } catch (e) {
        // Fallback to headless launch
        console.log(`      ⚠️ Remote debugging unavailable, using headless mode`);
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

        // Warmup (short)
        try {
            await page.goto('https://www.amazon.co.jp/', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => { });
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) { }

        // Search Amazon with exact product name
        const searchUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(productName)}`;
        // RELAXED WAIT: Don't fail on timeout if content is loaded
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log(`      ⚠️ Nav timeout ignored (search)`));

        // Ensure results are present before evaluating
        try {
            await page.waitForSelector('div[data-asin]', { timeout: 10000 });
        } catch (e) {
            console.log(`      ⚠️ Results selector timeout (continuing anyway)`);
        }
        await new Promise(r => setTimeout(r, 1000));

        // Find the best matching result
        let result = await page.evaluate((expectedName, catKeywords) => {
            const nodes = document.querySelectorAll('div[data-asin]');
            const expectedLower = expectedName.toLowerCase();

            for (const node of nodes) {
                const asin = node.getAttribute('data-asin');
                if (!asin || asin.length < 5) continue;

                const titleEl = node.querySelector('h2') || node.querySelector('span.a-text-normal');
                const priceEl = node.querySelector('.a-price-whole');
                const imgEl = node.querySelector('img.s-image');
                const ratingEl = node.querySelector('span[aria-label*="5つ星のうち"]');
                const reviewCountEl = node.querySelector('span[aria-label*="個の評価"]');

                if (!titleEl) continue;

                const title = titleEl.innerText.trim();
                const lowerTitle = title.toLowerCase();

                // Check if this result matches our product name
                const nameParts = expectedLower.split(/[\s\-\/\(\)]+/).filter(w => w.length > 2);
                const matchedParts = nameParts.filter(word => lowerTitle.includes(word.toLowerCase()));
                const matchRatio = nameParts.length > 0 ? matchedParts.length / nameParts.length : 0;

                // Strong match: >60% of name parts match
                const strongMatch = matchRatio >= 0.6;
                // Weak match: exact name in title
                const weakMatch = lowerTitle.includes(expectedLower);

                if (!strongMatch && !weakMatch) continue;

                // Category validation
                if (!strongMatch) {
                    const hasCategory = catKeywords.some(kw => lowerTitle.includes(kw.toLowerCase()));
                    if (!hasCategory) continue;
                }

                // Exclude junk
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

        if (result) {
            console.log(`      📦 Amazon result: ${result.amazonTitle.slice(0, 60)}...`);

            // AI Verification
            const isMatch = await verifyProductMatchWithAI(productName, result.amazonTitle);

            if (isMatch) {
                console.log(`      ✅ AI confirmed: Correct product`);
                result.name = productName;
                return result; // Return immediately
            } else {
                console.log(`      ⚠️ AI rejected: Not the same product`);
                result = null; // Clear result to trigger fallback
            }
        }

        // Fallback: Try searching for model number only
        const modelNumberMatch = productName.match(/[a-zA-Z0-9-]{4,}/g);
        if (modelNumberMatch && !result) {
            const candidates = modelNumberMatch.sort((a, b) => b.length - a.length);
            const bestCandidate = candidates[0];

            if (bestCandidate && bestCandidate !== productName && bestCandidate.length >= 5) {
                console.log(`      ⚠️ Amazon verification retry: searching for model number "${bestCandidate}"...`);

                // REUSE SAME BROWSER PAGE
                // RELAXED WAIT for Home Page + Search
                await page.goto('https://www.amazon.co.jp/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => { });
                await new Promise(r => setTimeout(r, 1000));

                await page.waitForSelector('#twotabsearchtextbox', { timeout: 15000 });
                await page.type('#twotabsearchtextbox', bestCandidate);

                try {
                    await Promise.all([
                        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }),
                        page.click('#nav-search-submit-button')
                    ]);
                } catch (e) {
                    console.log(`      ⚠️ Retry search nav timeout ignored`);
                }
                await new Promise(r => setTimeout(r, 2000));

                const retryNodes = await page.$$('[data-component-type="s-search-result"]');
                for (const node of retryNodes) {
                    const asin = await node.evaluate(el => el.getAttribute('data-asin'));
                    if (!asin) continue;
                    const title = await node.evaluate(el => el.querySelector('h2')?.innerText.trim());
                    if (!title) continue;

                    if (title.toLowerCase().includes(bestCandidate.toLowerCase())) {
                        console.log(`      ✅ Retrieval successful with model number: ${title.slice(0, 50)}...`);
                        const img = await node.evaluate(el => el.querySelector('.s-image')?.src);
                        const price = await node.evaluate(el => el.querySelector('.a-price-whole')?.innerText);

                        return {
                            amazonTitle: title,
                            name: productName,
                            asin: asin,
                            price: price ? `¥${price}` : null,
                            image: img,
                            link: `https://www.amazon.co.jp/dp/${asin}`,
                            rating: null,
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
        return null;
    } finally {
        // For remote debugging, only close the page (not the browser)
        // For local launch, close the browser entirely
        if (browser) {
            if (isRemote) {
                // Close pages we opened, but don't disconnect
                const pages = await browser.pages();
                for (const p of pages) {
                    if (p.url().includes('amazon')) await p.close().catch(() => { });
                }
            } else {
                await browser.disconnect();
            }
        }
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

        await browser.disconnect();

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
        if (browser) await browser.disconnect();
        return null;
    }
}

module.exports = { scoutAmazonProducts, scrapeProductReviews, verifyProductOnAmazon, matchesCategory, scrapeAmazonProductSpecs };

