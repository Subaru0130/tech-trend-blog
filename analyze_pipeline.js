
const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, 'src/data/products.json');
const ARTICLES_PATH = path.join(__dirname, 'src/data/articles.json');

console.log('--- Pipeline Analytics ---');

try {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
    const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf-8'));

    // 1. Source Analysis
    const totalProducts = products.length;
    const marketSourced = products.filter(p => p.marketScore && p.marketScore > 0);
    const amazonOnly = products.filter(p => !p.marketScore || p.marketScore === 0);

    console.log(`TOTAL_PRODUCTS: ${totalProducts}`);
    console.log(`MARKET_SOURCED: ${marketSourced.length}`);
    console.log(`AMAZON_ONLY: ${amazonOnly.length}`);

    // 2. Target Article Analysis
    const targetArticle = articles.find(a => a.title.includes('5000') || a.id.includes('wireless'));

    if (targetArticle) {
        console.log(`TARGET_ARTICLE_FOUND: YES`);
        console.log(`RANKING_COUNT: ${targetArticle.rankingItems.length}`);

        let finalMarketCount = 0;
        let finalAmazonCount = 0;

        targetArticle.rankingItems.forEach((item, i) => {
            const p = products.find(prod => prod.id === item.productId) || products.find(prod => prod.asin === item.productId.replace('scout-', ''));
            if (p) {
                const source = p.marketScore > 0 ? 'MARKET' : 'AMAZON';
                if (p.marketScore > 0) finalMarketCount++;
                else finalAmazonCount++;
                // Clean name for output
                const cleanName = p.name.replace(/[^a-zA-Z0-9 -]/g, '');
                console.log(`RANK_${i + 1}: [${source}] ${cleanName.substring(0, 30)}`);
            }
        });

        console.log(`FINAL_MARKET_COUNT: ${finalMarketCount}`);
        console.log(`FINAL_AMAZON_COUNT: ${finalAmazonCount}`);
    } else {
        console.log('TARGET_ARTICLE_FOUND: NO');
    }

} catch (e) {
    console.error(`Error: ${e.message}`);
}
