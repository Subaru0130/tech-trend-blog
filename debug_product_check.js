const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
const { verifyProductOnAmazon } = require('./scripts/lib/amazon_scout');
const { scrapeProductSpecs, scrapeKakakuReviews } = require('./scripts/lib/spec_scraper');
const { evaluateProductForTheme } = require('./scripts/lib/ai_rating_evaluator');

(async () => {
    // Target products reported by user
    const targets = [
        "Audio-Technica ATH-CKS50TW2", // Modified name slightly to help search
        "final TONALITE"
    ];

    console.log("🔍 STARTING DEBUG SESSION");

    for (const name of targets) {
        console.log(`\n\n================================`);
        console.log(`🔎 TESTING: ${name}`);
        console.log(`================================`);

        try {
            // Updated to be more flexible with category if needed, but earphones is correct here
            const verified = await verifyProductOnAmazon(name, 'wireless-earphones');

            if (verified) {
                console.log(`✅ FOUND ON AMAZON`);
                console.log(`   ASIN: ${verified.asin}`);
                console.log(`   Price: ${verified.price}`);
                console.log(`   Image: ${verified.image ? "✅ Present" : "❌ MISSING"}`);
                if (verified.image) console.log(`   Image URL: ${verified.image}`);
                console.log(`   Name Matched: ${verified.amazonTitle.slice(0, 50)}...`);

                // Specs
                console.log("\n--- Spec Scraping ---");
                const specs = await scrapeProductSpecs(name, verified.asin);
                console.log(`   Specs Count: ${specs?.specs?.length || 0}`);

                // Reviews
                console.log("\n--- Kakaku Reviews ---");
                const kReviews = await scrapeKakakuReviews(name);
                console.log(`   Kakaku Reviews Found: ${kReviews?.summary?.totalFound || 0}`);

                // AI Rating Check (Simulated)
                console.log("\n--- AI Rating Data Check ---");
                const productMock = {
                    name: name,
                    specs: specs?.specs || [],
                    kakakuSpecs: {}, // skipping kakaku specs for simple test
                    rawReviews: {
                        positive: [], // skipping amazon reviews for simple test unless retrieved
                        kakaku: kReviews ? { positive: kReviews.positive, negative: kReviews.negative } : null
                    }
                };

                // We just want to see if it runs without error and returns reasonable score
                const evalResult = await evaluateProductForTheme(productMock, { comparison_axis: "音質と機能性" });
                console.log(`   AI Score: ${evalResult.themeScore}`);
                console.log(`   Reason: ${evalResult.reason}`);

            } else {
                console.log(`❌ NOT FOUND ON AMAZON`);
            }
        } catch (e) {
            console.error("ERROR:", e);
        }
    }
})();
