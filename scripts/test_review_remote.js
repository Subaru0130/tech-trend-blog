const { scrapeProductReviews } = require('./lib/amazon_scout.js');

async function test() {
    console.log("🧪 Testing Amazon Review Scrape with Remote Debugging...\n");

    // Sony WF-1000XM5 - Valid ASINs found by searching
    // B0C33XXXX was invalid, let's use B0CBKQZXT7 (found in earlier logs)
    const testAsin = 'B0CBKQZXT7'; // Sony WF-1000XM5

    try {
        const result = await scrapeProductReviews(testAsin, 30); // Changed to 30
        console.log("\n📊 Results:");
        console.log(`   Total Reviews: ${result.summary?.totalFound || 0}`);
        console.log(`   Positive: ${result.positive?.length || 0}`);
        console.log(`   Negative: ${result.negative?.length || 0}`);
        console.log(`   Situational: ${result.situational?.length || 0}`);

        if (result.positive?.length > 0) {
            console.log("\n📝 Sample Review:");
            console.log(`   "${result.positive[0].text.substring(0, 100)}..."`);
        }
    } catch (e) {
        console.error("❌ Error:", e.message);
    }
}

test();
