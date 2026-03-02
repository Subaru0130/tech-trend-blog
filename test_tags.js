const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto('https://kakaku.com/interior/office-chair/ranking_6608/');
    const tags = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('[class*="rkgBoxLink"], .rkgBoxLink'));
        return els.map(el => el.tagName + "." + el.className);
    });
    console.log("Matching elements:", tags.slice(0, 5));
    await browser.close();
})();
