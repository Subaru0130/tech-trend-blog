import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

export async function verifyProducts(productNames) {
    const verifiedProducts = [];

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    for (const name of productNames) {
        try {
            console.log(`Verifying: ${name}...`);

            // 1. Find ASIN via Yahoo Web Search
            const webSearchUrl = `https://search.yahoo.co.jp/search?p=${encodeURIComponent(name + ' amazon.co.jp')}`;
            await page.goto(webSearchUrl, { waitUntil: 'networkidle2' });

            const asinResult = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a'));
                for (const link of links) {
                    const href = link.href;
                    if (href && href.includes('amazon.co.jp') && (href.includes('/dp/') || href.includes('/gp/product/'))) {
                        const match = href.match(/\/(?:dp|gp\/product)\/(B0[A-Z0-9]{8})/);
                        if (match) {
                            return {
                                asin: match[1],
                                url: href,
                                title: link.innerText
                            };
                        }
                    }
                }
                return null;
            });

            if (asinResult) {
                console.log(`✅ Verified ASIN: ${name} -> ${asinResult.asin}`);

                // 2. Find Image via Yahoo IMAGE Search (Robust Fallback)
                let yahooImage = null;
                const imgSearchUrl = `https://search.yahoo.co.jp/image/search?p=${encodeURIComponent(name)}`;
                try {
                    await page.goto(imgSearchUrl, { waitUntil: 'networkidle2' });
                    yahooImage = await page.evaluate(() => {
                        // Select first result that looks like a product image
                        const imgs = Array.from(document.querySelectorAll('div.sw-Thumbnail img, .sw-Thumbnail img, img'));
                        // Filter out tiny icons if possible
                        for (const img of imgs) {
                            if (img.src && img.src.startsWith('http') && img.naturalWidth > 50) {
                                return img.src;
                            }
                        }
                        return null;
                    });
                } catch (e) {
                    console.warn(`Yahoo Image Search failed for ${name}: ${e.message}`);
                }

                // 3. Try to get Amazon High-Res (Best Effort)
                let amazonImage = null;
                let finalTitle = asinResult.title;

                try {
                    await page.goto(asinResult.url, { waitUntil: 'domcontentloaded', timeout: 10000 });
                    const details = await page.evaluate(() => {
                        const pageTitle = document.title;
                        if (pageTitle.includes('Robot Check') || pageTitle.includes('Captcha')) return { error: 'Blocked' };

                        const titleEl = document.querySelector('#productTitle');
                        const imgWrapper = document.querySelector('#landingImage, #imgTagWrapperId img, #main-image');

                        let img = null;
                        if (imgWrapper) {
                            const dynamicData = imgWrapper.getAttribute('data-a-dynamic-image');
                            if (dynamicData) {
                                try { img = Object.keys(JSON.parse(dynamicData))[0]; } catch (e) { }
                            }
                            if (!img) img = imgWrapper.src;
                        }

                        return { title: titleEl ? titleEl.innerText.trim() : null, image: img };
                    });

                    if (details.image) amazonImage = details.image;
                    if (details.title) finalTitle = details.title;

                } catch (e) {
                    console.warn(`Amazon visit failed for ${name}`);
                }

                // Clean Title
                finalTitle = finalTitle
                    .replace(/【.*?】/g, '')
                    .replace(/Amazon\.co\.jp限定/g, '')
                    .replace(/本体/g, '')
                    .replace(/詰め替え/g, '')
                    .replace(/セット/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();

                // Final Decision: Prefer Amazon High-Res, then Yahoo Thumbnail
                // If Amazon scraped title contains "Robot", it might be bad, but we sanitized it.

                const bestImage = amazonImage || yahooImage;

                if (bestImage) {
                    verifiedProducts.push({
                        originalName: name,
                        verifiedName: finalTitle,
                        asin: asinResult.asin,
                        url: asinResult.url,
                        image: bestImage
                    });
                } else {
                    console.warn(`❌ No Image found for ${name}`);
                }

            } else {
                console.warn(`❌ ASIN Not found for ${name}`);
            }

            await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));

        } catch (e) {
            console.error(`Error verifying ${name}: ${e.message}`);
        }
    }

    await browser.close();
    return verifiedProducts;
}

// ... existing code ...

// Safe Hero Image Dictionary
// Maps keywords to verified Unsplash Source URLs (or specific IDs)
const SAFE_HERO_IMAGES = {
    'hair dryer': [
        'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1600&auto=format&fit=crop', // Salon/Tools (Bright & Colorful)
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1600&auto=format&fit=crop', // Salon/Woman (Bright)
    ],
    'water purifier': [
        'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=1600&auto=format&fit=crop', // Glass of water (Bright/Blue)
    ],
    'shampoo': [
        'https://images.unsplash.com/photo-1585232351009-31a316b186bf?q=80&w=1600&auto=format&fit=crop', // Pastel Bottles (Colorful)
        'https://images.unsplash.com/photo-1556228720-191739b83b38?q=80&w=1600&auto=format&fit=crop'  // Spa (Warm)
    ],
    'shower head': [
        'https://images.unsplash.com/photo-1517646331032-9e8563c523a1?q=80&w=1600&auto=format&fit=crop', // Bathroom (Bright)
    ],
    'default': [
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1600&auto=format&fit=crop' // Office/Bright (Replaced dark tech)
    ]
};

export async function getHeroImage(topic) {
    console.log(`Getting Safe Hero Image for topic: ${topic}...`);

    // Normalize topic
    const lowerTopic = topic.toLowerCase();

    let candidates = SAFE_HERO_IMAGES['default'];

    if (lowerTopic.includes('dryer') || lowerTopic.includes('ドライヤー')) {
        candidates = SAFE_HERO_IMAGES['hair dryer'];
    } else if (lowerTopic.includes('water') || lowerTopic.includes('purifier') || lowerTopic.includes('浄水')) {
        candidates = SAFE_HERO_IMAGES['water purifier'];
    } else if (lowerTopic.includes('shampoo') || lowerTopic.includes('シャンプー')) {
        candidates = SAFE_HERO_IMAGES['shampoo'];
    }

    // Pick random candidate to vary slightly if multiple exist
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    console.log(`✅ Selected Verified Image: ${selected}`);
    return selected;
}

// Standalone test
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const testProducts = [
        "アンドハニー ディープモイスト",
        "YOLU カームナイトリペア"
    ];
    // verifyProducts(testProducts).then(res => console.log(JSON.stringify(res, null, 2)));
    getHeroImage("ヘアドライヤー").then(url => console.log("Hero URL:", url));
}
