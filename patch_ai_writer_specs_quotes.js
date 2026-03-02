const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split('\n');

lines[548] = "            .filter(([k, v]) => !k.includes('特徴') && !k.includes('満足度') && !k.includes('ランキング') && !k.includes('PV') && !k.includes('記事'))";
lines[554] = "            .filter(s => s.label && s.value && s.value !== '記載なし')";

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
console.log('Fixed lines 549 and 555 quotes.');
