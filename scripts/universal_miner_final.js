/**
 * 🌍 Universal Miner Final (Adaptive & Pivot Edition)
 * * [Core Logic]
 * 1. Adaptive Mining: 有望な「悩みワード」だけを再帰的に深掘りし、ニッチな鉱脈を特定。
 * 2. Static Filtering: APIを叩く前に「ゴミ（Wiki/設定）」をルールベースで排除。
 * 3. Gemini 3 Pro: 「直し方」の検索意図を「買い替え提案」へ強制変換し、ランキング設計図を作成。
 * * [Usage]
 * node scripts/universal_miner_final.js "ワイヤレスイヤホン"
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

puppeteer.use(StealthPlugin());

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const SEED_KEYWORD = process.argv[2] || "ワイヤレスイヤホン";

if (!GEMINI_API_KEY) {
    console.error("❌ Error: API Key not found in .env.local");
    process.exit(1);
}

// ★ User Requirement: Force use of 'gemini-3-pro-preview'
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-3-pro-preview",
    generationConfig: { responseMimeType: "application/json" }
});

// ==========================================
// 🧠 SYSTEM PROMPT (The Pivot Logic)
// ==========================================
// ==========================================
// 🧠 SYSTEM PROMPT (The Pivot Logic - Genre Agnostic)
// ==========================================
const SYSTEM_PROMPT = `
あなたはアフィリエイトメディアの「ランキング記事構成作家」です。
ユーザーの「検索キーワード」と競合の「記事タイトル」を分析し、**既存の「ランキング記事テンプレート」に当てはまる記事設計図**を作成してください。

## 鉄の掟 (The Pivot Logic)
1. **コラム記事は書かない**: 「直し方」「原因」「寿命」などの悩みワードで検索しているユーザーは、現状の製品に不満を持っています。彼らに対し、修理や我慢ではなく**「（その悩みを解決する）新しい製品に買い換えるのが最適解だ」**と説得してください。
2. **ランキングへの強制変換**: どんなキーワードであっても、最終的には「その悩みを解決する機能を持った商品のランキング」に着地させてください。
3. **勝ち筋の判定**: 上位がそのジャンルの最大手EC（Amazon, 楽天等）や最強メディア（mybest, 価格コム, アットコスメ等）で埋め尽くされている場合は "NO_GO" としてください。Q&Aサイトや個人ブログが上位なら "GO" です。

## 出力フォーマット (JSON)
{
  "verdict": "GO" or "NO_GO",
  "reason": "判定理由",
  "article_title": "【202X年】[悩み]を解決！[メリット]な[ジャンル]おすすめランキングTOP5",
  "target_persona": "想定読者（例：現在の製品の[欠点]に悩み、ストレスを感じている人）",
  "intro_hook": "読者の悩みに共感しつつ、『実は買い替えが正解』と気づかせる導入文フック",
  "ranking_criteria": ["評価軸1", "評価軸2", "評価軸3"], 
  "winner_concept": "1位に選出すべき商品の特徴"
}
`;

// ==========================================
// 🔍 ADAPTIVE MINING LOGIC (汎用化)
// ==========================================

// 1. ゴミ判定リスト (ジャンル固有の社名は削除し、機能的なゴミに絞る)
const TRASH_WORDS = [
    'wiki', 'ウィキ', '意味', 'とは', '設定', '説明書', 'マニュアル',
    'ログイン', 'マイページ', '電話番号', '住所', '店舗', '中古', 'ヤフオク', 'メルカリ'
];

// 2. 脈ありリスト (感情・行動ベースに抽象化)
const INTENT_WORDS = [
    // 強い否定・後悔 (コンプレックス系も拾える)
    '最悪', 'やめとけ', '失敗', 'デメリット', '後悔', '効果なし', '嘘', 'バレる', '痛い', '臭い',
    // 故障・トラブル (買い替えシグナル)
    '壊れた', '動かない', '寿命', 'つながらない', 'おかしい', 'エラー', 'できない',
    // 探索・比較
    'おすすめ', 'ランキング', '比較', '違い', '安い', '最強', '評判', '口コミ', 'レビュー', '代わり'
];

async function fetchSuggestions(query) {
    try {
        const url = `http://suggestqueries.google.com/complete/search?client=firefox&hl=ja&gl=jp&q=${encodeURIComponent(query)}`;
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
        return (res.data && res.data[1]) ? res.data[1] : [];
    } catch { return []; }
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * キーワードを評価し、次のアクションを決める関数
 * @returns "DIG" (深掘り), "KEEP" (採用), "TRASH" (ゴミ)
 */
