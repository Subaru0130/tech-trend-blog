/**
 * 🌍 Universal Miner (Demand & Mismatch Edition)
 * * [狙い]
 * 1. 需要重視: 「サジェストの上位（浅い層）」を中心に探索し、ボリュームを確保。
 * 2. 勝ち筋: 競合が大手でも「タイトルが検索意図とズレている（汎用記事）」ならGO判定。
 * * [Usage]
 * node scripts/universal_miner_demand.js "ワイヤレスイヤホン"
 */
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;
const SEED_KEYWORD = process.argv[2] || "ワイヤレスイヤホン";

if (!GEMINI_API_KEY) {
    console.error("❌ Error: API Key not found in .env.local");
    process.exit(1);
}

// Warn if CSE ID is missing (but don't exit hard, maybe allow dry run or fallback later)
if (!GOOGLE_CSE_ID) {
    console.warn("⚠️  Warning: GOOGLE_CSE_ID not found in .env.local.");
    console.warn("    Scraping will fail. Please enable Custom Search JSON API and get an ID.");
    console.warn("    https://programmablesearchengine.google.com/controlpanel/all");
}

// ★ Upgrading to Gemini 3 Pro as per project standard
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-3-pro-preview",
    generationConfig: { responseMimeType: "application/json" }
});

// ==========================================
// 🧠 SYSTEM PROMPT (ミスマッチ判定)
// ==========================================
const SYSTEM_PROMPT = `
あなたはSEOのプロフェッショナルです。
「ユーザーの検索キーワード」と「上位表示されている記事タイトル」を比較し、**【情報の需給ギャップ（Mismatch）】**があるか判定してください。

## 判定ロジック (The Gap Strategy)
ユーザーが特定のニーズ（例: "ランニング", "重低音", "5000円以下"）を持っているのに、
上位記事のタイトルが**「ただの総合ランキング（例: 2025年おすすめイヤホン20選）」**である場合、それは**「チャンス (GO)」**です。
逆に、上位記事のタイトルがキーワードと完全に一致している（例: "ランニング用イヤホンおすすめ5選"）場合は、**「勝ち目なし (NO_GO)」**です。

## 出力フォーマット (JSON)
{
  "verdict": "GO" or "NO_GO",
  "reason": "なぜチャンスなのか？（例：上位は総合ランキングばかりで、'ランニング'に特化した記事がないため）",
  "article_title": "競合を出し抜くための、キーワードに完全一致させた特化型タイトル案",
  "demand_level": "High" or "Medium" (サジェストの深さから推測)
}
`;

// ==========================================
// 🔍 PHASE 1: BROAD MINING (浅く広く)
// ==========================================
// ゴミだけは弾く (Generic Trash)
const TRASH_WORDS = [
    'wiki', 'ウィキ', '意味', 'とは', '設定', '説明書', 'マニュアル',
    'ログイン', 'マイページ', '電話番号', '住所', '店舗', '中古', 'ヤフオク', 'メルカリ'
];

