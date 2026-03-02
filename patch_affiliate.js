const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/affiliate_processor.js', 'utf8').split(/\r?\n/);

for (let i = 70; i < 85; i++) {
    if (lines[i] && lines[i].includes('replace(/、E*?、Eg')) {
        lines[i] = "        .replace(/[【\\[\\(].*?[】\\]\\)]/g, '')";
        console.log("Fixed bracket replacement regex");
        break;
    }
}

fs.writeFileSync('scripts/lib/affiliate_processor.js', lines.join('\n'));
