const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split('\n');

const newBlock = [
    "    if (BLUEPRINT.title) {",
    "        // Use Blueprint's pre-defined title",
    "        seoMetadata = {",
    "            title: BLUEPRINT.title,",
    "            description: BLUEPRINT.meta_description || (BLUEPRINT.intro ? BLUEPRINT.intro.slice(0, 150) + '...' : `プロが選ぶ${TARGET_KEYWORD}のおすすめ人気ランキング。選び方のポイントも解説。`),",
    "            keywords: [TARGET_KEYWORD, 'おすすめ', 'ランキング', '比較']",
    "        };",
    "        console.log(`   ✂ 使用するBlueprintタイトル: ${BLUEPRINT.title}`);",
    "    } else {",
    "        seoMetadata = await ai_writer.generateSeoMetadata(TARGET_KEYWORD, validatedLineup, BLUEPRINT);",
    "    }"
];

lines.splice(951, 10, ...newBlock);
fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
console.log("Fixed block 951-961.");
