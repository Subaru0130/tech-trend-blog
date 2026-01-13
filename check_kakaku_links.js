const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    console.log('Navigating to Kakaku product page...');
    await page.goto('https://kakaku.com/item/J0000045151/#tab', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    // Find all links with '売り場' or Amazon-related
    const links = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('a').forEach(a => {
            const text = a.innerText || '';
            const href = a.href || '';
            if (text.includes('売り場') || text.includes('Amazon') || href.toLowerCase().includes('amazon')) {
                results.push({ text: text.slice(0, 60), href: href });
            }
        });
        return results;
    });

    console.log('\n=== Found Links ===');
    links.forEach((l, i) => {
        console.log((i + 1) + '. Text: ' + l.text);
        console.log('   Href: ' + l.href);
    });

    await browser.close();
})();
