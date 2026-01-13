/**
 * Debug Market Research - Step by Step
 */

require('dotenv').config({ path: '.env.local' });
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function debugSearch() {
    const keyword = "ワイヤレスイヤホン 1万円台 おすすめ 2025";

    console.log("🔍 Debug: Testing Bing Search");
    console.log(`Query: ${keyword}`);
    console.log("=".repeat(50));

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(keyword)}&setmkt=ja-JP&setlang=ja`;
        console.log(`URL: ${searchUrl}`);

        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 3000));

        // Get page title to check if we're blocked
        const title = await page.title();
        console.log(`Page Title: ${title}`);

        // Screenshot for debug
        await page.screenshot({ path: 'debug_bing_search.png' });
        console.log("📸 Screenshot saved: debug_bing_search.png");

        // Get results
        const results = await page.evaluate(() => {
            const snippets = [];
            document.querySelectorAll('li.b_algo').forEach(li => {
                const titleEl = li.querySelector('h2');
                const linkEl = li.querySelector('a');
                const snippetEl = li.querySelector('.b_caption p') || li.querySelector('.b_snippet');

                if (titleEl && linkEl) {
                    snippets.push({
                        title: titleEl.innerText,
                        url: linkEl.href,
                        snippet: snippetEl?.innerText || ''
                    });
                }
            });
            return snippets;
        });

        console.log(`\nFound ${results.length} results:`);
        results.slice(0, 5).forEach((r, i) => {
            console.log(`\n${i + 1}. ${r.title}`);
            console.log(`   URL: ${r.url}`);
            console.log(`   Snippet: ${r.snippet.slice(0, 100)}...`);
        });

        await browser.close();

    } catch (e) {
        console.error("Error:", e.message);
        await browser.close();
    }
}

debugSearch().catch(console.error);
