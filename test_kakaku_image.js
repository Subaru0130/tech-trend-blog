const { scrapeKakakuRanking } = require('./scripts/lib/market_research');

(async () => {
    console.log("🧪 Testing Kakaku Image Extraction...");
    try {
        const products = await scrapeKakakuRanking("ワイヤレスイヤホン", { maxPages: 1, targetCount: 5 });

        console.log(`\n📦 Found ${products.length} products:`);
        let successCount = 0;

        products.forEach((p, i) => {
            const hasImage = p.image && (p.image.startsWith('http') || p.image.startsWith('https'));
            if (hasImage) successCount++;

            console.log(`\nItem ${i + 1}: ${p.name.slice(0, 30)}...`);
            console.log(`   Price: ¥${p.price}`);
            console.log(`   Image: ${hasImage ? "✅ " + p.image : "❌ MISSING"}`);
        });

        if (successCount > 0) {
            console.log(`\n✅ TEST PASSED: Extracted images for ${successCount}/${products.length} products.`);
            process.exit(0);
        } else {
            console.error("\n❌ TEST FAILED: No valid images found.");
            process.exit(1);
        }

    } catch (e) {
        console.error("❌ Error:", e);
        process.exit(1);
    }
})();
