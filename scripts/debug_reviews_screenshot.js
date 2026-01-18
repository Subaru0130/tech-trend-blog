const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function debugReviewScrape(asin) {
    console.log(`Starting debug for ASIN: ${asin}`);
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

        // 1. Visit Home (Cold start, no warmup)
        const reviewUrl = `https://www.amazon.co.jp/product-reviews/${asin}?reviewerType=all_reviews`;
        console.log(`Navigating to: ${reviewUrl}`);

        await page.goto(reviewUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log('Nav timeout ignored'));

        // 2. Wait a bit
        await new Promise(r => setTimeout(r, 2000));

        // 3. Check for reviews
        const reviewCount = await page.evaluate(() => {
            return document.querySelectorAll('[data-hook="review"]').length;
        });
        console.log(`Reviews found: ${reviewCount}`);

        // 4. Take screenshot of the STATE
        await page.screenshot({ path: 'debug_reviews_snapshot.png', fullPage: true });
        console.log('Snapshot saved to debug_reviews_snapshot.png');

        // 5. Dump HTML to check for login prompt or specific classes
        const html = await page.content();
        if (html.includes('Sign-In') || html.includes('ログイン')) {
            console.log('DETECTED: Login redirect/prompt!');
        } else if (html.includes('robot')) {
            console.log('DETECTED: Robot check!');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

debugReviewScrape('B0C3326FXT'); // Sony WF-1000XM5 ASIN
// Using 'B0C3326FXT' based on context, or let's verify quickly if that's correct from logs?
// No, I'll assume B0C3326FXT (common for this product) or just search "Sony WF-1000XM5".
// Actually, let's use the ASIN found in previous logs if possible, but I don't have it handy.
// I'll search first.
