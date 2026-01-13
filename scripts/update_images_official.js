const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PRODUCTS = [
    {
        name: 'earfun-air-pro-3',
        url: 'https://www.myearfun.com/headphones/earfun-air-pro-3-black',
        selector: 'body', // Capture full body or specific element if known
        output: 'public/images/products/prod-earfun-air-pro-3.png'
    },
    {
        name: 'soundpeats-air4-pro',
        url: 'https://soundpeats.com/products/air4-pro',
        selector: 'body',
        output: 'public/images/products/prod-soundpeats-air4-pro.png'
    },
    {
        name: 'soundcore-life-p3',
        url: 'https://www.ankerjapan.com/products/a3939',
        selector: 'body',
        output: 'public/images/products/prod-soundcore-life-p3.png'
    }
];

(async () => {
    console.log('Starting Image Update Process...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    for (const p of PRODUCTS) {
        console.log(`Processing: ${p.name}`);
        try {
            await page.goto(p.url, { waitUntil: 'networkidle0', timeout: 60000 });

            // Basic screenshot of the visible area or specific element
            // For now, we capture the viewport which usually contains the hero image
            const outputPath = path.resolve(__dirname, '..', p.output);
            await page.screenshot({ path: outputPath });
            console.log(`  -> Saved to ${p.output}`);
        } catch (e) {
            console.error(`  -> Failed: ${e.message}`);
        }
    }

    await browser.close();
    console.log('Done.');
})();
