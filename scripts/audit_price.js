
const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../src/data/products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

let errors = [];

console.log("Starting Price & Link Audit...");

products.forEach(product => {
    // 1. Price Check (Only for under-10000 article items, but generally good practice to check logic)
    // We assume all items in this specific file meant for the "under-10000" ranking should optionally be checked.
    // However, the file contains refrigerators too. So we only check items with 'wireless-earphones' subCategory AND price < 10000 requirement.
    // For now, let's just log prices.

    if (product.subCategory === 'wireless-earphones') {
        const priceStr = product.price.replace(/[^0-9]/g, '');
        const price = parseInt(priceStr);

        if (price > 10000) {
            errors.push(`[${product.id}] Price Violation: ${product.price} exceeds ¥10,000 limit.`);
        }
    }

    // 2. Link Format Check
    if (product.affiliateLinks && product.affiliateLinks.amazon) {
        const url = product.affiliateLinks.amazon;
        if (!url.includes('amazon.co.jp/dp/')) {
            errors.push(`[${product.id}] Invalid Link Format: ${url} does not contain 'amazon.co.jp/dp/'.`);
        }
        if (url.includes('tag=demo-22')) {
            console.warn(`[${product.id}] Warning: Link contains 'tag=demo-22'. Ensure this is intended.`);
        }
    }
});

if (errors.length > 0) {
    console.error("\n❌ Price/Link Audit Failed:");
    errors.forEach(e => console.error(e));
    process.exit(1);
} else {
    console.log("\n✅ Price/Link Audit Passed.");
    process.exit(0);
}
