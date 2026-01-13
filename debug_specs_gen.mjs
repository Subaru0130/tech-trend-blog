import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Import the CJS module
const aiWriter = require('./scripts/lib/ai_writer.js');
const { generateProductSpecsAndProsCons } = aiWriter;

console.log("Loaded aiWriter:", Object.keys(aiWriter));

(async () => {
    const PRODUCT_NAME = "Audio-Technica ATH-CKS50TW2";
    const MOCK_SPECS = {
        "Bluetooth": "Ver.5.3 / Class2",
        "防水": "IPX4相当",
        "連続再生": "約25時間(NCオフ)",
        "重量": "約8g",
        "ノイズキャンセリング": "ハイブリッドデジタルノイズキャンセリング技術"
    };

    console.log(`\n🔍 DEBUG SPECS GEN (ESM): Testing Schema Enforcement for ${PRODUCT_NAME}...\n`);

    try {
        const mockProduct = {
            name: PRODUCT_NAME,
            asin: "B0DGPT2MVN",
            realSpecs: { specs: Object.entries(MOCK_SPECS).map(([k, v]) => ({ label: k, value: v })) },
            realFeatures: ["業界最高クラスのノイキャン", "圧倒的な重低音", "マルチポイント対応"],
            rawReviews: { positive: [], negative: [] }
        };

        const result = await generateProductSpecsAndProsCons(
            mockProduct,
            "Usage Context: Daily Commute",
            "B0DGPT2MVN",
            null
        );

        if (result && result.specs) {
            console.log("✅ Generated Specs Comparison Table:");
            console.table(result.specs);
            // Validation Logic
            let valid = true;
            result.specs.forEach(s => {
                if (s.label === '機能') {
                    if (/Ver\.|IPX|Class/.test(s.value)) {
                        console.error(`❌ Invalid LIST format for ${s.label}: "${s.value}"`);
                        valid = false;
                    } else {
                        console.log(`✅ Function Clean: "${s.value}"`);
                    }
                }
                if (['音質', 'ノイキャン'].includes(s.label)) {
                    if (/^[SABC][+\-]?$/.test(s.value)) {
                        console.log(`✅ Score Check: ${s.value}`);
                    } else {
                        console.error(`❌ Invalid SCORE: "${s.value}"`);
                        valid = false;
                    }
                }
            });
            if (valid) console.log("\n✨ Schema Validation Passed.");
        } else {
            console.error("❌ Generation Failed (Null result)");
        }

    } catch (e) {
        console.error("CRITICAL ERROR:", e);
    }
})();
