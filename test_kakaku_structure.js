/**
 * Test Kakaku.com product structure - check for Amazon links
 */
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function testKakakuStructure() {
    console.log('Analyzing Kakaku.com product structure...');

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        const url = 'https://kakaku.com/kaden/headphones/ranking_2046/';
        console.log(`URL: ${url}\n`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 3000));

        // Get first few products with detailed info
        const products = await page.evaluate(() => {
            const items = [];
            const productBoxes = document.querySelectorAll('[class*="rkgBox"]');

            // Get first 5 products
            Array.from(productBoxes).slice(0, 5).forEach(el => {
                const data = {
                    // Product name
                    name: '',
                    // Product detail page URL (Kakaku.com)
                    kakakuUrl: '',
                    // Price
                    price: '',
                    // Amazon link if available directly
                    amazonLink: '',
                    // All links found in this box
                    allLinks: []
                };

                // Extract name from any link with /item/ in URL
                const itemLink = el.querySelector('a[href*="/item/"]');
                if (itemLink) {
                    data.name = itemLink.innerText?.trim() || '';
                    data.kakakuUrl = itemLink.href || '';
                }

                // Check for Amazon links
                const amazonLinks = el.querySelectorAll('a[href*="amazon"]');
                if (amazonLinks.length > 0) {
                    data.amazonLink = amazonLinks[0].href;
                }

                // Get all links for analysis
                el.querySelectorAll('a').forEach(a => {
                    data.allLinks.push({
                        text: a.innerText?.trim().slice(0, 30) || '',
                        href: a.href?.slice(0, 80) || ''
                    });
                });

                // Price
                const priceEl = el.querySelector('[class*="price"]');
                data.price = priceEl?.innerText?.trim() || '';

                if (data.name) {
                    items.push(data);
                }
            });

            return items;
        });

        console.log('First 5 products structure:\n');
        products.forEach((p, i) => {
            console.log(`\n=== Product ${i + 1} ===`);
            console.log(`Name: ${p.name.slice(0, 50)}`);
            console.log(`Kakaku URL: ${p.kakakuUrl.slice(0, 60)}`);
            console.log(`Price: ${p.price}`);
            console.log(`Amazon Link: ${p.amazonLink || 'NOT FOUND ON RANKING PAGE'}`);
            console.log(`All links (${p.allLinks.length}):`);
            p.allLinks.slice(0, 5).forEach(l => {
                console.log(`  - ${l.text}: ${l.href}`);
            });
        });

    } finally {
        await browser.close();
    }
}

testKakakuStructure().catch(e => console.error('Error:', e.message));
