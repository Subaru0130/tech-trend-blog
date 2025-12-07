import { getHeroImage } from './verify_products.mjs';
import fs from 'fs';
import path from 'path';
import https from 'https';

// Standalone download function
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
    console.log("Fetching Hero Image for: 高級ヘアドライヤー (Stylish/Warm)");
    const imageUrl = await getHeroImage("luxury hair dryer warm interior aesthetic");

    if (imageUrl) {
        console.log("Found URL:", imageUrl);
        const targetPath = path.join(process.cwd(), 'public', 'images', 'hero-dryer.png');
        await download(imageUrl, targetPath);
        console.log("✅ Hero Image Saved to:", targetPath);
    } else {
        console.log("No hero image found.");
    }
}

main();
