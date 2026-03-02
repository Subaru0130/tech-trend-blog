const { scrapeKakakuReviews } = require('./lib/spec_scraper');
const { scrapeProductReviews } = require('./lib/amazon_scout');

// Fails in production: SONY WF-1000XM5
const PRODUCT_NAME = "SONY WF-1000XM5";
const ASIN = "B0DGL3XD3D";

(async () => {
    console.log("🚀 STARTING PRODUCTION SEQUENCE DEBUG");
    console.log("=========================================");

    try {
        // Step 1: Kakaku Reviews (Suspect)
        console.log(`\n1️⃣ Running scrapeKakakuReviews for ${PRODUCT_NAME}...`);
        console.log("   (This mimics the production step just before failure)");
        const kakakuResult = await scrapeKakakuReviews(PRODUCT_NAME, null, 50);
        console.log(`   ✅ Kakaku Done. Reviews found: ${kakakuResult?.summary?.totalFound || 0}`);

        // Step 2: Amazon Reviews (Victim)
        console.log(`\n2️⃣ Running scrapeProductReviews for ${ASIN} (Amazon)...`);
        console.log("   (This mimics the failed step)");
        const amazonResult = await scrapeProductReviews(ASIN, 10);
        console.log(`   ✅ Amazon Done. Reviews found: ${amazonResult?.summary?.totalFound || 0}`);

        console.log("\n✅ SEQUENCE SUCCESS: Both scrapers ran without conflict.");

    } catch (e) {
        console.error("\n❌ SEQUENCE FAILED:");
        console.error(`   Error: ${e.message}`);
        console.error("   Stack:", e.stack);
    }
})();
