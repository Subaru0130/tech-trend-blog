
const fs = require('fs');
const path = require('path');

const articlesPath = path.join(__dirname, '../src/data/articles.json');
const productsPath = path.join(__dirname, '../src/data/products.json');

const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

let errors = [];

// Helper to find product
const getProduct = (id) => products.find(p => p.id === id);

console.log("Starting Ranking Integrity Audit...");

articles.forEach(article => {
    if (!article.rankingItems || article.rankingItems.length === 0) return;

    console.log(`Checking Article: ${article.id}`);

    // Sort rankingItems by rank to ensure sequence check works
    const sortedItems = [...article.rankingItems].sort((a, b) => a.rank - b.rank);

    sortedItems.forEach((item, index) => {
        const expectedRank = index + 1;

        // 1. Check Sequence
        if (item.rank !== expectedRank) {
            errors.push(`[${article.id}] Rank Sequence Error: Item at index ${index} has rank ${item.rank}, expected ${expectedRank}.`);
        }

        // 2. Check Product Existence
        const product = getProduct(item.productId);
        if (!product) {
            errors.push(`[${article.id}] Missing Product Error: Rank ${item.rank} references productId '${item.productId}' which does not exist in products.json.`);
        } else {
            // 3. Check Rank Sync (Optional but good for sanity)
            // Note: product.rank is a legacy field if one product appears in multiple rankings, but assuming 1:1 for now:
            if (product.rank !== undefined && product.rank !== item.rank) {
                console.warn(`[${article.id}] Warning: Product '${product.id}' has JSON rank ${product.rank} but is Rank ${item.rank} in article.`);
                // We might want to enforce this or remove the field from products.json
            }
        }
    });

    console.log(`  -> Verified ${sortedItems.length} items.`);
});

if (errors.length > 0) {
    console.error("\n❁EIntegrity Check Failed with errors:");
    errors.forEach(e => console.error(e));
    process.exit(1);
} else {
    console.log("\n✁EIntegrity Check Passed: All rankings are sequential and linked to valid products.");
    process.exit(0);
}
