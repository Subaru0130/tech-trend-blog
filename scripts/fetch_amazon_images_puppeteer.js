
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Products list - Updated with Verified Lineup
const PRODUCTS = [
    { name: 'prod-sony-wf-1000xm5.jpg', url: 'https://www.amazon.co.jp/dp/B0CBKQZXT7' },
    { name: 'prod-apple-airpods-pro-2.jpg', url: 'https://www.amazon.co.jp/dp/B0CHXVBQHR' },
    { name: 'prod-bose-qc-ultra-earbuds.jpg', url: 'https://www.amazon.co.jp/dp/B0CFY6MWMZ' },
    { name: 'prod-earfun-air-pro-4.jpg', url: 'https://www.amazon.co.jp/dp/B0FWCQ7PPS' },
    { name: 'prod-soundcore-p40i.jpg', url: 'https://www.amazon.co.jp/dp/B0CP4RLMDB' }
];

const MIN_SIZE_BYTES = 15000; // 15KB minimum. 6KB is likely a tracking pixel or thumbnail.

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        const req = https.get(url, (response) => {
            if (response.statusCode !== 200) {
                fs.unlink(filepath, () => { });
                reject(new Error(`Status ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                // Check size
                const stats = fs.statSync(filepath);
                if (stats.size < MIN_SIZE_BYTES) {
                    fs.unlinkSync(filepath);
                    reject(new Error(`File too small: ${stats.size} bytes`));
                } else {
                    resolve();
                }
            });
        });
        req.on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
};

(async () => {
    console.log('Starting Robust Amazon Image Fetch (Screenshot Fallback Mode)...');

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,1080']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    for (const p of PRODUCTS) {
        console.log(`\nProcessing: ${p.name} (${p.url})`);
        const outputPath = path.resolve(__dirname, '..', 'public/images/products', p.name);

        try {
            await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Wait for main image container
            const imgSelector = '#landingImage, #imgTagWrapperId img';
            await page.waitForSelector(imgSelector, { timeout: 10000 }).catch(() => console.log("  -> Main image selector timeout, trying generic..."));

            let success = false;
            let imgUrl = null;

            // Strategy 1: High-Res URL Extraction
            imgUrl = await page.evaluate(() => {
                const img = document.querySelector('#landingImage');
                if (img && img.getAttribute('data-a-dynamic-image')) {
                    const data = JSON.parse(img.getAttribute('data-a-dynamic-image'));
                    // Return largest key
                    const keys = Object.keys(data);
                    return keys[keys.length - 1];
                }
                return img ? img.src : null;
            });

            if (imgUrl) {
                console.log(`  -> Trying Download: ${imgUrl}`);
                try {
                    await downloadImage(imgUrl, outputPath);
                    console.log('  -> Download Success.');
                    success = true;
                } catch (err) {
                    console.warn(`  -> Download Failed/Too Small: ${err.message}. Switching to Screenshot.`);
                }
            }

            // Strategy 2: Element Screenshot (Fallback for "Loophole-Free")
            if (!success) {
                console.log('  -> Fallback: Taking Element Screenshot...');
                const element = await page.$(imgSelector);
                if (element) {
                    await element.screenshot({ path: outputPath, type: 'jpeg', quality: 90 });
                    success = true;
                    console.log('  -> Screenshot Saved.');
                } else {
                    console.error('  -> Screenshot Failed: Element not found.');
                }
            }

            // Final Verification
            if (fs.existsSync(outputPath)) {
                const size = fs.statSync(outputPath).size;
                console.log(`  -> Final File Size: ${size} bytes`);
            } else {
                console.error(`  -> FATAL: File not created for ${p.name}`);
            }

        } catch (e) {
            console.error(`  -> Error: ${e.message}`);
        }
    }

    await browser.close();
    console.log('\nDone.');
})();
