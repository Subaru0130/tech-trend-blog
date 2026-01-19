
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testTimeoutBehavior() {
    console.log('🚀 Starting Timeout Behavior Test...');

    // Connect to existing Chrome key for speed/cookies if likely, but for isolation let's use a new headless instance 
    // or try to connect to the user's open browser if possible to match their state exactly. 
    // Given the previous context, let's try a fresh launch to reproduce the "clean" failure, 
    // but we can try to attach if we wanted. For now, launch new to be deterministic.

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        // Target: Apple AirPods 4 (known to have issues)
        const targetUrl = 'https://kakaku.com/item/K0001651424/#tab';
        console.log(`navigating to ${targetUrl} with strict 30s timeout...`);

        try {
            await page.goto(targetUrl, {
                waitUntil: 'networkidle0', // Very strict wait - likely to fail if ads are streaming
                timeout: 30000
            });
            console.log('✅ Navigation finished successfully (unexpectedly fast)');
        } catch (e) {
            console.log(`⚠️ Navigation timed out as expected: ${e.message}`);

            // IMMEDIATE CHECK: Is the DOM actually useful?
            const pageTitle = await page.title();
            console.log(`   Page Title after timeout: "${pageTitle}"`);

            const shopListExists = await page.$('.p-PTShopList_item, [class*="shopList"], table.shopTable');
            console.log(`   Shop List Element Found: ${!!shopListExists}`);

            const amazonLink = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a'));
                return links.find(l => l.innerText.includes('Amazon') && l.href.includes('shop/'))?.href;
            });
            console.log(`   Amazon Shop Link Found: ${amazonLink ? 'YES' : 'NO'} (${amazonLink || ''})`);

            if (shopListExists || amazonLink) {
                console.log('🎯 CONCLUSION: safe to ignore timeout! Content is present.');
            } else {
                console.log('❌ CONCLUSION: Page is genuinely broken/white screen.');
            }
        }

    } catch (err) {
        console.error('Test script crashed:', err);
    } finally {
        await browser.close();
    }
}

testTimeoutBehavior();
