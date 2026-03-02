const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/market_research.js', 'utf8').split(/\r?\n/);
let found = false;
for (let i = 900; i < 940; i++) {
    if (lines[i] && lines[i].includes(".replace(/\\d+佁Eg, '')")) {
        lines[i] = "                                .replace(/\\d+位/g, '')       // Remove ranking number anywhere";
        console.log("Fixed market_research.js regex mojibake");
        found = true;
        break;
    }
}
if (!found) {
    console.log("Regex issue not found around line 924");
} else {
    fs.writeFileSync('scripts/lib/market_research.js', lines.join('\n'));
}
