/**
 * 🌍 Universal Miner Pro (Production Ready)
 * * [機能]
 * 1. Googleサジェストからキーワードを「あ〜ん」まで総当たりで数百個収集
 * 2. 全キーワードの検索結果(SERP)をPuppeteerで巡回
 * 3. Gemini 1.5 Proが「検索意図」を分析し、どんな悩みも「ランキング記事」へ強制変換
 * 4. 勝ち筋のある設計図だけをJSON保存
 * * [使い方]
 * node scripts/universal_miner_pro.js "クレジットカード"
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const fs = require('fs');

// Load Env
require('dotenv').config({ path: '.env.local' });

puppeteer.use(StealthPlugin());

// ==========================================
// ⚙️ CONFIGURATION (設定)
// ==========================================
// Use Environment Variable for Security
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.warn("⚠️ Warning: GOOGLE_API_KEY not found in .env.local. Gemini might fail.");
}

// コマンドライン引数から種キーワードを取得
const SEED_KEYWORD = process.argv[2] || "ワイヤレスイヤホン";

// Geminiモデル設定
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-3-pro-preview",
    generationConfig: { responseMimeType: "application/json" }
});

// ==========================================
// 🧠 SYSTEM PROMPT (ランキング変換ロジック)
// ==========================================
const SYSTEM_PROMPT = `
あなたはアフィリエイトメディアの「ランキング記事構成作家」です。
ユーザーの「検索キーワード」と競合の「記事タイトル」を分析し、**既存の「ランキング記事テンプレート」に当てはまる記事設計図**を作成してください。

## 鉄の掟 (The Pivot Logic)
1. **コラム記事は書かない**: 「直し方」「原因」「とは」で検索しているユーザーに対しても、解説記事は書きません。
2. **買い替えへの誘導**: 「修理や我慢は損である。新しい機能を持つ製品に買い換えるのが最適解だ」というロジックで説得し、ランキング記事へ誘導してください。
3. **勝ち筋の判定**: 大手ECサイト（Amazon/楽天）や最強メディア（mybest, 価格コム）が上位を独占しており、個人メディアが入り込む隙間が全くない場合は "NO_GO" としてください。

## 変換プロセス例
- Keyword: [イヤホン 片耳 聞こえない]
- × Bad: 片耳が聞こえない時の対処法5選（コラム）
- ○ Good: **もう断線しない！耐久性最強のイヤホンランキングTOP5**
- Logic: 悩み（断線）を解決するスペック（耐久性・リケーブル）を軸にランキングを作る。

## 出力フォーマット (JSON)
{
  "verdict": "GO" or "NO_GO",
  "reason": "判定理由（簡潔に）",
  "article_title": "【2025年】[悩み]を解決！[メリット]な[ジャンル]おすすめランキングTOP5",
  "intro_hook": "読者の悩み（修理したい等）に寄り添いつつ、『実は買い替えが正解』と気づかせる導入文のフック（100文字以内）",
  "ranking_criteria": ["評価軸1(最重要)", "評価軸2", "評価軸3"], 
  "winner_concept": "1位に選出すべき商品の特徴（例：音質よりとにかく壊れないモデル）",
  "target_persona": "想定読者（例：通勤中に断線して絶望したサラリーマン）"
}
`;

// ==========================================
// 🛠️ UTILS
// ==========================================
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// 1. DEEP EXPANSION (徹底的なキーワード収集)
// ==========================================
async function fetchSuggestions(query) {
    try {
        const url = `http://suggestqueries.google.com/complete/search?client=firefox&hl=ja&gl=jp&q=${encodeURIComponent(query)}`;
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            timeout: 5000
        });
        return (res.data && res.data[1]) ? res.data[1] : [];
    } catch { return []; }
}

async function deepExpansion(seed) {
    console.log(`\n🔍 Phase 1: Deep Expansion for "${seed}"...`);
    let candidates = new Set();

    // 拡張パターンリスト (本番用フルセット)
    const suffixes = [
        // 基本
        '', ' ',
        // ひらがな (主要なもの)
        'あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ',
        // Intent
        'おすすめ', 'ランキング', '比較', '安い', '最強', '評判',
        // 悩み
        '痛い', '壊れた', '聞こえない', '音漏れ', '最悪', '寿命'
    ];

    process.stdout.write("   Mining Progress: ");

    for (const char of suffixes) {
        process.stdout.write("."); // 進捗バー代わり
        const q = char ? `${seed} ${char}` : seed;

        try {
            const sub = await fetchSuggestions(q);
            sub.forEach(c => candidates.add(c));
        } catch (e) {
            // エラーでも止まらず次へ
        }

        // API制限回避のためのウェイト (重要)
        await delay(300);
    }

    console.log("\n");

    // クリーニング: seedを含み、かつ2語以上のキーワードのみ残す
    const cleaned = Array.from(candidates).filter(k => k.includes(seed) && k.includes(' '));
    console.log(`   👉 Total Unique Keywords Found: ${cleaned.length}`);
    return cleaned;
}

// ==========================================
// 2. SCOUT (SERP情報の取得)
// ==========================================
async function getSerpData(page, query) {
    try {
        // Google検索
        await page.goto(`https://www.google.co.jp/search?q=${encodeURIComponent(query)}`, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Debug
        await page.screenshot({ path: `debug_${Date.now()}.png` });


        // 人間らしいランダムな動き（検出回避）
        await delay(1000 + Math.random() * 1000);

        // タイトルとURLを取得
        // タイトルとURLを取得
        // タイトルとURLを取得
        const data = await page.evaluate(() => {
            const results = [];
            // Generic Strategy: Find ALL H3s and looks for closest Link
            // This bypasses 'div.g' structure reliance
            const allH3s = document.querySelectorAll('h3');

            allH3s.forEach(h3 => {
                // Look up for anchor
                let a = h3.closest('a');
                // If not parent, look for immediate sibling or child (rare but possible)
                if (!a) a = h3.querySelector('a');

                if (a && a.href && a.href.startsWith('http')) {
                    const title = h3.innerText.trim();
                    if (title && title.length > 5) { // Filter empty/tiny titles
                        results.push({ title: title, url: a.href });
                    }
                }
            });

            // Unique Filter (Set) & Slice
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
    } catch (e) {
        // console.error(`   ⚠️ SERP Error (${query}): ${e.message}`);
        return [];
    }
}

// ==========================================
// 3. STRATEGIST (Gemini分析)
// ==========================================
async function runStrategist(keyword, serpData) {
    // ドメイン抽出
    const domains = serpData.map(d => {
        try { return new URL(d.url).hostname; } catch { return 'unknown'; }
    });

    const prompt = `
    Target Keyword: "${keyword}"
    
    Top 5 Competitors:
    ${serpData.map((d, i) => `${i + 1}. [${domains[i]}] ${d.title}`).join('\n')}
    
    Analyze the intent and generating the ranking blueprint in JSON.
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] }]
        });
        return JSON.parse(result.response.text());
    } catch (e) {
        console.error(`   ⚠️ Gemini Error (${keyword}):`, e.message);
        return null;
    }
}

// ==========================================
// 🚀 MAIN EXECUTION FLOW
// ==========================================
async function main() {
    console.log(`💎 UNIVERSAL MINER PRO STARTED`);
    console.log(`   Target Genre: "${SEED_KEYWORD}"`);

    // 1. 徹底収集
    const allKeywords = await deepExpansion(SEED_KEYWORD);

    if (allKeywords.length === 0) {
        console.log("❌ No keywords found. Check your internet or keyword.");
        return;
    }

    // ★ VERIFICATION LIMITER: For quick testing, limit to 20 items.
    // In production, comment this out.
    console.log("   (Limiting to 20 items for prototype speed.)");
    const targets = allKeywords.slice(0, 20);

    console.log(`\n🧠 Phase 2: AI Analysis & Strategy Planning`);
    console.log(`   Processing ${targets.length} keywords. This may take a while...`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--window-size=1920,1080',
            '--lang=ja-JP'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    // User-Agent固定 (Updated)
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7' });

    const strategies = [];
    let processedCount = 0;
    let successCount = 0;

    // ループ処理
    for (const kw of targets) {
        processedCount++;
        process.stdout.write(`[${processedCount}/${targets.length}] "${kw}" `);

        // 2. Scout
        const serpData = await getSerpData(page, kw);

        if (!serpData || serpData.length === 0) {
            console.log("-> ⚠️  Skip (No SERP Data)");
            continue;
        }

        // 3. Strategist
        // APIレート制限ウェイト (Prototyping: 2s)
        await delay(2000);

        const plan = await runStrategist(kw, serpData);

        if (plan && plan.verdict === "GO") {
            console.log(`-> ✅ GO!`);
            strategies.push({ keyword: kw, ...plan });
            successCount++;
        } else {
            const reason = plan ? plan.reason : "AI Error/NoGO";
            console.log(`-> ❌ (${reason.slice(0, 20)}...)`);
        }

        // Save temp
        if (strategies.length % 5 === 0 && strategies.length > 0) {
            fs.writeFileSync('ranking_strategies_temp.json', JSON.stringify(strategies, null, 2));
        }
    }

    await browser.close();

    // 4. 最終保存
    if (strategies.length > 0) {
        const filename = `strategies_${SEED_KEYWORD.replace(/\s+/g, '_')}.json`;
        fs.writeFileSync(filename, JSON.stringify(strategies, null, 2));
        console.log(`\n🏆 MISSION COMPLETE`);
        console.log(`   Total Scanned: ${targets.length}`);
        console.log(`   Viable Strategies: ${strategies.length}`);
        console.log(`   Saved to: ${filename}`);
    } else {
        console.log("\n❌ No viable strategies found.");
    }
}

main();
