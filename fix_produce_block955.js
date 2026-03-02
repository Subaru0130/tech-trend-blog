const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split('\n');

lines[955] = "            description: BLUEPRINT.meta_description || BLUEPRINT.intro ? BLUEPRINT.intro.slice(0, 150) + '...' : `プロが選ぶ${TARGET_KEYWORD}のおすすめ人気ランキング。選び方のポイントも解説。`,";
lines[956] = "            keywords: [TARGET_KEYWORD, 'おすすめ', 'ランキング', '比較']";
lines[958] = "        console.log(`   ✂ 使用するBlueprintタイトル: ${BLUEPRINT.title}`);";

fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
console.log("Fixed lines 955-958.");
