
const fs = require('fs');
const path = require('path');
const { scoutAmazonProducts } = require('./lib/amazon_scout');

async function repairImages() {
    console.log("肌 Starting Image Repair Operation...");

    const productsPath = path.join(__dirname, '../src/data/products.json');
    let products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    let updateCount = 0;

    // Filter for targets
    const targets = products.filter(p => p.image && p.image.includes('kakaku.k-img'));

    console.log(`搭 Found ${targets.length} items with Low-Quality (Kakaku) images.`);

    for (const product of targets) {
        console.log(`\n剥 Processing: ${product.name} (${product.id})...`);

        try {
            // Search Amazon for this product
            // Use ASIN if available for precision
            const query = product.asin || product.name;
            console.log(`   Searching Amazon for: ${query}`);

            const results = await scoutAmazonProducts(query, 1);

            if (results && results.length > 0) {
                // Find the best match. 
                // If we searched by ASIN, the first result should be it.
                // If by name, we might need to check.
                // amazon_scout usually returns items. Use the first one.
                const bestMatch = results[0];

                if (bestMatch && bestMatch.image && bestMatch.image.includes('media-amazon.com')) {
                    console.log(`   笨・Found High-Res Image: ${bestMatch.image}`);

                    // Update the product in the MAIN list (by reference/index)
                    const index = products.findIndex(p => p.id === product.id);
                    if (index !== -1) {
                        products[index].image = bestMatch.image;
                        updateCount++;
                    }
                } else {
                    console.log("   笶・No Amazon image found in search results.");
                }
            } else {
                console.log("   笶・No search results found.");
            }

            // Be nice to Amazon
            await new Promise(r => setTimeout(r, 2000));

        } catch (e) {
            console.error(`   笞・・Error processing ${product.name}: ${e.message}`);
        }
    }

    if (updateCount > 0) {
        console.log(`\n沈 Saving ${updateCount} updates to products.json...`);
        fs.writeFileSync(productsPath, JSON.stringify(products, null, 4), 'utf8');
        console.log("笨ｨ database updated.");
    } else {
        console.log("\n笞・・No updates were made.");
    }
}

repairImages();
