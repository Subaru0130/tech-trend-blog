const fs = require('fs');
const path = require('path');

const FILE_PATH = path.resolve(__dirname, '../BATCH_BLUEPRINTS_ワイヤレスイヤホン.json');

try {
    const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
    let updatedCount = 0;

    const updatedData = data.map(entry => {
        if (!entry.blueprint) return entry;

        const kw = entry.keyword || "";
        const comparisonAxis = entry.blueprint.comparison_axis || "";

        // Determine specialized status
        // Keywords implying single focus: 最強, 特化, 重視, コスパ, ノイキャン, 安い
        const isSpecialized = /最強|特化|重視|コスパ|ノイキャン|安い|低音|通話/.test(kw);

        let focus = "総合性能";
        if (isSpecialized) {
            if (/ノイキャン|ノイズキャンセリング/.test(kw)) focus = "ノイズキャンセリング性能";
            else if (/コスパ|安い|1万円|5000円/.test(kw)) focus = "コスパ（価格対性能）";
            else if (/音質|重低音|ハイレゾ/.test(kw)) focus = "音質";
            else if (/通話|マイク/.test(kw)) focus = "通話品質";
            else if (/スポーツ|ランニング/.test(kw)) focus = "装着感と防水性";
            else if (/iphone/i.test(kw)) focus = "iPhoneとの相性";
            else if (/ゲーム|遅延/.test(kw)) focus = "低遅延・定位感";
            else focus = comparisonAxis.split('、')[0] || "主要機能"; // Fallback to first item
        }

        // Only update if missing (or force update logic if needed, here we just add if missing)
        // entry.blueprint.is_specialized_theme = isSpecialized;
        // entry.blueprint.primary_evaluation_focus = focus;

        // Actually, let's just force update to be sure
        return {
            ...entry,
            blueprint: {
                ...entry.blueprint,
                is_specialized_theme: isSpecialized,
                primary_evaluation_focus: focus
            }
        };
    });

    fs.writeFileSync(FILE_PATH, JSON.stringify(updatedData, null, 2));
    console.log(`✅ Updated ${updatedData.length} blueprints.`);

    // Check first few
    console.log("Samples:");
    updatedData.slice(0, 3).forEach(d => {
        console.log(`[${d.keyword}] Specialized: ${d.blueprint.is_specialized_theme}, Focus: ${d.blueprint.primary_evaluation_focus}`);
    });

} catch (e) {
    console.error("Error:", e);
}
