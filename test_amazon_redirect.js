/**
 * Test the updated market_research.js with Amazon link extraction
 */
const { scrapeKakakuRanking } = require('./scripts/lib/market_research');

(async () => {
    console.log('=== Testing Kakaku Amazon Link Extraction ===\n');

    const products = await scrapeKakakuRanking('ワイヤレスイヤホン', {
        startPage: 1,
        maxPages: 1,
        targetCount: 3  // Just test 3 products
    });

    console.log('\n=== Results ===');
    products.slice(0, 3).forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`);
        console.log(`   Kakaku URL: ${p.kakakuUrl}`);
        console.log(`   Amazon URL: ${p.amazonUrl || 'NOT FOUND'}`);
        console.log(`   ASIN: ${p.asin || 'N/A'}`);
        console.log(`   Price: ¥${p.amazonPrice || p.price || '?'}`);
    });

    // Check if we got real Amazon URLs
    const hasRealAmazonUrl = products.some(p => p.amazonUrl && p.amazonUrl.includes('amazon.co.jp'));
    console.log(`\n✅ Real Amazon URLs found: ${hasRealAmazonUrl}`);

    process.exit(0);
})();
