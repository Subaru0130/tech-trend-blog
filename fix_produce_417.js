const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split('\n');
lines[416] = "    const manMatch = TARGET_KEYWORD.match(/(\\d+)万円台/);";
lines[419] = "    const underManMatch = TARGET_KEYWORD.match(/(\\d+)万円以/);";
fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
console.log("Fixed lines 417 and 420.");
