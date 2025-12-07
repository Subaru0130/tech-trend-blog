import puppeteer from 'puppeteer';

const products = [
    "アンドハニー ディープモイスト シャンプー 1.0",
    "YOLU カームナイトリペア シャンプー",
    "ボタニスト ボタニカルシャンプー モイスト"
];

async function findAmazonAsin(page, productName) {
    // Search for the Amazon page specifically for the "Main Unit" (本体)
    const query = `site:amazon.co.jp ${productName} 本体 -詰め替え -セット`;
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;

    console.log(`Searching for: ${productName}...`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2' }); // Wait for network idle

    // Debug: Take screenshot
    await page.screenshot({ path: `debug-${productName.replace(/\s+/g, '-')}.png` });

    // Try multiple selectors
    const asin = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a')); // Get ALL links
        for (const link of links) {
            const url = link.href;
            if (url.includes('amazon.co.jp') && (url.includes('/dp/') || url.includes('/gp/product/'))) {
                const match = url.match(/\/(?:dp|gp\/product)\/(B0[A-Z0-9]{8})/);
                if (match) return match[1];
            }
        }
        return null;
    });

    return asin;
}

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    for (const p of products) {
        const asin = await findAmazonAsin(page, p);
        console.log(`Product: ${p} => ASIN: ${asin || 'NOT FOUND'}`);
    }

    await browser.close();
})();