function evaluateKeyword(keyword, seed) {
    if (TRASH_WORDS.some(w => keyword.includes(w))) return "TRASH";
    if (!keyword.includes(seed)) return "TRASH"; // Seedを含まない関連語はノイズになりやすいので除外

    const hasIntent = INTENT_WORDS.some(w => keyword.includes(w));
    const depth = keyword.split(' ').length; // 単語数 (例: "イヤホン 痛い" = 2)

    // 悩みワードを含み、かつまだ短い(2~3語)場合は、さらに奥があるはず -> DIG
    if (hasIntent && depth <= 3) return "DIG";

    // 十分に具体的(3語以上) または Intentはないが関連語 -> KEEP
    if (depth >= 3 || hasIntent) return "KEEP";

    return "TRASH"; // それ以外（単なる言い換えなど）は捨てる
}

async function adaptiveMining(initialSeed) {
    console.log(`\n🔍 Phase 1: Adaptive Mining for "${initialSeed}"`);
    console.log(`   (Logic: Finding 'Pain' keywords and digging deeper automatically)`);

    let queue = [initialSeed]; // 探索キュー
    let candidates = new Set(); // 最終候補
    let visited = new Set(); // 重複防止

    // 初期拡張用の接尾語
    // 初期拡張用の接尾語 (Generic)
    const baseSuffixes = [' ', ' あ', ' か', ' さ', ' た', ' な', ' は', ' ま', ' や', ' ら', ' わ', ' 最悪', ' 壊れた', ' おすすめ'];

    // まずSeed自体をキューに入れるのではなく、Seedの周辺をキューに入れる
    for (const suffix of baseSuffixes) {
        queue.push(initialSeed + suffix);
    }

    let processedCount = 0;
    const MAX_PROCESS = 150; // APIバン防止の上限

    while (queue.length > 0 && processedCount < MAX_PROCESS) {
        const currentQuery = queue.shift();
        if (visited.has(currentQuery)) continue;
        visited.add(currentQuery);
        processedCount++;

        process.stdout.write(`\r   Scanning: [${processedCount}/${MAX_PROCESS}] Queue: ${queue.length} Candidates: ${candidates.size}`);

        // APIコール
        const suggestions = await fetchSuggestions(currentQuery);
        await delay(300); // Wait to avoid ban

        for (const sugg of suggestions) {
            if (visited.has(sugg)) continue;

            const action = evaluateKeyword(sugg, initialSeed);

            if (action === "DIG") {
                // 有望なのでキューに追加してさらに掘る
                // console.log(`\n      💎 Digging Deeper: "${sugg}"`); // ログがうるさい場合はコメントアウト
                if (!queue.includes(sugg)) queue.push(sugg);
                // DIG対象も一応候補には入れておく
                candidates.add(sugg);
            } else if (action === "KEEP") {
                // 採用
                candidates.add(sugg);
            }
        }
    }
    console.log(`\n   👉 Mining Complete. Found ${candidates.size} potential niches.`);
    return Array.from(candidates);
}

