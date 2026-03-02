const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('比輁E]')) {
        lines[i] = "            keywords: [TARGET_KEYWORD, 'おすすめ', 'ランキング', '比較']";
        console.log(`Fixed line ${i + 1}`);
    }
}

fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
