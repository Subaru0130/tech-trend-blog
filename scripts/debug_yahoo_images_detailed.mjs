import puppeteer from 'puppeteer';

async function testYahooImageQuality() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const products = [
        "YOLU カームナイトリペア シャンプ�E 本佁E,
        "BOTANIST ボタニカルシャンプ�E モイスチE本佁E,
        "TSUBAKI プレミアムEX リペアションプ�E 本佁E
    ];

    for (const name of products) {
        console.log(`\nSearching for: ${name}`);
        const url = `https://search.yahoo.co.jp/image/search?p=${encodeURIComponent(name)}`;
        await page.goto(url, { waitUntil: 'networkidle2' });

        const images = await page.evaluate(() => {
            const results = [];
            const items = document.querySelectorAll('div.sw-Thumbnail');
            items.forEach(item => {
                const img = item.querySelector('img');
                const title = item.textContent || img?.alt || "";
                if (img && img.src) {
                    results.push({ src: img.src, alt: img.alt, text: title, width: img.naturalWidth });
                }
            });
            return results.slice(0, 5);
        });

        console.log("Top 5 Results:");
        images.forEach((img, i) => {
            console.log(`#${i + 1}: [${img.width}px] ${img.alt} / Text: ${img.text.substring(0, 30)}...`);
            console.log(`   URL: ${img.src.substring(0, 50)}...`);
        });
    }
    await browser.close();
}

testYahooImageQuality();
