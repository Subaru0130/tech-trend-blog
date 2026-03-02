const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/amazon_scout.js', 'utf8').split(/\r?\n/);

for (let i = 890; i < 900; i++) {
    if (lines[i].includes('modelName: specs.find(s => s.label.match(/Model Name|モチ')) {
        lines[i] = "                modelName: specs.find(s => s.label.match(/Model Name|モデル名/i))?.value,";
        console.log("Fixed modelName regex.");
    }
    if (lines[i].includes('modelNumber: specs.find(s => s.label.match(/Model Number|Item model number|型番|モチ')) {
        lines[i] = "                modelNumber: specs.find(s => s.label.match(/Model Number|Item model number|型番|モデル番号|部品番号/i))?.value,";
        console.log("Fixed modelNumber regex.");
    }
}

fs.writeFileSync('scripts/lib/amazon_scout.js', lines.join('\n'));
