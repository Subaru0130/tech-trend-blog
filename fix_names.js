/**
 * 🔧 Fix Corrupted Product Names
 * 
 * Problem: Some products have model numbers like "A3954" as their `name`
 * but have the correct full name in `originalName`.
 * 
 * Solution: Restore `name` from `originalName` where applicable.
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, 'src/data/products.json');

console.log('=== FIXING CORRUPTED PRODUCT NAMES ===\n');

try {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
    let fixedCount = 0;

    products.forEach((p, i) => {
        // Check if name looks like a model number (short, alphanumeric only)
        const nameIsModelNumber = p.name && (
            /^[A-Z0-9\-]{2,10}$/.test(p.name.trim()) ||  // "A3954", "TW700", "S5IO"
            p.name.startsWith('‎') // Has hidden character (LTR mark)
        );

        // Check if we have a better name in originalName
        const hasGoodOriginal = p.originalName &&
            p.originalName.length > 10 &&
            p.originalName.length > p.name.length;

        if (nameIsModelNumber && hasGoodOriginal) {
            // Extract a clean name from originalName
            // Format: "Brand Model Details..." -> "Brand Model"
            let cleanName = p.originalName
                .split(/[,\(（]/)[0]  // Take first part before comma or parenthesis
                .replace(/Wireless Earphones?|Bluetooth|Earbuds?|Headphones?/gi, '')
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 50);  // Limit length

            // If we have verifiedBrand, use it
            if (p.verifiedBrand && !cleanName.toLowerCase().includes(p.verifiedBrand.toLowerCase())) {
                cleanName = `${p.verifiedBrand} ${cleanName}`;
            }

            console.log(`FIX: "${p.name}" -> "${cleanName}"`);
            p.name = cleanName;
            fixedCount++;
        }
    });

    if (fixedCount > 0) {
        fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 4));
        console.log(`\n✅ Fixed ${fixedCount} corrupted product names.`);
    } else {
        console.log('\n✅ No corrupted names found.');
    }

} catch (e) {
    console.error('Error:', e.message);
}
