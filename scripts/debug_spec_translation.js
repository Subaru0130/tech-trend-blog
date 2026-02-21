const { normalizeSpecs } = require('./lib/spec_normalizer');

const mockSpecs = [
    { label: "Noise Control", value: "Active Noise Cancellation" }, // -> ノイキャン (Keep)
    { label: "Connectivity Technology", value: "Wireless" },        // -> 接続方弁E(Keep)
    { label: "Model Name", value: "Technics" },                     // -> 型番 -> Junk (Remove)
    { label: "Department", value: "Electronics" },                  // -> Junk (Remove)
    { label: "RandomEnglishTag", value: "Values" },                 // -> Unknown Eng (Remove)
    { label: "Generic ID", value: "12345" },                        // -> Unknown Eng (Remove)
    { label: "サイズ", value: "10cm" },                             // -> Japanese (Keep)
    { label: "Valid Japanese", value: "そ�Eまま" }                  // -> Japanese (Keep)
];

console.log("🚀 Testing Strict Spec Filtering...");
const normalized = normalizeSpecs(mockSpecs);

console.log("\n✁EResult:");
normalized.forEach(s => {
    console.log(`  - ${s.label}: ${s.value}`);
});

// Assertions
const keptLabels = normalized.map(s => s.label);
if (
    keptLabels.includes('ノイキャン') &&
    keptLabels.includes('接続方弁E) &&
    keptLabels.includes('サイズ') &&
    !keptLabels.includes('型番') &&
    !keptLabels.includes('Department') &&
    !keptLabels.includes('RandomEnglishTag') &&
    !keptLabels.includes('Generic ID')
) {
    console.log("\n🎉 SUCCESS: Only valid Japanese translations and original Japanese keys remained!");
} else {
    console.log("\n❁EFAILURE: Filtering logic is flawed.");
    console.log("   Kept Labels:", keptLabels);
}
