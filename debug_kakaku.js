const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
const { scrapeKakakuReviews } = require('./scripts/lib/spec_scraper');

(async () => {
    const NAME = "Audio-Technica ATH-CKS50TW2";
    // User provided URL: https://review.kakaku.com/review/K0001709588/#tab
    // Note: The scraper might expect the PRODUCT page url (kakaku.com/item/...) not only review page.
    // Let's test providing the Review URL directly if the function supports it, or the Product URL.
    const DIRECT_REVIEW_URL = "https://review.kakaku.com/review/K0001709588/";

    console.log(`\n🔍 DEBUG KAKAKU: Testing extraction for ${NAME}...\n`);

    try {
        console.log(`--- Test 1: Direct URL Access (${DIRECT_REVIEW_URL}) ---`);
        const result1 = await scrapeKakakuReviews(NAME, DIRECT_REVIEW_URL, 5);
        console.log(`[Direct] Found: ${result1.summary?.totalFound || 0}`);
        if (result1.summary?.totalFound > 0) {
            console.log(`[Direct] Sample: ${result1.positive[0]?.text?.slice(0, 50)}...`);
        } else {
            console.error("[Direct] ❌ Failed to extract from direct URL");
        }

        console.log(`\n--- Test 2: Search Logic (ATH-CKS50TW2) ---`);
        // We know this failed before. Let's see if we can fix it.
        const result2 = await scrapeKakakuReviews("ATH-CKS50TW2", null, 5);
        console.log(`[Search] Found: ${result2.summary?.totalFound || 0}`);

    } catch (e) {
        console.error("CRITICAL ERROR:", e);
    }
})();
