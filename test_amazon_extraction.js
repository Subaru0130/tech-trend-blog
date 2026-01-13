const puppeteer = require('puppeteer');

(async () => {
    console.log("Testing fixed selector on WF-1000XM5...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');

    const targetUrl = 'https://kakaku.com/item/J0000041936/#tab';

    console.log(`Checking: ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    const amazonInfo = await page.evaluate(() => {
        const allLinks = Array.from(document.querySelectorAll('a'));
        for (const link of allLinks) {
            const href = link.href || '';
            const text = link.innerText || '';

            // NEW FIXED SELECTOR
            if (text.includes('Amazon') && href.includes('kakaku.com/shop/')) {
                let price = 0;
                const parent = link.closest('tr, .p-shopList_item, .shopList_item, [class*="shop"]');
                if (parent) {
                    const priceEl = parent.querySelector('.productPrice, .p-shopTable_price, .price, [class*="price"]');
                    if (priceEl) {
                        const match = priceEl.innerText.match(/[\d,]+/);
                        if (match) price = parseInt(match[0].replace(/,/g, ''), 10);
                    }
                }
                return { url: href, price, text: text.trim() };
            }
        }
        return null;
    });

    console.log('Result:', amazonInfo);
    await browser.close();
})();
