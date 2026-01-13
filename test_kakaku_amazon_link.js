/**
 * Test: Extract Amazon link from Kakaku.com product detail page
 */
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function extractAmazonFromKakakuPage() {
    console.log('Testing Amazon link extraction from Kakaku.com product page...\n');

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        // Example: AirPods Pro 3 product page
        const productUrl = 'https://kakaku.com/item/K0001709588/';
        console.log(`Testing URL: ${productUrl}\n`);

        await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        const pageTitle = await page.title();
        console.log(`Page Title: ${pageTitle}\n`);

        // Extract product info and Amazon link
        const productData = await page.evaluate(() => {
            const data = {
                name: '',
                price: '',
                amazonLink: null,
                otherShops: []
            };

            // Product name - try multiple selectors
            const nameEl = document.querySelector('.p-item_name, .item_name, h2[itemprop="name"], .p-detail_name');
            data.name = nameEl?.innerText?.trim() || '';

            // Price
            const priceEl = document.querySelector('.p-item_price, .p-price_value, .pricetxt');
            data.price = priceEl?.innerText?.trim() || '';

            // All shop links - look for Amazon specifically
            const shopLinks = document.querySelectorAll('a[href*="amazon"], a[href*="amzn"]');
            shopLinks.forEach(link => {
                const href = link.href;
                if (href.includes('amazon.co.jp') || href.includes('amzn.to')) {
                    if (!data.amazonLink) {
                        data.amazonLink = href;
                    }
                }
            });

            // Also check for shop list/buttons
            const shopButtons = document.querySelectorAll('.p-shop_link a, .shop_link a, [class*="shop"] a');
            shopButtons.forEach(btn => {
                const href = btn.href || '';
                const text = btn.innerText || '';
                if (href.includes('amazon') || text.toLowerCase().includes('amazon')) {
                    if (!data.amazonLink) {
                        data.amazonLink = href;
                    }
                }
                // Record all shop links for debugging
                if (text && href) {
                    data.otherShops.push({ name: text.slice(0, 30), href: href.slice(0, 80) });
                }
            });

            // Check if there's a "ショップを見る" or similar button that leads to shop list
            const allLinks = document.querySelectorAll('a');
            allLinks.forEach(a => {
                const text = a.innerText?.toLowerCase() || '';
                const href = a.href || '';
                if ((text.includes('amazon') || href.includes('amazon')) && !data.amazonLink) {
                    data.amazonLink = href;
                }
            });

            return data;
        });

        console.log('=== Extracted Data ===');
        console.log(`Name: ${productData.name}`);
        console.log(`Price: ${productData.price}`);
        console.log(`Amazon Link: ${productData.amazonLink || 'NOT FOUND'}`);
        console.log(`\nOther shops found (${productData.otherShops.length}):`);
        productData.otherShops.slice(0, 10).forEach(s => {
            console.log(`  - ${s.name}: ${s.href}`);
        });

    } finally {
        await browser.close();
    }
}

extractAmazonFromKakakuPage().catch(e => console.error('Error:', e.message));
