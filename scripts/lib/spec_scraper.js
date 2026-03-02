/**
 * 📋 Spec Scraper Module
 * 
 * 公式サイトや価格.comから正確なスペック情報を取得
 * AI学習データに頼らず、常に最新・正確な仕様を反映
 */

// Load environment variables with proper path resolution
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Scrape product specs from official sources
 * Priority: 1) Amazon (most reliable - direct from ASIN)
 *          2) 価格.com  
 *          3) Official manufacturer sites
 *          4) General web search (last resort)
 * @param {string} productName - Product name (e.g., "Sony WF-1000XM5")
 * @param {string} asin - Optional Amazon ASIN for direct spec lookup
 * @returns {Promise<object>} - { specs: [], features: [], price: "¥XX,XXX", source: "URL" }
 */
async function scrapeProductSpecs(productName, asin = null) {
    console.log(`   📋 Fetching specs for: ${productName}${asin ? ` (ASIN: ${asin})` : ''}`);

    // Strategy 0: Amazon direct (most reliable if we have ASIN)
    if (asin) {
        const { scrapeAmazonProductSpecs } = require('./amazon_scout');
        let specs = await scrapeAmazonProductSpecs(asin);
        if (specs && (specs.specs.length > 0 || specs.features.length > 0)) {
            console.log(`      ✅ Got real specs from Amazon!`);
            return specs;
        }
    }

    // Strategy 1: Try 価格.com (reliable for structured specs)
    let specs = await scrapeKakakuSpec(productName);
    if (specs && specs.specs.length > 0) {
        return specs;
    }

    // Strategy 2: Try official manufacturer sites
    specs = await scrapeOfficialSite(productName);
    if (specs && specs.specs.length > 0) {
        return specs;
    }

    // Strategy 3: Fallback to general web search (uses AI extraction)
    console.log(`      ⚠️ No structured specs found, using web search fallback`);
    specs = await scrapeFromWebSearch(productName);
    return specs || { specs: [], features: [], price: null, source: null };
}

/**
 * Scrape from 価格.com
 */
async function scrapeKakakuSpec(productName) {
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
    } catch (e) {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });
    }

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        // Search on kakaku.com
        const searchUrl = `https://kakaku.com/search_results/${encodeURIComponent(productName)}/`;
        // Relaxed wait
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => { });
        await new Promise(r => setTimeout(r, 2000));

        // Get first result link
        const productLink = await page.evaluate(() => {
            const link = document.querySelector('.itemSearchResult a.itemName');
            return link ? link.href : null;
        });

        if (!productLink) {
            await browser.close();
            return null;
        }

        // Go to product page
        await page.goto(productLink, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => { });
        await new Promise(r => setTimeout(r, 2000));

        // Try to go to spec page
        const specLink = await page.evaluate(() => {
            const link = document.querySelector('a[href*="spec"]');
            return link ? link.href : null;
        });

        if (specLink) {
            await page.goto(specLink, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => { });
            await new Promise(r => setTimeout(r, 1500));
        }

        // Extract specs from spec table
        const data = await page.evaluate(() => {
            const specs = [];
            const price = document.querySelector('.priceBox .price')?.innerText || null;

            // Look for spec tables
            document.querySelectorAll('table.specTable tr, table.tblSpec tr').forEach(row => {
                const label = row.querySelector('th')?.innerText?.trim();
                const value = row.querySelector('td')?.innerText?.trim();

                // Filter out irrelevant marketing rows
                const blackList = ['特集', 'ピックアップ', '関連', '記事', 'キャンペーン', '詳細', '更新'];
                if (label && value && !blackList.some(b => label.includes(b))) {
                    specs.push({ label, value });
                }
            });

            return { specs, price, url: window.location.href };
        });

        await browser.close();

        if (data.specs.length > 0) {
            console.log(`      ✅ Found ${data.specs.length} specs from 価格.com`);
            return { specs: data.specs, features: [], price: data.price, source: data.url };
        }
        return null;

    } catch (e) {
        if (browser) {
            if (isRemote) {
                const pages = await browser.pages();
                for (const p of pages) {
                    if (p.url().includes('kakaku')) await p.close().catch(() => { });
                }
            } else {
                await browser.close();
            }
        }
        console.log(`      ⚠️ 価格.com scrape failed: ${e.message}`);
        return null;
    }
}

