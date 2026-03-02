const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

const newBlock = [
    "    const realFeaturesText = product.realFeatures && product.realFeatures.length > 0",
    "        ? product.realFeatures.join('\\n')",
    "        : \"情報なし\";",
    "",
    "    // Parse scraped specs if available (with translation)",
    "    const realSpecsText = product.realSpecs && Object.keys(product.realSpecs).length > 0",
    "        ? Object.entries(product.realSpecs).slice(0, 8).map(([k, v]) => {",
    "            const jpLabel = labelMap[k] || k;",
    "            return `- ${jpLabel}: ${v}`;",
    "        }).join('\\n')",
    "        : \"情報なし\";"
];

for (let i = 555; i < 575; i++) {
    if (lines[i] && lines[i].includes('const realFeaturesText = product.realFeatures')) {
        lines.splice(i, 11, ...newBlock);
        console.log("Replaced realFeaturesText and realSpecsText block.");
        break;
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
