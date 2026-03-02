const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

for (let i = 610; i < 630; i++) {
    if (lines[i].includes('usage_scenario: blueprint.usage_scenario || "普段使い",')) {
        lines[i] = '    const usageScenario = blueprint.usage_scenario || "普段使い";';
        console.log(`Fixed formatting at line ${i + 1}`);
        break;
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
