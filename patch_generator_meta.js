const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/generator.js', 'utf8').split(/\r?\n/);

for (let i = 360; i < 380; i++) {
    if (lines[i] && lines[i].includes('author: "ChoiceGuide編')) {
        lines[i] = '        author: "ChoiceGuide編集部",';
        console.log("Fixed author string.");
    }
    if (lines[i] && lines[i].includes('description: "今回のランキングは')) {
        lines[i] = '            description: "今回のランキングは、以下の基準で厳選しました。",';
        console.log("Fixed ranking description string.");
    }
}

fs.writeFileSync('scripts/lib/generator.js', lines.join('\n'));
