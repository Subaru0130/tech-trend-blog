
const { scrapeProductReviews, verifyProductOnAmazon } = require('./lib/amazon_scout');
const { scrapeKakakuReviews } = require('./lib/spec_scraper');

// Test targets
const PRODUCTS = [
    "Sony WF-1000XM5",
    "Apple AirPods Pro (第2世代)",
    "Anker Soundcore Liberty 4"
];

(async () => {
    console.log("📊 Starting Review Acquisition Verification...");
    console.log("---------------------------------------------------");

    for (const productName of PRODUCTS) {
        console.log(`\n📦 Processing: ${productName}`);

        // 1. Kakaku.com Reviews
        console.log(`   Searching Kakaku.com...`);
        let kakakuCount = 0;
        let kakakuTime = 0;
        const startKakaku = Date.now();
        try {
            const kakakuResult = await scrapeKakakuReviews(productName, null, 30);
            kakakuTime = (Date.now() - startKakaku) / 1000;

            if (kakakuResult && kakakuResult.summary) {
                kakakuCount = kakakuResult.summary.totalFound;
                console.log(`   ✅ Kakaku: Found ${kakakuCount} reviews in ${kakakuTime.toFixed(1)}s`);
                if (kakakuResult.positive.length > 0) console.log(`      Example (Pos): ${kakakuResult.positive[0].title}`);
            } else {
                console.log(`   ⚠️ Kakaku: No reviews found`);
            }
        } catch (e) {
            console.log(`   ❌ Kakaku Error: ${e.message}`);
        }

        // 2. Amazon Reviews
        console.log(`   Searching Amazon...`);
        let amazonCount = 0;
        let amazonTime = 0;
        const startAmazon = Date.now();
        let asin = null;

        try {
            // Step A: Find ASIN
            const productInfo = await verifyProductOnAmazon(productName);
            if (productInfo && productInfo.asin) {
                asin = productInfo.asin;
                console.log(`      Found ASIN: ${asin} (${productInfo.amazonTitle.slice(0, 30)}...)`);

                // Step B: Scrape Reviews
                const amazonResult = await scrapeProductReviews(asin, 30);
                amazonTime = (Date.now() - startAmazon) / 1000;

                if (amazonResult && amazonResult.summary) {
                    amazonCount = amazonResult.summary.totalFound;
                    console.log(`   ✅ Amazon: Found ${amazonCount} reviews in ${amazonTime.toFixed(1)}s`);
                    if (amazonResult.positive.length > 0) console.log(`      Example (Pos): ${amazonResult.positive[0].title}`);
                } else {
                    console.log(`   ⚠️ Amazon: No reviews found`);
                }
            } else {
                console.log(`   ⚠️ Amazon: Product not found (No ASIN)`);
            }
        } catch (e) {
            console.log(`   ❌ Amazon Error: ${e.message}`);
        }

        // Summary for this product
        console.log(`   📝 result: Kakaku=${kakakuCount}, Amazon=${amazonCount}`);
    }

    console.log("\n---------------------------------------------------");
    console.log("✅ Verification Complete");
})();
