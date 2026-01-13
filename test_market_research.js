/**
 * Test Market Research System
 * Quick test of the new market-first discovery
 */

require('dotenv').config({ path: '.env.local' });
const { discoverProducts } = require('./scripts/lib/market_research');
const { verifyProductOnAmazon } = require('./scripts/lib/amazon_scout');

async function testMarketResearch() {
    const keyword = "ワイヤレスイヤホン 1万円台 ノイズキャンセリング";
    const blueprint = {
        comparison_axis: "ノイズキャンセリング性能"
    };

    console.log("🧪 Testing Market Research System\n");
    console.log("=".repeat(50));

    // Test 1: Discover products from market
    console.log("\n📊 Stage 1: Market Discovery");
    const products = await discoverProducts(keyword, blueprint);

    console.log(`\nDiscovered ${products.length} products:`);
    products.slice(0, 5).forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name} (Score: ${p.marketScore}, Sources: ${p.sources.join(", ")})`);
    });

    // Test 2: Verify top product on Amazon
    if (products.length > 0) {
        console.log("\n📦 Stage 2: Amazon Verification");
        const amazonResult = await verifyProductOnAmazon(products[0].name, 'wireless-earphones');

        if (amazonResult) {
            console.log(`  ✅ Found on Amazon: ${amazonResult.name}`);
            console.log(`     ASIN: ${amazonResult.asin}`);
            console.log(`     Price: ${amazonResult.price}`);
            console.log(`     Rating: ${amazonResult.rating}★ (${amazonResult.reviewCount} reviews)`);
        } else {
            console.log(`  ❌ Not found on Amazon`);
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log("🧪 Test Complete");
}

testMarketResearch().catch(console.error);
