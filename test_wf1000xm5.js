const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    console.log('Testing SONY WF-1000XM5...');

    // Step 1: Go to product page
    const kakakuUrl = 'https://kakaku.com/item/J0000041936/#tab';
    console.log('1. Navigating to: ' + kakakuUrl);
    await page.goto(kakakuUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000));

    // Step 2: Find Amazon shop link
    const amazonShopInfo = await page.evaluate(() => {
        const allLinks = Array.from(document.querySelectorAll('a'));
        for (const link of allLinks) {
            const text = link.innerText || '';
            const href = link.href || '';
            if (text.includes('Amazon') && href.includes('kakaku.com/shop/')) {
                return { text: text.slice(0, 50), href: href };
            }
        }
        return null;
    });

    if (!amazonShopInfo) {
        console.log('❌ No Amazon shop link found on product page');
        await browser.close();
        return;
    }

    console.log('2. Amazon shop found: ' + amazonShopInfo.text);
    console.log('   Shop URL: ' + amazonShopInfo.href);

    // Step 3: Navigate to shop page
    await page.goto(amazonShopInfo.href, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000));

    // Step 4: Find forwarder link
    const forwarderUrl = await page.evaluate(() => {
        const allLinks = Array.from(document.querySelectorAll('a'));
        for (const link of allLinks) {
            if (link.href && link.href.includes('forwarder/forward.aspx')) {
                return link.href;
            }
        }
        return null;
    });

    if (!forwarderUrl) {
        console.log('❌ No forwarder link found');
        await browser.close();
        return;
    }

    console.log('3. Forwarder found: ' + forwarderUrl.slice(0, 80) + '...');

    // Step 5: Follow forwarder to Amazon
    await page.goto(forwarderUrl, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000));

    const finalUrl = page.url();
    console.log('4. Final URL: ' + finalUrl);

    if (finalUrl.includes('amazon.co.jp')) {
        console.log('✅ SUCCESS! Reached Amazon');
        const asinMatch = finalUrl.match(/\/dp\/([A-Z0-9]{10})/);
        if (asinMatch) {
            console.log('   ASIN: ' + asinMatch[1]);
        }
    } else {
        console.log('❌ Did not reach Amazon');
    }

    await browser.close();
})();
