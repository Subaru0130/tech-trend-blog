const fs = require('fs');

const file = 'scripts/produce_from_blueprint.js';
let content = fs.readFileSync(file, 'utf8');

// Patch generateSeoMetadata to consume BLUEPRINT
// From: seoMetadata = await ai_writer.generateSeoMetadata(TARGET_KEYWORD, validatedLineup);
// To: seoMetadata = await ai_writer.generateSeoMetadata(TARGET_KEYWORD, validatedLineup, BLUEPRINT);
content = content.replace(
    /seoMetadata = await ai_writer\.generateSeoMetadata\(TARGET_KEYWORD, validatedLineup\);/g,
    'seoMetadata = await ai_writer.generateSeoMetadata(TARGET_KEYWORD, validatedLineup, BLUEPRINT);'
);

// Instead of rewriting the JSON struct which caused mojibake issues earlier,
// just inject checking for blueprint.meta_description inside the `if (BLUEPRINT.title)` block.
// The original code was:
/*
    if (BLUEPRINT.title) {
        // Use Blueprint's pre-defined title
        seoMetadata = {
            title: BLUEPRINT.title,
            description: BLUEPRINT.intro ? BLUEPRINT.intro.slice(0, 150) + "..." : `プロが選ぶ${TARGET_KEYWORD}のおすすめ人気ランキング。選び方のポイントも解説。`,
            keywords: [TARGET_KEYWORD, "おすすめ", "ランキング", "比較"]
        };
        console.log(`   ✂ 使用するBlueprintタイトル: ${BLUEPRINT.title}`);
*/
// Replace the exact description assignment line:
content = content.replace(
    /description: BLUEPRINT\.intro \? BLUEPRINT\.intro\.slice\(0, 150\) \+ "\.\.\." : \`プロが選ぶ\$\{TARGET_KEYWORD\}のおすすめ人気ランキング。選び方のポイントも解説。\`,/g,
    'description: BLUEPRINT.meta_description || (BLUEPRINT.intro ? BLUEPRINT.intro.slice(0, 150) + "..." : `プロが選ぶ${TARGET_KEYWORD}のおすすめ人気ランキング。選び方のポイントも解説。`),'
);

fs.writeFileSync(file, content);
console.log('Successfully patched generateSeoMetadata call and description override.');
