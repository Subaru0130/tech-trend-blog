const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/generator.js', 'utf8').split(/\r?\n/);

const newBlock = [
    "function detectCategoryFromKeyword(keyword) {",
    "    const kw = keyword.toLowerCase();",
    "    if (kw.match(/イヤホン|ヘッドホン|ヘッドフォン/)) {",
    "        return { category: 'audio', categoryId: 'audio', subCategoryId: 'wireless-headphones' };",
    "    }",
    "    if (kw.match(/スピーカー/)) {",
    "        return { category: 'audio', categoryId: 'audio', subCategoryId: 'speakers' };",
    "    }",
    "    if (kw.match(/冷蔵庫/)) {",
    "        return { category: 'appliances', categoryId: 'appliances', subCategoryId: 'refrigerators' };",
    "    }",
    "    if (kw.match(/洗濯機/)) {",
    "        return { category: 'appliances', categoryId: 'appliances', subCategoryId: 'washing-machines' };",
    "    }",
    "    if (kw.match(/エアコン/)) {",
    "        return { category: 'appliances', categoryId: 'appliances', subCategoryId: 'air-conditioners' };",
    "    }",
    "    if (kw.match(/掃除機|ロボット/)) {",
    "        return { category: 'appliances', categoryId: 'appliances', subCategoryId: 'vacuum-cleaners' };",
    "    }"
];

for (let i = 95; i < 115; i++) {
    if (lines[i] && lines[i].includes('function detectCategoryFromKeyw')) {
        lines.splice(i, 20, ...newBlock);
        console.log("Fixed detectCategoryFromKeyword");
        break;
    }
}

fs.writeFileSync('scripts/lib/generator.js', lines.join('\n'));
