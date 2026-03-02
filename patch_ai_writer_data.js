const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

const newBlock = [
    "# 評価軸（分析の重点）",
    "${comparisonAxis || '基本性能・実際の使用感'}",
    "",
    "# 高評価レビュー（検証の証拠：Positive）",
    "${positiveText || '(データなし)'}",
    "",
    "# 低評価レビュー（検証の証拠：Negative）",
    "${negativeText || '(データなし)'}",
];

for (let i = 1350; i < 1365; i++) {
    if (lines[i].includes('comparisonAxis')) {
        lines.splice(i - 1, 8, ...newBlock);
        console.log("Fixed review analysis prompt strings");
        break;
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
