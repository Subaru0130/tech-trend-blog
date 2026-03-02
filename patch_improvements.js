const fs = require('fs');
const file = 'c:/Users/Kokik/OneDrive/gemini/tech-trend-blog/scripts/universal_miner_situation_v1.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Inject getAvailableSpecs function before generateSituationBlueprint
const injectSpecsFunc = `// ==========================================
// 🏗️ PHASE 2: BLUEPRINT GENERATION
// ==========================================
function getAvailableSpecs() {
    try {
        const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));
        const specSet = new Set();
        products.forEach(p => {
            if(p.specs) p.specs.forEach(s => specSet.add(s.label.replace(/\\*.*$/, '').trim()));
        });
        const specsArray = Array.from(specSet).filter(s => s).slice(0, 100);
        if(specsArray.length > 0) {
            return "【DBに存在する有効な絞り込みスペック一覧】\\n" + specsArray.map(s => '"' + s + '"').join(', ') + "\\n\\n⚠️絶対厳守: required_featuresには、必ず上記リストに完全一致する文字列のみを含めてください。適当なスペックを創作しないでください。該当がなければ空配列 [] にしてください。";
        }
    } catch(e) {}
    return "⚠️絶対厳守: required_featuresは機能有無(ON/OFF)で判定できる最も一般的な語のみを指定してください。テキストや数値のスペック（重量、サイズ等）は機能検証できないため絶対に入れないでください。";
}

async function generateSituationBlueprint(seed, situationData) {
    const { situation, baseQuery, suggestions } = situationData;
    const availableSpecsText = getAvailableSpecs();`;

content = content.replace(/\/\/ ==========================================\n\/\/ 🏗️ PHASE 2: BLUEPRINT GENERATION\n\/\/ ==========================================\nasync function generateSituationBlueprint\(seed, situationData\) {\n\s*const { situation, baseQuery, suggestions } = situationData;/, injectSpecsFunc);


// 2. Modify "7. フィルタリング情報" in the prompt
const oldFilteringText = `### 7. フィルタリング惁E (重要E Kakaku.com互換性)
- **price_min / price_max**: 
  - そE状況で「安物買ぁEE銭失ぁEを防ぐためE最低価格、またE学生などのための上限価格、E
  - 数値EEEで出力、E
- **required_features**:
  - ⭕【重要: 機種の有無(ON/OFF)で判定できるもの限定】
      例: イヤホンなら「防水」「ノイズキャンセリング」、家具なら「完成品」「キャスター付き」、家電なら「タイマー機能」など。
      理由: スクリプトはスペック値が「○」や「対応」になっているか判定するため。
  - ❌【厳禁: 数値やテキストで表されるスペック】
      例: 「連続再生時間」「重量」「サイズ（幅・高さ）」「カラー」「耐荷重100kg」など。
      理由: 値が「10時間」や「ブラック」だと「○」ではないため誤って除外されます。
  - ❌【厳禁: 検索ヒット率が極端に低いニッチな用語】
      例: 「XSサイズ」「超小型」「睡眠用」など。
  - ※ 迷ったら、そのジャンルにおいて最も広範で安全な機能名（例: イヤホンなら"防水"、家具なら"完成品"）を1つだけ選んでください。`;

const newFilteringText = `### 7. フィルタリング情報 (重要: 実在するデータとの検証)
- **price_min / price_max**: 
  - その状況で「安物買いの銭失い」を防ぐための最低価格、または上限価格。
  - 数値のみで出力。
- **required_features**:
  \${availableSpecsText}

### 8. 読者の心のつぶやき (reader_empathy_phrase)
- 読者が検索窓にキーワードを打ち込む時の、リアルで生々しい「心の声・痛みの独白」を記述してください。
- このセリフがあることで、記事の書き出しが圧倒的に共感性の高いものになります。
- 例: 「あーあ、また汗でイヤホン壊れた…。安物買いの銭失いだったな。次こそは絶対、水洗いできるくらいタフなやつにしよう…」

### 9. SEOメタディスクリプション (meta_description)
- 検索結果に表示される120文字前後の要約文。検索者の悩みに刺さり、思わずクリックしたくなる魅力的なテキストにしてください。`;

// Replace using a simpler regex since encoding characters might differ
content = content.replace(/### 7\. フィルタリング(.*?)つだけ選んでください、E/s, newFilteringText);

// 3. Update the output JSON structure
const oldJsonOutput = `## 出力JSON (承認時 - Universal Miner God v12完E互換)
{
  "status": "APPROVED",
  "keyword": "\${baseQuery}", 
  "title": "...",
  "search_intent_analysis": "...",
  "intro_structure": { "hook": "...", "background_explanation": "..." },
  "ranking_criteria": ["基溁E", "基溁E", "基溁E"],
  "target_reader": "...", // 戦略皁EーゲチE記述
  "user_demographics": { // ターゲチE構E要素
    "situation": "\${situation}", // 状況E
    "pain_point": "...", // 悩み
    "desire": "..." // 願望
  },
  "is_specialized_theme": true,
  "comparison_axis": "...", // カンマ区刁E斁EE
  "sales_hook": "...",
  "ranking_count": 10,
  "price_min": 0,
  "price_max": 0,
  "required_features": ["..."]
}`;

const newJsonOutput = `## 出力JSON (承認時 - Universal Miner God v12完全互換)
{
  "status": "APPROVED",
  "keyword": "\${baseQuery}", 
  "title": "...",
  "meta_description": "...", // 提案3: SEO用の120文字要約
  "search_intent_analysis": "...",
  "reader_empathy_phrase": "...", // 提案2: 読者の生々しい心の声
  "intro_structure": { "hook": "...", "background_explanation": "..." },
  "ranking_criteria": ["基準1", "基準2", "基準3"],
  "target_reader": "...", 
  "user_demographics": { 
    "situation": "\${situation}", 
    "pain_point": "...", 
    "desire": "..." 
  },
  "is_specialized_theme": true,
  "comparison_axis": "...", 
  "sales_hook": "...",
  "ranking_count": 10,
  "price_min": 0,
  "price_max": 0,
  "required_features": ["..."] // 提案1: DB実在のスペック名のみ
}`;

content = content.replace(/## 出力JSON \(承認時 - Universal Miner God v12完(.*?)\]\n\}/s, newJsonOutput);

fs.writeFileSync('c:/Users/Kokik/OneDrive/gemini/tech-trend-blog/scripts/universal_miner_situation_v1_patched.js', content);
console.log('Created universal_miner_situation_v1_patched.js');
