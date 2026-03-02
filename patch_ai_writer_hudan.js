const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('|| "普段使ぁE;')) {
        lines[i] = '            usage_scenario: blueprint.usage_scenario || "普段使い",';
        console.log(`Fixed 普段使い at line ${i + 1}`);
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
