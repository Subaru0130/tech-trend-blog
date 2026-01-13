const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const shopUrl = 'https://kakaku.com/shop/2671/?pdid=K0001637898&lid=shop_itemview_shopname';
    console.log('Navigating to: ' + shopUrl);

    // Method 1: Track redirects
    page.on('request', request => {
        if (request.url().includes('amazon')) {
            console.log('>>> Amazon request detected: ' + request.url());
        }
    });

    page.on('response', response => {
        if (response.url().includes('amazon')) {
            console.log('>>> Amazon response: ' + response.url());
        }
    });

    await page.goto(shopUrl, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 10000)); // Wait 10 seconds for JS redirect

    const finalUrl = page.url();
    console.log('\n=== Final URL ===');
    console.log(finalUrl);

    // Check page content
    const title = await page.title();
    console.log('Page title: ' + title);

    // Look for any Amazon links or redirect scripts on this page
    const pageInfo = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script')).map(s => s.innerHTML.slice(0, 200));
        const amazonLinks = Array.from(document.querySelectorAll('a[href*="amazon"]')).map(a => a.href);
        const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
        return {
            amazonLinks,
            metaRefresh: metaRefresh?.content || null,
            hasRedirectScript: scripts.some(s => s.includes('redirect') || s.includes('location'))
        };
    });

    console.log('\nAmazon links on page: ' + JSON.stringify(pageInfo.amazonLinks));
    console.log('Meta refresh: ' + pageInfo.metaRefresh);
    console.log('Has redirect script: ' + pageInfo.hasRedirectScript);

    await page.screenshot({ path: 'kakaku_shop_page.png' });
    console.log('\nSaved screenshot to kakaku_shop_page.png');

    await browser.close();
})();
