const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

const newBlock = [
    "    // Default Fallback Context (if no blueprint provided)",
    "    const defaultContext = {",
    "        target_reader: `${keyword}を探している一般的な読者`,",
    "        comparison_axis: \"音質、機能、価格のバランス\",",
    "        sales_hook: `最適な${keyword}を見つけるための完全ガイド`",
    "    };",
    "",
    "    const ctx = {",
    "        target_reader: blueprint.target_reader || defaultContext.target_reader,",
    "        target_reader_situation: blueprint.target_reader_situation || \"日常使い\",",
    "        reader_empathy_phrase: blueprint.reader_empathy_phrase || \"\",",
    "        comparison_axis: blueprint.comparison_axis || defaultContext.comparison_axis,",
    "        sales_hook: blueprint.sales_hook || defaultContext.sales_hook",
    "    };"
];

lines.splice(128, 13, ...newBlock);

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
console.log('Fixed lines 128-140.');