// ==========================================
// 🕵️ SCOUT (SERP Scraping - Improved H3 Strategy)
// ==========================================
async function getSerpData(page, query) {
    try {
        await page.goto(`https://www.google.co.jp/search?q=${encodeURIComponent(query)}&hl=ja&gl=jp`, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        await delay(1500 + Math.random() * 1000); // Human-like delay

        // Generic H3 Scraper (Most robust)
        const data = await page.evaluate(() => {
            const results = [];
            const allH3s = document.querySelectorAll('h3');
            allH3s.forEach(h3 => {
                let a = h3.closest('a');
                if (!a) a = h3.querySelector('a');
                if (a && a.href && a.href.startsWith('http')) {
                    const title = h3.innerText.trim();
                    if (title.length > 5) results.push({ title, url: a.href });
                }
            });
            // Unique
            const unique = [];
            const seen = new Set();
            for (const r of results) {
                if (!seen.has(r.url)) {
                    seen.add(r.url);
                    unique.push(r);
                }
            }
            return unique.slice(0, 5);
        });
        return data;
    } catch (e) { return []; }
}

// ==========================================
// 🧠 STRATEGIST (Gemini 3 Pro)
// ==========================================
async function runStrategist(keyword, serpData) {
    const domains = serpData.map(d => {
        try { return new URL(d.url).hostname; } catch { return 'unknown'; }
    });

    const prompt = `
    Target Keyword: "${keyword}"
    
    Top 5 Competitors:
    ${serpData.map((d, i) => `${i + 1}. [${domains[i]}] ${d.title}`).join('\n')}
    
    Based on the "Iron Rules", analyze intent and generate the ranking blueprint JSON.
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] }]
        });
        return JSON.parse(result.response.text());
    } catch (e) {
        console.error(`\n   ⚠️ Gemini Error (${keyword}):`, e.message);
        return null;
    }
}

// ==========================================
// 🚀 MAIN EXECUTION
// ==========================================
async function main() {
    console.log(`💎 UNIVERSAL MINER FINAL (Gemini 3 Pro Edition)`);
    console.log(`   Target Genre: "${SEED_KEYWORD}"`);

    // 1. Adaptive Mining
    const allKeywords = await adaptiveMining(SEED_KEYWORD);

    if (allKeywords.length === 0) {
        console.log("❌ No keywords found.");
        return;
    }

    // 優先度が高い順（単語数が多く、Intentワードを含むもの）にソート
    const sortedTargets = allKeywords.sort((a, b) => {
        const scoreA = (a.split(' ').length) + (INTENT_WORDS.some(w => a.includes(w)) ? 5 : 0);
        const scoreB = (b.split(' ').length) + (INTENT_WORDS.some(w => b.includes(w)) ? 5 : 0);
        return scoreB - scoreA;
    });

    // テスト用に上位30件のみ処理（本番は制限解除してください）
    const targets = sortedTargets.slice(0, 30);

    console.log(`\n🧠 Phase 2: AI Analysis & Strategy Planning`);
    console.log(`   Processing Top ${targets.length} candidates...`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=1920,1080',
            '--lang=ja-JP'
        ]
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7' });

    const strategies = [];

    for (const kw of targets) {
        process.stdout.write(`   Analyzing: "${kw}" `);

        // 2. Scout
        const serpData = await getSerpData(page, kw);
        if (!serpData || serpData.length === 0) {
            console.log("-> ⚠️  Skip (Bot Blocked/No Data)");
            continue;
        }

        // 3. Strategist
        await delay(2000); // Gemini Rate Limit Wait
        const plan = await runStrategist(kw, serpData);

        if (plan && plan.verdict === "GO") {
            console.log(`-> ✅ GO!`);
            strategies.push({ keyword: kw, ...plan });
        } else {
            console.log(`-> ❌ ${plan ? plan.reason.slice(0, 30) : 'Error'}...`);
        }

        // 定期保存
        if (strategies.length > 0 && strategies.length % 5 === 0) {
            fs.writeFileSync('strategies_final_temp.json', JSON.stringify(strategies, null, 2));
        }
    }

    await browser.close();

    if (strategies.length > 0) {
        const filename = `strategies_${SEED_KEYWORD.replace(/\s+/g, '_')}_final.json`;
        fs.writeFileSync(filename, JSON.stringify(strategies, null, 2));
        console.log(`\n🏆 MISSION COMPLETE`);
        console.log(`   Saved ${strategies.length} blueprints to: ${filename}`);
    } else {
        console.log("\n❌ No viable strategies found.");
    }
}

main();
