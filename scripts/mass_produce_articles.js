/**
 * 少 Mass Produce Articles
 * * [蠖ｹ蜑ｲ]
 * 謖・ｮ壹＆繧後◆JSON繝輔ぃ繧､繝ｫ・・iner God縺悟・蜉帙＠縺檻lueprint繝ｪ繧ｹ繝茨ｼ峨ｒ隱ｭ縺ｿ霎ｼ縺ｿ縲・
 * 蜷ｫ縺ｾ繧後ｋ**縺吶∋縺ｦ**縺ｮ繧ｭ繝ｼ繝ｯ繝ｼ繝峨↓縺､縺・※縲・｣邯壹〒險倅ｺ九ｒ閾ｪ蜍慕函謌舌＠縺ｾ縺吶・
 * 
 * * [菴ｿ縺・婿]
 * node scripts/mass_produce_articles.js "BATCH_BLUEPRINTS_繝ｯ繧､繝､繝ｬ繧ｹ繧､繝､繝帙Φ.json"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Arguments
const JSON_FILE = process.argv[2];

if (!JSON_FILE) {
    console.error("笶・Usage: node scripts/mass_produce_articles.js <JSON_FILE>");
    process.exit(1);
}

// 2. Load Blueprints
const jsonPath = path.resolve(process.cwd(), JSON_FILE);
if (!fs.existsSync(jsonPath)) {
    console.error(`笶・File not found: ${jsonPath}`);
    process.exit(1);
}

let blueprints = [];
try {
    blueprints = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
} catch (e) {
    console.error(`笶・JSON Parse Error: ${e.message}`);
    process.exit(1);
}

// Filter only approved ones (just in case, though Miner usually only saves Approved or marks them)
// Assuming structure: [{ keyword, status, ... }] or just list of objects.
// Miner v10 outputs: { keyword, score, blueprint: { status: "APPROVED", ... } }
const targets = blueprints.filter(b => b.blueprint && b.blueprint.status === "APPROVED");

console.log(`\n噫 Starting Mass Production: ${targets.length} Articles`);
console.log(`   Source: ${JSON_FILE}\n`);

// 3. Loop and Execute
for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const keyword = target.keyword;

    console.log(`===========================================================`);
    console.log(`[${i + 1}/${targets.length}] 畑 Producing: "${keyword}"`);
    console.log(`===========================================================`);

    try {
        // Call produce_from_blueprint.js for this specific keyword
        // Using execSync ensures we finish one before starting the next (memory safety)
        execSync(`node scripts/produce_from_blueprint.js "${JSON_FILE}" "${keyword}"`, { stdio: 'inherit' });

        console.log(`\n笨・Done: "${keyword}"\n`);
    } catch (e) {
        console.error(`\n笶・Failed to produce: "${keyword}"`);
        console.error(`   Error: ${e.message}\n`);
        // Continue to next item even if one fails
    }

    // Cool down between articles preventing rate limits
    if (i < targets.length - 1) {
        console.log("笘・Cooling down for 10 seconds...");
        const waitEndpoint = Date.now() + 10000;
        while (Date.now() < waitEndpoint) { }
    }
}

console.log(`\n笨ｨ笨ｨ Mass Production Complete! 笨ｨ笨ｨ`);
