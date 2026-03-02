const fs = require('fs');

function patchAiWriter() {
    const file = 'c:/Users/Kokik/OneDrive/gemini/tech-trend-blog/scripts/lib/ai_writer.js';
    let content = fs.readFileSync(file, 'utf8');

    // 1. Patch generateSeoMetadata
    content = content.replace(
        /async function generateSeoMetadata\(keyword, productName = null\) \{/,
        "async function generateSeoMetadata(keyword, productName = null, blueprint = null) {\\n    if (blueprint && blueprint.meta_description) {\\n        console.log(`  🤁EUsing Blueprint Meta Description for \\\"${keyword}\\\" ...`);\\n        return {\\n            title: blueprint.title || keyword + ' おすすめ',\\n            description: blueprint.meta_description\\n        };\\n    }"
    );

    // 2. Patch generateBuyingGuideBody parsing
    content = content.replace(
        /target_reader_situation: blueprint\.target_reader_situation \|\| "日常使ぁE,/,
        'target_reader_situation: blueprint.target_reader_situation || "日常使ぁE,\\n        reader_empathy_phrase: blueprint.reader_empathy_phrase || "",'
    );

    // 3. Patch generateBuyingGuideBody prompt (Blueprint section)
    content = content.replace(
        /- 読老EE状況E悩み: \$\{ctx\.target_reader_situation\}/,
        '- 読老EE状況E悩み: ${ctx.target_reader_situation}\\n${ctx.reader_empathy_phrase ? `- 読老EE生々しぁE心のつぶやき(Empathy Phrase): "${ctx.reader_empathy_phrase}"` : \'\'}'
    );

    // 4. Patch generateBuyingGuideBody prompt (Intro instruction)
    content = content.replace(
        /- 冒頭の1斁Eで、E\*\$\{ctx\.target_reader\}\*\* が抱える「E通E悩みEEインE」を言ぁEてる、E/,
        '- 冒頭の1斁Eで、E*${ctx.target_reader}** が抱える「E通E悩みEEインE」を言ぁEてる、E\\n${ctx.reader_empathy_phrase ? `   - 【最重要】提示された「読老EE生々しぁE心のつぶやき(「${ctx.reader_empathy_phrase}」)」のエッセンスを自然に融入させ、読老Eが「まさに自分のことだ」と強烈に共感する魅力的なリード文を作成してください。` : \'\'}'
    );

    fs.writeFileSync(file, content);
    console.log('Patched ai_writer.js successfully.');
}

function patchProduceScript() {
    const file = 'c:/Users/Kokik/OneDrive/gemini/tech-trend-blog/scripts/produce_from_blueprint.js';
    let content = fs.readFileSync(file, 'utf8');

    // Find the call to generateSeoMetadata and add BLUEPRINT
    content = content.replace(
        /seoMetadata = await ai_writer\.generateSeoMetadata\(TARGET_KEYWORD, validatedLineup\);/,
        'seoMetadata = await ai_writer.generateSeoMetadata(TARGET_KEYWORD, validatedLineup, BLUEPRINT);'
    );

    fs.writeFileSync(file, content);
    console.log('Patched produce_from_blueprint.js successfully.');
}

patchAiWriter();
patchProduceScript();
