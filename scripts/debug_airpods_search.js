
const { scrapeKakakuReviews } = require('./lib/spec_scraper');
const { verifyProductOnAmazon } = require('./lib/amazon_scout');

const VARIATIONS = [
    "Apple AirPods Pro (第2世代)", // The one that failed
    "AirPods Pro 第2世代",        // Space instead of parens
    "AirPods Pro 2",              // Simple number
    "MTJV3J/A",                   // Model Number (USB-C)
    "MQD83J/A"                    // Model Number (Lightning)
];

(async () => {
    console.log("🔍 Debugging AirPods Pro Search Logic...");

    for (const name of VARIATIONS) {
        console.log(`\n-----------------------------------`);
        console.log(`🧪 Testing Name: "${name}"`);

        // 1. Test Kakaku Search
        try {
            console.log(`   [Kakaku] Searching...`);
            const kRes = await scrapeKakakuReviews(name, null, 1); // Max 1 just to check existence
            if (kRes) {
                console.log(`   ✁E[Kakaku] HIT! Found ${kRes.summary.totalFound} reviews`);
                console.log(`      Title: "${kRes.all[0].title.slice(0, 30)}..."`);
            } else {
                console.log(`   ❁E[Kakaku] No reviews found`);
            }
        } catch (e) {
            console.log(`   ❁E[Kakaku] Error: ${e.message}`);
        }

        // 2. Test Amazon Search
        try {
            console.log(`   [Amazon] Searching...`);
            const aRes = await verifyProductOnAmazon(name);
            if (aRes) {
                console.log(`   ✁E[Amazon] HIT! ASIN: ${aRes.asin}`);
                console.log(`      Title: "${aRes.amazonTitle.slice(0, 30)}..."`);
            } else {
                console.log(`   ❁E[Amazon] Not found`);
            }
        } catch (e) {
            console.log(`   ❁E[Amazon] Error: ${e.message}`);
        }
    }
})();
