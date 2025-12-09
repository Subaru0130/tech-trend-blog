import fs from 'fs';
import path from 'path';
import https from 'https';
import { url } from 'inspector';

// Helper: Download File with User-Agent and Redirect Handling
function download(url, filename) {
    return new Promise((resolve, reject) => {
        const dir = path.join(process.cwd(), 'public', 'images');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const filepath = path.join(dir, filename);
        const file = fs.createWriteStream(filepath);

        const request = https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }, (response) => {
            // Handle Redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                download(response.headers.location, filename).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                fs.unlink(filepath, () => { });
                reject(new Error(`Failed to download: Status Code ${response.statusCode}`));
                return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close(() => {
                    // Check file size
                    const stats = fs.statSync(filepath);
                    if (stats.size < 1000) { // Less than 1KB is suspicious
                        fs.unlinkSync(filepath);
                        reject(new Error(`Downloaded file is too small (${stats.size} bytes). Likely an error page.`));
                    } else {
                        resolve();
                    }
                });
            });
        });

        request.on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
}

// Main
async function main() {
    try {
        // 1. Water Purifier
        console.log("Downloading High-Res Water Purifier Image...");
        // Updated to a known reliable Unsplash ID (Glass of water)
        await download("https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=1600&auto=format&fit=crop", "hero-water.png");

        // 2. Hair Dryer
        console.log("Downloading High-Res Hair Dryer Image...");
        // Updated to a known reliable Unsplash ID (Hair salon/tools) - avoiding the broken 404 link
        await download("https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1600&auto=format&fit=crop", "hero-dryer.png");

        console.log("✅ High-Resolution Hero Images Updated (Unsplash)");
    } catch (e) {
        console.error("❌ Error downloading images:", e.message);
        process.exit(1);
    }
}

main();
