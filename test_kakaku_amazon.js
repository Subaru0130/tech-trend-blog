/**
 * Test: Verify Kakaku Scraping with Amazon Link Extraction
 * Tests the enrichment function that adds Amazon links to Kakaku products
 */
const { scrapeKakakuRankingWithEnrichment } = require('./scripts/lib/market_research.js');

(async () => {
    console.log('🧪 Testing Kakaku Scraping WITH Amazon Link Enrichment...');
    console.log('Target: Get products with Amazon links');
    console.log('Price Range: ¥10,000 - ¥19,999\n');

    try {
        const products = await scrapeKakakuRankingWithEnrichment('ワイヤレスイヤホン', {
            minPrice: 10000,
            maxPrice: 19999,
            targetCount: 20,  // Get 20 products to ensure 10 have Amazon
            maxPages: 5       // Use more pages
        });

        console.log('\n' + '='.repeat(60));
        console.log('📊 SCRAPING + ENRICHMENT RESULTS');
        console.log('='.repeat(60));
        console.log('Total products:', products.length);

        // Count products with Amazon links
        const withAmazon = products.filter(p => p.hasAmazon || p.amazonUrl || p.amazonKakakuUrl);
        console.log('With Amazon link:', withAmazon.length);

        // Check for duplicates
        const names = products.map(p => p.name);
        const uniqueNames = new Set(names);
        console.log('Unique names:', uniqueNames.size);

        // Show products with Amazon status
        console.log('\n' + '='.repeat(60));
        console.log('📝 PRODUCTS WITH AMAZON STATUS');
        console.log('='.repeat(60));

        products.slice(0, 20).forEach((p, i) => {
            const priceStr = p.price ? `¥${p.price.toLocaleString()}` : 'N/A';
            const amazonStatus = (p.hasAmazon || p.amazonUrl || p.amazonKakakuUrl) ? '✅ Amazon' : '❌ No Amazon';
            console.log(`${String(i + 1).padStart(2)}. ${p.name.slice(0, 45)}`);
            console.log(`    Price: ${priceStr} | ${amazonStatus}`);
        });

        // Check duplicates
        const dupes = names.filter((n, i) => names.indexOf(n) !== i);
        if (dupes.length > 0) {
            console.log('\n⚠️ DUPLICATE NAMES: ' + [...new Set(dupes)].join(', '));
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📋 SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total: ${products.length}`);
        console.log(`With Amazon: ${withAmazon.length}`);
        console.log(`Unique: ${uniqueNames.size}`);
        console.log(`Duplicates: ${dupes.length}`);

        if (withAmazon.length >= 10 && dupes.length === 0) {
            console.log('\n✅ SUCCESS: Have enough products with Amazon links!');
        } else {
            console.log('\n❌ ISSUES: Need more Amazon links or fix duplicates');
        }
    } catch (err) {
        console.error('Error running test:', err.message);
        console.error(err.stack);
    }

    process.exit(0);
})();
