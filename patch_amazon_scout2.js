const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/amazon_scout.js', 'utf8').split(/\r?\n/);

const newBlock = [
    "const CATEGORY_KEYWORDS = {",
    "    'wireless-earphones': ['イヤホン', 'イヤフォン', 'earphone', 'earbuds', 'earbud', 'ワイヤレス', 'tws', 'buds'],",
    "    'wireless-headphones': ['ヘッドホン', 'ヘッドフォン', 'headphone', 'headset', 'オーバーイヤー'],",
    "    'bone-conduction': ['骨伝導', 'bone', 'shokz', 'オープンイヤー', 'open ear', 'openrun']",
    "};"
];

for (let i = 560; i < 570; i++) {
    if (lines[i].includes('const CATEGORY_KEYWORDS = {')) {
        lines.splice(i, 5, ...newBlock);
        console.log("Fixed CATEGORY_KEYWORDS.");
        break;
    }
}

fs.writeFileSync('scripts/lib/amazon_scout.js', lines.join('\n'));
