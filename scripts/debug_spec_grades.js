require('dotenv').config({ path: '.env.local' });
const { generateProductSpecsAndProsCons } = require('./lib/ai_writer');

const productName = "Sony WF-1000XM5";
const targetLabels = {
    spec1: "髻ｳ雉ｪ",       // Should trigger Grade
    spec2: "繝弱う繧ｭ繝｣繝ｳ",   // Should trigger Grade
    spec3: "繝舌ャ繝・Μ繝ｼ",   // Should be Value
    spec4: "陬・捩諢・       // Should trigger Grade
};

const mockSpecs = [
    { label: "Driver", value: "8.4mm Dynamic Driver X" },
    { label: "Battery", value: "8 hours (NC on)" },
    { label: "Weight", value: "5.9g" }
];

(async () => {
    console.log(`噫 Testing Spec Grade Generation for "${productName}"...`);
    try {
        const result = await generateProductSpecsAndProsCons(
            { name: productName, realSpecs: { specs: mockSpecs } },
            { comparison_axis: "Sound, NC, Comfort" },
            "B0C33XXYY",
            null,
            targetLabels // <--- Testing new arg
        );

        console.log("\n笨・Result Specs:");
        if (result && result.specs) {
            result.specs.forEach(s => console.log(`  - ${s.label}: ${s.value}`));
        } else {
            console.log("笶・No specs returned.");
        }

    } catch (e) {
        console.error("笶・CRITICAL ERROR:", e);
    }
})();
