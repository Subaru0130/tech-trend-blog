/**
 * Test: scrapeKakakuRankingWithEnrichment
 */
require('dotenv').config({ path: '.env.local' });
const { scrapeKakakuRankingWithEnrichment } = require('./scripts/lib/market_research');

async function test() {
    console.log('Testing scrapeKakakuRankingWithEnrichment...\n');

    const products = await scrapeKakakuRankingWithEnrichment('ワイヤレスイヤホン', {
        minPrice: 10000,
        maxPrice: 30000,
        targetCount: 15,
        maxEnrich: 5  // Only enrich first 5 products for quick test
    });

    console.log('\n=== RESULTS ===');
    console.log(`Total products: ${products.length}`);
    console.log('\nFirst 10 products:');
    products.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ${p.name.slice(0, 50)}`);
        console.log(`   Price: ${p.price} | Amazon: ${p.hasAmazon ? 'Yes' : 'No'}`);
        if (p.amazonKakakuUrl) {
            console.log(`   Amazon URL: ${p.amazonKakakuUrl.slice(0, 70)}...`);
        }
    });
}

test().catch(console.error);
