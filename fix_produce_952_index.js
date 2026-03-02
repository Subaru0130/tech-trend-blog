const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split(/\r?\n/);
lines.splice(951, 1); // remove line 952
fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
console.log("Removed duplicate at line 952.");
