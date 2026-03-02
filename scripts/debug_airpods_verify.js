
const { scrapeKakakuRanking } = require('./lib/market_research');

async function verifyStock() {
    console.log('🚀 Starting Validation: Searching for AirPods 4...');

    const options = {
        minPrice: 20000,
        keywords: ['AirPods 4'],
        targetCount: 1,
        maxPages: 1,
        searchMode: true
    };

    try {
        const products = await scrapeKakakuRanking('AirPods 4', options);
        console.log('✅ Result:', JSON.stringify(products, null, 2));
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

verifyStock();
