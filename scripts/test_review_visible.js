const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testReviewScraping() {
    console.log('Starting simple test...');

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    const page = await browser.newPage();

    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

        // 1. Go to Amazon home
        console.log('1. Amazon home...');
        await page.goto('https://www.amazon.co.jp/', { waitUntil: 'domcontentloaded', timeout: 20000 });
        await new Promise(r => setTimeout(r, 2000));
        console.log('OK - Title:', await page.title());

        // 2. Product page - don't wait for network, just load basic HTML
        console.log('2. Product page (no network wait)...');
        try {
            await page.goto('https://www.amazon.co.jp/dp/B0BB1PFCS3', {
                waitUntil: 'domcontentloaded',  // Only wait for DOM, not network
                timeout: 20000
            });
            console.log('DOM loaded, waiting for content...');
            await new Promise(r => setTimeout(r, 5000)); // Manual wait
            console.log('Title:', await page.title());
        } catch (e) {
            console.log('Navigation error:', e.message);
        }

        // 3. Check what's on page
        const result = await page.evaluate(() => {
            const reviews = document.querySelectorAll('[data-hook="review"]');
            const body = document.body?.innerText?.slice(0, 500) || 'No body';
            return { reviewCount: reviews.length, bodyPreview: body };
        });
        console.log('Reviews found:', result.reviewCount);
        console.log('Page content preview:', result.bodyPreview.slice(0, 200));

        console.log('\n--- Keeping browser open 30 sec to inspect ---');
        await new Promise(r => setTimeout(r, 30000));

    } catch (e) {
        console.error('Fatal error:', e.message);
        console.log('--- Keeping browser open 15 sec ---');
        await new Promise(r => setTimeout(r, 15000));
    } finally {
        await browser.close();
    }
}

testReviewScraping();
