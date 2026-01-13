/**
 * Save scraped content to file to check encoding
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function test() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const query = "ワイヤレスイヤホン 1万円台 おすすめ";
    await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}&setmkt=ja-JP`, {
        waitUntil: 'domcontentloaded'
    });
    await new Promise(r => setTimeout(r, 3000));

    const snippets = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('li.b_algo').forEach(li => {
            const title = li.querySelector('h2')?.innerText || '';
            const snippet = li.querySelector('.b_caption p')?.innerText || '';
            if (title) results.push({ title, snippet });
        });
        return results.slice(0, 5);
    });

    await browser.close();

    // Save to file with UTF-8 BOM for proper encoding
    const content = JSON.stringify(snippets, null, 2);
    fs.writeFileSync('scraped_content.json', '\ufeff' + content, 'utf8');
    console.log('Saved to scraped_content.json');
    console.log('Snippet count:', snippets.length);
}

test().catch(console.error);
