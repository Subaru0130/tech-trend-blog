require('dotenv').config({ path: '.env.local' });
const { generateProductSpecsAndProsCons } = require('./lib/ai_writer');

// Mock context data
const contextData = {
    target_reader: "通勤・通学で使いたい人",
    comparison_axis: "音質、ノイキャン、バッテリー"
};

const productName = "オーディオテクニカ ATH-TWX9MK2";
const asin = "B0FGPMX93Q";

(async () => {
    console.log(`🚀 Testing generateProductSpecsAndProsCons for ${productName}...`);
    try {
        const result = await generateProductSpecsAndProsCons(productName, contextData, asin);
        console.log("✅ Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("❌ CRITICAL ERROR in Test Script:", e);
    }
})();
