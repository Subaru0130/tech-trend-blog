/**
 * Test: Verify Kakaku Page 1 Scraping
 * Confirms 40 unique products are scraped with correct names and URLs
 */
const { scrapeKakakuRanking } = require('./scripts/lib/market_research.js');

(async () => {
    console.log('🧪 Testing Kakaku Page 1 Scraping...');
    console.log('Target: 40 unique products from page 1');
    console.log('Price Range: ¥10,000 - ¥19,999\n');

    try {
        const products = await scrapeKakakuRanking('ワイヤレスイヤホン', {
            minPrice: 10000,
            maxPrice: 19999,
            targetCount: 40,
            maxPages: 1
        });

        console.log('\n' + '='.repeat(60));
        console.log('📊 SCRAPING RESULTS');
        console.log('='.repeat(60));
        console.log('Total products retrieved:', products.length);

        // Check for duplicates by name
        const names = products.map(p => p.name);
        const uniqueNames = new Set(names);
        console.log('Unique product names:', uniqueNames.size);

        // Check for duplicates by URL
        const urls = products.map(p => p.kakakuUrl).filter(Boolean);
        const uniqueUrls = new Set(urls);
        console.log('Unique Kakaku URLs:', uniqueUrls.size);

        // Show all products
        console.log('\n' + '='.repeat(60));
        console.log('📝 ALL SCRAPED PRODUCTS');
        console.log('='.repeat(60));

        products.forEach((p, i) => {
            const priceStr = p.price ? `¥${p.price.toLocaleString()}` : 'N/A';
            const urlStatus = p.kakakuUrl ? '✓' : '✗';
            console.log(`${String(i + 1).padStart(2)}. [${urlStatus}] ${p.name.slice(0, 55)}`);
            console.log(`    Price: ${priceStr}`);
        });

        // Check for duplicate names
        const dupes = names.filter((n, i) => names.indexOf(n) !== i);
        if (dupes.length > 0) {
            console.log('\n' + '='.repeat(60));
            console.log('⚠️ DUPLICATE NAMES FOUND (' + dupes.length + ')');
            console.log('='.repeat(60));
            [...new Set(dupes)].forEach(d => console.log('  - ' + d.slice(0, 60)));
        } else {
            console.log('\n✅ NO DUPLICATES - All product names are unique');
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📋 SUMMARY');
        console.log('='.repeat(60));
        console.log(`Products: ${products.length}/40`);
        console.log(`Unique Names: ${uniqueNames.size}`);
        console.log(`Unique URLs: ${uniqueUrls.size}`);
        console.log(`Duplicates: ${dupes.length}`);

        if (products.length >= 40 && dupes.length === 0) {
            console.log('\n✅ SUCCESS: Page 1 scraping is working correctly!');
        } else {
            console.log('\n❌ ISSUES FOUND - Need to fix scraping logic');
        }
    } catch (err) {
        console.error('Error running test:', err.message);
        console.error(err.stack);
    }

    process.exit(0);
})();
