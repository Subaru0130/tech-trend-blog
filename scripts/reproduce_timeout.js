
const { scrapeKakakuRanking } = require('./lib/market_research');

async function verifyStock() {
    console.log('🚀 Starting Reproduction: Searching for Sony WF-1000XM5...');

    const options = {
        minPrice: 30000,
        keywords: ['WF-1000XM5'],
        targetCount: 1,
        maxPages: 1,
        searchMode: true
    };

    try {
        const products = await scrapeKakakuRanking('WF-1000XM5', options);
        console.log('✁EResult:', JSON.stringify(products, null, 2));
    } catch (error) {
        console.error('❁EError:', error);
    }
}

verifyStock();
