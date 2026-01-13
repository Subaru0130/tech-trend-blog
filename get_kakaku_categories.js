const puppeteer = require('puppeteer');

async function getKakakuCategories() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const allCategories = [];

    // Check multiple category pages
    const categoryPages = [
        'https://kakaku.com/kaden/',
        'https://kakaku.com/camera/',
        'https://kakaku.com/pc/',
        'https://kakaku.com/car_goods/',
        'https://kakaku.com/sports/',
        'https://kakaku.com/baby/',
        'https://kakaku.com/hobby/'
    ];

    for (const url of categoryPages) {
        try {
            console.log(`Checking: ${url}`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(r => setTimeout(r, 2000));

            const categories = await page.evaluate(() => {
                const results = [];
                document.querySelectorAll('a').forEach(a => {
                    const href = a.href || '';
                    // Match patterns like /kaden/freezer/ranking_2115/
                    const match = href.match(/\/(kaden|camera|pc|car_goods|sports|baby|hobby|fashion|watch|house|money)\/([a-z0-9-]+)\/ranking_(\d+)/);
                    if (match) {
                        const name = a.innerText.trim().replace(/\s+/g, '').slice(0, 30);
                        if (name && name.length > 1) {
                            results.push({
                                name: name,
                                section: match[1],
                                path: match[2],
                                code: match[3]
                            });
                        }
                    }
                });
                return results;
            });

            allCategories.push(...categories);
        } catch (e) {
            console.log(`Error on ${url}: ${e.message}`);
        }
    }

    // Remove duplicates
    const unique = [];
    const seen = new Set();
    for (const cat of allCategories) {
        const key = `${cat.section}/${cat.path}/${cat.code}`;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(cat);
        }
    }

    console.log(`\n=== Found ${unique.length} unique categories ===\n`);

    // Output as JavaScript object
    console.log('const KAKAKU_CATEGORY_MAP = {');
    for (const cat of unique) {
        console.log(`    '${cat.name}': { section: '${cat.section}', path: '${cat.path}', code: '${cat.code}' },`);
    }
    console.log('};');

    await browser.close();
}

getKakakuCategories().catch(console.error);
