const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

for (let i = 970; i < 990; i++) {
    if (lines[i].includes('catch (e) {')) {
        lines[i + 1] = "        console.error(\"  ❌ AI Generation Failed:\", e);";
        lines[i + 2] = "        return \"レビュー生成に失敗しました。\";";
        console.log("Fixed review generation catch block.");
        break;
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
