/**
 * 🏭 Mass Produce Articles
 * * [役割]
 * 指定されたJSONファイル（Miner Godが出力したBlueprintリスト）を読み込み、
 * 含まれる**すべて**のキーワードについて、連続で記事を自動生成します。
 * 
 * * [使い方]
 * node scripts/mass_produce_articles.js "BATCH_BLUEPRINTS_ワイヤレスイヤホン.json"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Arguments
const JSON_FILE = process.argv[2];

if (!JSON_FILE) {
    console.error("❌ Usage: node scripts/mass_produce_articles.js <JSON_FILE>");
    process.exit(1);
}

// 2. Load Blueprints
const jsonPath = path.resolve(process.cwd(), JSON_FILE);
if (!fs.existsSync(jsonPath)) {
    console.error(`❌ File not found: ${jsonPath}`);
    process.exit(1);
}

let blueprints = [];
try {
    blueprints = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
} catch (e) {
    console.error(`❌ JSON Parse Error: ${e.message}`);
    process.exit(1);
}

// Filter only approved ones (just in case, though Miner usually only saves Approved or marks them)
// Assuming structure: [{ keyword, status, ... }] or just list of objects.
// Miner v10 outputs: { keyword, score, blueprint: { status: "APPROVED", ... } }
const targets = blueprints.filter(b => b.blueprint && b.blueprint.status === "APPROVED");

console.log(`\n🚀 Starting Mass Production: ${targets.length} Articles`);
console.log(`   Source: ${JSON_FILE}\n`);

// 3. Loop and Execute
for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const keyword = target.keyword;

    console.log(`===========================================================`);
    console.log(`[${i + 1}/${targets.length}] 🔨 Producing: "${keyword}"`);
    console.log(`===========================================================`);

    try {
        // Call produce_from_blueprint.js for this specific keyword
        // Using execSync ensures we finish one before starting the next (memory safety)
        execSync(`node scripts/produce_from_blueprint.js "${JSON_FILE}" "${keyword}"`, { stdio: 'inherit' });

        console.log(`\n✅ Done: "${keyword}"\n`);
    } catch (e) {
        console.error(`\n❌ Failed to produce: "${keyword}"`);
        console.error(`   Error: ${e.message}\n`);
        // Continue to next item even if one fails
    }

    // Cool down between articles preventing rate limits
    if (i < targets.length - 1) {
        console.log("☕ Cooling down for 10 seconds...");
        const waitEndpoint = Date.now() + 10000;
        while (Date.now() < waitEndpoint) { }
    }
}

console.log(`\n✨✨ Mass Production Complete! ✨✨`);
