const fs = require('fs');
const file = 'c:/Users/Kokik/OneDrive/gemini/tech-trend-blog/scripts/universal_miner_situation_v1.js';
let content = fs.readFileSync(file, 'utf8');

// Upgrade model
content = content.replace(/model:\s*"gemini-2\.0-flash"/, 'model: "gemini-3-flash-preview"');

// Update prompt to restrict verifiable specs
const oldPrompt = 'のシチュエーション・用途・悩みのキーワードを';
const newPrompt = `のシチュエーション・用途・悩みのキーワードを

    【超重要コンプライアンス（絶対に守ること）】
    Amazon等のスペック表（IPX防水等級、連続再生時間、重量・サイズ、ノイズキャンセリング有無、マルチポイント有無、対応コーデック、価格など）で「客観的な数値・機能として証明できる」シチュエーションのみを厳選してください。
    
    ❌ 絶対にNGな例（客観的スペックがない、または差別化できない）
    - 低遅延、FPS用、ゲーム用（※具体的な遅延ms数が公開されていないため不可）
    - iPhone用、Windows用、Mac用、PC用（※Bluetooth対応ならどれでも繋がり差別化できないため不可）
    - 高音質（※主観的すぎるため不可）
    
    ✅ OKな例（スペックで証明できる）
    - ジム用、お風呂用（IPX防水等級で証明可能）
    - 睡眠用、耳が小さい（本体重量やサイズで証明可能）
    - テレワーク、飛行機（ノイキャン有無、マイクで証明可能）
    - 2台同時接続（マルチポイント対応で証明可能）

上記を守り、`;

content = content.replace(oldPrompt, newPrompt);
fs.writeFileSync(file, content);
console.log('Successfully patched universal_miner_situation_v1.js');
