const fs = require('fs');
const file = 'c:/Users/Kokik/OneDrive/gemini/tech-trend-blog/scripts/universal_miner_situation_v1.js';
let content = fs.readFileSync(file, 'utf8');

// The block to replace
const oldText = `  - ⭕︁E**「機Eの有無EEN/OFFE」で判定できるもE限宁E*E侁E "防水", "ノイズキャンセリング", "ワイヤレス", "マイク", "ハイレゾ", "マルチEインチEE、E
      ↁE琁E: スクリプトはスペック値が「○」「対応」になってぁEか判定するため、E
  - ❁E**数値めEキストで表されるスペックは厳禁E*E侁E "連続E生時閁E, "重量", "サイズ", "允E端孁E, "カラー"E、E
      ↁE琁E: 値が、E0時間」や「USB-C」だと、「○」ではなぁEEで**誤って除夁E*されます、E
  - ❁E**検索ヒット率が低いニッチな用語E禁止**E侁E "XSサイズ", "趁E型", "睡眠用", "横向き"E、E
  - ※ 迷ったら**最も庁Eで安Eな語（侁E "防水"EE*めEつだけ選んでください、E`;

// The universal replacement text
const newText = `  - ⭕【重要: 機種の有無(ON/OFF)で判定できるもの限定】
      例: イヤホンなら「防水」「ノイズキャンセリング」、家具なら「完成品」「キャスター付き」、家電なら「タイマー機能」など。
      理由: スクリプトはスペック値が「○」や「対応」になっているか判定するため。
  - ❌【厳禁: 数値やテキストで表されるスペック】
      例: 「連続再生時間」「重量」「サイズ（幅・高さ）」「カラー」「耐荷重100kg」など。
      理由: 値が「10時間」や「ブラック」だと「○」ではないため誤って除外されます。
  - ❌【厳禁: 検索ヒット率が極端に低いニッチな用語】
      例: 「XSサイズ」「超小型」「睡眠用」など。
  - ※ 迷ったら、そのジャンルにおいて最も広範で安全な機能名（例: イヤホンなら"防水"、家具なら"完成品"）を1つだけ選んでください。`;

content = content.replace(oldText, newText);

// Another block to replace
const oldText2 = `- 侁E ジム用 ↁE「汗で壊れるEが怖い」「激しく動くと外れる」「集中したぁEE`;
const newText2 = `- 例: イヤホンのジム用 → 「汗で壊れるのが怖い」「激しく動くと外れる」\n- 例: ソファのペット用 → 「猫の爪でボロボロになる」「抜け毛の掃除が大変」`;
content = content.replace(oldText2, newText2);

// Another block to replace
const oldText3 = `- 侁E "【ジム専用】汗で壊れなぁE外れなぁE最強スポEチEヤホン5選"`;
const newText3 = `- 例: "【ジム専用】汗で壊れない・外れない！最強スポーツイヤホン5選" (イヤホンの場合)\n- 例: "【猫飼い必見】爪とぎされてもボロボロにならない！最強ソファ5選" (家具の場合)`;
content = content.replace(oldText3, newText3);


fs.writeFileSync(file, content);
console.log('Successfully applied universal updates to generateSituationBlueprint');
