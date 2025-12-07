import { getHeroImage } from './verify_products.mjs';
import { downloadImage } from './generate-post.mjs'; // Trying to reuse or just reimplement simple download
import fs from 'fs';
import path from 'path';
import https from 'https';

// Simple download function if not importing
async function download(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            if (res.statusCode !== 200) {
                res.resume();
                reject(new Error(`Status ${res.statusCode}`));
                return;
            }
            const stream = fs.createWriteStream(filepath);
            res.pipe(stream);
            stream.on('finish', () => {
                stream.close();
                resolve(true);
            });
            stream.on('error', reject);
        }).on('error', reject);
    });
}

async function main() {
    console.log("Fetching Hero Image for: 高級ヘアドライヤー");
    // Search for a stylish, high-quality image
    const imageUrl = await getHeroImage("premium hair dryer lifestyle aesthetic");

    if (imageUrl) {
        console.log("Found URL:", imageUrl);
        // Save as hero-dryer.png to fix the thumbnail
        const targetPath = path.join(process.cwd(), 'public', 'images', 'hero-dryer.png');
        await download(imageUrl, targetPath);
        console.log("✅ Hero Image Saved!");
    } else {
        console.log("No hero image found.");
    }
}

main();
