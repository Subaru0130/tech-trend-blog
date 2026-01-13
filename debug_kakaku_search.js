const puppeteer = require('puppeteer');

async function debugKakakuSearch(productName) {
    console.log(`Searching Kakaku for: ${productName}`);
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        const searchUrl = `https://kakaku.com/search_results/${encodeURIComponent(productName)}/`;
        console.log(`Goto: ${searchUrl}`);
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        // Screenshot to see what we got
        await page.screenshot({ path: 'debug_kakaku_search.png' });
        console.log("Saved screenshot to debug_kakaku_search.png");

        // debug selectors - capture ALL links to see what matches
        const found = await page.evaluate(() => {
            // Try to find the main results container first
            const main = document.querySelector('#main, .main, #contents, .contents') || document.body;
            const links = Array.from(main.querySelectorAll('a'));

            return links
                .filter(a => a.innerText.trim().length > 5) // Filter tiny links
                .slice(0, 20) // First 20 interesting links
                .map(a => ({
                    text: a.innerText.trim(),
                    href: a.href,
                    className: a.className,
                    parentClass: a.parentElement.className
                }));
        });

        console.log("Found items:", found);

        if (found.length > 0) {
            console.log("Would select:", found[0].href);
        } else {
            console.log("NO ITEMS FOUND via selectors.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

debugKakakuSearch("Technics EAH-AZ100");
