// Test script for verifying spec generation logic
const { generateProductSpecsAndProsCons } = require('./lib/ai_writer');

(async () => {
    console.log("ｧｪ Testing Spec Generation...");

    // Mock Product Data
    const productName = "Sony WF-1000XM5";
    const context = {
        target_reader: "騾壼共繝ｻ騾壼ｭｦ閠・,
        comparison_axis: "髻ｳ雉ｪ縺ｨ繝弱う繧ｺ繧ｭ繝｣繝ｳ繧ｻ繝ｪ繝ｳ繧ｰ"
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

            if (s.label.includes('髻ｳ雉ｪ') || s.label.includes('繝弱う繧ｭ繝｣繝ｳ')) {
                const valid = ['S', 'A', 'B', 'C', 'S+'];
                if (valid.some(v => s.value.startsWith(v))) {
                    console.log("  笨・Rating format OK");
                } else {
                    console.error("  笶・Rating format INVALID (should be S/A/B/C)");
                }
            }

            if (s.label.includes('繝舌ャ繝・Μ繝ｼ')) {
                if (s.value.includes('蜊倅ｽ・) || !s.value.includes('譛螟ｧ')) {
                    console.log("  笨・Battery format looks OK (checked manually)");
                } else {
                    console.warn("  笞・・Battery checking needed: " + s.value);
                }
            }
        });
    }
})();
