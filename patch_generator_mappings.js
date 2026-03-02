const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/generator.js', 'utf8').split(/\r?\n/);

const newBlock = [
    "    // Product category mappings (order matters: longer phrases first)",
    "    const productMappings = {",
    "        'ワイヤレスイヤホン': 'wireless-earphones',",
    "        'ノイズキャンセリング': 'noise-cancelling',",
    "        'イヤホン': 'earphones',",
    "        'ヘッドホン': 'headphones',",
    "        'スピーカー': 'speaker',",
    "        '冷蔵庫': 'refrigerator',",
    "        '洗濯機': 'washing-machine',",
    "        'エアコン': 'air-conditioner',",
    "        'ロボット掃除機': 'robot-vacuum',",
    "        '掃除機': 'vacuum-cleaner',",
    "        'カメラ': 'camera',",
    "        '一眼レフ': 'dslr-camera',",
    "        'ミラーレス': 'mirrorless-camera',",
    "        'テレビ': 'tv',",
    "        'モニター': 'monitor',",
    "        'キーボード': 'keyboard',",
    "        'マウス': 'mouse',",
    "        'タブレット': 'tablet',",
    "        'スマートウォッチ': 'smartwatch',",
    "        'Apple Watch': 'apple-watch',",
    "        'スマートスピーカー': 'smart-speaker',",
    "        'Wi-Fiルーター': 'wifi-router',",
    "        'モバイルバッテリー': 'power-bank',",
    "        '充電器': 'charger'",
    "    };"
];

for (let i = 4; i < 15; i++) {
    if (lines[i] && lines[i].includes('// Product category mappings')) {
        let endIdx = i;
        while (!lines[endIdx].includes('};')) {
            endIdx++;
        }
        lines.splice(i, endIdx - i + 1, ...newBlock);
        console.log("Fixed productMappings in generator.js");
        break;
    }
}

fs.writeFileSync('scripts/lib/generator.js', lines.join('\n'));
