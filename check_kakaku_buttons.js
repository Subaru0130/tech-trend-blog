const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    console.log('Navigating to Kakaku product page...');
    await page.goto('https://kakaku.com/item/J0000045151/#tab', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    // Find the actual "売り場へ行く" button links (not shop name links)
    const links = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('a').forEach(a => {
            const text = (a.innerText || '').trim();
            const href = a.href || '';
            // Look for the actual button to go to shop
            if (text.includes('売り場へ行く') || (text.includes('Amazon') && href.includes('shop_price'))) {
                results.push({ text: text.slice(0, 80), href: href });
            }
            // Also check for any onclick or data attributes
            const onclick = a.getAttribute('onclick') || '';
            if (onclick.includes('amazon') || onclick.includes('redirect')) {
                results.push({ text: text.slice(0, 80), href: href, onclick: onclick.slice(0, 100) });
            }
        });
        return results;
    });

    console.log('\n=== 売り場へ行く Links ===');
    links.forEach((l, i) => {
        console.log((i + 1) + '. Text: ' + l.text);
        console.log('   Href: ' + l.href);
        if (l.onclick) console.log('   Onclick: ' + l.onclick);
    });

    // Also check for any hidden redirect URLs or data attributes
    const shopData = await page.evaluate(() => {
        const results = [];
        // Look for shop list containers
        document.querySelectorAll('[class*="shop"], [class*="Shop"]').forEach(el => {
            const amazonInner = el.innerHTML.includes('Amazon') || el.innerHTML.includes('amazon');
            if (amazonInner) {
                const allLinks = el.querySelectorAll('a[href*="shop_price"], a[href*="amazon"]');
                allLinks.forEach(a => {
                    results.push({ href: a.href, text: (a.innerText || '').slice(0, 50) });
                });
            }
        });
        return results;
    });

    console.log('\n=== Shop Price Links ===');
    shopData.forEach((l, i) => {
        console.log((i + 1) + '. ' + l.href);
    });

    await browser.close();
})();
