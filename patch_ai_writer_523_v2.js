const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

const newBlock = [
    "    const labelMap = {",
    "        'Model Name': '型番',",
    "        'Connectivity Technology': '接続方式',",
    "        'Wireless Communication Technology': 'ワイヤレス技術',",
    "        'Included Components': '付属品',",
    "        'Age Range (Description)': '対象年齢',",
    "        'Material': '素材',",
    "        'Specific Uses For Product': '用途',",
    "        'Charging Time': '充電時間',",
    "        'Recommended Uses For Product': '推奨用途',",
    "        'Compatible Devices': '対応機器',",
    "        'Control Type': '操作方式',",
    "        'Control Method': '操作方法',",
    "        'Number of Items': '個数',",
    "        'Batteries Required': 'バッテリー',",
    "        'Manufacturer': 'メーカー',",
    "        'Item Model Number': '型番',",
    "        'Package Dimensions': 'サイズ',",
    "        'Weight': '重量',",
    "        'Color': 'カラー'",
    "    };"
];

for (let i = 520; i < 550; i++) {
    if (lines[i].includes("const labelMap = {")) {
        let endIndex = i;
        while (!lines[endIndex].includes("};")) endIndex++;
        lines.splice(i, endIndex - i + 1, ...newBlock);
        console.log(`Replaced labelMap block from line ${i + 1} to ${endIndex + 1}`);
        break;
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
