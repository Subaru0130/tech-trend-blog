require('dotenv').config({ path: '.env.local' });
const { generateProductSpecsAndProsCons } = require('./lib/ai_writer');

// Mock context data
const contextData = {
    target_reader: "騾壼共繝ｻ騾壼ｭｦ縺ｧ菴ｿ縺・◆縺・ｺｺ",
    comparison_axis: "髻ｳ雉ｪ縲√ヮ繧､繧ｭ繝｣繝ｳ縲√ヰ繝・ユ繝ｪ繝ｼ"
};

const productName = "繧ｪ繝ｼ繝・ぅ繧ｪ繝・け繝九き ATH-TWX9MK2";
const asin = "B0FGPMX93Q";

(async () => {
    console.log(`噫 Testing generateProductSpecsAndProsCons for ${productName}...`);
    try {
        const result = await generateProductSpecsAndProsCons(productName, contextData, asin);
        console.log("笨・Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("笶・CRITICAL ERROR in Test Script:", e);
    }
})();
