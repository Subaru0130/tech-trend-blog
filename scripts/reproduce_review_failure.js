const { scrapeProductReviews } = require('./lib/amazon_scout');

async function test() {
    console.log("Testing scrapeProductReviews with ASIN B0FQFQDN6K (AirPods Pro 3)..."); // Using ASIN from logs
    try {
        const result = await scrapeProductReviews('B0FQFQDN6K', 5);
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Test Failed:", e);
    }
}

test();
