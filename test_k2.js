const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://kakaku.com/interior/office-chair/ranking_6608/');
    const items = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a')).map(a => a.className + " | " + a.innerText).filter(t => t.includes('オカムラ') || t.includes('エルゴヒューマン') || t.includes('ハーマンミラー')).slice(0, 10);
    });
    console.log(items);
    await browser.close();
})();
