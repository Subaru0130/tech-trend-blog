const fs = require('fs');
let content = fs.readFileSync('scripts/lib/spec_scraper.js', 'utf8');

// Replace corrupted "悪い"
content = content.replace(/'悪ぁE/g, "'悪い'");

fs.writeFileSync('scripts/lib/spec_scraper.js', content);
console.log("Fixed all spec_scraper.js '悪い' mojibake");
