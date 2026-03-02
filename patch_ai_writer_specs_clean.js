const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

for (let i = 540; i < 560; i++) {
    if (lines[i] && lines[i].includes('product.kakakuSpecs)')) {
        // We know the structure here, replace lines exactly
        lines[i + 1] = "            .filter(([k, v]) => !k.includes('特徴') && !k.includes('満足度') && !k.includes('ランキング') && !k.includes('PV') && !k.includes('記事'))";
        console.log("Fixed kakakuSpecs filter.");
    }
    if (lines[i] && lines[i].includes('s => s.label && s.value &&')) {
        lines[i] = "            .filter(s => s.label && s.value && s.value !== '記載なし')";
        console.log("Fixed amazon specs filter.");
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
