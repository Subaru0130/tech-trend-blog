/**
 * Quick test for Kakaku.com with correct URL
 */
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testKakaku() {
    console.log('Testing Kakaku.com with correct URL...');

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        // User-confirmed correct URL
        const url = 'https://kakaku.com/kaden/headphones/ranking_2046/';
        console.log(`URL: ${url}`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 3000));

        // Get page title
        const title = await page.title();
        console.log(`Page title: ${title}`);

        // Check if it's an error page
        const isError = await page.evaluate(() => {
            const h1 = document.querySelector('h1');
            return h1 && h1.innerText.includes('見つかりません');
        });
        console.log(`Is error page: ${isError}`);

        if (!isError) {
            // Try various selectors
            const selectors = [
                '.rkgBoxList .rkgBox',
                '.p-result_item',
                '.c-rkgitem',
                '.p-rkglist_item',
                'a[href*="/item/"]',
                '.p-list_item',
                '[class*="rkgBox"]',
                '[class*="rkgitem"]',
                '[class*="ranking"] li'
            ];

            for (const selector of selectors) {
                const count = await page.$$eval(selector, els => els.length).catch(() => 0);
                if (count > 0) {
                    console.log(`✅ Selector "${selector}": ${count} elements`);

                    // Get first few product names
                    const names = await page.$$eval(selector, els =>
                        els.slice(0, 3).map(el => {
                            const a = el.querySelector('a');
                            return a ? a.innerText.trim().slice(0, 50) : '';
                        }).filter(n => n)
                    ).catch(() => []);
                    if (names.length > 0) {
                        console.log(`   Products: ${names.join(' | ')}`);
                    }
                }
            }
        }

    } finally {
        await browser.close();
    }
}

testKakaku().catch(e => console.error('Error:', e.message));
