const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '.env.local');
const envResult = dotenv.config({ path: envPath });

console.log(`[DEBUG] .env load path: ${envPath}`);
if (envResult.error) console.error(`[DEBUG] .env load error: ${envResult.error}`);

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
console.log(`[DEBUG] API Key present: ${!!apiKey}`);

try {
    console.log("[DEBUG] Requiring ai_writer.js...");
    const { generateProductSpecsAndProsCons } = require('./scripts/lib/ai_writer');
    console.log("[DEBUG] ai_writer.js loaded successfully.");

    (async () => {
        const PRODUCT_NAME = "Audio-Technica ATH-CKS50TW2";
        const MOCK_SPECS = {
            "Bluetooth": "Ver.5.3 / Class2",
            "防水": "IPX4相当",
            "連続再生": "約25時間(NCオフ)",
            "重量": "約8g",
            "ノイズキャンセリング": "ハイブリッドデジタルノイズキャンセリング技術"
        };

        const mockProduct = {
            name: PRODUCT_NAME,
            asin: "B0DGPT2MVN",
            realSpecs: { specs: Object.entries(MOCK_SPECS).map(([k, v]) => ({ label: k, value: v })) },
            realFeatures: ["業界最高クラスのノイキャン", "圧倒的な重低音", "マルチポイント対応"],
            rawReviews: { positive: [], negative: [] }
        };

        console.log("[DEBUG] Calling generateProductSpecsAndProsCons...");
        try {
            const result = await generateProductSpecsAndProsCons(
                mockProduct,
                "Usage Context: Daily Commute",
                "B0DGPT2MVN",
                null
            );

            console.log("[DEBUG] Result received.");
            if (result && result.specs) {
                console.log("✅ Generated Specs Comparison Table:");
                console.table(result.specs);

                let valid = true;
                result.specs.forEach(s => {
                    if (s.label === '機能') {
                        if (/Ver\.|IPX|Class/.test(s.value)) {
                            console.error(`❌ Invalid LIST format (Version detected) for ${s.label}: "${s.value}"`);
                            valid = false;
                        } else {
                            console.log(`✅ Function Check: "${s.value}" (Clean)`);
                        }
                    }
                    if (['音質', 'ノイキャン'].includes(s.label)) {
                        if (/^[SABC][+\-]?$/.test(s.value)) {
                            console.log(`✅ Score Check: ${s.label} = ${s.value}`);
                        } else {
                            console.error(`❌ Invalid SCORE format for ${s.label}: "${s.value}"`);
                            valid = false;
                        }
                    }
                });

                if (valid) console.log("\n✨ Schema Validation Passed.");
                else console.log("\n⚠️ Schema Validation Failed.");

            } else {
                console.error("❌ Generation Failed (Null result)");
            }
        } catch (execError) {
            console.error("[DEBUG] Execution Error:", execError);
        }

    })();

} catch (e) {
    console.error(`[DEBUG] Critical Require Error: ${e.message}`, e);
}
