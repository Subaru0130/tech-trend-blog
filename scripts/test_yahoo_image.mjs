import puppeteer from 'puppeteer';

async function testYahooImage() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });
    const page = await browser.newPage();
    const query = "YOLU カームナイトリペア シャンプー 本体";
    const url = `https://search.yahoo.co.jp/image/search?p=${encodeURIComponent(query)}`;

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Save screenshot
    await page.screenshot({ path: 'debug-yahoo-image-search.png' });

    // Extract first few images
    const images = await page.evaluate(() => {
        // Yahoo Image container selector (reverse engineered guess, need to be robust)
        // Usually grid items.
        const imgs = Array.from(document.querySelectorAll('div.sw-Thumbnail img, .sw-Thumbnail img, img'));
        return imgs.slice(0, 5).map(img => ({
            src: img.src,
            alt: img.alt,
            width: img.naturalWidth,
            height: img.naturalHeight
        }));
    });

    console.log("Found images:", JSON.stringify(images, null, 2));
    await browser.close();
}

testYahooImage();
