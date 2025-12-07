import puppeteer from 'puppeteer';

const products = [
    "アンドハニー ディープモイスト シャンプー 1.0",
    "YOLU カームナイトリペア シャンプー",
    "ボタニスト ボタニカルシャンプー モイスト"
];

async function findOfficialImage(page, productName) {
    // 1. Search for official site
    const query = `${productName} 公式`;
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;

    console.log(`Searching for: ${query}...`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    // Extract first organic link
    const link = await page.evaluate(() => {
        const item = document.querySelector('li.b_algo h2 a');
        return item ? item.href : null;
    });

    if (!link) {
        console.log("No official link found.");
        return null;
    }

    console.log(`Found Official Link: ${link}`);

    // 2. Visit site and get OG Image
    try {
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const ogImage = await page.evaluate(() => {
            const meta = document.querySelector('meta[property="og:image"]');
            return meta ? meta.content : null;
        });
        return ogImage;
    } catch (e) {
        console.log(`Failed to visit site: ${e.message}`);
        return null;
    }
}

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    for (const p of products) {
        const img = await findOfficialImage(page, p);
        console.log(`Product: ${p} => IMAGE: ${img || 'NOT FOUND'}`);
    }

    await browser.close();
})();