async function fetchSuggestions(query) {
    try {
        const url = `http://suggestqueries.google.com/complete/search?client=firefox&hl=ja&gl=jp&q=${encodeURIComponent(query)}`;
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
        return (res.data && res.data[1]) ? res.data[1] : [];
    } catch { return []; }
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function broadMining(seed) {
    console.log(`\n🔍 Phase 1: Broad Mining (Targeting High Demand Layers)`);

    let candidates = new Set();

    // 1. 直サジェスト (Volume: 特大)
    const directSuggestions = await fetchSuggestions(seed);
    if (directSuggestions) directSuggestions.forEach(s => candidates.add(s));

    // 2. 「あ〜ん」サジェスト (Volume: 大〜中)
    // Generic Suffixes covering various intents
    const suffixes = [' ', ' あ', ' か', ' さ', ' た', ' な', ' は', ' ま', ' や', ' ら', ' わ', ' おすすめ', ' ランキング', ' 最悪', ' 失敗'];

    let processed = 0;
    process.stdout.write("   Mining Progress: ");
    for (const suffix of suffixes) {
        process.stdout.write(".");
        const subSuggestions = await fetchSuggestions(seed + suffix);
        if (subSuggestions) subSuggestions.forEach(s => candidates.add(s));
        await delay(300);
        processed++;
    }

    // フィルタリング
    const filtered = Array.from(candidates).filter(kw => {
        if (!kw.includes(seed)) return false;
        if (TRASH_WORDS.some(t => kw.includes(t))) return false;
        // ★重要: あまりに長すぎる(4語以上)と需要が低いので、2〜3語に絞る
        const depth = kw.split(' ').length;
        return depth >= 2 && depth <= 3;
    });

    console.log(`\n   👉 Found ${filtered.length} high-potential keywords.`);
    return filtered;
}

// ==========================================
// 🕵️ PHASE 2: SCOUT (API)
// ==========================================
async function getSerpData(query) {
    if (!GOOGLE_CSE_ID) return [];

    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${GEMINI_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}`;
        const res = await axios.get(url);
        if (!res.data.items) return [];
        return res.data.items.slice(0, 5).map(item => ({
            title: item.title,
            displayLink: item.displayLink
        }));
    } catch (e) {
        console.error(`   ⚠️ API Error: ${e.message}`);
        return [];
    }
}

// ==========================================
// 🧠 PHASE 3: STRATEGIST (Mismatch Check)
// ==========================================
async function runStrategist(keyword, serpData) {
    const prompt = `
    Search Keyword: "${keyword}"
    
    Top 5 Competitor Titles:
    ${serpData.map((d, i) => `${i + 1}. ${d.title}`).join('\n')}
    
    Check for "Content Mismatch". Are the top results too generic?
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] }]
        });
        return JSON.parse(result.response.text());
    } catch (e) { return null; }
}

// ==========================================
// 🚀 MAIN
// ==========================================
async function main() {
    console.log(`💎 UNIVERSAL MINER (Demand Edition)`);
    console.log(`   Target: "${SEED_KEYWORD}"`);

    // 1. Broad Mining (需要のある層だけを集める)
    const allKeywords = await broadMining(SEED_KEYWORD);
    if (allKeywords.length === 0) return console.log("❌ No keywords found.");

    // API節約のため、サジェストリストの上から順（＝需要が高い順）に100個やる
    const targets = allKeywords.slice(0, 100);

    console.log(`\n🧠 Phase 2: Finding "Content Gaps" in Top ${targets.length} Keywords...`);
    const winners = [];

    if (!GOOGLE_CSE_ID) {
        console.log("\n🛑 STOPPING: No GOOGLE_CSE_ID provided.");
        console.log("   Please add GOOGLE_CSE_ID to .env.local to proceed with Phase 2.");
        return;
    }

    for (const kw of targets) {
        process.stdout.write(`   Checking: "${kw}" `);

        const serpData = await getSerpData(kw);
        if (serpData.length === 0) { console.log("-> ⚠️ No Data"); continue; }

        await delay(1000); // Wait for Gemini
        const analysis = await runStrategist(kw, serpData);

        if (analysis && analysis.verdict === "GO") {
            console.log(`-> ✅ GAP FOUND!`);
            winners.push({ keyword: kw, ...analysis });
        } else {
            console.log(`-> ❌ saturated`); // 飽和している
        }

        if (winners.length % 5 === 0) fs.writeFileSync('winners_temp.json', JSON.stringify(winners, null, 2));
    }

    fs.writeFileSync(`winners_${SEED_KEYWORD.replace(/\s+/g, '_')}_demand.json`, JSON.stringify(winners, null, 2));
    console.log(`\n🏆 Done. Found ${winners.length} high-demand keywords with weak competition.`);
}

main();
