const { scrapeProductReviews } = require('./lib/amazon_scout');

// ASIN from user's error log (Bose QuietComfort Ultra Earbuds Gen 2)
const ASIN = "B0C61G4X7P"; // DENON PerL Pro (User's failing item)

(async () => {
    console.log(`🚀 Testing Review Scraper for ASIN: ${ASIN}...`);
    try {
        const result = await scrapeProductReviews(ASIN, 10);

        console.log("\n✁EScrape Result:");
        console.log(`   Total Found: ${result.summary.totalFound}`);
        console.log(`   Situational: ${result.summary.situationalCount}`);

        if (result.positive.length > 0) {
            console.log(`   Sample Positive: ${result.positive[0].title}`);
        }
        if (result.situational.length > 0) {
            console.log(`   Sample Situational: ${result.situational[0].text.slice(0, 50)}...`);
        }

        if (result.summary.totalFound > 0) {
            console.log("\n🎉 SUCCESS: Reviews were scraped successfully!");
        } else {
            console.log("\n❁EFAILURE: No reviews found.");
        }

    } catch (e) {
        console.error("❁ECRITICAL ERROR:", e);
    }
})();
