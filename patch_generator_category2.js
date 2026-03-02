const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/generator.js', 'utf8').split(/\r?\n/);

const newBlock = [
    "    if (kw.match(/タブレット/)) {",
    "        return { category: 'mobile', categoryId: 'mobile', subCategoryId: 'tablets' };",
    "    }",
    "    if (kw.match(/スマートウォッチ/)) {",
    "        return { category: 'wearable', categoryId: 'wearable', subCategoryId: 'smartwatches' };",
    "    }",
    "    if (kw.match(/電子レンジ|炊飯器|食洗機/)) {",
    "        return { category: 'kitchen', categoryId: 'kitchen', subCategoryId: 'kitchen-appliances' };",
    "    }",
    "    if (kw.match(/ドライヤー/)) {",
    "        return { category: 'beauty', categoryId: 'beauty', subCategoryId: 'hair-dryers' };",
    "    }",
    "    if (kw.match(/空気清浄機|加湿器|除湿機/)) {",
    "        return { category: 'appliances', categoryId: 'appliances', subCategoryId: 'air-quality' };",
    "    }"
];

for (let i = 120; i < 145; i++) {
    if (lines[i] && lines[i].includes("if (kw.match(/タブレ")) {
        lines.splice(i, 15, ...newBlock);
        console.log("Fixed detectCategoryFromKeyword part 2");
        break;
    }
}

fs.writeFileSync('scripts/lib/generator.js', lines.join('\n'));
