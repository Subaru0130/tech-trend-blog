const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
const { scrapeProductReviews } = require('./scripts/lib/amazon_scout');
const { scrapeKakakuReviews } = require('./scripts/lib/spec_scraper');

(async () => {
    const ASIN = "B0DGPT2MVN"; // Audio-Technica ATH-CKS50TW2
    const NAME_FULL = "Audio-Technica ATH-CKS50TW2";
    const NAME_MODEL = "ATH-CKS50TW2"; // Strict model search

    console.log(`\n🔍 VERIFICATION: Fetching reviews for ${NAME_FULL}...\n`);

    try {
        // 1. Amazon
        const amazonData = await scrapeProductReviews(ASIN, 10);
        const azCount = amazonData?.summary?.totalFound || 0;
        console.log(`[AMAZON] Count: ${azCount}`);
        if (azCount > 0) {
            console.log(`[AMAZON] Sample: "${amazonData.positive[0]?.text?.slice(0, 50)}..."`);
        }

        // 2. Kakaku (Strict Search)
        console.log(`\n[KAKAKU] Searching with model name: "${NAME_MODEL}"...`);
        const kakakuData = await scrapeKakakuReviews(NAME_MODEL, null, 10);
        const kkCount = kakakuData?.summary?.totalFound || 0;
        console.log(`[KAKAKU] Count: ${kkCount}`);
        if (kkCount > 0) {
            console.log(`[KAKAKU] Sample: "${kakakuData.positive[0]?.text?.slice(0, 50)}..."`);
        } else {
            console.error("[KAKAKU] ⚠️ NO REVIEWS FOUND (Check selectors)");
        }

        if (azCount > 0 && kkCount > 0) {
            console.log("\n✅ SUCCESS: Both sources acquired!");
        } else {
            console.log("\n⚠️ PARTIAL: One or more sources missing.");
        }

    } catch (e) {
        console.error("CRITICAL ERROR:", e);
    }
})();
