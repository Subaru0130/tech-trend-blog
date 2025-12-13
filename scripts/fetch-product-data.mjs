import { verifyProducts } from './verify_products.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to download image (Copied from generate-post.mjs to ensure standalone function)
async function downloadImage(url, filename) {
    if (!url || !url.startsWith('http')) return null;
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) throw new Error(`Status ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length < 1000) {
            console.warn(`[Imager] Skipped small image (${buffer.length} bytes): ${url}`);
            return null;
        }

        const relativePath = `/images/products/${filename}`;
        const filepath = path.join(process.cwd(), 'public', relativePath);

        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(filepath, buffer);
        console.log(`[Imager] Saved: ${filepath}`);
        return relativePath;
    } catch (error) {
        console.warn(`[Imager] Failed to download ${url}: ${error.message}`);
        return null;
    }
}

async function main() {
    const query = process.argv[2];
    if (!query) {
        console.error("Usage: node scripts/fetch-product-data.mjs <ProductName>");
        process.exit(1);
    }

    console.log(`Fetching data for: ${query}`);
    try {
        // verifyProducts returns array of found items
        const results = await verifyProducts([query]);

        if (results.length === 0) {
            console.error("No product found.");
            process.exit(1);
        }

        const product = results[0];
        console.log("Found Product:", product);

        // Download Image
        if (product.image) {
            const filename = `prod-${product.asin}.jpg`;
            const localPath = await downloadImage(product.image, filename);
            product.localImage = localPath;
        }

        // Output JSON result
        console.log("---JSON_START---");
        console.log(JSON.stringify(product, null, 2));
        console.log("---JSON_END---");

    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

main();
