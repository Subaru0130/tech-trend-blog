const fs = require('fs');
const path = require('path');

const FILE_PATH = path.resolve(__dirname, '../BATCH_BLUEPRINTS_ワイヤレスイヤホン.json');
const TARGET_KEYWORD = "ワイヤレスイヤホン おすすめ ノイズキャンセリング";

try {
    const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
    let found = false;

    const updatedData = data.map(entry => {
        if (entry.keyword === TARGET_KEYWORD) {
            console.log(`🎯 Found target blueprint: ${entry.keyword}`);
            found = true;
            return {
                ...entry,
                blueprint: {
                    ...entry.blueprint,
                    // Force specialize
                    is_specialized_theme: true,
                    primary_evaluation_focus: "ノイズキャンセリング性能",
                    // Also update comparison_axis to focus purely on NC
                    comparison_axis: "ノイズキャンセリング性能（低周波ノイズのカット率、人の声の遮断性、圧迫感のなさ、外音取り込みの自然さ）"
                }
            };
        }
        return entry;
    });

    if (found) {
        fs.writeFileSync(FILE_PATH, JSON.stringify(updatedData, null, 2));
        console.log(`✅ Update successful for: ${TARGET_KEYWORD}`);
    } else {
        console.log(`❌ Target keyword not found: ${TARGET_KEYWORD}`);
    }

} catch (e) {
    console.error("Error:", e);
}
