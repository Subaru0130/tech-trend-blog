// TEST for Generic Spec Normalization
const { normalizeSpecs, normalizeObjectSpecs } = require('./scripts/lib/spec_normalizer.js');

console.log("--- TEST 1: normalizeSpecs (Array) ---");
const testSpecs = [
    { label: "音質", value: "○" },
    { label: "バッテリー", value: "8時間" },
    { label: "配送", value: "お届け日時指定" }
];
const result1 = normalizeSpecs(testSpecs);
console.log(JSON.stringify(result1, null, 2));

if (result1.find(s => s.label === "音質").value === "A" && !result1.find(s => s.label === "配送")) {
    console.log("✅ normalizeSpecs PASSED");
} else {
    console.error("❌ normalizeSpecs FAILED");
    process.exit(1);
}

console.log("\n--- TEST 2: normalizeObjectSpecs (Object) ---");
const products = [
    {
        name: "Test Product",
        specs: {
            sound: "◎",
            battery: "○", // Should become detailed check
            delivery: "On time" // Should be kept? normalizeObjectSpecs normalizes VALUES but keys are kept.
            // Wait, normalizeObjectSpecs currently maps specLabels[key].
            // If specLabels['delivery'] is '配送', then normalizeSpecs logic runs on '配送'.
            // The junk filter returns EMPTY for '配送'.
            // If result is empty, normalizeObjectSpecs currently does NOT update value?
            // Let's check logic:
            // if (result && result.length > 0) newSpecs[key] = result[0].value;
            // So if normalized returns empty (junk), the original value REMAINS.
            // This is BAD. We want to clear junk specs OR remove the key.
            // But removing key might break table columns.
            // Ideally we set it to "-" or "".
            // Let's test what happens.
        }
    }
];

const labels = {
    sound: "音質",
    battery: "再生時間",
    delivery: "配送"
};

const result2 = normalizeObjectSpecs(products, labels);
console.log(JSON.stringify(result2, null, 2));

const p = result2[0].specs;
if (p.sound === "S" && p.battery === "詳細要確認") {
    console.log("✅ normalizeObjectSpecs PASSED (Transformation)");
} else {
    console.error("❌ normalizeObjectSpecs FAILED");
    process.exit(1);
}

// NOTE: Current logic does NOT remove junk keys, it simply fails to update them.
// If valid junk filtering is needed in Object specs, we need to handle empty return.
