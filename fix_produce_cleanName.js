const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split('\n');
lines[343] = "    let clean = rawName.replace(/【.*?】/g, '').trim();";
lines[375] = "        clean = rawName.substring(0, 30).replace(/【.*?】/g, '').trim();";
fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
console.log("Fixed lines 343 and 375.");
