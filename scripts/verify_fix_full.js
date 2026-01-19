const { scrapeKakakuRanking } = require('./lib/market_research');

async function testFix() {
    console.log("🚀 Testing Smart Redirect Fix with 'Apple AirPods Pro'...");

    // Use searchMode: true to force search results which often have Amazon links
    const results = await scrapeKakakuRanking('Apple AirPods Pro', {
        targetCount: 1,
        maxPages: 1,
        searchMode: true
    });

    console.log("---------------------------------------------------");
    console.log("Final Results:");
    console.log(JSON.stringify(results, null, 2));
}

testFix();
