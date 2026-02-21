const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testSmartWait() {
    console.log('🚀 Starting Smart Wait Verification...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        // Target: A popular product that should definitely have title/price
        const targetUrl = 'https://www.amazon.co.jp/dp/B0FQFQDN6K'; // AirPods Pro 2 (from user log)

        console.log(`   🔗 Navigating to ${targetUrl}...`);

        // Start navigation
        const gotoPromise = page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // START SMART WAIT immediately (simulating the race condition in main script)
        console.log(`   ⚡ Smart Wait: Waiting for content...`);
        const startTime = Date.now();

        await page.waitForFunction(() => {
            const body = document.body;
            if (!body) return false;

            // 1. Specific key elements for product page
            const hasTitle = !!document.querySelector('#productTitle') || !!document.querySelector('#title');
            const hasPrice = !!document.querySelector('.a-price') || !!document.querySelector('#priceblock_ourprice');
            const hasAvailability = !!document.querySelector('#availability') || !!document.querySelector('#add-to-cart-button');

            // 2. Fallback: Body length check
            const bodyLength = body.innerText.length;

            return hasTitle || hasAvailability || (hasPrice && bodyLength > 2000) || bodyLength > 4000;
        }, { timeout: 15000 });

        const duration = Date.now() - startTime;
        console.log(`   ✁ESmart Wait Success! Took ${duration}ms`);

        // Verify what we found
        const debug = await page.evaluate(() => {
            return {
                title: document.querySelector('#productTitle')?.innerText.trim().slice(0, 50),
                bodyLength: document.body.innerText.length,
                hasPrice: !!document.querySelector('.a-price'),
                hasCart: !!document.querySelector('#add-to-cart-button')
            };
        });

        console.log('   📊 Page State:', debug);

        if (debug.bodyLength < 2000) {
            console.error('   ❁EFAILED: Body length too small despite wait!');
        } else {
            console.log('   ✁EPASSED: Body length sufficient.');
        }

    } catch (e) {
        console.error(`   ❁EError: ${e.message}`);
    } finally {
        await browser.close();
    }
}

testSmartWait();
