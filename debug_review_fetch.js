const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
const { scrapeProductReviews } = require('./scripts/lib/amazon_scout');
const { scrapeKakakuReviews } = require('./scripts/lib/spec_scraper');
const { analyzeReviewsForInsights } = require('./scripts/lib/ai_writer');

(async () => {
    const ASIN = "B0DGPT2MVN"; // Audio-Technica ATH-CKS50TW2
    const NAME = "Audio-Technica ATH-CKS50TW2";

    console.log(`🔍 DEBUG: End-to-End Test for ${NAME}...`);

    try {
        // 1. Fetch Amazon
        console.log("\n--- 1. Fetching Amazon ---");
        const amazonData = await scrapeProductReviews(ASIN, 5);
        console.log(`✅ Amazon: ${amazonData.summary.totalFound} reviews`);

        // 2. Fetch Kakaku
        console.log("\n--- 2. Fetching Kakaku ---");
        const kakakuData = await scrapeKakakuReviews(NAME, null, 5);
        console.log(`✅ Kakaku: ${kakakuData.summary.totalFound} reviews`);

        // 3. Merge (Simulate Logic)
        const mergedReviewData = {
            ...amazonData,
            situational: [...amazonData.situational, ...(kakakuData.all || [])],
            positive: [...amazonData.positive, ...(kakakuData.positive || [])],
            negative: [...amazonData.negative, ...(kakakuData.negative || [])]
        };
        console.log(`\n--- 3. Merged Data ---`);
        console.log(`Positive: ${mergedReviewData.positive.length} (Amazon + Kakaku)`);
        console.log(`Text Sample (Amazon): ${mergedReviewData.positive[0]?.text?.slice(0, 20)}...`);
        console.log(`Text Sample (Kakaku): ${mergedReviewData.positive[mergedReviewData.positive.length - 1]?.text?.slice(0, 20)}...`);

        // 4. AI Analysis
        console.log("\n--- 4. Calling AI Analysis ---");
        const insights = await analyzeReviewsForInsights(NAME, mergedReviewData, "重低音");

        console.log("\n✅ AI Result:");
        console.log(JSON.stringify(insights, null, 2));

    } catch (e) {
        console.error("ERROR:", e);
    }
})();
