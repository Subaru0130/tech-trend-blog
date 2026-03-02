const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split('\n');

// Find the duplicate line
for (let i = 0; i < lines.length; i++) {
    if (lines[i] === "    if (BLUEPRINT.title) {" && lines[i + 1] === "    if (BLUEPRINT.title) {") {
        lines.splice(i, 1);
        console.log("Removed duplicate at line " + (i + 1));
        break;
    }
}

fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
