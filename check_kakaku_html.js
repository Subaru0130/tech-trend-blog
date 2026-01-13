const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    console.log('Navigating to Kakaku product page...');
    await page.goto('https://kakaku.com/item/J0000045151/#tab', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    // Get ALL links on page
    const allLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a')).map(a => ({
            text: (a.innerText || '').trim().slice(0, 60),
            href: a.href || '',
            classes: a.className || ''
        })).filter(l => l.href.includes('shop') || l.text.includes('売り場') || l.text.includes('Amazon'));
    });

    console.log('\n=== ALL Shop/Amazon Related Links ===');
    allLinks.forEach((l, i) => {
        console.log((i + 1) + '. [' + l.classes.slice(0, 30) + '] ' + l.text);
        console.log('   ' + l.href);
    });

    // Save HTML snapshot
    const html = await page.content();
    fs.writeFileSync('kakaku_page_snapshot.html', html);
    console.log('\n✅ Saved page HTML to kakaku_page_snapshot.html');

    // Take screenshot
    await page.screenshot({ path: 'kakaku_page_screenshot.png', fullPage: true });
    console.log('✅ Saved screenshot to kakaku_page_screenshot.png');

    await browser.close();
})();
