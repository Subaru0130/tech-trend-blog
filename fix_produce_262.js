const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split('\n');
lines[261] = "   【必須機能リスト】 ${requiredFeatures.length > 0 ? requiredFeatures.join(', ') : '特になし'}";
fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
console.log("Fixed line 262.");
