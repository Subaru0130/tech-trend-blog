const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

for (let i = 910; i < 930; i++) {
    if (lines[i].includes('text = text.replace(/正直な判定（競合比輁')) {
        lines[i] = "        text = text.replace(/正直な判定（競合比較）/g, '競合製品との比較');";
        lines[i + 1] = "        text = text.replace(/その実力を深掘りします/g, ''); // Also remove the \"Deep Dive\" phrase";
        console.log("Fixed regex replacements at lines 915-916");
        break;
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
