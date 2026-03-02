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
    "    }",
    "    if (kw.match(/カメラ|一眼|ミラーレス/)) {",
    "        return { category: 'camera', categoryId: 'camera', subCategoryId: 'cameras' };",
    "    }",
    "    if (kw.match(/テレビ|モニター/)) {",
    "        return { category: 'display', categoryId: 'display', subCategoryId: 'tvs' };",
    "    }",
    "    if (kw.match(/キーボード|マウス/)) {",
    "        return { category: 'pc-peripherals', categoryId: 'pc-peripherals', subCategoryId: 'input-devices' };",
    "    }",
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
    "    }",
    "    if (kw.match(/プロジェクター/)) {",
    "        return { category: 'display', categoryId: 'display', subCategoryId: 'projectors' };",
    "    }",
    "    // Default",
    "    return { category: 'gadgets', categoryId: 'gadgets', subCategoryId: 'general' };",
    "}"
];

let start = -1;
let end = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i] && lines[i].includes('function detectCategoryFromKeyword(')) {
        start = i;
    }
    if (start !== -1 && i > start && lines[i] === '}') {
        end = i;
        break;
    }
}

if (start !== -1 && end !== -1) {
    lines.splice(start, end - start + 1, ...newBlock);
    console.log('Fixed detectCategoryFromKeyword entirely');
}

fs.writeFileSync('scripts/lib/generator.js', lines.join('\n'));
