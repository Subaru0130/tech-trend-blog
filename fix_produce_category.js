const fs = require('fs');
let text = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8');
let lines = text.split(/\r?\n/);

const newBlock = [
    "function determineCategory(kw) {",
    "    if (!kw) return 'general';",
    "",
    "    // Audio",
    "    if (kw.match(/イヤホン|ヘッドホン|スピーカー/)) return 'audio';",
    "",
    "    // Home appliances",
    "    if (kw.match(/冷蔵|洗濯|エアコン/)) return 'home-appliances';",
    "",
    "    // Camera",
    "    if (kw.match(/カメラ|レンズ/)) return 'camera';",
    "",
    "    // Electronics",
    "    if (kw.match(/pc|パソコン|laptop|タブレット|スマホ|モニター|キーボード/i)) return 'electronics';",
    "",
    "    // Beauty & Health",
    "    if (kw.match(/美容|ドライヤー|シェーバー|脱毛|マッサージ/)) return 'beauty-health';",
    "",
    "    return 'general';",
    "}"
];

lines.splice(143, 23, ...newBlock);
fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
console.log("Fixed lines 143-165.");
