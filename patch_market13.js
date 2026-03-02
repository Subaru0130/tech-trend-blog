const fs = require('fs');
let content = fs.readFileSync('scripts/lib/market_research.js', 'utf8');

// Replace all instances of '家電批詁E with valid quote
content = content.replace(/'MONOQLO\/家電批詁E/g, "'MONOQLO/家電批評'");

fs.writeFileSync('scripts/lib/market_research.js', content);
console.log("Fixed all market_research.js '家電批評' mojibake");
