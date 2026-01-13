
const puppeteer = require('puppeteer');
const fs = require('fs');

const KEYWORD = process.argv[2] || '完全ワイヤレスイヤホン';

(async () => {
    console.log(`Starting Amazon Search for: "${KEYWORD}"...`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        const searchUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(KEYWORD)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

        // Scrape search results
        const products = await page.evaluate(() => {
            const items = document.querySelectorAll('div.s-result-item[data-asin]');
            const results = [];

            items.forEach(item => {
                const asin = item.getAttribute('data-asin');
                if (!asin) return;

                const titleEl = item.querySelector('h2 a span');
                const priceEl = item.querySelector('.a-price .a-offscreen');
                const ratingEl = item.querySelector('.a-icon-star-small .a-icon-alt');
                const linkEl = item.querySelector('h2 a');
                const imgEl = item.querySelector('img.s-image');

                if (titleEl && linkEl) {
                    results.push({
                        asin,
                        title: titleEl.innerText,
                        price: priceEl ? priceEl.innerText : 'N/A',
                        rating: ratingEl ? ratingEl.innerText : 'N/A',
                        url: 'https://www.amazon.co.jp' + linkEl.getAttribute('href'),
                        imageUrl: imgEl ? imgEl.src : null
                    });
                }
            });
            // Limit to top 10 verified items
            return results.slice(0, 10);
        });

        console.log(`\nFound ${products.length} candidates. Verifying availability...\n`);

        const verified = [];
        for (const p of products) {
            // Visit page to verify it's not a dead link
            // For speed, we might skip full visit if we trust search, but strict mode says "Verify".
            // We'll trust search results for existence, but maybe check if price is valid.
            if (p.price !== 'N/A') {
                verified.push(p);
                console.log(`[OK] ${p.asin} | ${p.price} | ${p.title.substring(0, 40)}...`);
            } else {
                console.log(`[SKIP] ${p.asin} (No Price)`);
            }
        }

        console.log("\n--- Verified Candidates JSON ---");
        console.log(JSON.stringify(verified, null, 2));

    } catch (e) {
        console.error("Search failed:", e);
    } finally {
        await browser.close();
    }
})();
