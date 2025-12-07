import puppeteer from 'puppeteer';

async function main() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Target the Hair Dryer page specifically
    const url = 'http://localhost:3000/posts/2025-12-07-%E6%9C%80%E6%96%B0%E3%83%98%E3%82%A2%E3%83%89%E3%83%A9%E3%82%A4%E3%83%A4%E3%83%BC';

    console.log(`Checking ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Check for Hero Image
    // The hero image was: <div className="rounded-2xl ..."><img ...>
    // We expect it to be gone.

    const heroImage = await page.$('header img');

    if (heroImage) {
        console.error("❌ Hero Image FOUND! (Test Failed)");
        // Log src to be sure
        const src = await page.evaluate(el => el.src, heroImage);
        console.log("Image Src:", src);
    } else {
        console.log("✅ Hero Image NOT found. (Test Passed)");
    }

    // Check for Quick Summary existence
    const summary = await page.$('.bg-gradient-to-br'); // QuickSummary usually has this or similar class, or check text
    const summaryText = await page.evaluate(() => document.body.innerText.includes('編集部コメント')); // Check context

    if (summaryText) {
        console.log("✅ Editor Comment found (context confirmed).");
    }

    await page.screenshot({ path: 'verification-no-hero.png', fullPage: false });
    console.log("Screenshot saved.");

    await browser.close();
}

main();
