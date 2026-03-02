const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
    // 1. generateSeoMetadata function literal newline error (around line 32)
    if (lines[i].includes('async function generateSeoMetadata(keyword, productName = null, blueprint = null) {\\n')) {
        lines.splice(i, 1,
            "async function generateSeoMetadata(keyword, productName = null, blueprint = null) {",
            "    if (blueprint && blueprint.meta_description) {",
            "        console.log(`  ✂ Using Blueprint Meta Description for \"${keyword}\" ...`);",
            "        return {",
            "            title: blueprint.title || keyword + ' おすすめ',",
            "            description: blueprint.meta_description",
            "        };",
            "    }"
        );
        console.log("Fixed SEO metadata block.");
    }

    // 2. generateSeoMetadata catch block (around line 99)
    if (lines[i].includes('return { title: `、E025、E{keyword} 通勤用ランキング`')) {
        lines[i] = "        return { title: `【2025】${keyword} おすすめランキング`, description: \"通勤や通学が快適になるガジェットを厳選紹介。\" };";
        console.log("Fixed SEO catch block.");
    }

    // 3. defaultContext definition (around line 136-145)
    if (lines[i].includes('target_reader: `${keyword}を探してぁE一般皁E読老E')) {
        lines.splice(i - 1, 9,
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
            "        comparison_axis: blueprint.comparison_axis || defaultContext.comparison_axis,"
        );
        console.log("Fixed defaultContext block.");
    }

    // 4. generateBuyingGuideBody catch block (around line 508)
    if (lines[i].includes('return "AI生Eに失敗しました、E;')) {
        lines[i - 1] = "        console.error(\"  ❌ AI Generation Failed:\", e);";
        lines[i] = "        return \"AI生成に失敗しました。\";";
        console.log("Fixed AI generation catch block.");
    }

    // 5. labelMap definition (around line 523)
    if (lines[i].includes("const labelMap = {")) {
        let endIndex = i;
        while (!lines[endIndex].includes("};")) endIndex++;
        if (lines[i + 1].includes("Model Name")) {
            lines.splice(i, endIndex - i + 1,
                "    const labelMap = {",
                "        'Model Name': '型番',",
                "        'Connectivity Technology': '接続方式',",
                "        'Wireless Communication Technology': 'ワイヤレス技術',",
                "        'Included Components': '付属品',",
                "        'Age Range (Description)': '対象年齢',",
                "        'Material': '素材',",
                "        'Specific Uses For Product': '用途',",
                "        'Charging Time': '充電時間',",
                "        'Recommended Uses For Product': '推奨用途',",
                "        'Compatible Devices': '対応機器',",
                "        'Control Type': '操作方式',",
                "        'Control Method': '操作方法',",
                "        'Number of Items': '個数',",
                "        'Batteries Required': 'バッテリー',",
                "        'Manufacturer': 'メーカー',",
                "        'Item Model Number': '型番',",
                "        'Package Dimensions': 'サイズ',",
                "        'Weight': '重量',",
                "        'Color': 'カラー'",
                "    };"
            );
            console.log("Fixed labelMap dictionary.");
        }
    }

    // 6. spec filter logic (around line 549)
    if (lines[i].includes(".filter(([k, v]) => !k.includes('特雁E')")) {
        lines[i] = "            .filter(([k, v]) => !k.includes('特徴') && !k.includes('満足度') && !k.includes('ランキング') && !k.includes('PV') && !k.includes('記事'))";
        console.log("Fixed spec array filter line 1");
    }

    // 7. spec length filter (around line 555)
    if (lines[i].includes(".filter(s => s.label && s.value && s.value !== '記載なぁE')")) {
        lines[i] = "            .filter(s => s.label && s.value && s.value !== '記載なし')";
        console.log("Fixed spec array filter line 2");
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
console.log('All targeted cleanups applied.');
