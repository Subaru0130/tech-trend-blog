const { scoutAmazonProducts } = require('./scripts/lib/amazon_scout');

(async () => {
    console.log("Running Test Scout...");
    // Use the exact failing keyword
    const items = await scoutAmazonProducts("ワイヤレスイヤホン", 10);
    console.log("Items found:", items.length);
    if (items.length > 0) {
        console.log("First Item:", items[0]);
    }
})();
