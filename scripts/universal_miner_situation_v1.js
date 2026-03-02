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
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const SEED_KEYWORD = process.argv[2] || "ワイヤレスイヤホン";

if (!GEMINI_API_KEY) {
    console.error("❌ Error: API Key is missing.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

// ==========================================
// 🧠 AI動的サフィックス生成
// ==========================================
// seedキーワードに応じて、そのジャンル特有の状況サフィックスをAIが生成
// 例: "ワイヤレスイヤホン" → 眼鏡, 骨伝導, 耳が小さい, ASMR, 音漏れ
// 例: "オフィスチェア" → 腰痛, 猫背, 長時間デスクワーク, 在宅勤務
async function generateSituationSuffixes(seed, specDetails = '') {
    console.log(`\n🧠 AIが「${seed}」向けの状況サフィックスをブレインストーミング中...`);
    if (specDetails) console.log(`   → 価格.comスペック情報を参考に生成`);

    try {
        const result = await model.generateContent(`
あなたは「${seed}」という製品ジャンルの専門家です。

## この製品ジャンルのスペック情報（価格.comから実際に取得）
${specDetails || '（スペック情報なし）'}
上記スペックを参考に、各スペックが活きる状況・使ない場面を考えてください。

## 目的
「${seed}」を検索するユーザーが、**特定の状況・悩み・条件**で絞り込み検索する時に使うサフィックスを網羅的にリストアップしてください。

## ルール
- 「${seed} ○○○」の形で実際にGoogleで検索されそうな語句のみ
- 1〜4語の短いフレーズ（例: "耳が小さい", "腰痛持ち", "一人暮らし"）
- 以下のカテゴリを網羅すること:
  1. **身体的条件** — 体格、身体的制約、持病など
  2. **使用環境** — 仕事場、移動中、自宅、屋外など
  3. **アクティビティ** — 運動、趣味、作業など
  4. **年齢・属性** — 子供、女性、シニア、学生など
  5. **悩み・課題** — その製品ジャンル特有の困りごと
  6. **予算・購入動機** — コスパ、プレゼント、初心者など
  7. **スペック・機能ニーズ** — その製品特有の機能要件

## 除外するもの (NG)
- 「おすすめ」「ランキング」「比較」「最強」「人気」（汎用すぎる）
- ブランド名やモデル名（Sony, Appleなど）
- トラブルシューティング（「故障」「修理」など）
- 特定デバイス名（iPhone, PS5など — 内容が同じになる）

## 出力形式
カンマ区切りのリストのみを出力してください。説明は不要です。
`);

        let text = result.response.text();
        const suffixes = text.split(/,|、|\n/).map(s => s.trim().replace(/・/g, '')).filter(s => s.length > 1 && s.length < 20);

        // 重複除去 + 上限50
        const uniqueSuffixes = [...new Set(suffixes)].slice(0, 50);
        console.log(`   ✨ ${uniqueSuffixes.length} 個の状況サフィックスを生成:`);
        console.log(`   ${uniqueSuffixes.slice(0, 10).join(', ')} ...`);
        return uniqueSuffixes;

    } catch (e) {
        console.log(`   ⚠️ AI生成失敗: ${e.message}。フォールバックリストを使用。`);
        // 最低限の汎用フォールバック
        return [
            'テレワーク', '在宅勤務', '通勤', 'オフィス',
            '初心者', '女性', '子供', 'シニア',
            'コスパ', '高級', 'プレゼント',
            '一人暮らし', '長時間',
            '小さい', 'コンパクト', '軽い',
        ];
    }
}

// ==========================================
// 🚫 EXCLUDE PATTERNS (除外パターン)
// ==========================================
const EXCLUDE_PATTERNS = [
    'ランキング', 'おすすめ', '比較', '最強', '人気',
    '修理', '故障', '接続できない',
    '100均', 'ダイソー', 'セリア', 'ドンキ', 'コストコ',
    'メルカリ', 'ヤフオク', '中古',
];
// ==========================================
// 📋 動的スペック発見：記事生成と同じ market_research.js を使用
// ==========================================
// produce_from_blueprint.js と全く同じ手法で価格.comにアクセスし、
// そのカテゴリで実際に取得可能なスペック項目を調査する
// ※ 記事生成時のAIフィルタは全スペックをAIに渡して判断させるため、
//    ON/OFF限定ではなく全スペック項目を返す
async function discoverFilterableSpecs(seed) {
    console.log(`\n📋 価格.comスペック調査: 「${seed}」の利用可能スペックを探索中...`);
    console.log(`   → market_research.js (記事生成と同じ手法) を使用`);

    try {
        const { scrapeKakakuRankingWithEnrichment } = require('./lib/market_research');

        // 少数の商品だけ取得してスペック項目を調査（3商品で十分）
        const products = await scrapeKakakuRankingWithEnrichment(seed, {
            targetCount: 5,
            maxEnrich: 3,  // スペック調査なので3商品で十分
        });

        if (products.length === 0) {
            console.log('   ⚠️ 価格.comで商品が見つかりませんでした');
            return { labels: [], details: '' };
        }

        // 返ってきた商品の kakakuSpecs から全スペック項目を収集
        const specLabels = new Map(); // label → { sampleValue, count }

        products.forEach(p => {
            if (p.kakakuSpecs && typeof p.kakakuSpecs === 'object') {
                Object.entries(p.kakakuSpecs).forEach(([label, value]) => {
                    if (!specLabels.has(label)) {
                        specLabels.set(label, { sampleValue: String(value).slice(0, 40), count: 0 });
                    }
                    specLabels.get(label).count++;
                });
            }
        });

        // 全スペック項目をレポート
        const labels = [...specLabels.keys()];
        const details = [...specLabels.entries()]
            .map(([label, info]) => `${label} (例: ${info.sampleValue})`)
            .join('\n  ');

        console.log(`\n   📋 スペック調査結果 (${specLabels.size} 項目):`);
        specLabels.forEach((info, label) => {
            console.log(`      ${label} = ${info.sampleValue} (${info.count}商品)`);
        });
        console.log(`\n   🎯 利用可能スペック: ${labels.length} 項目`);

        return { labels, details };

    } catch (e) {
        console.log(`   ⚠️ スペック調査エラー: ${e.message}`);
        return { labels: [], details: '' };
    }
}

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
async function mineSituationKeywords(seed, specDetails = '') {
    // AIが seed + スペック情報 に合わせた状況サフィックスを動的生成
    const SITUATION_SUFFIXES = await generateSituationSuffixes(seed, specDetails);

    console.log(`\n🎯 Phase 1: Mining Situation-Based Keywords for "${seed}"...`);
    console.log(`   Testing ${SITUATION_SUFFIXES.length} situation suffixes...\n`);

    const validatedKeywords = [];
    let count = 0;

    for (const suffix of SITUATION_SUFFIXES) {
        count++;
        const query = `${seed} ${suffix}`;
        process.stdout.write(`   [${count}/${SITUATION_SUFFIXES.length}] "${query}" `);

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
async function generateSituationBlueprint(seed, situationData, specResult) {
    const { situation, baseQuery, suggestions } = situationData;
    const specDetails = specResult.details || '';

    // スペック情報は main() で事前取得済み → 引数から受け取る

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
3. この状況に最適な製品の**必須条件**を、下記の「使用可能スペック」の中から選んでください

## 🚫 禁止事項
- 「○○おすすめランキング」のような汎用タイトルは禁止
- 「通勤電車で〜」のような**他の状況を混ぜる**のは禁止
- 「${situation}」に特化していない内容は禁止

## ✅ 承認基準 (status: APPROVED)
1. **独自性**: この状況ならではの「選び方の基準」が存在する
2. **需要**: 深刻な悩みや、強いこだわりがある
3. **スペック判定可能**: 下記「使用可能スペック」で客観的に製品を絞り込める

## 設計指示

### 1. 検索意図の深掘り (search_intent_analysis)
- この状況にいるユーザーの「隠れた悩み」「本当のペイン」は何か？

### 2. タイトル設計 (title)
- **「誰の」「どんな悩みを」「どう解決するか」**が一目でわかるタイトル
- 必ず「【${situation}】」や状況を示す言葉を含める

### 3. ターゲット読者 (target_reader)
- **徹底的に具体的かつニッチな状況**を描写する。

### 4. 比較軸 (comparison_axis) ★重要★
- そのターゲット層が**「共通して最も重視するポイント」**を主軸にする。
- ★★★ ただし、以下の制約を守ること ★★★
  - 比較軸は**上記のスペック項目で客観的に比較・検証できるもの**に限る
  - ⭕️ 良い例: 「ノイズキャンセリング有無」「防水等級」「重量」「バッテリー時間」「マルチポイント対応」
  - ❌ 悪い例: 「マイク品質」「装着感」「音質の良さ」（スペック表で判定不能、レビューなしでは評価できない）
  - 主観的な評価軸は記事の文章では触れてOKだが、comparison_axisには入れないこと
- カンマ区切りの文字列

### 5. セールスフック (sales_hook)
- その悩みを持つ層全体に対し、「この記事が最適解である」と約束する。

### 6. 導入部設計 (intro_structure)
- hook: 多くの読者が「自分のことだ」と感じる共感
- background_explanation: 従来品ではなぜダメなのか？

### 7. フィルタリング情報 (★最重要: 記事生成スクリプト互換性★)
- **price_min / price_max**: ★★★ 必ず実際の円の数値を入れること。絶対に0にしないこと ★★★
  - その状況のターゲット層が買う現実的な価格帯を設定する（例: 学生向けなら3000〜15000、高級志向なあ20000〜80000）
  - price_min: 0 は密店など高すぎる商品を混ぜない場合のOKだが、price_max: 0 は絶対禁止
  - price_max は「この状況の人が出せる上限」を入れる
- **required_features**: ★★★ 以下のルールを絶対に守ること ★★★
  **【価格.comから実際に取得したスペック項目】**
  以下は実際の商品のスペック表から取得した項目と値の例です。
  required_featuresには、この中から**その状況で必須となるスペック項目名**を選んでください：
  ${specDetails || '（データなし — 空配列 [] にしてください）'}

  - ⭕️ 上記リストに存在するスペック項目名のみ使用可能
  - ⭕️ 値が「○」「対応」のスペック → そのまま有無で判定できる（例: "ノイズキャンセリング"）
  - ⭕️ 値が数値やテキストのスペック → AIが解釈して判定する（例: "防水・防塵性能" の値が "IPX4" → 防水ありと判定）
  - ❌ 上記リストにない項目は絶対に指定禁止（例: "耳掛けフック", "心拍数計測" 等）
  - ※ 該当するスペックがない場合は required_features: [] （空配列）にしてください

### 8. ランキング基準 (ranking_criteria)
- ★ comparison_axis と同様、**スペック表で客観的に検証可能な基準のみ**にすること
- 各基準は上記スペック項目リストと対応していること

## 出力JSON (承認時 - Universal Miner God v12完全互換)
{
  "status": "APPROVED",
  "keyword": "${baseQuery}", 
  "title": "...",
  "search_intent_analysis": "...",
  "intro_structure": { "hook": "...", "background_explanation": "..." },
  "ranking_criteria": ["基準1", "基準2", "基準3"],  // ★スペック検証可能な基準のみ★
  "target_reader": "...",
  "user_demographics": {
    "situation": "${situation}",
    "pain_point": "...",
    "desire": "..."
  },
  "is_specialized_theme": true,
  "comparison_axis": "...",
  "sales_hook": "...",
  "ranking_count": 10,
  "price_min": 3000,   // ★実際の円の数値を入れること。0は禁止★
  "price_max": 30000,  // ★その状況のターゲット層の上限価格★
  "required_features": ["..."]  // ★上記リストからのみ選択★
}

## 出力JSON (却下時)
{ "status": "REJECT", "reason": "却下理由" }
`;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const blueprint = JSON.parse(text);

        // バリデーション: price_max が 0 の場合はデフォルト値を設定
        if (blueprint.status === 'APPROVED') {
            if (!blueprint.price_max || blueprint.price_max === 0) {
                console.log(`   ⚠️ price_max が 0 → 自動修正: 50000`);
                blueprint.price_max = 50000;
            }
            if (blueprint.price_min === undefined || blueprint.price_min === null) {
                blueprint.price_min = 0;
            }
        }

        return blueprint;
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

    // Phase 0: 価格.comからスペック情報を事前取得（1回だけ）
    const specResult = await discoverFilterableSpecs(SEED_KEYWORD);

    // Phase 1: Mine situation keywords（スペック情報込みでAI生成）
    const situationKeywords = await mineSituationKeywords(SEED_KEYWORD, specResult.details);

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

        const blueprint = await generateSituationBlueprint(SEED_KEYWORD, sit, specResult);

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
