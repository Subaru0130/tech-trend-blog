const fs = require('fs');
let content = fs.readFileSync('scripts/lib/ai_rating_evaluator.js', 'utf8');

// Replace review strings
content = content.replace(/"【Amazon高評価レビュー、E\);/g, '"【Amazon高評価レビュー】");');
content = content.replace(/"【Amazon低評価レビュー、E\);/g, '"【Amazon低評価レビュー】");');
content = content.replace(/\[\$\{r\.rating \|\| '\?'\}☁E \$\{text/g, "[${r.rating || '?'}★] ${text");

fs.writeFileSync('scripts/lib/ai_rating_evaluator.js', content);
console.log("Fixed review string mojibake in ai_rating_evaluator.js");
