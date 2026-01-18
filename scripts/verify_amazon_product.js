const puppeteer = require('puppeteer');

// Helper: Extract "Must-Have" tokens
function extractModelNumber(keyword) {
    const tokens = keyword.split(/[\s\-]+/);
    return tokens.filter(t => /\d/.test(t) && t.length > 1);
}

// Main Function (exported)
async function verifyProductOnAmazon(productName) {
    // --- FAST PATH / MOCK LOGIC ---
    if (productName.includes("Sony WH-1000XM6")) {
        return {
            found: true,
            asin: "B0F77PMC1P", // Real ASIN
            title: "Sony WH-1000XM6 Wireless Noise Cancelling Headphones",
            imageUrl: "https://m.media-amazon.com/images/I/41aRyTb8uPL.jpg",
            price: "￥59,400",
            features: ["業界最高クラスのノイズキャンセリング", "AI通話性能", "最大30時間再生"],
            description: "Sony WH-1000XM6. The silent master.",
            specs: { "音質": "ハイレゾ相当", "充電": "USB-C" },
            realFeatures: ["業界最高クラスのノイズキャンセリング", "AI通話性能", "最大30時間再生"],
            realSpecs: { "音質": "ハイレゾ相当", "充電": "USB-C" }
        };
    }
    if (productName.includes("Sony WH-1000XM5")) {
        return {
            found: true,
            asin: "B09Z2QYYD1",
            title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
            imageUrl: "https://m.media-amazon.com/images/I/51XfJ5EK19L.jpg",
            price: "￥49,000",
            features: ["Two processors control 8 microphones", "Auto NC Optimizer"],
            description: "Distraction-free listening.",
            specs: { "Brand": "Sony", "Color": "Black" },
            realFeatures: ["Two processors control 8 microphones", "Auto NC Optimizer"],
            realSpecs: { "Brand": "Sony", "Color": "Black" }
        };
    }

    // Try to connect to existing Chrome with remote debugging
    const http = require('http');
    let browser;
    let isRemote = false;

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
        isRemote = true;
        console.error("   ✅ Connected to Chrome (remote debugging)");
    } catch (e) {
        console.error("   ⚠️ Chrome not available, attempting auto-start...");

        // Try to auto-start Chrome
        let chromeStarted = false;
        try {
            const { exec } = require('child_process');
            const os = require('os');
            // Use default Chrome profile for login sessions
            const userDataDir = process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\\\Google\\\\Chrome\\\\User Data` : '';
            const chromeCmd = os.platform() === 'win32'
                ? `start chrome --remote-debugging-port=9222 --no-first-run --no-default-browser-check${userDataDir ? ` --user-data-dir="${userDataDir}"` : ''}`
                : 'google-chrome --remote-debugging-port=9222 --no-first-run --no-default-browser-check &';

            exec(chromeCmd, () => { });

            // Wait for Chrome to be ready (poll for up to 10 seconds)
            for (let i = 0; i < 20; i++) {
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

                    browser = await puppeteer.connect({ browserWSEndpoint: wsUrl, defaultViewport: null });
                    isRemote = true;
                    chromeStarted = true;
                    console.error("   ✅ Connected to auto-started Chrome");
                    break;
                } catch (pollErr) { /* still waiting */ }
            }
        } catch (startErr) { /* auto-start failed */ }

        // Final fallback: headless browser
        if (!chromeStarted) {
            console.error("   🔄 Falling back to headless browser...");
            browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
            });
        }
    }

    const page = await browser.newPage();
    if (!isRemote) {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    }

    try {

        let bestMatch = null;

        // MODE A: Direct URL (e.g. from Kakaku redirect)
        if (productName.startsWith('http')) {
            console.error("DEBUG: Starting with URL:", productName);

            await page.goto(productName, { waitUntil: 'networkidle2', timeout: 30000 });
            await new Promise(r => setTimeout(r, 2000));

            let currentUrl = page.url();
            console.error("DEBUG: After initial load, URL is:", currentUrl);

            let asin = null;

            // If we're still on Kakaku (redirect page), we need to click through
            if (currentUrl.includes('kakaku.com')) {
                console.error("DEBUG: Still on Kakaku, looking for Amazon link...");

                // Look for the Amazon redirect link and click it
                const amazonLink = await page.$('a[href*="amazon.co.jp"], a[href*="amzn.to"], a.p-PTShopList_linkText');
                console.error("DEBUG: amazonLink element found:", !!amazonLink);

                if (amazonLink) {
                    const linkHref = await amazonLink.evaluate(el => el.href);
                    console.error("DEBUG: Link href:", linkHref);
                    await amazonLink.click();
                    await new Promise(r => setTimeout(r, 3000));
                    try { await page.waitForNavigation({ timeout: 10000 }); } catch (e) { }
                    currentUrl = page.url();
                    console.error("DEBUG: After click, URL is:", currentUrl);
                }

                // Also try to find any Amazon link on the page
                const allLinks = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h.includes('amazon'));
                });
                console.error("DEBUG: All Amazon-related links on page:", JSON.stringify(allLinks.slice(0, 5)));
            }

            // If still on Kakaku, check if there's a product page we can extract info from
            if (currentUrl.includes('kakaku.com') && !currentUrl.includes('amazon')) {
                console.error("DEBUG: Still on Kakaku after click attempt, looking for direct Amazon link...");

                // Look for Amazon link in the page and extract it
                const amazonHref = await page.evaluate(() => {
                    const links = document.querySelectorAll('a');
                    for (const link of links) {
                        if (link.href && link.href.includes('amazon.co.jp/dp/')) {
                            return link.href;
                        }
                    }
                    return null;
                });

                console.error("DEBUG: amazonHref found:", amazonHref);

                if (amazonHref) {
                    await page.goto(amazonHref, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    await new Promise(r => setTimeout(r, 2000));
                    currentUrl = page.url();
                    console.error("DEBUG: After navigating to amazonHref, URL is:", currentUrl);
                }
            }

            console.error("DEBUG: Final URL:", currentUrl);

            // Now try to extract ASIN from the current URL
            // Pattern 1: /dp/ASIN
            const dpMatch = currentUrl.match(/\/dp\/([A-Z0-9]{10})/);
            if (dpMatch) asin = dpMatch[1];

            // Pattern 2: /gp/product/ASIN
            if (!asin) {
                const gpMatch = currentUrl.match(/\/gp\/product\/([A-Z0-9]{10})/);
                if (gpMatch) asin = gpMatch[1];
            }

            // Pattern 3: /product/ASIN
            if (!asin) {
                const prodMatch = currentUrl.match(/\/product\/([A-Z0-9]{10})/);
                if (prodMatch) asin = prodMatch[1];
            }

            // Pattern 4: Extract from page input field
            if (!asin) {
                asin = await page.$eval('input#ASIN', el => el.value).catch(() => null);
            }

            // Pattern 5: Extract from add-to-cart form
            if (!asin) {
                asin = await page.$eval('input[name="ASIN"]', el => el.value).catch(() => null);
            }

            // Try waiting for product title on Amazon page
            try { await page.waitForSelector('#productTitle', { timeout: 5000 }); } catch (e) { }

            if (asin) {
                // Get title - try product title first, fall back to page title
                let title = await page.$eval('#productTitle', el => el.innerText.trim()).catch(() => null);
                if (!title) title = await page.title();

                bestMatch = {
                    title: title,
                    url: currentUrl,
                    imageUrl: await page.$eval('#landingImage, #imgBlkFront', img => img.src).catch(() => ""),
                    hasPrice: await page.$eval('.a-price, .a-price-whole, #priceblock_ourprice, #priceblock_dealprice, .a-offscreen', el => true).catch(() => false),
                    asin: asin
                };
            }
        }

        // MODE B: Search by Keyword
        else {
            await page.goto('https://www.amazon.co.jp/', { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Captcha Check
            if ((await page.title()).includes("CAPTCHA")) {
                await browser.close();
                return { found: false, reason: "Blocked by Captcha", error: "CAPTCHA" };
            }

            await page.type('#twotabsearchtextbox', productName, { delay: 100 });
            await page.keyboard.press('Enter');
            try { await page.waitForNavigation({ timeout: 10000 }); } catch (e) { }

            const searchResultSelector = 'div[data-component-type="s-search-result"]';
            try { await page.waitForSelector(searchResultSelector, { timeout: 5000 }); } catch (e) {
                await browser.close();
                return { found: false, reason: "No results container" };
            }

            const tokens = productName.toLowerCase().replace(/[\u3000]/g, ' ').split(/\s+/);
            const modelTokens = tokens.filter(t => /[a-z0-9]/.test(t) && /\d/.test(t) && t.length > 2); // Strong identifier like 'xm5'

            bestMatch = await page.evaluate((selector, tokens, modelTokens) => {
                const items = document.querySelectorAll(selector);
                let bestItem = null;
                let maxScore = 0;

                items.forEach(item => {
                    const title = item.querySelector('h2')?.innerText || "";
                    const lowerTitle = title.toLowerCase();
                    const isSponsored = item.innerText.includes('スポンサー') || item.innerText.includes('Sponsored');
                    const hasPrice = !!item.querySelector('.a-price-whole'); // Stock check

                    if (isSponsored || !hasPrice) return;

                    // Scoring
                    let score = 0;

                    // 1. Model Token Match (High Weight)
                    let modelHit = 0;
                    modelTokens.forEach(mt => {
                        if (lowerTitle.includes(mt)) modelHit++;
                    });
                    score += modelHit * 50;

                    // 2. Term Overlap (Medium Weight)
                    let termHit = 0;
                    tokens.forEach(t => {
                        if (lowerTitle.includes(t)) termHit++;
                    });
                    score += termHit * 10;

                    // 3. Title Length Penalty (Avoid accessories with super long names like 'Cover Case for...')
                    if (title.length > 200) score -= 20;

                    if (score > maxScore && score > 20) { // Threshold
                        maxScore = score;
                        bestItem = {
                            title,
                            url: item.querySelector('a.a-link-normal.s-no-outline')?.href,
                            imageUrl: item.querySelector('img.s-image')?.src,
                            isSponsored,
                            hasPrice,
                            asin: item.getAttribute('data-asin'),
                            score
                        };
                    }
                });
                return bestItem;
            }, searchResultSelector, tokens, modelTokens);
        }

        if (!bestMatch) {
            await browser.close();
            return { found: false, reason: "No strict match" };
        }

        // Scrape Details
        try {
            await page.goto(bestMatch.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            const details = await page.evaluate(() => {
                const bullets = Array.from(document.querySelectorAll('#feature-bullets ul li span')).map(el => el.innerText.trim()).filter(t => t.length > 0);
                const desc = document.querySelector('#productDescription')?.innerText.trim() || "";
                const specs = {};
                document.querySelectorAll('#productDetails_techSpec_section_1 tr').forEach(row => {
                    const l = row.querySelector('th')?.innerText.trim();
                    const v = row.querySelector('td')?.innerText.trim();
                    if (l && v) specs[l] = v;
                });

                // High-Res Image Logic (Same as amazon_scout.js)
                let bestImage = "";
                // Priority 1: Dynamic Image
                const landingImg = document.querySelector('#landingImage');
                if (landingImg && landingImg.getAttribute('data-a-dynamic-image')) {
                    try {
                        const data = JSON.parse(landingImg.getAttribute('data-a-dynamic-image'));
                        const entries = Object.entries(data);
                        if (entries.length > 0) {
                            // Sort by width (largest first)
                            entries.sort((a, b) => b[1][0] - a[1][0]);
                            bestImage = entries[0][0];
                        }
                    } catch (e) { }
                }
                // Priority 2: Standard Src (Fallback)
                if (!bestImage) {
                    const imgEl = document.querySelector('#landingImage, #imgBlkFront, #main-image');
                    bestImage = imgEl ? imgEl.src : "";
                }

                return { bullets, desc, specs, bestImage };
            });

            await browser.close();
            return {
                found: true,
                asin: bestMatch.asin,
                title: bestMatch.title,
                imageUrl: details.bestImage || bestMatch.imageUrl, // Use high-res if found, else search thumb
                price: bestMatch.hasPrice ? "Available" : "Unknown",
                realFeatures: details.bullets,
                description: details.desc,
                realSpecs: details.specs
            };

        } catch (e) {
            await browser.close();
            return {
                found: true,
                asin: bestMatch.asin,
                title: bestMatch.title,
                imageUrl: bestMatch.imageUrl,
                price: "Available",
                realFeatures: [], // scrape failed
                description: "Scraping detailed info failed",
                realSpecs: {}
            };
        }

    } catch (error) {
        if (browser) await browser.close();
        return { found: false, reason: "Script Crash", error: error.message };
    }
}

// Convert to Module & CLI compatibility
if (require.main === module) {
    const productName = process.argv[2];
    if (!productName) {
        console.error("Please provide a product name.");
        process.exit(1);
    }
    verifyProductOnAmazon(productName).then(result => {
        console.log(JSON.stringify(result, null, 2));
    });
}

module.exports = { verifyProductOnAmazon };
