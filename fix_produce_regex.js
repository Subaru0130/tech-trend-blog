const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split('\n');
for (let i = 143; i <= 155; i++) { lines[i] = ''; }
lines[144] = "function determineCategory(kw) {";
lines[145] = "    if (!kw) return 'electronics';";
lines[146] = "    // Audio";
lines[147] = "    if (kw.match(/イヤホン|ヘッドホン|スピーカー/)) return 'audio';";
lines[148] = "    // Home appliances";
lines[149] = "    if (kw.match(/冷蔵庫|洗濯機|エアコン/)) return 'home-appliances';";
lines[150] = "    // Camera";
lines[151] = "    if (kw.match(/カメラ|レンズ/)) return 'camera';";
lines[152] = "    return 'electronics';";
lines[153] = "}";
fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
console.log("Fixed lines 143-155.");
