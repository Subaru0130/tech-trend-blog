const puppeteer = require('puppeteer');
const ASIN = 'B0C5WZ5L8Q'; // The problematic ASIN

(async () => {
    console.log(`噫 Verifying Fix Flow for ASIN: ${ASIN}`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        // New Headers
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
            'Referer': 'https://www.google.com/'
        });

        const reviewUrl = `https://www.amazon.co.jp/product-reviews/${ASIN}`;
        console.log(`1・鞘Ε  Trying Review Page: ${reviewUrl}`);

        let usedFallback = false;

        // Simulate scrapeProductReviews Logic
        try {
            await page.goto(reviewUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            await page.waitForSelector('[data-hook="review"]', { timeout: 3000 });
            console.log("   笨・Review Page loaded successfully (Unexpected but good)");
        } catch (e) {
            console.log("   笞・・Blocked/Timeout on Review Page (Expected). Switching to Fallback...");
            usedFallback = true;
        }

        if (usedFallback) {
            const productUrl = `https://www.amazon.co.jp/dp/${ASIN}`;
            console.log(`2・鞘Ε  Falling back to Product Page: ${productUrl}`);
            await new Promise(r => setTimeout(r, 2000)); // Small delay

            await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Scroll to trigger lazy load
            await page.evaluate(async () => {
                window.scrollBy(0, window.innerHeight);
                await new Promise(r => setTimeout(r, 500));
            });

            // Check for reviews (using selectors from amazon_scout.js path)
            const reviewCount = await page.evaluate(() => {
                return document.querySelectorAll('[data-hook="review"], .review, #cm_cr-review_list .a-section').length;
            });

            if (reviewCount > 0) {
                console.log(`   笨・SUCCESS: Found ${reviewCount} reviews on Product Page!`);
            } else {
                console.log("   笶・FAILURE: Found 0 reviews on Product Page.");
                // Dump HTML for debugging
                const html = await page.content();
                console.log(`Dump: ${html.substring(0, 500)}`);
            }
        }

    } catch (e) {
        console.log(`   笶・Script Error: ${e.message}`);
    } finally {
        await browser.close();
    }
})();
