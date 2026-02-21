
const { scrapeProductReviews, verifyProductOnAmazon } = require('./lib/amazon_scout');
const { scrapeKakakuReviews } = require('./lib/spec_scraper');
const fs = require('fs');

// Test targets (Skipping AirPods for now as it's known to fail)
const PRODUCTS = [
    "Sony WF-1000XM5",
    "Anker Soundcore Liberty 4"
];

(async () => {
    const logParams = [];
    console.log("📊 Starting Review Verification...");

    for (const productName of PRODUCTS) {
        console.log(`\n📦 Processing: ${productName}`);

        let kCount = 0;
        let aCount = 0;

        // 1. Kakaku
        try {
            const kRes = await scrapeKakakuReviews(productName, null, 30);
            if (kRes?.summary) kCount = kRes.summary.totalFound;
        } catch (e) {
            console.log(`Kakaku Error: ${e.message}`);
        }

        // 2. Amazon
        try {
            const pInfo = await verifyProductOnAmazon(productName);
            if (pInfo?.asin) {
                const aRes = await scrapeProductReviews(pInfo.asin, 30);
                if (aRes?.summary) aCount = aRes.summary.totalFound;
            }
        } catch (e) {
            console.log(`Amazon Error: ${e.message}`);
        }

        logParams.push({ name: productName, kakaku: kCount, amazon: aCount });
        console.log(`   👉 ${productName}: Kakaku=${kCount}, Amazon=${aCount}`);
    }

    fs.writeFileSync('review_stats.json', JSON.stringify(logParams, null, 2));
    console.log("✁EDone");
    process.exit(0);
})();
