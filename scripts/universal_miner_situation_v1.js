/**
 * 🎯 Universal Miner - Situation Edition v1
 * 
 * 従来のランキング記事（価格帯、おすすめ）ではなく、
 * 「特定の状況にいるユーザー」を対象としたニッチなキーワードを発掘
 * 
 * [戦略]
 * 1. 「ユーザーの状況」を表すサフィックスを網羅的に試す
 * 2. Googleサジェストで需要を検証
 * 3. 需要があるものだけをBlueprint化
 * 
 * [使い方]
 * node scripts/universal_miner_situation_v1.js "ワイヤレスイヤホン"
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const SEED_KEYWORD = process.argv[2] || "ワイヤレスイヤホン";

if (!GEMINI_API_KEY) {
    console.error("❌ Error: API Key is missing.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// ==========================================
// 🎯 SITUATION SUFFIXES (状況ベースのキーワード)
// ==========================================
// これらは「ランキング」ではなく「特定の状況・ペルソナ」を表す
// ==========================================
// 🧠 AI BRAIN: DYNAMIC SITUATION GENERATOR
// ==========================================
async function generateSituationSuffixes(seed) {
    console.log(`\n🧠 AI Brain is brainstorming situation scenarios for "${seed}"...`);

    const prompt = `
    あなたはWebコンテンツ戦略の専門家です。キーワード「${seed}」に関連する、50個の「特定の状況」や「ユーザー属性」を表す検索サフィックスを考えてください。
    
    ## 目的
    一般的なランキングではなく、「特定の悩み」や「特殊なニーズ」を持つニッチなターゲット層を見つけること。
    
    ## 含めるべきカテゴリ
    1. **使用シーン** (例: 狭い部屋, 一人暮らし, 同棲, アウトドア, 車中泊, 風呂...)
    2. **ユーザー属性** (例: 腰痛持ち, 猫飼い, 赤ちゃん, 高齢者, ミニマリスト, 初心者...)
    3. **物理的制約** (例: 6畳, 賃貸, 角部屋, 収納なし, 壁が薄い...)
    4. **特定の悩み** (例: 蒸れない, 掃除しやすい, 傷つかない, 組み立て不要, 痛くない...)
    5. **ライフスタイル** (例: 在宅勤務, ゲーム廃人, 読書, 映画鑑賞, 深夜...)

    ## 除外するもの (NG)
    - 汎用的な言葉 (おすすめ, ランキング, 安い, 人気, 比較, 最新, 最強, コスパ)
    - ブランド名単体 (IKEA, ニトリ, 無印, Apple, Sony...)
    
    ## 出力形式
    カンマ区切りのリストのみを出力してください。
    例: 一人暮らし, 6畳, 腰痛, 猫, 北欧, テレワーク, ...
    `;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        const suffixes = text.split(/,|\n/).map(s => s.trim().replace(/・/g, '')).filter(s => s.length > 1);

        // Remove duplicates and limit to 50
        const uniqueSuffixes = [...new Set(suffixes)].slice(0, 50);

        console.log(`   ✨ Brainstormed ${uniqueSuffixes.length} unique situations:`);
        console.log(`   ${uniqueSuffixes.slice(0, 5).join(', ')} ... and more`);

        return uniqueSuffixes;
    } catch (e) {
        console.error(`   ⚠️ Brainstorming failed: ${e.message}`);
        return [ // Fallback for earphones if AI fails
            'テレワーク', 'ゲーム', '睡眠', 'スポーツ', '耳が小さい', 'メガネ', 'iPhone', 'PC', '通勤', '勉強'
        ];
    }
}


// ==========================================
// 🚫 EXCLUDE PATTERNS (除外パターン)
// ==========================================
const EXCLUDE_PATTERNS = [
    // ランキング系（今回は避ける）
    'ランキング', 'おすすめ', '比較', '最強', '人気',
    // トラブルシューティング
    '修理', '故障', '接続できない', '聞こえない', '片方',
    // 非Amazon
    '100均', 'ダイソー', 'セリア', 'ドンキ', 'コストコ',
    'メルカリ', 'ヤフオク', '中古',
];

// ==========================================
// 📊 Googleサジェストで需要を検証
// ==========================================
async function fetchSuggestions(query) {
    try {
        const url = `http://suggestqueries.google.com/complete/search?client=firefox&hl=ja&gl=jp&q=${encodeURIComponent(query)}`;
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
        return (res.data && res.data[1]) ? res.data[1] : [];
    } catch { return []; }
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ==========================================
// 🔍 PHASE 1: SITUATION KEYWORD MINING
// ==========================================
async function mineSituationKeywords(seed, customSuffixes = []) {
    console.log(`\n🎯 Phase 1: Mining Situation-Based Keywords for "${seed}"...`);
    const targetSuffixes = customSuffixes.length > 0 ? customSuffixes : []; // SITUATION_SUFFIXES was removed
    console.log(`   Testing ${targetSuffixes.length} situation suffixes...\n`);

    const validatedKeywords = [];
    let count = 0;

    for (const suffix of targetSuffixes) {
        count++;
        const query = `${seed} ${suffix}`;
        process.stdout.write(`   [${count}/${targetSuffixes.length}] "${query}" `);

        // Get suggestions for this query
        const suggestions = await fetchSuggestions(query);

        // Check if the query itself or similar appears in suggestions
        const hasExactMatch = suggestions.some(s => s.toLowerCase().includes(suffix.toLowerCase()));
        const hasSeedMatch = suggestions.length > 0;

        if (hasExactMatch || hasSeedMatch) {
            // Filter out excluded patterns
            const isExcluded = EXCLUDE_PATTERNS.some(p =>
                suggestions.some(s => s.includes(p))
            );

            // Get related suggestions that are NOT generic rankings
            const relevantSuggestions = suggestions.filter(s => {
                // Must contain the seed keyword
                if (!s.includes(seed)) return false;
                // Must contain the situation suffix
                if (!s.toLowerCase().includes(suffix.toLowerCase())) return false;
                // Must NOT be a generic ranking keyword
                if (EXCLUDE_PATTERNS.some(p => s.includes(p))) return false;
                return true;
            });

            if (relevantSuggestions.length > 0 || hasExactMatch) {
                console.log(`✅ DEMAND FOUND (${suggestions.length} suggestions)`);
                validatedKeywords.push({
                    situation: suffix,
                    baseQuery: query,
                    suggestions: relevantSuggestions.slice(0, 3),
                    demandScore: suggestions.length
                });
            } else if (hasSeedMatch && !isExcluded) {
                console.log(`⚙️ Partial (${suggestions.length})`);
                // Still include if there's some demand
                validatedKeywords.push({
                    situation: suffix,
                    baseQuery: query,
                    suggestions: suggestions.filter(s => s.includes(seed)).slice(0, 2),
                    demandScore: Math.floor(suggestions.length / 2)
                });
            } else {
                console.log(`❌ Excluded/Weak`);
            }
        } else {
            console.log(`❌ No demand`);
        }

        await delay(200); // Rate limiting
    }

    // Sort by demand score
    validatedKeywords.sort((a, b) => b.demandScore - a.demandScore);

    console.log(`\n📊 Found ${validatedKeywords.length} situation-based keywords with demand`);
    return validatedKeywords;
}

// ==========================================
// 🏗️ PHASE 2: BLUEPRINT GENERATION
// ==========================================
async function generateSituationBlueprint(seed, situationData) {
    const { situation, baseQuery, suggestions } = situationData;

    const prompt = `
あなたはWebコンテンツ戦略の分析官です。
「${seed}」を「${situation}」という**特定の状況**で使いたいユーザー向けの記事を設計してください。

重要: これは「ランキング記事」ではありません。
「${situation}」という検索ワードには、一般的なおすすめ記事では満たせない**独自の悩み**があります。

## Googleサジェストで見つかった関連キーワード
${suggestions.join(', ') || baseQuery}

## タスク
1. この「状況」で検索する人の**具体的な悩み・不安**を深堀りしてください
2. 一般的なランキング記事では解決できない**この状況特有の選び方ポイント**を特定してください
3. この状況に最適な製品の**必須条件**を明確にしてください

## 🚫 禁止事項
- 「○○おすすめランキング」のような汎用タイトルは禁止
- 「通勤電車で〜」のような**他の状況を混ぜる**のは禁止
- 「${situation}」に特化していない内容は禁止

## ✅ 承認基準 (status: APPROVED)
1. **独自性**: この状況ならではの「選び方の基準」が存在する
2. **需要**: 深刻な悩みや、強いこだわりがある

## 設計指示

### 1. 検索意図の深掘り (search_intent_analysis)
- この状況にいるユーザーの「隠れた悩み」「本当のペイン」は何か？
- 例: ジム用 → 「汗で壊れるのが怖い」「激しく動くと外れる」「集中したい」

### 2. タイトル設計 (title)
- **「誰の」「どんな悩みを」「どう解決するか」**が一目でわかるタイトル
- 必ず「【${situation}】」や状況を示す言葉を含める
- 例: "【ジム専用】汗で壊れない！外れない！最強スポーツイヤホン5選"

### 3. ターゲット読者 (target_reader)
- **徹底的に具体的かつニッチな状況**を描写する。
- ❌ 「ジムに通う人」
- ⭕️ 「週3回ジムに通い、激しいHIITトレーニング中も絶対にズレおちず、汗で水没しないタフな相棒を探しているトレーニー」

### 4. 比較軸 (comparison_axis) ★重要★
- そのターゲット層が**「共通して最も重視するポイント」**を主軸にする。
- カンマ区切りの文字列（例: "防水・防汗性能, 装着安定性（外れにくさ）, 重低音"）

### 5. セールスフック (sales_hook)
- その悩みを持つ層全体に対し、「この記事が最適解である」と約束する。

### 6. 導入部設計 (intro_structure)
- hook: 多くの読者が「自分のことだ」と感じる共感
- background_explanation: 従来品（普通の製品）ではなぜダメなのか？

### 7. フィルタリング情報 (重要: Kakaku.com互換性)
- **price_min / price_max**: 
  - その状況で「安物買いの銭失い」を防ぐための最低価格、または学生などのための上限価格。
  - 数値（円）で出力。
- **required_features**:
  - **フィルタリング用の「検索可能な」必須キーワード**。
  - ⭕️ **「機能の有無（ON/OFF）」で判定できるもの限定**（例: "防水", "ノイズキャンセリング", "ワイヤレス", "マイク", "ハイレゾ", "マルチポイント"）。
      → 理由: スクリプトはスペック値が「○」「対応」になっているか判定するため。
  - ❌ **数値やテキストで表されるスペックは厳禁**（例: "連続再生時間", "重量", "サイズ", "充電端子", "カラー"）。
      → 理由: 値が「10時間」や「USB-C」だと、「○」ではないので**誤って除外**されます。
  - ❌ **検索ヒット率が低いニッチな用語は禁止**（例: "XSサイズ", "超小型", "睡眠用", "横向き"）。
  - ※ 迷ったら**最も広義で安全な語（例: "防水"）**を1つだけ選んでください。

## 出力JSON (承認時 - Universal Miner God v12完全互換)
{
  "status": "APPROVED",
  "keyword": "${baseQuery}", 
  "title": "...",
  "search_intent_analysis": "...",
  "intro_structure": { "hook": "...", "background_explanation": "..." },
  "ranking_criteria": ["基準1", "基準2", "基準3"],
  "target_reader": "...", // 戦略的ターゲット記述
  "user_demographics": { // ターゲット構成要素
    "situation": "${situation}", // 状況
    "pain_point": "...", // 悩み
    "desire": "..." // 願望
  },
  "is_specialized_theme": true,
  "comparison_axis": "...", // カンマ区切り文字列
  "sales_hook": "...",
  "ranking_count": 10,
  "price_min": 0,
  "price_max": 0,
  "required_features": ["..."]
}

## 出力JSON (却下時)
{ "status": "REJECT", "reason": "却下理由" }
`;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (e) {
        console.log(`   ⚠️ Blueprint generation failed: ${e.message}`);
        return null;
    }
}

// ==========================================
// 🚀 MAIN EXECUTION
// ==========================================
async function main() {
    console.log(`\n🎯 UNIVERSAL MINER - SITUATION EDITION v1`);
    console.log(`   Target: "${SEED_KEYWORD}"`);
    console.log(`   Strategy: Find situation-based niches with verified demand\n`);
    console.log('='.repeat(60));

    // Phase 1: Brainstorm & Mine
    const situationSuffixes = await generateSituationSuffixes(SEED_KEYWORD);

    // We modify mineSituationKeywords to accept the list
    const situationKeywords = await mineSituationKeywords(SEED_KEYWORD, situationSuffixes);

    if (situationKeywords.length === 0) {
        console.log("\n❌ No situation-based keywords found with demand.");
        return;
    }

    // Take top 20 by demand
    const topSituations = situationKeywords.slice(0, 20);

    console.log(`\n🏗️ Phase 2: Generating Blueprints for top ${topSituations.length} situations...\n`);

    const blueprints = [];
    for (let i = 0; i < topSituations.length; i++) {
        const sit = topSituations[i];
        process.stdout.write(`   [${i + 1}/${topSituations.length}] "${sit.situation}" (Demand: ${sit.demandScore})... `);

        const blueprint = await generateSituationBlueprint(SEED_KEYWORD, sit);

        if (blueprint && blueprint.status === "APPROVED") {
            console.log("✅ APPROVED");
            blueprint.demandScore = sit.demandScore;
            blueprint.googleSuggestions = sit.suggestions;
            blueprints.push({
                keyword: sit.baseQuery,
                situation: sit.situation,
                demandScore: sit.demandScore,
                blueprint: blueprint
            });
        } else {
            const reason = blueprint?.reason || blueprint?.status || "Generation failed";
            console.log(`❌ ${reason}`);
        }

        await delay(1500); // Rate limiting for Gemini
    }

    // Save results
    const filename = `SITUATION_BLUEPRINTS_${SEED_KEYWORD.replace(/\s+/g, '_')}.json`;
    fs.writeFileSync(filename, JSON.stringify(blueprints, null, 2));

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✨ MISSION COMPLETE ✨`);
    console.log(`   Found ${situationKeywords.length} situation keywords with demand`);
    console.log(`   Generated ${blueprints.length} approved blueprints`);
    console.log(`   Saved to: ${filename}`);
    console.log(`\n📋 Approved Situations:`);
    blueprints.forEach((b, i) => {
        console.log(`   ${i + 1}. [${b.situation}] ${b.blueprint.title?.slice(0, 50)}...`);
    });
}

main();
