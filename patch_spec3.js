const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/spec_scraper.js', 'utf8').split(/\r?\n/);
let found = false;
for (let i = 260; i < 290; i++) {
    if (lines[i] && lines[i].includes("hrefLower.includes('仕槁E)")) {
        lines[i] = "                    hrefLower.includes('仕様') || hrefLower.includes('support')) {";
        console.log("Fixed spec_scraper.js '仕様' mojibake");
        found = true;
        break;
    }
}
if (!found) {
    console.log("Could not find the '仕様' bug");
} else {
    fs.writeFileSync('scripts/lib/spec_scraper.js', lines.join('\n'));
}
