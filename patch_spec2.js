const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/spec_scraper.js', 'utf8').split(/\r?\n/);
let found = false;
for (let i = 130; i < 150; i++) {
    if (lines[i] && lines[i].includes("const blackList = ['特雁E,")) {
        lines[i] = "                const blackList = ['特徴', 'ピックアップ', '関連', '記事', 'キャンペーン', '詳細', '更新'];";
        console.log("Fixed spec_scraper.js blackList mojibake");
        found = true;
        break;
    }
}
if (!found) {
    console.log("Could not find the blackList bug");
} else {
    fs.writeFileSync('scripts/lib/spec_scraper.js', lines.join('\n'));
}