/**
 * Try to find and scrape official manufacturer page
 * Dynamic approach: Extract brand from product name and search for official site
 */
async function scrapeOfficialSite(productName) {
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
    } catch (e) {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });
    }

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        // DYNAMIC BRAND EXTRACTION: Get brand from product name
        // Known brands for faster matching
        const KNOWN_BRANDS = [
            'Sony', 'Anker', 'Soundcore', 'Sennheiser', 'Bose', 'Apple', 'JBL', 'Beats',
            'HUAWEI', 'Samsung', 'Audio-Technica', 'Technics', 'Jabra', 'Nothing', 'AVIOT',
            'EarFun', 'Shokz', 'Marshall', 'Skullcandy', 'Panasonic', 'Victor', 'JVC', 'JVCKENWOOD',
            'SOUNDPEATS', 'TOZO', 'Edifier', 'Tribit', 'MOONDROP', 'Google', 'Pixel', 'final',
            'JPRiDE', 'Bang & Olufsen', 'B&O', 'AKG', 'Denon', 'Yamaha', 'CMF', 'Xiaomi', 'Redmi'
        ];

        // Try to find brand in product name
        let brandName = null;
        for (const brand of KNOWN_BRANDS) {
            if (productName.toLowerCase().includes(brand.toLowerCase())) {
                brandName = brand;
                break;
            }
        }

        // If no known brand found, try to extract first word as brand
        if (!brandName) {
            const firstWord = productName.split(/[\s\-\/]/)[0];
            if (firstWord && firstWord.length > 2) {
                brandName = firstWord;
            }
        }

        // Search for official product page with brand
        const query = brandName
            ? `${brandName} ${productName} 公式 仕様 スペック`
            : `${productName} 公式 仕様`;

        console.log(`      🔍 Searching official site for brand: ${brandName || 'unknown'}`);

        await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}&setmkt=ja-JP`, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        await new Promise(r => setTimeout(r, 2000));

        // Find official site link dynamically
        // Strategy: Look for links containing the brand name in the domain
        const officialLink = await page.evaluate((brand) => {
            const links = Array.from(document.querySelectorAll('li.b_algo a'));
            const brandLower = brand ? brand.toLowerCase() : '';

            for (const link of links) {
                const href = link.href || '';
                const hrefLower = href.toLowerCase();

                // Priority 1: Domain contains brand name (e.g., sony.jp, ankerjapan.com)
                if (brandLower && (hrefLower.includes(brandLower) ||
                    hrefLower.includes(brandLower.replace(/[\s\-]/g, '')))) {
                    // Exclude shopping sites and review sites
                    const excludePatterns = ['amazon', 'rakuten', 'kakaku', 'my-best', 'review', 'blog'];
                    if (!excludePatterns.some(p => hrefLower.includes(p))) {
                        return href;
                    }
                }

                // Priority 2: Official-looking domains (.jp, .com with product in path)
                if (hrefLower.includes('/product') || hrefLower.includes('/spec') ||
                    hrefLower.includes('仕様') || hrefLower.includes('support')) {
                    const excludePatterns = ['amazon', 'rakuten', 'kakaku', 'my-best', 'review', 'blog', 'twitter', 'youtube'];
                    if (!excludePatterns.some(p => hrefLower.includes(p))) {
                        return href;
                    }
                }
            }
            return null;
        }, brandName);

        if (!officialLink) {
            if (browser) {
                if (isRemote) {
                    await page.close().catch(() => { });
                } else {
                    await browser.close();
                }
            }
            console.log(`      ⚠️ No official site found for ${brandName || productName}`);
            return null;
        }

        console.log(`      📄 Found official page: ${officialLink.slice(0, 60)}...`);

        // Go to official page
        await page.goto(officialLink, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        // Extract page content
        const pageContent = await page.evaluate(() => {
            document.querySelectorAll('script, style, nav, footer').forEach(el => el.remove());
            return document.body.innerText.slice(0, 15000);
        });

        if (browser) {
            if (isRemote) {
                await page.close().catch(() => { });
            } else {
                await browser.close();
            }
        }

        // Use AI to extract specs from the page content
        return await extractSpecsWithAI(pageContent, productName, officialLink);

    } catch (e) {
        if (browser) {
            if (isRemote) {
                const pages = await browser.pages();
                for (const p of pages) {
                    if (p.url().includes('bing') || p.url().includes('http')) await p.close().catch(() => { });
                }
            } else {
                await browser.close();
            }
        }
        console.log(`      ⚠️ Official site scrape failed: ${e.message}`);
        return null;
    }
}

/**
 * Fallback: Search web for specs
 */
async function scrapeFromWebSearch(productName) {
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
    } catch (e) {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });
    }

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        const query = `${productName} スペック 仕様`;
        await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}&setmkt=ja-JP`, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        await new Promise(r => setTimeout(r, 2000));

        // Get snippets that might contain specs
        const snippets = await page.evaluate(() => {
            const results = [];
            document.querySelectorAll('li.b_algo').forEach(li => {
                const snippet = li.querySelector('.b_caption p')?.innerText || '';
                results.push(snippet);
            });
            return results.slice(0, 5).join('\n');
        });

        if (isRemote) await browser.disconnect();
        else await browser.close();

        // Use AI to extract specs from snippets
        return await extractSpecsWithAI(snippets, productName, 'web search');

    } catch (e) {
        if (browser) {
            if (isRemote) await browser.disconnect();
            else await browser.close();
        }
        return null;
    }
}

