const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('match(/(\\d+)冁')) {
        lines[i] = "    const rangeMatch = TARGET_KEYWORD.match(/(\\d+)万円〜(\\d+)万円/);";
    }
}

fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
console.log('Fixed line 407.');
