
const { scrapeKakakuRanking } = require('./lib/market_research');
const { scrapeKakakuReviews } = require('./lib/spec_scraper');
const { scrapeProductReviews } = require('./lib/amazon_scout');

// Allow keyword argument or default
const KEYWORD = process.argv[2] || "繝ｯ繧､繝､繝ｬ繧ｹ繧､繝､繝帙Φ";

(async () => {
    console.log(`噫 Starting Production Flow Verification for keyword: "${KEYWORD}"`);
    console.log(`   Mimicking full workflow: Ranking Page -> Product Page -> Reviews`);

    try {
        // 1. Get Top 3 Items from Ranking (this gets name + kakakuUrl + amazon info)
        console.log(`\n投 1. Fetching Top 3 Items from Kakaku Ranking...`);
        const products = await scrapeKakakuRanking(KEYWORD, {
            startPage: 1,
            maxPages: 1,
            targetCount: 3,
            // We want to force it to stop after finding enough, but scrapeKakakuRanking logic 
            // might fetch more. We'll splice the result.
        });

        const top3 = products.slice(0, 3);
        console.log(`   笨・Found ${products.length} items, processing Top ${top3.length}...`);

        const results = [];

        // 2. For each item, fetch reviews using the URL (No Search!)
        for (const p of top3) {
            console.log(`\n逃 [Rank ${p.kakakuRank}] ${p.name}`);
            console.log(`   迫 URL: ${p.kakakuUrl}`);
            if (p.asin) console.log(`   逃 ASIN: ${p.asin}`);

            const itemResult = {
                name: p.name,
                rank: p.kakakuRank,
                kakakuCount: 0,
                amazonCount: 0,
                kakakuStatus: '笶・Fail',
                amazonStatus: '笶・Fail'
            };

            // A. Kakaku Reviews (Direct URL)
            if (p.kakakuUrl) {
                console.log(`   統 Fetching Kakaku reviews via URL...`);
                try {
                    const kRes = await scrapeKakakuReviews(p.name, p.kakakuUrl, 10);
                    if (kRes && kRes.summary) {
                        itemResult.kakakuCount = kRes.summary.totalFound;
                        itemResult.kakakuStatus = '笨・OK';
                        console.log(`      笨・Kakaku Reviews: ${kRes.summary.totalFound}`);
                    } else {
                        console.log(`      笞・・No reviews found (or error)`);
                    }
                } catch (e) {
                    console.log(`      笶・Kakaku Error: ${e.message}`);
                }
            } else {
                console.log(`      笞・・Skipping Kakaku (No URL)`);
            }

            // B. Amazon Reviews (ASIN)
            if (p.asin) {
                console.log(`   箝撰ｸ・Fetching Amazon reviews via ASIN: ${p.asin}`);
                try {
                    const aRes = await scrapeProductReviews(p.asin, 10);
                    if (aRes && aRes.summary) {
                        itemResult.amazonCount = aRes.summary.totalFound;
                        itemResult.amazonStatus = '笨・OK';
                        console.log(`      笨・Amazon Reviews: ${aRes.summary.totalFound}`);
                    } else {
                        console.log(`      笞・・No reviews found (or blocked)`);
                        itemResult.amazonStatus = '笞・・0 Reviews';
                    }
                } catch (e) {
                    console.log(`      笶・Amazon Error: ${e.message}`);
                    itemResult.amazonStatus = `笶・Err: ${e.message.slice(0, 15)}...`;
                }
            } else {
                console.log(`      笞・・Skipping Amazon (No ASIN extracted from ranking)`);
                itemResult.amazonStatus = '笞・・No ASIN';
            }

            results.push(itemResult);
        }

        // 3. Report
        console.log(`\n\n討 === FINAL VERIFICATION REPORT ===`);
        console.table(results);

        // Output for simple parsing if needed
        console.log(JSON.stringify(results, null, 2));

    } catch (e) {
        console.error(`笶・Critical Error: ${e.message}`);
    }
})();
