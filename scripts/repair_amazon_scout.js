const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lib/amazon_scout.js');
let content = fs.readFileSync(filePath, 'utf8');

const startAnchor = "async function verifyProductOnAmazon(productName, category = 'wireless-earphones') {";
const endAnchor = "/**\r\n * Use AI to verify";
// Note: endAnchor might vary by newline settings, so let's use a simpler one and careful regex
const endAnchorSimple = "async function verifyProductMatchWithAI";

const startIndex = content.indexOf(startAnchor);
const endIndex = content.indexOf(endAnchorSimple);

if (startIndex === -1 || endIndex === -1) {
    console.error("Anchors not found!");
    console.log("Start:", startIndex, "End:", endIndex);
    process.exit(1);
}

// Find the JSDoc comment before verifyProductMatchWithAI to include in the preserved part
// We want to replace up to the JSDoc start.
const realEndIndex = content.lastIndexOf("/**", endIndex);

const newFunction = `async function verifyProductOnAmazon(productName, category = 'wireless-earphones') {
    console.log(\`   🔍 Verifying on Amazon: "\${productName}"\`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        
        // Warmup (short)
        try {
            await page.goto('https://www.amazon.co.jp/', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {}

        // Search Amazon with exact product name
        const searchUrl = \`https://www.amazon.co.jp/s?k=\${encodeURIComponent(productName)}\`;
        // RELAXED WAIT: Don't fail on timeout if content is loaded
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log(\`      ⚠️ Nav timeout ignored (search)\`));
        
        // Ensure results are present before evaluating
        try {
            await page.waitForSelector('div[data-asin]', { timeout: 10000 });
        } catch (e) {
            console.log(\`      ⚠️ Results selector timeout (continuing anyway)\`);
        }
        await new Promise(r => setTimeout(r, 1000));

        // Find the best matching result
        let result = await page.evaluate((expectedName, catKeywords) => {
            const nodes = document.querySelectorAll('div[data-asin]');
            const expectedLower = expectedName.toLowerCase();

            for (const node of nodes) {
                const asin = node.getAttribute('data-asin');
                if (!asin || asin.length < 5) continue;

                const titleEl = node.querySelector('h2') || node.querySelector('span.a-text-normal');
                const priceEl = node.querySelector('.a-price-whole');
                const imgEl = node.querySelector('img.s-image');
                const ratingEl = node.querySelector('span[aria-label*="5つ星のうち"]');
                const reviewCountEl = node.querySelector('span[aria-label*="個の評価"]');

                if (!titleEl) continue;

                const title = titleEl.innerText.trim();
                const lowerTitle = title.toLowerCase();

                // Check if this result matches our product name
                const nameParts = expectedLower.split(/[\\s\\-\\/\\(\\)]+/).filter(w => w.length > 2);
                const matchedParts = nameParts.filter(word => lowerTitle.includes(word.toLowerCase()));
                const matchRatio = nameParts.length > 0 ? matchedParts.length / nameParts.length : 0;

                // Strong match: >60% of name parts match
                const strongMatch = matchRatio >= 0.6;
                // Weak match: exact name in title
                const weakMatch = lowerTitle.includes(expectedLower);

                if (!strongMatch && !weakMatch) continue;

                // Category validation
                if (!strongMatch) {
                    const hasCategory = catKeywords.some(kw => lowerTitle.includes(kw.toLowerCase()));
                    if (!hasCategory) continue;
                }

                // Exclude junk
                const junkKeywords = ["ケース用", "カバー", "保護", "case for", "cover for", "cable", "ケーブル", "フィルム", "イヤーピース"];
                if (junkKeywords.some(kw => lowerTitle.includes(kw))) continue;

                return {
                    amazonTitle: title,
                    asin: asin,
                    price: priceEl ? \`¥\${priceEl.innerText}\` : null,
                    image: imgEl ? imgEl.src : null,
                    link: \`https://www.amazon.co.jp/dp/\${asin}\`,
                    rating: ratingEl ? parseFloat(ratingEl.getAttribute('aria-label').split('5つ星のうち')[1]) : null,
                    reviewCount: reviewCountEl ? parseInt(reviewCountEl.getAttribute('aria-label').replace(/[^0-9]/g, '')) : 0
                };
            }
            return null;
        }, productName, CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS['wireless-earphones']);

        if (result) {
            console.log(\`      📦 Amazon result: \${result.amazonTitle.slice(0, 60)}...\`);

            // AI Verification
            const isMatch = await verifyProductMatchWithAI(productName, result.amazonTitle);

            if (isMatch) {
                console.log(\`      ✅ AI confirmed: Correct product\`);
                result.name = productName;
                return result; // Return immediately
            } else {
                console.log(\`      ⚠️ AI rejected: Not the same product\`);
                result = null; // Clear result to trigger fallback
            }
        }

        // Fallback: Try searching for model number only
        const modelNumberMatch = productName.match(/[a-zA-Z0-9-]{4,}/g);
        if (modelNumberMatch && !result) {
            const candidates = modelNumberMatch.sort((a, b) => b.length - a.length);
            const bestCandidate = candidates[0];

            if (bestCandidate && bestCandidate !== productName && bestCandidate.length >= 5) {
                console.log(\`      ⚠️ Amazon verification retry: searching for model number "\${bestCandidate}"...\`);

                // REUSE SAME BROWSER PAGE
                // RELAXED WAIT for Home Page + Search
                await page.goto('https://www.amazon.co.jp/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => {});
                await new Promise(r => setTimeout(r, 1000));

                await page.waitForSelector('#twotabsearchtextbox', { timeout: 15000 });
                await page.type('#twotabsearchtextbox', bestCandidate);
                
                try {
                    await Promise.all([
                        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }),
                        page.click('#nav-search-submit-button')
                    ]);
                } catch (e) {
                     console.log(\`      ⚠️ Retry search nav timeout ignored\`);
                }
                await new Promise(r => setTimeout(r, 2000));

                const retryNodes = await page.$$('[data-component-type="s-search-result"]');
                for (const node of retryNodes) {
                    const asin = await node.evaluate(el => el.getAttribute('data-asin'));
                    if (!asin) continue;
                    const title = await node.evaluate(el => el.querySelector('h2')?.innerText.trim());
                    if (!title) continue;

                    if (title.toLowerCase().includes(bestCandidate.toLowerCase())) {
                        console.log(\`      ✅ Retrieval successful with model number: \${title.slice(0, 50)}...\`);
                        const img = await node.evaluate(el => el.querySelector('.s-image')?.src);
                        const price = await node.evaluate(el => el.querySelector('.a-price-whole')?.innerText);
                        
                        return {
                            amazonTitle: title,
                            name: productName,
                            asin: asin,
                            price: price ? \`¥\${price}\` : null,
                            image: img,
                            link: \`https://www.amazon.co.jp/dp/\${asin}\`,
                            rating: null,
                            reviewCount: 0
                        };
                    }
                }
            }
        }

        console.log(\`      ❌ Not found on Amazon\`);
        return null;

    } catch (e) {
        console.error(\`      ❌ Amazon verification error: \${e.message}\`);
        return null;
    } finally {
        if (browser) await browser.close();
    }
}
`;

const newContent = content.substring(0, startIndex) + newFunction + content.substring(realEndIndex);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Fixed amazon_scout.js!");
