/**
 * Test Each Market Research Source Individually
 * To identify which scrapers are failing
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const {
    discoverProducts,
    scrapeKakakuRanking,
    scrapeMyBestRanking,
    scrapeMONOQLO,
    scrapeAmazonBestseller
} = require('./scripts/lib/market_research');

async function testAllSources() {
    const keyword = 'ワイヤレスイヤホン ノイズキャンセリング';

    console.log('='.repeat(60));
    console.log('🔍 TESTING EACH MARKET RESEARCH SOURCE');
    console.log('='.repeat(60));

    const results = {};

    // 1. Kakaku.com
    console.log('\n\n📊 SOURCE 1: Kakaku.com');
    console.log('-'.repeat(40));
    try {
        const kakaku = await scrapeKakakuRanking(keyword, {
            minPrice: 10000,
            maxPrice: 20000,
            maxPages: 3
        });
        results.kakaku = kakaku.length;
        console.log(`✅ Kakaku.com: ${kakaku.length} products found`);
        if (kakaku.length > 0) {
            console.log(`   Sample: ${kakaku.slice(0, 3).map(p => p.name.slice(0, 30)).join(', ')}`);
        }
    } catch (e) {
        results.kakaku = `ERROR: ${e.message}`;
        console.log(`❌ Kakaku.com FAILED: ${e.message}`);
    }

    // 2. MyBest.jp
    console.log('\n\n📊 SOURCE 2: MyBest.jp');
    console.log('-'.repeat(40));
    try {
        const mybest = await scrapeMyBestRanking(keyword);
        results.mybest = mybest.length;
        console.log(`✅ MyBest.jp: ${mybest.length} products found`);
        if (mybest.length > 0) {
            console.log(`   Sample: ${mybest.slice(0, 3).map(p => p.name.slice(0, 30)).join(', ')}`);
        }
    } catch (e) {
        results.mybest = `ERROR: ${e.message}`;
        console.log(`❌ MyBest.jp FAILED: ${e.message}`);
    }

    // 3. MONOQLO
    console.log('\n\n📊 SOURCE 3: MONOQLO/家電批評');
    console.log('-'.repeat(40));
    try {
        const monoqlo = await scrapeMONOQLO(keyword);
        results.monoqlo = monoqlo.length;
        console.log(`✅ MONOQLO: ${monoqlo.length} products found`);
        if (monoqlo.length > 0) {
            console.log(`   Sample: ${monoqlo.slice(0, 3).map(p => p.name.slice(0, 30)).join(', ')}`);
        }
    } catch (e) {
        results.monoqlo = `ERROR: ${e.message}`;
        console.log(`❌ MONOQLO FAILED: ${e.message}`);
    }

    // 4. Amazon Bestseller
    console.log('\n\n📊 SOURCE 4: Amazon Bestseller');
    console.log('-'.repeat(40));
    try {
        const amazon = await scrapeAmazonBestseller('3477981', { minPrice: 10000, maxPrice: 20000 });
        results.amazonBestseller = amazon.length;
        console.log(`✅ Amazon Bestseller: ${amazon.length} products found`);
        if (amazon.length > 0) {
            console.log(`   Sample: ${amazon.slice(0, 3).map(p => p.name.slice(0, 30)).join(', ')}`);
        }
    } catch (e) {
        results.amazonBestseller = `ERROR: ${e.message}`;
        console.log(`❌ Amazon Bestseller FAILED: ${e.message}`);
    }

    // 5. Bing Web Search (discoverProducts)
    console.log('\n\n📊 SOURCE 5: Bing Web Search (AI extraction)');
    console.log('-'.repeat(40));
    try {
        const bing = await discoverProducts(keyword, { comparison_axis: 'ノイズキャンセリング' }, 30);
        results.bingSearch = bing.length;
        console.log(`✅ Bing Search: ${bing.length} products found`);
        if (bing.length > 0) {
            console.log(`   Sample: ${bing.slice(0, 3).map(p => p.name.slice(0, 30)).join(', ')}`);
        }
    } catch (e) {
        results.bingSearch = `ERROR: ${e.message}`;
        console.log(`❌ Bing Search FAILED: ${e.message}`);
    }

    // Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(JSON.stringify(results, null, 2));

    const total = Object.values(results).filter(v => typeof v === 'number').reduce((a, b) => a + b, 0);
    const errors = Object.entries(results).filter(([k, v]) => typeof v === 'string').map(([k]) => k);

    console.log(`\nTOTAL PRODUCTS: ${total}`);
    console.log(`FAILED SOURCES: ${errors.length > 0 ? errors.join(', ') : 'None'}`);
}

testAllSources().then(() => process.exit(0)).catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