/**
 * Use Gemini to extract structured specs from text
 */
async function extractSpecsWithAI(content, productName, source) {
    if (!content || content.length < 50) return null;

    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });

    const prompt = `
以下のWebページコンテンツから「${productName}」のスペック情報を抽出してJSON形式で返してください。

【厳守ルール】
1. **「記載なし」「不明」は禁止。** 文脈から推測するか、一般的な同等クラスの値を補完してください。
2. 「対応/非対応」等の項目は、必ず「〇」か「×」で統一すること。「あり」「なし」「対応」は禁止。
3. 防水規格は「IPX4」のように書くこと。「IPX4相当」などの余計な文字は削除。
4. 連続再生時間は「約●時間」の形式に統一。数値+時間の形にする。

【出力形式】
{
    "specs": [
        { "label": "ドライバー", "value": "○○mm" },
        { "label": "連続再生時間", "value": "約○○時間" },
        { "label": "ノイズキャンセリング", "value": "〇" },
        { "label": "防水規格", "value": "IPX○" },
        { "label": "Bluetooth", "value": "5.○" },
        { "label": "対応コーデック", "value": "AAC, SBC" },
        { "label": "重量", "value": "約○○g" }
    ],
    "features": ["特徴1", "特徴2", "特徴3"],
    "price": "¥○○,○○○"
}

情報が見つからない項目は省略してください。JSONのみを出力してください。
`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            parsed.source = source;
            console.log(`      ✅ AI extracted ${parsed.specs?.length || 0} specs`);
            return parsed;
        }
    } catch (e) {
        console.log(`      ⚠️ AI spec extraction failed: ${e.message}`);
    }

    return null;
}

/**
 * Scrape 口コミ/レビュー from 価格.com
 * @param {string} productName - Product name to search
 * @param {string} kakakuUrl - Optional direct 価格.com product URL
 * @param {number} maxReviews - Maximum reviews to collect
 * @returns {Promise<object>} - { reviews: [], summary: {} }
 */
