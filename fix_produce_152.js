const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split('\n');
lines[152] = "    if (kw.match(/冷蔵庫|洗濯機|エアコン/)) return 'home-appliances';";
fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
console.log("Fixed line 152.");
