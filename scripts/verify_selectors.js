const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const path = require('path');
const http = require('http');

async function checkPort() {
    return new Promise((resolve) => {
        const req = http.get('http://127.0.0.1:9222/json/version', (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.webSocketDebuggerUrl);
                } catch (e) { resolve(null); }
            });
        });
        req.on('error', () => resolve(null));
    });
}

(async () => {
    console.log("🕵️ SELECTOR INSPECTOR");

    // 1. Launch
    console.log("🚀 Launching Chrome...");
    execSync(`"${path.join(__dirname, 'start_chrome_quiet.bat')}"`, { stdio: 'inherit' });

    // 2. Wait
    let wsUrl = null;
    for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1000));
        wsUrl = await checkPort();
        if (wsUrl) break;
    }

    if (!wsUrl) { console.error("❌ Failed to connect"); process.exit(1); }

    // 3. Connect
    const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl, defaultViewport: null });
    const page = (await browser.pages())[0] || await browser.newPage();

    // 4. Navigate
    const url = 'https://www.amazon.co.jp/product-reviews/B0DGL3XD3D';
    console.log(`🔗 Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 5000)); // Wait for render

    // 5. Inspect DOM
    const result = await page.evaluate(() => {
        const reviews = document.querySelectorAll('[data-hook="review"]');
        const bodies = document.querySelectorAll('[data-hook="review-body"]');
        const titles = document.querySelectorAll('[data-hook="review-title"]');

        let firstReviewHTML = "";
        let bodyClasses = "";

        if (reviews.length > 0) {
            firstReviewHTML = reviews[0].outerHTML.substring(0, 500) + "...";
        } else {
            // If no reviews, dump body snippets to see what IS there
            firstReviewHTML = document.body.innerHTML.substring(0, 500);
        }

        return {
            reviewCount: reviews.length,
            bodyCount: bodies.length,
            titleCount: titles.length,
            sample: firstReviewHTML,
            title: document.title
        };
    });

    console.log("================ ANALYSIS ================");
    console.log(`Title: ${result.title}`);
    console.log(`Reviews ([data-hook="review"]): ${result.reviewCount}`);
    console.log(`Bodies ([data-hook="review-body"]): ${result.bodyCount}`);
    console.log(`Titles ([data-hook="review-title"]): ${result.titleCount}`);
    console.log("------------------------------------------");
    console.log("Sample HTML:\n", result.sample);

    await browser.disconnect();
})();