async function scrapeKakakuReviews(productName, kakakuUrl = null, maxReviews = 10) {
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
            req.setTimeout(5000, () => { req.destroy(); reject(new Error('timeout')); });
        });

        browser = await puppeteer.connect({ browserWSEndpoint: wsUrl, defaultViewport: null });
        isRemote = true;
    } catch (e) {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });
    }

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        let productPageUrl = kakakuUrl;

        // Detect if the URL is already a review page
        const isDirectReviewPage = productPageUrl && (
            productPageUrl.includes('review.kakaku.com') ||
            productPageUrl.includes('/kuchikomi/') ||
            productPageUrl.includes('#tab')
        );

        // If no direct URL, search for the product
        if (!productPageUrl) {
            const searchUrl = `https://kakaku.com/search_results/${encodeURIComponent(productName)}/`;
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(r => setTimeout(r, 2000));

            const searchResult = await page.evaluate(() => {
                // Generic robust search: find first link to an item page
                // Main container usually has id="main" or class="main"
                const main = document.querySelector('#main, .main, #contents, .contents') || document.body;
                const links = Array.from(main.querySelectorAll('a'));
                const link = links.find(a => a.href && a.href.includes('/item/') && !a.href.includes('spec') && !a.href.includes('review'));

                return {
                    foundUrl: link ? link.href : null,
                    pageTitle: document.title,
                    currentUrl: window.location.href,
                    linkCount: links.length
                };
            });

            productPageUrl = searchResult.foundUrl;

            if (!productPageUrl) {
                console.log(`      ⚠️ Primary search failed. Page: ${searchResult.pageTitle} (${searchResult.currentUrl})`);
                console.log(`      ⚠️ Found ${searchResult.linkCount} links, but none matched /item/.`);


                // Fallback: Try searching for model number only
                // Extract pattern like "ATH-CKS50TW2", "WH-1000XM5", "ZE8000"
                const modelNumberMatch = productName.match(/[a-zA-Z0-9-]{4,}/g);
                if (modelNumberMatch) {
                    // Use the last match or longest alphanumeric
                    const candidates = modelNumberMatch.sort((a, b) => b.length - a.length);
                    const bestCandidate = candidates[0];

                    if (bestCandidate && bestCandidate.length > 3 && bestCandidate !== productName) {
                        console.log(`      ⚠️ Kakaku search retry: searching for model number "${bestCandidate}"...`);
                        const retryUrl = `https://kakaku.com/search_results/${encodeURIComponent(bestCandidate)}/`;
                        await page.goto(retryUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                        await new Promise(r => setTimeout(r, 1500));

                        productPageUrl = await page.evaluate(() => {
                            const link = document.querySelector('.itemSearchResult a.itemName');
                            return link ? link.href : null;
                        });
                    }
                }
            }

            if (!productPageUrl) {
                await browser.close();
                console.log(`      ⚠️ No product found on 価格.com for: ${productName}`);
                return null;
            }
        }

        // Go to product page (or review page if direct)
        await page.goto(productPageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        // Only look for review link if we are NOT already on a review page
        if (!isDirectReviewPage) {
            // Find the review/kuchikomi link (口コミ or レビュー)
            const reviewLink = await page.evaluate(() => {
                // Try multiple selectors for review page
                const selectors = [
                    'a[href*="/review/"]',
                    'a[href*="review"]',
                    '.subNavi a:contains("レビュー")',
                    'a[href*="/kuchikomi/"]',
                    'a[href*="/bbs/"]',
                    '.subNavi a:contains("口コミ")',
                    'a.tabNav[href*="kuchi"]',
                    'li.tabItem_kuchikomi a'
                ];
                for (const sel of selectors) {
                    try {
                        const link = document.querySelector(sel);
                        if (link && link.href) return link.href;
                    } catch (e) { }
                }
                // Fallback: construct URL from product page
                const currentUrl = window.location.href;
                if (currentUrl.includes('/item/')) {
                    return currentUrl.replace('/item/', '/kuchikomi/');
                }
                return null;
            });

            if (reviewLink) {
                await page.goto(reviewLink, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        // Extract reviews with pagination
        let allReviews = [];
        let currentPage = 1;
        const maxPages = Math.ceil(maxReviews / 15); // Assume ~15 reviews per page

        while (allReviews.length < maxReviews && currentPage <= maxPages) {
            await new Promise(r => setTimeout(r, 1500));

            const pageReviews = await page.evaluate(() => {
                const results = [];
                // Primary Selectors for Kakaku reviews
                const items = document.querySelectorAll('.reviewBox, .kuchikomiBbsBody .bbsItem');

                items.forEach(item => {
                    const text = item.querySelector('.reviewDetail, .reviewContent, .revText, p.reviewBody')?.innerText?.trim() ||
                        item.innerText?.trim();

                    // Rating extraction (star5, star4...) => 5, 4
                    let rating = null;
                    const starEl = item.querySelector('[class*="star"]');
                    if (starEl) {
                        const match = starEl.className.match(/star(\d)/);
                        if (match) rating = parseInt(match[1]);
                    }

                    const title = item.querySelector('.reviewTitle, h3')?.innerText?.trim();

                    if (text && text.length > 10) {
                        results.push({
                            text: text.slice(0, 500),
                            rating: rating,
                            title: title || '',
                            source: '価格.com'
                        });
                    }
                });
                return results;
            });

            if (pageReviews.length === 0) break;
            allReviews = allReviews.concat(pageReviews);
            console.log(`      📄 Kakaku Page ${currentPage}: Found ${pageReviews.length} reviews`);

            if (allReviews.length >= maxReviews) break;

            // Updated Pagination Logic
            console.log(`      Looking for next page link (Current: ${currentPage})...`);

            // Check existence first
            const nextLinkExists = await page.evaluate(() => {
                const selectors = ['a.next', 'li.next a', '.nextPage a', 'ul.pageLink li.next a', 'img[alt="次へ"]'];
                for (const sel of selectors) {
                    const el = document.querySelector(sel);
                    if (el && el.href) return true;
                }
                const links = Array.from(document.querySelectorAll('a'));
                return !!links.find(a => a.innerText.includes('次へ') || a.innerText.includes('次の'));
            });

            if (nextLinkExists) {
                const oldUrl = page.url();

                // Click next with retry logic
                const clicked = await page.evaluate(() => {
                    // Specific robust selectors matching existence check
                    const selectors = ['a.next', 'li.next a', '.nextPage a', 'ul.pageLink li.next a', 'img[alt="次へ"]'];
                    for (const sel of selectors) {
                        const el = document.querySelector(sel);
                        if (el) {
                            // If it's an image, click parent anchor if possible
                            if (el.tagName === 'IMG' && el.parentElement.tagName === 'A') {
                                el.parentElement.click();
                            } else {
                                el.click();
                            }
                            return true;
                        }
                    }
                    // Fallback
                    const links = Array.from(document.querySelectorAll('a'));
                    const nextLink = links.find(a => a.innerText.includes('次へ') || a.innerText.includes('次の'));
                    if (nextLink) { nextLink.click(); return true; }
                    return false;
                });

                if (!clicked) {
                    console.log('      ⚠️ Could not click next link even though it was found.');
                    break;
                }

                // Wait for URL to change (more robust than waitForNavigation)
                try {
                    await page.waitForFunction((oldUrl) => window.location.href !== oldUrl, { timeout: 10000 }, oldUrl);
                    await new Promise(r => setTimeout(r, 2000)); // Chill

                    // Verify we are on a new page
                    const newUrl = page.url();
                    // console.log(`      ✅ Navigated to: ${newUrl}`);
                    currentPage++;

                } catch (e) {
                    console.log(`      ⚠️ Navigation failed (URL didn't change). URL: ${page.url()}`);
                    // Try one more fallback: direct navigation if we can find the href
                    const nextHref = await page.evaluate(() => {
                        const el = document.querySelector('a.next, li.next a, .nextPage a');
                        return el ? el.href : null;
                    });

                    if (nextHref && nextHref !== oldUrl) {
                        console.log(`      🔄 Trying direct navigation to: ${nextHref}`);
                        await page.goto(nextHref, { waitUntil: 'domcontentloaded', timeout: 30000 });
                        currentPage++;
                    } else {
                        break;
                    }
                }
            } else {
                console.log(`      ⚠️ Debug: No next link found. URL: ${page.url()}`);
                const debugInfo = await page.evaluate(() => {
                    const pageLink = document.querySelector('.pageLink, .pagination, .pager');
                    if (pageLink) return pageLink.outerHTML;
                    return document.body.innerText.slice(0, 500);
                });
                console.log(`      ⚠️ Debug Info: ${debugInfo ? debugInfo.slice(0, 500) : 'null'}`);
                break;
            }
        }

        const reviewData = allReviews.slice(0, maxReviews);

        if (isRemote) await browser.disconnect();
        else await browser.close();

        if (reviewData.length > 0) {
            // Categorize reviews by sentiment
            const positive = reviewData.filter(r => r.rating >= 4 || (!r.rating && !r.text.includes('残念') && !r.text.includes('悪い')));
            const negative = reviewData.filter(r => r.rating <= 2 || (r.text.includes('残念') || r.text.includes('悪い') || r.text.includes('不満')));

            console.log(`      ✅ Found ${reviewData.length} 価格.com口コミ`);
            return {
                positive: positive.slice(0, 5),
                negative: negative.slice(0, 3),
                all: reviewData,
                summary: {
                    totalFound: reviewData.length,
                    source: '価格.com'
                }
            };
        }

        console.log(`      ⚠️ No reviews found on 価格.com for: ${productName}`);
        return null;

    } catch (e) {
        if (browser) {
            if (isRemote) await browser.disconnect();
            else await browser.close();
        }
        console.log(`      ⚠️ 価格.com review scrape failed: ${e.message}`);
        return null;
    }
}

module.exports = { scrapeProductSpecs, scrapeKakakuReviews };
