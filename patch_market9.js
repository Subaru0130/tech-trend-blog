const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/market_research.js', 'utf8').split(/\r?\n/);
let found = false;
for (let i = 1160; i < 1190; i++) {
    if (lines[i] && lines[i].includes("a.innerText.includes('こちめE)")) {
        lines[i] = "                                                        return a && (a.innerText.includes('こちら') || a.innerText.includes('Click') || a.innerText.includes('Amazon'));";
        console.log("Fixed market_research.js 'こちら' mojibake");
        found = true;
        break;
    }
}
if (!found) {
    console.log("Could not find the 'こちら' bug");
} else {
    fs.writeFileSync('scripts/lib/market_research.js', lines.join('\n'));
}
