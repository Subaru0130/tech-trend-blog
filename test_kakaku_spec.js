/**
 * Test Kakaku Spec Extraction
 * Verifies that scrapeKakakuRanking now extracts specs unconditionally
 */
require('dotenv').config({ path: '.env.local' });
const { scrapeKakakuRanking } = require('./scripts/lib/market_research');

async function testSpecExtraction() {
    console.log("🧪 Testing Kakaku Spec Extraction\n");

    // Test with "wireless earphones" which should have NC specs
    const keyword = "ワイヤレスイヤホン";
    const options = {
        targetCount: 3,
        maxPages: 1
    };

    try {
        const products = await scrapeKakakuRanking(keyword, options);

        console.log(`\n✅ Scraped ${products.length} products`);

        let specCountWithData = 0;
        let ncCount = 0;

        products.forEach((p, i) => {
            console.log(`\n[${i + 1}] ${p.name}`);
            console.log(`    URL: ${p.kakakuUrl}`);

            const specs = p.kakakuSpecs || {};
            const specKeys = Object.keys(specs);
            console.log(`    Specs found: ${specKeys.length}`);

            if (specKeys.length > 0) {
                specCountWithData++;
                console.log(`    Sample specs: ${specKeys.slice(0, 3).join(', ')}...`);

                if (specs['ノイズキャンセリング']) {
                    console.log(`    Noise Cancelling (Raw): ${specs['ノイズキャンセリング']}`);
                }

                if (p.hasNoiseCancel !== undefined) {
                    console.log(`    hasNoiseCancel: ${p.hasNoiseCancel}`);
                    if (p.hasNoiseCancel) ncCount++;
                }
            } else {
                console.log(`    ⚠️ No specs found`);
            }
        });

        console.log("\n" + "=".repeat(30));
        console.log(`Summary:`);
        console.log(`Products with specs: ${specCountWithData}/${products.length}`);
        console.log(`Products with NC detected: ${ncCount}`);

        if (specCountWithData > 0) {
            console.log("✅ SUCCESS: Spec extraction is working!");
        } else {
            console.log("❌ FAILURE: No specs were extracted.");
        }

    } catch (e) {
        console.error("❌ Error during test:", e);
    }
}

testSpecExtraction();
