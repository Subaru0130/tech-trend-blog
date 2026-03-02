const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split('\n');
lines[420] = "    const underManMatch = TARGET_KEYWORD.match(/(\\d+)万円以下/);";
fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
console.log("Fixed line 421.");
