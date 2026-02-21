const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function searchReviewSummaries(productName) {
    // Switch to Bing to avoid Google's aggressive CAPTCHA
    const query = `${productName} 繝ｬ繝薙Η繝ｼ`;
    console.log(`\n訣 Web Scout: Searching Bing for opinions on "${productName}"...`);

    const browser = await puppeteer.launch({
        headless: true, // Bing is lenient, usually works with headless
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');

        // Bing Search URL
        await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}&setmkt=ja-JP&setlang=ja`, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait a small random amount
        await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));

        // Scrape Snippets (Bing Structure)
        const snippets = await page.evaluate(() => {
            const results = [];
            // Bing generic result container usually 'li.b_algo'
            document.querySelectorAll('li.b_algo').forEach(li => {
                const title = li.querySelector('h2')?.innerText || "";

                // Exclude Amazon/Rakuten results to get "External" opinions
                if (title.includes("Amazon") || title.includes("Rakuten") || title.includes("讌ｽ螟ｩ")) return;

                const snippet = li.querySelector('.b_caption p')?.innerText ||
                    li.querySelector('.b_snippet')?.innerText ||
                    li.innerText.slice(0, 150);

                if (title && snippet) {
                    results.push(`Source: ${title}\nOpinion: ${snippet}`);
                }
            });
            return results.slice(0, 3); // Top 3
        });

        await browser.close();
        if (snippets.length === 0) return "No specific external reviews found. Relying on specs.";

        return snippets.join("\n\n");

    } catch (e) {
        if (browser) await browser.close();
        console.log(`      笞・・Web Scout failed: ${e.message}`);
        return "Search failed.";
    }
}


/**
 * Search for official product specs via Bing
 * Used as fallback when Amazon spec scraping fails
 */
async function searchProductSpecs(productName) {
    const query = `${productName} 蜈ｬ蠑・繧ｹ繝壹ャ繧ｯ 莉墓ｧ・weight battery`;
    console.log(`\n訣 Web Scout: Searching Bing for specs of "${productName}"...`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');

        await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}&setmkt=ja-JP&setlang=ja`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        const snippets = await page.evaluate(() => {
            const results = [];
            document.querySelectorAll('li.b_algo').forEach(li => {
                const title = li.querySelector('h2')?.innerText || "";
                const snippet = li.querySelector('.b_caption p')?.innerText ||
                    li.querySelector('.b_snippet')?.innerText ||
                    li.innerText.slice(0, 200);

                // Prioritize official sites or tech specs
                if (title && snippet) {
                    results.push(`[Source: ${title}]\n${snippet}`);
                }
            });
            return results.slice(0, 5); // Top 5
        });

        await browser.close();
        if (snippets.length === 0) return "";

        console.log(`      笨・Found ${snippets.length} spec-related snippets.`);
        return snippets.join("\n\n");

    } catch (e) {
        if (browser) await browser.close();
        console.log(`      笞・・Spec Search failed: ${e.message}`);
        return "";
    }
}

module.exports = { searchReviewSummaries, searchProductSpecs };
