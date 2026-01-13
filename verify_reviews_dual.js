const { scrapeProductReviews, verifyProductOnAmazon } = require('./scripts/lib/amazon_scout');
const { scrapeKakakuReviews } = require('./scripts/lib/spec_scraper');
const fs = require('fs');

const TESTS = [
    { name: "Sony WF-1000XM5", asin: "B0C33XH59J", category: "wireless-earphones" },
    { name: "Technics EAH-AZ100", asin: null, category: "wireless-earphones" },
    { name: "GTRACING GT002", asin: null, category: "office-chair" },
    { name: "DeLonghi Magnifica S", asin: null, category: "coffee-maker" }
];

async function runTest() {
    console.log("🔍 Starting PDCA Verification with JSON output...");
    const logs = [];

    for (const test of TESTS) {
        let entry = { name: test.name, amazon: null, kakaku: null };
        let targetAsin = test.asin;

        // 1. ASIN Lookup
        if (!targetAsin) {
            try {
                const v = await verifyProductOnAmazon(test.name, test.category);
                if (v && v.asin) targetAsin = v.asin;
            } catch (e) { }
        }

        // 2. Amazon
        if (targetAsin) {
            const reviewUrl = `https://www.amazon.co.jp/product-reviews/${targetAsin}/ref=cm_cr_arp_d_viewopt_sr?ie=UTF8&reviewerType=all_reviews&sortBy=recent&pageNumber=1`;
            const productUrl = `https://www.amazon.co.jp/dp/${targetAsin}`;
            console.log(`      🔗 [Usage Check] Target ASIN: ${targetAsin}`);
            console.log(`      🔗 [Usage Check] Review URL: ${reviewUrl}`);
            console.log(`      🔗 [Usage Check] Fallback URL: ${productUrl}`);

            entry.debug_info = {
                asin: targetAsin,
                review_url_used: reviewUrl,
                product_url_used: productUrl
            };

            try {
                const res = await scrapeProductReviews(targetAsin, 30);
                entry.amazon = {
                    total: res.summary.totalFound,
                    positive: res.positive.length,
                    negative: res.negative.length
                };
            } catch (e) {
                entry.amazon = { error: e.message };
            }
        } else {
            console.log(`      ⚠️ ASIN Lookup Failed for ${test.name}`);
            entry.amazon = "ASIN Not Found";
        }

        // 3. Kakaku
        try {
            const res = await scrapeKakakuReviews(test.name, null, 30);
            if (res) {
                entry.kakaku = {
                    total: res.summary.totalFound,
                    positive: res.positive.length,
                    negative: res.negative.length
                };
            } else {
                entry.kakaku = "Not Found";
            }
        } catch (e) {
            entry.kakaku = { error: e.message };
        }
        logs.push(entry);
    }

    fs.writeFileSync('verification_result.json', JSON.stringify(logs, null, 2));
    console.log("✅ Done.");
}

runTest();
