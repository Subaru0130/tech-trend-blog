const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("|| '∁E}")) {
        lines[i] = "    console.log(`   💰 Price range: ¥${priceRange.minPrice || 0} - ¥${priceRange.maxPrice || '上限なし'}`);";
        console.log(`Fixed line ${i + 1}`);
    }
}

fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
