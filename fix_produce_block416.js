const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split('\n');

lines[416] = "    const manMatch = TARGET_KEYWORD.match(/(\\d+)万円台/);";
lines[417] = "    if (manMatch) {";
lines[418] = "        priceRange.minPrice = parseInt(manMatch[1], 10) * 10000;";
lines[419] = "        priceRange.maxPrice = parseInt(manMatch[1], 10) * 10000 + 9999;";
lines[420] = "        console.log(`   💰 Price Range: ¥${priceRange.minPrice} - ¥${priceRange.maxPrice}`);";
lines[421] = "    }";
lines[422] = "    const underManMatch = TARGET_KEYWORD.match(/(\\d+)万円以下/);";
lines[423] = "    if (underManMatch) {";
lines[424] = "        priceRange.maxPrice = parseInt(underManMatch[1], 10) * 10000;";
lines[425] = "        console.log(`   💰 Price Range (Max): ¥${priceRange.maxPrice}`);";

fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
console.log("Fixed lines 416-425.");
