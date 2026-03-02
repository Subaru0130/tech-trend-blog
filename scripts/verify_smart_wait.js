
const { scrapeKakakuRanking } = require('./lib/market_research');

async function verifyFix() {
    console.log('🚀 Verifying Smart Wait with generic search...');

    const options = {
        targetCount: 3, // Check 3 items
        maxPages: 1,
        searchMode: true
    };

    try {
        // Use a broad term that definitely has results
        const products = await scrapeKakakuRanking('Sony イヤホン', options);
        console.log(`✅ Result: Found ${products.length} verified products.`);

        // Check logs manually for "⚡ Smart Wait"
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

verifyFix();
