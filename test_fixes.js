const { generateProductSpecsAndProsCons: genSpecs } = require('./scripts/lib/ai_writer');

// Mock Data
const MOCK_EARPHONE = {
    name: "Sony WF-1000XM5",
    asin: "B0C3W",
    blueprint: { comparison_axis: "ハイレゾ対応とバッテリー持ち", category: "earphones" },
    specs: { "連続再生時間": "最大8時間(NCオン)", "防水": "IPX4", "Bluetooth": "Ver5.3" }
};

const MOCK_VACUUM = {
    name: "Dyson V12 Detect Slim",
    asin: "B09Y",
    blueprint: { comparison_axis: "吸引力と軽さ", category: "vacuum" },
    specs: { "運転時間": "最長60分(エコモード)", "重量": "2.2kg", "充電時間": "3.5時間" }
};

(async () => {
    console.log("🧪 Testing Generic Prompt Logic...");

    try {
        // Test 1: Earphone (Should still be strict)
        console.log("\n[1/2] Testing Earphone Logic (Strict)...");
        const res1 = await genSpecs(MOCK_EARPHONE.name, MOCK_EARPHONE.blueprint, MOCK_EARPHONE.asin, MOCK_EARPHONE.specs);
        const batt1 = res1.specs.find(s => s.label.includes("バッテリー"))?.value || "";
        const func1 = res1.specs.find(s => s.label.includes("機能"))?.value || "";

        console.log(`   Battery: ${batt1}`);
        console.log(`   Function: ${func1}`);

        if (batt1.includes("ケース")) console.error("   ❌ Failed: Battery included case info");
        else console.log("   ✅ Battery format strict OK");

        if (func1.includes("Ver") || func1.includes("IPX")) console.error("   ❌ Failed: Function included version numbers");
        else console.log("   ✅ Function format strict OK");


        // Test 2: Vacuum (Should be generic)
        console.log("\n[2/2] Testing Vacuum Logic (Generic)...");
        const res2 = await genSpecs(MOCK_VACUUM.name, MOCK_VACUUM.blueprint, MOCK_VACUUM.asin, MOCK_VACUUM.specs);
        const batt2 = res2.specs.find(s => s.label.includes("バッテリー")) || res2.specs.find(s => s.label.includes("運転時間"))?.value || "";

        // Note: Label might vary depending on AI's category classification, but let's check value
        const battValue2 = res2.specs.find(s => s.value.includes("分"))?.value || "";
        console.log(`   Battery/Time: ${battValue2}`);

        if (battValue2.includes("分")) {
            console.log("   ✅ Vacuum time accepted OK");
        } else {
            console.warn("   ⚠️ Comparison might need manual check: " + JSON.stringify(res2.specs));
        }

    } catch (e) {
        console.error("❌ Error:", e);
    }
})();
