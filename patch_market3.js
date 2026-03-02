const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/market_research.js', 'utf8').split(/\r?\n/);
let start = -1;
let end = -1;
for (let i = 300; i < 340; i++) {
    if (lines[i] && lines[i].includes('const prompt = `')) {
        start = i;
    }
    if (start !== -1 && i > start && lines[i].includes('`;')) {
        end = i;
        break;
    }
}
if (start !== -1 && end !== -1) {
    const newPrompt = [
        "    const prompt = `",
        "あなたは製品調査アシスタントです。以下のWeb検索結果から、「${keyword}」に該当する具体的な製品名を抽出してください。",
        "",
        "【検索結果】",
        "${context}",
        "",
        "【抽出ルール】",
        "1. 具体的な製品名のみを抽出（例： \"Sony WF-1000XM5\", \"Anker Soundcore Space A40\"）",
        "2. カテゴリ名（例： \"ワイヤレスイヤホン\"）は除外",
        "3. 関連部品（ケース、イヤーピース等）は除外",
        "4. ${blueprint?.comparison_axis ? \\`比較軸「\\${blueprint.comparison_axis}」に強く関連し、その性能が高く評価されている製品を厳選して抽出\\` : '検索結果で高く評価されている製品を優先'}",
        "5. 最大20製品まで",
        "",
        "【出力形式】",
        "JSON配列で出力",
        "[\"製品名1\", \"製品名2\", ...]",
        "",
        "製品が見つからない場合は空配列 [] を返してください。",
        "`;"
    ];
    lines.splice(start, end - start + 1, ...newPrompt);
    console.log("Fixed market_research.js prompt 2");
} else {
    console.log("Could not find prompt 2 bounds", start, end);
}
fs.writeFileSync('scripts/lib/market_research.js', lines.join('\n'));
