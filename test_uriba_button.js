const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const shopUrl = 'https://kakaku.com/shop/2671/?pdid=K0001637898&lid=shop_itemview_shopname';
    console.log('Navigating to: ' + shopUrl);

    await page.goto(shopUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Find the orange "ショップの売り場へ行く" button
    const buttonInfo = await page.evaluate(() => {
        // Look for the button by text or class
        const allLinks = Array.from(document.querySelectorAll('a'));

        for (const link of allLinks) {
            const text = link.innerText || '';
            if (text.includes('売り場へ行く')) {
                return {
                    text: text.trim(),
                    href: link.href,
                    onclick: link.getAttribute('onclick') || null
                };
            }
        }

        // Also check for any forwarder links
        const forwarderLinks = allLinks.filter(a => a.href.includes('forwarder'));
        if (forwarderLinks.length > 0) {
            return {
                text: 'Forwarder link found',
                href: forwarderLinks[0].href
            };
        }

        return null;
    });

    console.log('\n=== 売り場へ行く Button ===');
    console.log(JSON.stringify(buttonInfo, null, 2));

    if (buttonInfo && buttonInfo.href) {
        console.log('\n=== Following the link... ===');

        // Follow the link and track final URL
        await page.goto(buttonInfo.href, { waitUntil: 'networkidle0', timeout: 30000 });
        await new Promise(r => setTimeout(r, 5000));

        const finalUrl = page.url();
        console.log('Final URL: ' + finalUrl);

        if (finalUrl.includes('amazon.co.jp')) {
            console.log('✅ SUCCESS! Landed on Amazon!');

            const asinMatch = finalUrl.match(/\/dp\/([A-Z0-9]{10})/);
            if (asinMatch) {
                console.log('ASIN: ' + asinMatch[1]);
            }
        }
    }

    await browser.close();
})();
