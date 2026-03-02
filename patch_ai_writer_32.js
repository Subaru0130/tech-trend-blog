const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split('\n');

const newBlock = [
    "async function generateSeoMetadata(keyword, productName = null, blueprint = null) {",
    "    if (blueprint && blueprint.meta_description) {",
    "        console.log(`  ✂ Using Blueprint Meta Description for \"${keyword}\" ...`);",
    "        return {",
    "            title: blueprint.title || keyword + ' おすすめ',",
    "            description: blueprint.meta_description",
    "        };",
    "    }"
];

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('async function generateSeoMetadata(keyword, productName = null, blueprint = null) {\\n')) {
        lines.splice(i, 1, ...newBlock);
        console.log(`Fixed literal error at line ${i + 1}`);
        break;
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
