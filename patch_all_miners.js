const fs = require('fs');

const files = [
    'scripts/universal_miner_god_v12.js',
    'scripts/universal_miner_god_v11.js',
    'scripts/universal_miner_final.js'
];

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');

        const target = /### 4\. 比較軸 \(comparison_axis\)[\s\S]*?(?=### 5\.)/g;
        // Or if mojibake is present:
        const altTarget = /### 4\. 比輁E \(comparison_axis\)[\s\S]*?(?=### 5\.)/g;

        const newText = `### 4. 比較軸 (comparison_axis) ★重要★
- そのターゲット層が**「共通して最も重視するポイント」**を主軸にする。
- カンマ区切りの文字列（例: "防水・防汗性能, 装着安定性（外れにくさ）, コストパフォーマンス"）
- 🚫 **絶対に守るべき制約**: この比較軸は、後続のAIが**以下のデータソースのみ**から客観的に判定できる項目に限定してください。
  1. 価格.comの「スペック表（例: 連続再生時間、ノイズキャンセリング機能の有無、防水規格、重量など）」
  2. Amazonや価格.comの「ユーザー口コミテキスト（例: 装着感、音漏れ、初期不良などについて言及された生の声）」
  - ⭕️ 判定可能（許可）: 「ノイズキャンセリングの強さ（口コミでわかる）」「バッテリー持ち（スペック表に載る）」「装着の安定性（口コミで言及されやすい）」「コスパ（仕様と価格から判定可能）」など。
  - ❌ 判定不可能（禁止）: 「高音の伸び」「解像度の高さ」「圧倒的な没入感」など、スペック表に載らず、ネットの一般的な口コミでも個人差が大きすぎるため判定できない主観的・抽象的な指標。

`;

        if (content.match(target)) {
            content = content.replace(target, newText);
            fs.writeFileSync(file, content);
            console.log(`Updated comparison_axis in ${file}`);
        } else if (content.match(altTarget)) {
            content = content.replace(altTarget, newText);
            fs.writeFileSync(file, content);
            console.log(`Updated comparison_axis (with mojibake) in ${file}`);
        }
    }
}
