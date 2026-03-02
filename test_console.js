const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    page.on('console', msg => console.log('HOOKED:', msg.text()));
    await page.goto('https://example.com');
    await page.evaluate(() => { console.log("HELLO FROM EVALUATE"); });
    await browser.close();
})();
