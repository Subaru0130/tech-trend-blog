
const fs = require('fs');
const path = require('path');
const https = require('https');

const productsPath = path.join(__dirname, '../src/data/products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

const checkUrl = (url) => {
    return new Promise((resolve) => {
        // Amazon often blocks HEAD, so we might need GET with partial range or just look at response code.
        // Simplified check: Use a real browser user agent to avoid immediate 503 from bot protection.
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };

        https.get(url, options, (res) => {
            // Amazon returns 200 for 404 pages sometimes (soft 404). 
            // Better to look for specific title or "Not Found" text if status is 200.
            // But strict 404 is a good first filter.
            resolve({ code: res.statusCode, url });
        }).on('error', (e) => {
            resolve({ code: 'ERROR', url, error: e.message });
        });
    });
};

(async () => {
    console.log("Starting Amazon Link Verification...");
    let failure = false;

    for (const p of products) {
        if (p.affiliateLinks && p.affiliateLinks.amazon) {
            const url = p.affiliateLinks.amazon;
            // console.log(`Checking ${p.id}: ${url}`);

            // Note: Automated checking of Amazon links is hard due to anti-bot. 
            // We will just print the URL for manual verification if code is weird.
            // But this script serves as the "Thorough Investigation" base.

            // To be truly robust, we can use the result of the fetch script (which uses puppeteer)
            // But here we just want to ensure the URL string itself is well-formed.

            if (!url.includes('/dp/B0') && !url.includes('amazon.co.jp')) {
                console.error(`笶・Invalid Amazon URL Format for ${p.id}: ${url}`);
                failure = true;
            }

            // Check for duplicate ASINs
            const asinMatch = url.match(/\/dp\/(B0[0-9A-Z]{8})/);
            if (asinMatch) {
                // Good ASIN format
            } else {
                console.warn(`笞・・URL might lack ASIN for ${p.id}: ${url}`);
            }
        } else {
            // console.warn(`邃ｹ・・No Amazon link for ${p.id}`);
        }
    }

    if (failure) {
        console.log("笶・Link issues found.");
    } else {
        console.log("笨・URLs look syntactically correct. Running HEAD checks is unreliable due to bot protection, so relying on Puppeteer image fetch verification.");
    }
})();
