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
    console.log("📸 SCREENSHOT DIAGNOSTIC");

    // 1. Launch
    console.log("🚀 Launching Chrome...");
    execSync(`"${path.join(__dirname, 'start_chrome_quiet.bat')}"`, { stdio: 'inherit' });

    // 2. Wait
    console.log("⏳ Waiting for Port...");
    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 1000));
        wsUrl = await checkPort();
        if (wsUrl) break;
    }

    if (!wsUrl) { console.error("❁EFailed to connect"); process.exit(1); }

    // 3. Connect & Screenshot
    console.log("🔗 Connecting...");
    const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl, defaultViewport: null });
    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    // Navigate to Review Page
    const url = 'https://www.amazon.co.jp/product-reviews/B0DGL3XD3D';
    console.log(`🔗 Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await new Promise(r => setTimeout(r, 3000)); // Let it render

    const shotPath = path.join(__dirname, '..', 'debug_review_fail.png');
    await page.screenshot({ path: shotPath });
    console.log(`📸 Screenshot saved to: ${shotPath}`); // Important path output

    console.log("Page Title:", await page.title());

    await browser.disconnect();
})();
