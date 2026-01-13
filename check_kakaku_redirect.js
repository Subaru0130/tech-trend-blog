const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // Test: Navigate to the Kakaku shop link and see where it redirects
    const shopUrl = 'https://kakaku.com/shop/2671/?pdid=K0001637898&lid=shop_itemview_shopname';
    console.log('Navigating to Kakaku shop link: ' + shopUrl);

    await page.goto(shopUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000)); // Wait for JS redirect

    const finalUrl = page.url();
    console.log('\n=== Final URL after redirect ===');
    console.log(finalUrl);

    // Check if we landed on Amazon
    if (finalUrl.includes('amazon.co.jp')) {
        console.log('✅ SUCCESS: Redirected to Amazon!');

        // Extract ASIN from URL
        const asinMatch = finalUrl.match(/\/dp\/([A-Z0-9]{10})/);
        if (asinMatch) {
            console.log('ASIN: ' + asinMatch[1]);
        }
    } else {
        console.log('❌ Did not redirect to Amazon');
        console.log('Page title: ' + await page.title());
    }

    await browser.close();
})();
