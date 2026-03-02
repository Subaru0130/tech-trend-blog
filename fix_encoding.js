const fs = require('fs');
const file = 'c:/Users/Kokik/OneDrive/gemini/tech-trend-blog/scripts/lib/amazon_scout.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/span\[aria-label\*\=\"5つ星[^"]*\"\]/g, 'span[aria-label*=\"5つ星のうち\"]');
content = content.replace(/span\[aria-label\*\=\"個[^"]*評価\"\]/g, 'span[aria-label*=\"個の評価\"]');
content = content.replace(/\.split\('5つ星[^']*'\)/g, '.split(\'5つ星のうち\')');

fs.writeFileSync(file, content);
console.log('Fixed amazon_scout.js successfully.');
