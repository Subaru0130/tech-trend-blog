
const { scrapeKakakuRanking } = require('./lib/market_research');
const { scrapeKakakuReviews } = require('./lib/spec_scraper');
const { scrapeProductReviews } = require('./lib/amazon_scout');

// Allow keyword argument or default
const KEYWORD = process.argv[2] || "ワイヤレスイヤホン";

(async () => {
    console.log(`🚀 Starting Production Flow Verification for keyword: "${KEYWORD}"`);
    console.log(`   Mimicking full workflow: Ranking Page -> Product Page -> Reviews`);

    try {
        // 1. Get Top 3 Items from Ranking (this gets name + kakakuUrl + amazon info)
        console.log(`\n📊 1. Fetching Top 3 Items from Kakaku Ranking...`);
        const products = await scrapeKakakuRanking(KEYWORD, {
            startPage: 1,
            maxPages: 1,
            targetCount: 3,
            // We want to force it to stop after finding enough, but scrapeKakakuRanking logic 
            // might fetch more. We'll splice the result.
        });

        const top3 = products.slice(0, 3);
        console.log(`   ✅ Found ${products.length} items, processing Top ${top3.length}...`);

        const results = [];

        // 2. For each item, fetch reviews using the URL (No Search!)
        for (const p of top3) {
            console.log(`\n📦 [Rank ${p.kakakuRank}] ${p.name}`);
            console.log(`   🔗 URL: ${p.kakakuUrl}`);
            if (p.asin) console.log(`   📦 ASIN: ${p.asin}`);

            const itemResult = {
                name: p.name,
                rank: p.kakakuRank,
                kakakuCount: 0,
                amazonCount: 0,
                kakakuStatus: '❌ Fail',
                amazonStatus: '❌ Fail'
            };

            // A. Kakaku Reviews (Direct URL)
            if (p.kakakuUrl) {
                console.log(`   📝 Fetching Kakaku reviews via URL...`);
                try {
                    const kRes = await scrapeKakakuReviews(p.name, p.kakakuUrl, 10);
                    if (kRes && kRes.summary) {
                        itemResult.kakakuCount = kRes.summary.totalFound;
                        itemResult.kakakuStatus = '✅ OK';
                        console.log(`      ✅ Kakaku Reviews: ${kRes.summary.totalFound}`);
                    } else {
                        console.log(`      ⚠️ No reviews found (or error)`);
                    }
                } catch (e) {
                    console.log(`      ❌ Kakaku Error: ${e.message}`);
                }
            } else {
                console.log(`      ⚠️ Skipping Kakaku (No URL)`);
            }

            // B. Amazon Reviews (ASIN)
            if (p.asin) {
                console.log(`   ⭐️ Fetching Amazon reviews via ASIN: ${p.asin}`);
                try {
                    const aRes = await scrapeProductReviews(p.asin, 10);
                    if (aRes && aRes.summary) {
                        itemResult.amazonCount = aRes.summary.totalFound;
                        itemResult.amazonStatus = '✅ OK';
                        console.log(`      ✅ Amazon Reviews: ${aRes.summary.totalFound}`);
                    } else {
                        console.log(`      ⚠️ No reviews found (or blocked)`);
                        itemResult.amazonStatus = '⚠️ 0 Reviews';
                    }
                } catch (e) {
                    console.log(`      ❌ Amazon Error: ${e.message}`);
                    itemResult.amazonStatus = `❌ Err: ${e.message.slice(0, 15)}...`;
                }
            } else {
                console.log(`      ⚠️ Skipping Amazon (No ASIN extracted from ranking)`);
                itemResult.amazonStatus = '⚠️ No ASIN';
            }

            results.push(itemResult);
        }

        // 3. Report
        console.log(`\n\n📢 === FINAL VERIFICATION REPORT ===`);
        console.table(results);

        // Output for simple parsing if needed
        console.log(JSON.stringify(results, null, 2));

    } catch (e) {
        console.error(`❌ Critical Error: ${e.message}`);
    }
})();
