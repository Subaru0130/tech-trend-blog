const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split('\n');

lines[506] = "        console.error(\"  ❌ AI Generation Failed:\", e);";
lines[507] = "        return \"AI生成に失敗しました。\";";

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
console.log('Fixed line 508.');
