
const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, 'src/data/products.json');
const ARTICLES_PATH = path.join(__dirname, 'src/data/articles.json');

console.log('--- Verifying Data ---');

try {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
    console.log(`Total Products: ${products.length}`);

    // Check for specific items from recent logs
    const liberty4 = products.find(p => p.name.includes('Liberty 4') || p.asin === 'B0BZV8M35K' || p.asin === 'B0C5W5R1L9');
    const earfun = products.find(p => p.name.toLowerCase().includes('earfun') || p.asin === 'B0D9PVX7ZV'); // EarFun Air Pro 4 typical ASIN or similar

    // Check for recent items with 'realSpecs'
    const recentEnriched = products.filter(p => p.realSpecs && Object.keys(p.realSpecs).length > 0).slice(-5);

    if (recentEnriched.length > 0) {
        console.log('✅ Found recently enriched products:');
        recentEnriched.forEach(p => {
            console.log(`- ${p.name} (ASIN: ${p.asin})`);
            console.log(`  Specs: ${JSON.stringify(p.realSpecs).slice(0, 50)}...`);
            console.log(`  Ext Search Used: ${!!p.externalContext}`);
        });
    } else {
        console.log('⚠️ No recent products with realSpecs found at end of file.');
        // Log last 3 products to see what they are
        console.log('Last 3 products:', products.slice(-3).map(p => p.name));
    }

    const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf-8'));
    console.log(`\nTotal Articles: ${articles.length}`);
    const latestArticle = articles[articles.length - 1];
    console.log(`Latest Article: ${latestArticle.title} (ID: ${latestArticle.id})`);

    // Check for target keyword article
    const targetArticle = articles.find(a => a.title.includes('5000円以下') || a.id.includes('ワイヤレスイヤホン'));
    if (targetArticle) {
        console.log(`✅ Target Article Found: ${targetArticle.title}`);
        console.log(`  Products in ranking: ${targetArticle.rankingItems.length}`);

        // Check for empty/missing details in ranking items
        const missingDetails = targetArticle.rankingItems.filter(item => !item.specs || item.specs.length === 0 || item.specs.some(s => s.value === '詳細はまだ入力されていません'));
        if (missingDetails.length > 0) {
            console.log(`  ⚠️ Found ${missingDetails.length} items with missing/placeholder details.`);
        } else {
            console.log(`  ✅ All ranking items have specs.`);
        }
    } else {
        console.log('⚠️ Target Article NOT found.');
    }

    if (targetArticle) {
        console.log('--- Ranking Items Check ---');
        targetArticle.rankingItems.forEach((item, idx) => {
            // Find product data
            const p = products.find(prod => prod.id === item.productId) || products.find(prod => prod.asin === item.productId.replace('scout-', ''));
            const nameToShow = p ? p.name : item.productId;
            console.log(`  Rank ${idx + 1}: ${nameToShow}`);

            // BAD NAME DETECTOR
            if (/^[A-Z0-9-]{3,10}$/.test(nameToShow)) {
                console.log(`     ❌ BAD NAME DETECTED: ${nameToShow}`);
            } else {
                console.log(`     ✅ Name looks descriptive.`);
            }
        });

        // Check for specific BAD items from user complaint
        const badNames = ["TW700", "AMZ-A3953", "S5IOW-S951-E", "AMZ-A3954"];
        const foundBad = products.filter(p => badNames.includes(p.name));
        if (foundBad.length > 0) {
            console.log(`❌ ALARM: Found products with explicitly banned names: ${foundBad.map(p => p.name).join(', ')}`);
        } else {
            console.log(`✅ CONFIRMED: No products found with banned names (TW700 etc).`);
        }
    }

} catch (e) {
    console.error(`Error: ${e.message}`);
}
