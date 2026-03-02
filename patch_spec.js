const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/spec_normalizer.js', 'utf8').split(/\r?\n/);

const newBlock = [
    "        // --- 0. TRANSLATION (English -> Japanese) ---",
    "        const TRANSLATION_MAP = {",
    "            'Model Name': '型番',",
    "            'Connectivity Technology': '接続方法',",
    "            'Wireless Communication Technology': 'ワイヤレス技術',",
    "            'Included Components': '付属品',",
    "            'Age Range (Description)': '対象年齢',",
    "            'Material': '素材',",
    "            'Specific Uses For Product': '用途',",
    "            'Charging Time': '充電時間',",
    "            'Recommended Uses For Product': '推奨用途',",
    "            'Compatible Devices': '対応機器',",
    "            'Control Type': '操作方法',",
    "            'Control Method': '操作方法',",
    "            'Number of Items': '個数',",
    "            'Batteries Required': 'バッテリー',",
    "            'Manufacturer': 'メーカー',",
    "            'Item Model Number': '型番',",
    "            'Package Dimensions': 'サイズ',",
    "            'ASIN': 'ASIN',",
    "            'Date First Available': '発売日',",
    "            'Language': '言語',",
    "            'Product Dimensions': 'サイズ',",
    "            'Item Weight': '重量'",
    "        };"
];

let start = -1;
let end = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i] && lines[i].includes('const TRANSLATION_MAP = {')) {
        start = i - 1;
    }
    if (start !== -1 && i > start && lines[i].includes('};')) {
        end = i;
        break;
    }
}

if (start !== -1 && end !== -1) {
    lines.splice(start, end - start + 1, ...newBlock);
    console.log('Fixed TRANSLATION_MAP');
}

fs.writeFileSync('scripts/lib/spec_normalizer.js', lines.join('\n'));
