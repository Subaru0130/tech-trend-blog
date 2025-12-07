import { getHeroImage } from './verify_products.mjs';
import fs from 'fs';
import path from 'path';
import https from 'https';

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
    console.log("Fetching Hero Image for Hair Dryer...");
    try {
        const url = await getHeroImage("ヘアドライヤー");
        if (url) {
            const targetPath = path.join(process.cwd(), 'public', 'images', 'hero-dryer.png');
            console.log(`Downloading ${url} to ${targetPath}`);
            await download(url, targetPath);
            console.log("✅ Hero Image Saved!");
        } else {
            console.error("❌ No Hero Image found.");
        }
    } catch (e) {
        console.error(e);
    }
}

main();
