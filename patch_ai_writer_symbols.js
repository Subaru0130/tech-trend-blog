const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

const newBlock = [
    "                // Fix Rating Symbols",
    "                if (val === '◎' || val === 'Top' || val === 'Excellent') val = 'S';",
    "                if (val === '〇' || val === '○' || val === 'Good') val = 'A';",
    "                if (val === '△') val = 'B';",
    "                if (val === '×') val = 'C';"
];

for (let i = 1295; i < 1315; i++) {
    if (lines[i] && lines[i].includes('// Fix Rating Symbols')) {
        lines.splice(i, 5, ...newBlock);
        console.log("Fixed Rating Symbols block");
        break;
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
