// Test script for verifying spec generation logic
const { generateProductSpecsAndProsCons } = require('./lib/ai_writer');

(async () => {
    console.log("🧪 Testing Spec Generation...");

    // Mock Product Data
    const productName = "Sony WF-1000XM5";
    const context = {
        target_reader: "通勤・通学者",
        comparison_axis: "音質とノイズキャンセリング"
    };

    // We don't have real specs here easily without running full scout, 
    // so we trust the AI to generate based on its internal knowledge + constraints we just added.

    const result = await generateProductSpecsAndProsCons(productName, context);

    console.log("\n--- RESULT ---");
    console.log(JSON.stringify(result, null, 2));

    // Verification Checks
    if (result && result.specs) {
        console.log("\n--- VALIDATION ---");

        result.specs.forEach(s => {
            console.log(`Checking ${s.label}: ${s.value}`);

            if (s.label.includes('音質') || s.label.includes('ノイキャン')) {
                const valid = ['S', 'A', 'B', 'C', 'S+'];
                if (valid.some(v => s.value.startsWith(v))) {
                    console.log("  ✅ Rating format OK");
                } else {
                    console.error("  ❌ Rating format INVALID (should be S/A/B/C)");
                }
            }

            if (s.label.includes('バッテリー')) {
                if (s.value.includes('単体') || !s.value.includes('最大')) {
                    console.log("  ✅ Battery format looks OK (checked manually)");
                } else {
                    console.warn("  ⚠️ Battery checking needed: " + s.value);
                }
            }
        });
    }
})();
