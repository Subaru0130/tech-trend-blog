import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsPath = path.join(__dirname, '../src/data/products.json');
const targetDir = path.join(__dirname, '../public/images/products');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

async function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(targetDir, filename);
        const file = fs.createWriteStream(filepath);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Status ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(filepath);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
}

async function localizeImages() {
    console.log("📦 Localizing Images in products.json...");
    
    const rawData = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(rawData);
    let changed = false;

    for (const product of products) {
        if (product.image && product.image.startsWith('http')) {
            // It's an external link
            console.log(`Downloading for ${product.name}: ${product.image}`);
            
            try {
                // Generate filename from ID or ASIN
                const ext = path.extname(product.image).split('?')[0] || '.jpg';
                const filename = `prod-${product.id}${ext}`;
                const relativePath = `/images/products/${filename}`;
                
                await downloadImage(product.image, filename);
                
                // Update JSON
                product.image = relativePath;
                changed = true;
                console.log(`-> Saved to ${relativePath}`);
                
            } catch (e) {
                console.error(`❁EFailed to download ${product.image}: ${e.message}`);
            }
        }
    }

    if (changed) {
        fs.writeFileSync(productsPath, JSON.stringify(products, null, 4));
        console.log("✁Eproducts.json updated with local paths.");
    } else {
        console.log("✨ All images are already local.");
    }
}

localizeImages();
