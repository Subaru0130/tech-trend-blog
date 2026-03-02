const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_rating_evaluator.js', 'utf8').split(/\r?\n/);
let found = 0;
for (let i = 40; i < 70; i++) {
    if (lines[i] && lines[i].includes("${product.brand || '不")) {
        lines[i] = "- ブランド: ${product.brand || '不明'}";
        found++;
    }
    if (lines[i] && lines[i].includes("${product.price || '不")) {
        lines[i] = "- 価格: ${product.price || '不明'}";
        found++;
    }
    if (lines[i] && lines[i].includes("${specsText || '【スペック")) {
        lines[i] = "${specsText || '【スペック情報なし】'}";
        found++;
    }
    if (lines[i] && lines[i].includes("${reviewText || '【レビュー")) {
        lines[i] = "${reviewText || '【レビュー情報なし】'}";
        found++;
    }
}
console.log("Fixed " + found + " bugs in ai_rating_evaluator.js");
fs.writeFileSync('scripts/lib/ai_rating_evaluator.js', lines.join('\n'));
