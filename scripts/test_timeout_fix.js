
const { scrapeKakakuRanking } = require('./lib/market_research');

async function test() {
    console.log('🧪 Starting Timeout Fix Verification Test...');
    try {
        // Target a category known to trigger the issue (high traffic/heavy pages)
        // Use a small target count to keep it quick but sufficient to hit detail pages
        const results = await scrapeKakakuRanking('ワイヤレスイヤホン', {
            targetCount: 3,
            maxPages: 1
        });

        console.log('\n✅ Test Complete');
        console.log(`Found ${results.length} products`);

        if (results.length > 0) {
            const p = results[0];
            console.log('\n✨ SUCESSFULLY SCRAPED DATA:');
            console.log('---------------------------------------------------');
            console.log(`📦 Product: ${p.name}`);
            console.log(`💰 Price:   ¥${p.price}`);
            console.log(`⭐ Rating:  ${p.rating} (${p.reviewCount} reviews)`);
            console.log(`🔗 Amazon:  ${p.amazonUrl ? '✅ Found' : '❌ Not Found'}`);
            console.log(`📋 Specs (${Object.keys(p.kakakuSpecs || {}).length} items found):`);

            // Show first 5 specs as proof
            Object.entries(p.kakakuSpecs || {}).slice(0, 5).forEach(([k, v]) => {
                console.log(`   - ${k}: ${v}`);
            });
            console.log('---------------------------------------------------');
        }
    } catch (e) {
        console.error('❌ Test Failed:', e);
    }
}

test();
