const puppeteer = require('puppeteer');
const path = require('path');

const PRODUCTS = [
    {
        name: 'prod-earfun-air-pro-3.png',
        url: 'https://www.myearfun.com/headphones/earfun-air-pro-3-black',
        // Target the main slider image or specific product container
        // EarFun usually has a slick slider. We'll try to find a clean image.
        imageSelector: '.product-gallery__image, .swiper-slide-active img, .feature_image img',
        // Look for Amazon link
        amazonLinkSelector: 'a[href*="amazon.co.jp"]',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    {
        name: 'prod-soundpeats-air4-pro.png',
        // Original URL was 404, we found this one via search earlier:
        url: 'https://soundpeats.com/products/air4-pro',
        imageSelector: '.product-gallery__image img, .product-media img, .product__media img',
        amazonLinkSelector: 'a[href*="amazon.co.jp"]',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    {
        name: 'prod-soundcore-life-p3.png',
        url: 'https://www.ankerjapan.com/products/a3939',
        // Anker Japan typically has a clear hero image
        imageSelector: '.product-gallery__image img, .product-single__photo img',
        amazonLinkSelector: 'a[href*="amazon.co.jp"]',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
];

(async () => {
    console.log('Starting Scrape & Capture...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });
    const page = await browser.newPage();

    // Results to verify ASINs
    const results = [];

    for (const p of PRODUCTS) {
        console.log(`\nProcessing: ${p.url}`);
        try {
            await page.setUserAgent(p.userAgent);
            await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 30000 });
            await page.setViewport({ width: 1920, height: 1080 });

            // 1. Scrape Amazon Link
            let amazonLink = null;
            try {
                amazonLink = await page.$eval(p.amazonLinkSelector, el => el.href);
                console.log(`  -> Found Amazon Link: ${amazonLink}`);
            } catch (e) {
                console.log(`  -> Amazon Link NOT found via selector ${p.amazonLinkSelector}`);
            }
            results.push({ file: p.name, amazon: amazonLink });

            // 2. Capture Clean Image
            // We'll try to find the element handle
            let el = null;
            // Split selectors and try one by one
            const selectors = p.imageSelector.split(',').map(s => s.trim());
            for (const sel of selectors) {
                try {
                    await page.waitForSelector(sel, { timeout: 2000, visible: true });
                    el = await page.$(sel);
                    if (el) {
                        console.log(`  -> Locked on image with selector: ${sel}`);
                        break;
                    }
                } catch (e) { }
            }

            const outPath = path.resolve(__dirname, '..', 'public/images/products', p.name);
            if (el) {
                // Take screenshot of the ELEMENT only (cleaner, no borders if focused properly)
                await el.screenshot({ path: outPath });
                console.log(`  -> Saved Element Screenshot: ${p.name}`);
            } else {
                // Fallback: Viewport
                console.log('  -> Element not found, capturing viewport (fallback)');
                await page.screenshot({ path: outPath });
            }

        } catch (e) {
            console.error(`  -> ERROR: ${e.message}`);
        }
    }

    await browser.close();
    console.log('\n--- Final Data ---');
    console.log(JSON.stringify(results, null, 2));
})();
