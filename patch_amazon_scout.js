const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/amazon_scout.js', 'utf8').split(/\r?\n/);

for (let i = 150; i < 160; i++) {
    if (lines[i].includes('const situationKeywords =')) {
        lines[i] = "    const situationKeywords = ['電車', '通勤', 'カフェ', 'ジム', 'ランニング', '風切り音', 'オフィス', '飛行機', '地下鉄', '会議', 'テレワーク', '在宅'];";
        console.log("Fixed situationKeywords array.");
        break;
    }
}

fs.writeFileSync('scripts/lib/amazon_scout.js', lines.join('\n'));
