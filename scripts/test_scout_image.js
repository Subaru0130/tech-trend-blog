// Test script for Amazon Image Extraction
const { scrapeAmazonProductSpecs } = require('./lib/amazon_scout');

(async () => {
    console.log("📸 Testing Image Extraction...");

    // Use a product known to have high-res images (Sony WF-1000XM5)
    // We need a real ASIN.
    const ASIN = "B0CBKQZXT7"; // Sony WF-1000XM5

    console.log(`Target ASIN: ${ASIN}`);

    const result = await scrapeAmazonProductSpecs(ASIN);

    if (result) {
        console.log("\n--- RESULT ---");
        console.log(`Image URL: ${result.image}`);

        if (result.image) {
            if (result.image.includes('.jpg') && !result.image.includes('_AC_SY')) {
                console.log("  ✅ Potential High-Res Image (No resize params detected locally, but Amazon logic varies)");
            }

            // Check if it's the dynamic image structure (usually has specific patterns)
            // But main verification is just getting *an* image that isn't a tiny placeholder.
            console.log("  ✅ Image extracted successfully.");
        } else {
            console.error("  ❌ No image found.");
        }

        if (result.specs) {
            console.log(`\nSpecs found: ${result.specs.length}`);
            result.specs.slice(0, 3).forEach(s => console.log(`- ${s.label}: ${s.value}`));
        }
    } else {
        console.error("❌ Scrape failed completely.");
    }
})();
