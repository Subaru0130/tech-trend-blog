const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split('\n');

const newBlock = [
    "    // Parse price range from keyword",
    "    const priceRange = { minPrice: null, maxPrice: null };",
    "    const rangeMatch = TARGET_KEYWORD.match(/(\\d+)万円台/);",
    "    if (rangeMatch) {",
    "        const base = parseInt(rangeMatch[1], 10) * 10000;",
    "        priceRange.minPrice = base;",
    "        priceRange.maxPrice = base + 9999;",
    "    }",
    "    const rangeBetweenMatch = TARGET_KEYWORD.match(/(\\d+)万円〜(\\d+)万円/);",
    "    if (rangeBetweenMatch) {",
    "        priceRange.minPrice = parseInt(rangeBetweenMatch[1], 10) * 10000;",
    "        priceRange.maxPrice = parseInt(rangeBetweenMatch[2], 10) * 10000 + 9999;",
    "    }",
    "    const underMatch = TARGET_KEYWORD.match(/(\\d+)円以下/);",
    "    if (underMatch) {",
    "        priceRange.maxPrice = parseInt(underMatch[1], 10);",
    "    }",
    "    const underManMatch = TARGET_KEYWORD.match(/(\\d+)万円以下/);",
    "    if (underManMatch) {",
    "        priceRange.maxPrice = parseInt(underManMatch[1], 10) * 10000;",
    "    }"
];

// Replaces lines 406 to 421 inclusive (16 lines)
lines.splice(406, 16, ...newBlock);

fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
console.log('Fixed block 406-421.');
