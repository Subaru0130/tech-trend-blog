import fs from 'fs';
import path from 'path';
import https from 'https';

// Helper: Download File
function download(url, filename) {
    return new Promise((resolve, reject) => {
        // Ensure directory exists
        const dir = path.join(process.cwd(), 'public', 'images');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const filepath = path.join(dir, filename);
        const file = fs.createWriteStream(filepath);

        https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                // Handle Redirects (Unsplash often redirects)
                download(response.headers.location, filename).then(resolve).catch(reject);
                return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { }); // Delete failed file
            reject(err);
        });
    });
}

// Main
async function main() {
    // 1. Water Purifier
    console.log("Downloading High-Res Water Purifier Image...");
    // Verified High-Res Unsplash Image (Modern Kitchen/Water)
    await download("https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=2670&auto=format&fit=crop", "hero-water.png");

    // 2. Hair Dryer
    console.log("Downloading High-Res Hair Dryer Image...");
    // Verified High-Res Unsplash Image (Beauty/Salon/Hair)
    await download("https://images.unsplash.com/photo-1522337360705-8754d3d700e8?q=80&w=2670&auto=format&fit=crop", "hero-dryer.png");

    console.log("✅ High-Resolution Hero Images Updated (Unsplash)");
}

main();
