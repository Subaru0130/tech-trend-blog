
const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, 'src/data/products.json');
const ARTICLES_PATH = path.join(__dirname, 'src/data/articles.json');

console.log('=== PIPELINE STATS ===');

try {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
    const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf-8'));

    // 1. Count by source
    const marketProducts = products.filter(p => p.marketScore && p.marketScore > 0);
    const amazonProducts = products.filter(p => !p.marketScore || p.marketScore === 0);

    console.log('');
    console.log('--- ALL PRODUCTS IN DB ---');
    console.log('TOTAL: ' + products.length);
    console.log('MARKET_RESEARCH: ' + marketProducts.length);
    console.log('AMAZON_FALLBACK: ' + amazonProducts.length);

    // 2. Target Article (1万円台ノイキャン)
    const targetArticle = articles.find(a =>
        a.title && (a.title.includes('1万円台') || a.title.includes('ノイキャン最強'))
    );

    console.log('');
    console.log('--- TARGET ARTICLE ---');
    if (targetArticle) {
        console.log('TITLE: ' + targetArticle.title);
        console.log('RANKING_ITEMS: ' + (targetArticle.rankingItems?.length || 0));

        let marketCount = 0;
        let amazonCount = 0;

        console.log('');
        console.log('PRODUCTS:');
        (targetArticle.rankingItems || []).forEach((item, i) => {
            const p = products.find(prod => prod.id === item.productId) || products.find(prod => prod.asin === item.productId?.replace('scout-', ''));
            if (p) {
                const src = p.marketScore > 0 ? 'MARKET' : 'AMAZON';
                if (p.marketScore > 0) marketCount++;
                else amazonCount++;
                console.log('  ' + (i + 1) + '. [' + src + '] ' + p.name);
            } else {
                console.log('  ' + (i + 1) + '. [UNKNOWN] ' + item.productId);
            }
        });

        console.log('');
        console.log('FINAL_FROM_MARKET: ' + marketCount);
        console.log('FINAL_FROM_AMAZON: ' + amazonCount);
    } else {
        console.log('NOT FOUND');
    }

} catch (e) {
    console.error('Error: ' + e.message);
}
