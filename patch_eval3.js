const fs = require('fs');
let content = fs.readFileSync('scripts/lib/ai_rating_evaluator.js', 'utf8');

// Replace review strings
content = content.replace(/"【価格\.com高評価、E\);/g, '"【価格.com高評価】");');
content = content.replace(/"【価格\.com低評価、E\);/g, '"【価格.com低評価】");');
content = content.replace(/"【シチュエーション別、E\);/g, '"【シチュエーション別】");');

fs.writeFileSync('scripts/lib/ai_rating_evaluator.js', content);
console.log("Fixed more review string mojibake in ai_rating_evaluator.js");
