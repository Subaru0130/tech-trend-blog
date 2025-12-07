import puppeteer from 'puppeteer';

async function testYahoo() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const query = "YOLU カームナイトリペア シャンプー 本体 amazon.co.jp";
    await page.goto(`https://search.yahoo.co.jp/search?p=${encodeURIComponent(query)}`);

    // Check if we can find an image in the search result
    // Often Yahoo shows a thumbnail next to the result if it's a product.
    // Or we can try to find an image in the snippet.

    // Save screenshot to see layout
    await page.screenshot({ path: 'debug-yahoo-search.png' });
    console.log("Saved debug-yahoo-search.png");

    await browser.close();
}

testYahoo();
