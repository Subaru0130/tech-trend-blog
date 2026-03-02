const fs = require('fs');
let content = fs.readFileSync('scripts/lib/market_research.js', 'utf8');

// The original line 812 might look like:
// if (match && text && text.length < 30 && !text.includes('人氁E)) {

let lines = content.split(/\r?\n/);
let found = false;
for (let i = 800; i < 830; i++) {
    if (lines[i] && lines[i].includes('text.includes(') && lines[i].includes('E)')) {
        lines[i] = "                        if (match && text && text.length < 30 && !text.includes('人気')) {";
        console.log("Fixed market_research.js text.includes('人気') mojibake");
        found = true;
        break;
    }
}
if (!found) {
    console.log("Could not find line 812 pattern");
} else {
    fs.writeFileSync('scripts/lib/market_research.js', lines.join('\n'));
}
