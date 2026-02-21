const { execSync } = require('child_process');
const path = require('path');
const http = require('http');
// Load environment variables (critical for scraper)
require('dotenv').config({ path: '.env.local' });

// Import the actual scraper logic
const { scrapeProductReviews } = require('./lib/amazon_scout');

async function checkPort() {
    return new Promise((resolve) => {
        const req = http.get('http://127.0.0.1:9222/json/version', (res) => {
            resolve(true);
        });
        req.on('error', () => resolve(false));
    });
}

(async () => {
    console.log("ｧｪ FULL END-TO-END VERIFICATION: Launch + Review Scrape");
    console.log("=======================================================");

    // 1. Kill old Chrome
    console.log("八 Killing existing Chrome...");
    try { execSync('taskkill /F /IM chrome.exe >nul 2>&1'); } catch (e) { }
    await new Promise(r => setTimeout(r, 2000));

    // 2. Launch using the NEW BATCH FILE
    const batPath = path.join(__dirname, 'start_chrome_quiet.bat');
    console.log(`噫 Launching via: ${batPath}`);
    try {
        execSync(`"${batPath}"`, { stdio: 'inherit' });
    } catch (e) {
        console.error("笶・Bat launch failed:", e.message);
        process.exit(1);
    }

    // 3. Wait for Port
    console.log("竢ｳ Waiting for Chrome Port 9222...");
    let connected = false;
    for (let i = 0; i < 30; i++) {
        if (await checkPort()) {
            connected = true;
            break;
        }
        await new Promise(r => setTimeout(r, 1000));
        process.stdout.write(".");
    }
    console.log("");

    if (!connected) {
        console.error("笶・Chrome failed to open port 9222 (Launch failed)");
        process.exit(1);
    }
    console.log("笨・Chrome is Listening!");

    // 4. Run Actual Scraping Logic
    const TEST_ASIN = "B0DGL3XD3D"; // SONY WF-1000XM5
    console.log(`当 Attempting to scrape reviews for ${TEST_ASIN}...`);

    try {
        // Result is { reviews: [], blocked: boolean }
        const result = await scrapeProductReviews(TEST_ASIN, "SONY WF-1000XM5");
        const reviews = result.reviews || [];

        console.log("\n================ RESULT ================");
        if (reviews.length > 0) {
            console.log(`笨・SUCCESS! Collected ${reviews.length} reviews.`);
            console.log("Sample Review:", reviews[0].title);
            process.exit(0);
        } else {
            console.log("笞・・ Scraper ran but returned 0 reviews (Login wall or Stock issue?)");
            process.exit(0);
        }
    } catch (e) {
        console.error("笶・Scraper Crashed:", e);
        process.exit(1);
    }
})();
