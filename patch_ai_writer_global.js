const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('特雁E')) {
        lines[i] = lines[i].replace(/特雁E/g, '特徴');
        console.log(`Replaced 特雁E at line ${i + 1}`);
    }
    if (lines[i].includes('記亁E')) {
        lines[i] = lines[i].replace(/記亁E/g, '記事');
        console.log(`Replaced 記亁E at line ${i + 1}`);
    }
    if (lines[i].includes('記載なぁE')) {
        lines[i] = lines[i].replace(/記載なぁE/g, '記載なし');
        console.log(`Replaced 記載なぁE at line ${i + 1}`);
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
