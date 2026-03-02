const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/market_research.js', 'utf8').split(/\r?\n/);
let found = false;
for (let i = 1660; i < 1700; i++) {
    if (lines[i] && lines[i].includes("source: 'MONOQLO/家電批詁E")) {
        lines[i] = "                                    source: 'MONOQLO/家電批評'";
        console.log("Fixed market_research.js '家電批評' mojibake");
        found = true;
        break;
    }
}
if (!found) {
    console.log("Could not find the '家電批評' bug");
} else {
    fs.writeFileSync('scripts/lib/market_research.js', lines.join('\n'));
}
