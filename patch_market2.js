const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/market_research.js', 'utf8').split(/\r?\n/);
for (let i = 250; i < 280; i++) {
    if (lines[i] && lines[i].includes('blueprint?.comparison_axis ?')) {
        lines[i] = "5. ${blueprint?.comparison_axis ? `比較軸「${blueprint.comparison_axis}」に強く関連し、その性能が高く評価されている製品を厳選して抽出` : '記事内で高く評価されている製品を優先'}";
        console.log("Fixed market_research.js blueprint prompt mojibake");
        break;
    }
}
fs.writeFileSync('scripts/lib/market_research.js', lines.join('\n'));
