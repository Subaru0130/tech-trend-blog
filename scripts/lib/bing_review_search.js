/**
 * Bing経由でAmazonレビューを検索する
 * Amazonへの直接アクセスがボット検出でブロックされる場合の代替手段
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 * Bing検索でAmazon製品レビューを取得
 * @param {string} productName - 製品名 (例: "Sony WF-1000XM5")
 * @param {string} asin - AmazonのASIN (例: "B0BB1PFCS3")
 * @returns {Promise<object>} - { positive: [], negative: [], summary: {} }
 */
async function searchAmazonReviewsViaBing(productName, asin) {
    console.log(`   🔍 Bing Search: "${productName}" reviews...`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    const reviews = { positive: [], negative: [], situational: [] };
    let totalFound = 0;

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

        // Force Japanese locale
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7'
        });

        // Search queries to try
        const queries = [
            `${productName} Amazon レビュー 口コミ`,
            `${productName} 評価 感想`,
            `site:amazon.co.jp ${productName} レビュー`
        ];

        for (const query of queries) {
            if (totalFound >= 15) break; // Enough reviews

            // Use DuckDuckGo (most lenient bot detection)
            const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&kl=jp-jp`;
            console.log(`      🔗 Searching: ${query.slice(0, 40)}...`);

            try {
                await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
                await new Promise(r => setTimeout(r, 3000)); // DDG needs more time to load

                // Extract review-like content from search results
                const results = await page.evaluate(() => {
                    const snippets = [];

                    // DuckDuckGo result selectors
                    const resultElements = document.querySelectorAll('[data-result], .result, article');

                    resultElements.forEach(el => {
                        // DDG puts snippet in various elements
                        const snippet = el.querySelector('.snippet, .result__snippet, [data-result-snippet]')?.innerText ||
                            el.querySelector('a + span, a + div')?.innerText || '';
                        const title = el.querySelector('h2, .result__title, a[data-testid]')?.innerText || '';

                        // Look for review-like content
                        if (snippet.length > 30) {
                            // More comprehensive sentiment indicators
                            const positiveWords = ['良い', '最高', 'おすすめ', '満足', '気に入', '便利', '快適', '素晴らしい', '高音質', 'クリア', '軽い', '長持ち', 'フィット', '遮音', 'ノイキャン効果', '買って良かった', 'コスパ', '音が良い', '静か'];
                            const negativeWords = ['悪い', '残念', 'イマイチ', '問題', '不満', '期待外れ', '音漏れ', 'うるさい', '痛い', '重い', 'バッテリー', '接続切れ', '不具合', 'ノイズ', '使いにくい', '壊れ'];

                            // Count matches
                            const posCount = positiveWords.filter(w => snippet.includes(w) || title.includes(w)).length;
                            const negCount = negativeWords.filter(w => snippet.includes(w) || title.includes(w)).length;

                            snippets.push({
                                text: snippet.slice(0, 300),
                                title: title.slice(0, 100),
                                posScore: posCount,
                                negScore: negCount
                            });
                        }
                    });

                    return snippets;
                });

                // Categorize results based on scores
                results.forEach(r => {
                    totalFound++;
                    // Debug: show first 3 snippets
                    if (totalFound <= 3) {
                        console.log(`      [DEBUG] snippet: "${r.text.slice(0, 80)}..." pos=${r.posScore} neg=${r.negScore}`);
                    }
                    if (r.posScore > r.negScore && r.posScore > 0) {
                        reviews.positive.push({ text: r.text, title: r.title, rating: 4, body: r.text });
                    } else if (r.negScore > r.posScore && r.negScore > 0) {
                        reviews.negative.push({ text: r.text, title: r.title, rating: 2, body: r.text });
                    } else if (r.posScore > 0 || r.negScore > 0) {
                        reviews.situational.push({ text: r.text, title: r.title, rating: 3, body: r.text });
                    }
                    // If no sentiment detected, also add to situational for now
                    else {
                        reviews.situational.push({ text: r.text, title: r.title, rating: 3, body: r.text });
                    }
                });

                console.log(`      ✅ Found ${results.length} snippets`);

            } catch (e) {
                console.log(`      ⚠️ Search failed: ${e.message}`);
            }

            // Small delay between searches
            await new Promise(r => setTimeout(r, 1000));
        }

        await browser.close();

        console.log(`   ✅ Bing Review Search: ${reviews.positive.length} positive, ${reviews.negative.length} negative, ${reviews.situational.length} neutral`);

        return {
            positive: reviews.positive,
            negative: reviews.negative,
            situational: reviews.situational,
            summary: {
                totalFound,
                source: 'bing_search'
            }
        };

    } catch (e) {
        console.error(`   ❌ Bing Search Error: ${e.message}`);
        if (browser) await browser.close();
        return { positive: [], negative: [], situational: [], summary: { totalFound: 0, source: 'bing_search' } };
    }
}

// Test function
async function test() {
    const result = await searchAmazonReviewsViaBing('Sony WF-1000XM5', 'B0BB1PFCS3');
    console.log('\n=== Results ===');
    console.log('Positive:', result.positive.length);
    console.log('Negative:', result.negative.length);
    console.log('Situational:', result.situational.length);
    if (result.positive.length > 0) {
        console.log('\nSample positive:', result.positive[0].text.slice(0, 100));
    }
}

// Export and test
module.exports = { searchAmazonReviewsViaBing };

// Run test if called directly
if (require.main === module) {
    test();
}
