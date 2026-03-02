const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

const newBlock = [
    "    // Prioritize kakakuSpecs (Japanese) over Amazon specs (English)",
    "    let specsText = '';",
    "    if (product.kakakuSpecs && Object.keys(product.kakakuSpecs).length > 0) {",
    "        specsText = Object.entries(product.kakakuSpecs)",
    "            .filter(([k, v]) => !k.includes('特徴') && !k.includes('満足度') && !k.includes('ランキング') && !k.includes('PV') && !k.includes('記事'))",
    "            .slice(0, 15)",
    "            .map(([k, v]) => `${k}: ${v}`)",
    "            .join(', ');",
    "    } else if (product.specs && product.specs.length > 0) {",
    "        specsText = product.specs",
    "            .filter(s => s.label && s.value && s.value !== '記載なし')",
    "            .filter(s => !s.label.includes('特徴') && !s.label.includes('満足度') && !s.label.includes('ランキング') && !s.label.includes('PV') && !s.label.includes('記事'))",
    "            .slice(0, 10)",
    "            .map(s => {",
    "                const jpLabel = labelMap[s.label] || s.label;",
    "                return `${jpLabel}: ${s.value}`;",
    "            })",
    "            .join(', ');",
    "    }",
    "    specsText = specsText || '記載なし';"
];

for (let i = 538; i < 560; i++) {
    if (lines[i].includes('// Prioritize kakakuSpecs (Japanese) over Amazon specs (English)')) {
        lines.splice(i, 20, ...newBlock);
        console.log("Replaced entire specs filtering block.");
        break;
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
