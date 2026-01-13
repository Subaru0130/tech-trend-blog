const { scrapeAmazonProductSpecs } = require('./scripts/lib/amazon_scout');

(async () => {
    console.log("🛋️ Testing Furniture Image Extraction (Generic Check)...");

    // ASIN for a Sofa or Chair (Generic Furniture)
    // B08X4LCNM9 is a generic Iris Ohyama Sofa/Chair or similar
    // Let's use a very standard one: B07W5JK7C1 (GTRACING) or B08CZ5F7F6 (Iris Ohyama Desk)
    const ASIN = "B07W5JK7C1"; // GTRACING Gaming Chair

    console.log(`Target ASIN: ${ASIN}`);

    try {
        const result = await scrapeAmazonProductSpecs(ASIN);

        if (result && result.image) {
            console.log("\n--- RESULT ---");
            console.log(`Image URL: ${result.image}`);
            if (result.image.includes('.jpg')) {
                console.log("✅ Image extracted successfully.");
            }
            // Check against typical high-res patterns (usually lacks the ._AC_... resize parameters if perfect, or is just large)
            if (!result.image.includes('_AC_SY') && !result.image.includes('_AC_SX')) {
                console.log("✅ Likely High-Res (No resize params).");
            } else {
                console.log("⚠️ Contains resize params, might be medium res, but check size.");
            }
        } else {
            console.error("❌ No image found / Scrape failed.");
        }
    } catch (e) {
        console.error("❌ Fatal Error:", e);
    }
})();
