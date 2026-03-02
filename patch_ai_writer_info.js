const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(': "惁EなぁE;')) {
        lines[i] = '        : "情報なし";';
        console.log(`Fixed 情報なし at line ${i + 1}`);
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
