/**
 * 🌍 Universal Miner Human Edition (Final Complete)
 * * [All Fixes Included]
 * 1. Robust H3 Logic: 検索結果の構造変化に対応し、データ取得エラーを回避。
 * 2. Smart Sorting: 「勝ちやすい（単語数が多い）」キーワードから先に調査し、"Saturated"を回避。
 * 3. Deep Broad Mining: 価格やスペック（1万円以下、音質など）を強制的に注入して網羅性を向上。
 * * * [使い方]
 * node scripts/universal_miner_human.js "ワイヤレスイヤホン"
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

// 安定動作のため 1.5-pro-latest を使用
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-latest",
    generationConfig: { responseMimeType: "application/json" }
});

// ==========================================
// 🧠 SYSTEM PROMPT
// ==========================================
const SYSTEM_PROMPT = `
あなたはSEOのプロフェッショナルです。
ユーザーの「検索キーワード」と「上位記事タイトル」を比較し、**【情報の需給ギャップ（Mismatch）】**があるか判定してください。

## 判定基準 (The Gap Strategy)
1. **特化の欠如**: ユーザーが「1万円以下」「重低音」「ランニング」など**具体的な条件**で検索しているのに、上位記事が「おすすめ20選」のような**汎用的なまとめ記事**ばかりなら「チャンス (GO)」です。
2. **大手独占**: 上位がすべて「Amazon」「楽天」「価格.com」の商品一覧ページである場合、個人ブログの記事（レビューやランキング）を入れる隙間があるため「チャンス (GO)」となる場合があります。
3. **完全一致**: 上位に「【1万円以下】重低音イヤホンおすすめ5選」のような、キーワードに完全一致した高品質な記事がある場合は「負け (NO_GO)」です。

## 出力フォーマット (JSON)
{
  "verdict": "GO" or "NO_GO",
  "reason": "判定理由",
  "article_title": "競合を出し抜くための、キーワードに特化させたタイトル案",
  "demand_type": "Specific Need" or "Price Range" or "Trouble"
}
`;

// ==========================================
// 🔍 PHASE 1: BROAD MINING (Deep Injection)
// ==========================================
const TRASH_WORDS = ['wiki', '意味', 'とは', '設定', '説明書', 'ログイン', '店舗', '中古', 'ジャンク', 'ゲオ'];

async function fetchSuggestions(query) {
    try {
        const url = `http://suggestqueries.google.com/complete/search?client=firefox&hl=ja&gl=jp&q=${encodeURIComponent(query)}`;
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
        return (res.data && res.data[1]) ? res.data[1] : [];
    } catch { return []; }
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function broadMining(seed) {
    console.log(`\n🔍 Phase 1: Broad Mining for "${seed}"`);
    let candidates = new Set();

    // 1. 基本拡張
    const baseSuffixes = [
        ' ', ' あ', ' か', ' さ', ' た', ' な', ' は', ' ま', ' や', ' ら', ' わ',
        ' おすすめ', ' ランキング', ' 口コミ', ' 評判'
    ];

    // 2. 価格・スペックの強制注入 (重要)
    const deepSuffixes = [
        ' 安い', ' コスパ', ' 最強',
        ' 1000円', ' 2000円', ' 3000円', ' 5000円', ' 1万円', ' 2万円',
        ' 以下', ' 以内', ' 台',
        ' 痛い', ' 音漏れ', ' 壊れた', ' 寿命', ' 遅延',
        ' ランニング', ' スポーツ', ' 重低音', ' ノイズキャンセリング'
    ];

    const allSuffixes = [...baseSuffixes, ...deepSuffixes];

    process.stdout.write(`   Mining (${allSuffixes.length} patterns): `);
    for (const suffix of allSuffixes) {
        process.stdout.write(".");
        const sub = await fetchSuggestions(seed + suffix);
        sub.forEach(s => candidates.add(s));
        await delay(300);
    }

    const filtered = Array.from(candidates).filter(kw => {
        if (!kw.includes(seed)) return false;
        if (TRASH_WORDS.some(t => kw.includes(t))) return false;
        const depth = kw.split(' ').length;
        return depth >= 2 && depth <= 5; // 少し深めも許容
    });

    console.log(`\n   👉 Found ${filtered.length} candidates.`);
    return filtered;
}

// ==========================================
// 🕵️ PHASE 2: HUMAN SCOUT (Robust H3 Logic)
// ==========================================
async function getSerpData(page, query) {
    try {
        await page.goto(`https://www.google.co.jp/search?q=${encodeURIComponent(query)}&hl=ja&gl=jp`, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await delay(2000 + Math.random() * 2000);

        const content = await page.content();
        if (content.includes("私はロボットではありません") || content.includes("unusual traffic")) {
            console.log("      🚨 CAPTCHA detected! Please solve it manually in the browser window.");
            await page.waitForNavigation({ timeout: 0 });
        }

        const data = await page.evaluate(() => {
            const results = [];
            const allH3s = document.querySelectorAll('h3');
            allH3s.forEach(h3 => {
                let a = h3.closest('a');
                if (!a) a = h3.querySelector('a');
                if (a && a.href && a.href.startsWith('http')) {
                    const title = h3.innerText.trim();
                    if (title.length > 5) results.push({ title: title, url: a.href });
                }
            });

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

async function runStrategist(keyword, serpData) {
    const domains = serpData.map(d => {
        try { return new URL(d.url).hostname; } catch { return 'unknown'; }
    });

    const prompt = `
    Keyword: "${keyword}"
    Top 5 Titles:
    ${serpData.map((d, i) => `${i + 1}. [${domains[i]}] ${d.title}`).join('\n')}
    
    Check for mismatch/gap.
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] }]
        });
        return JSON.parse(result.response.text());
    } catch (e) { return null; }
}

// ==========================================
// 🚀 MAIN EXECUTION (Sorted & Smart)
// ==========================================
async function main() {
    console.log(`💎 UNIVERSAL MINER (Human Edition Final)`);
    console.log(`   Target: "${SEED_KEYWORD}"`);
    console.log(`   Note: This will be SLOW to avoid detection. Please wait.`);

    // 1. Mining
    const allKeywords = await broadMining(SEED_KEYWORD);
    if (allKeywords.length === 0) return console.log("❌ No keywords found.");

    // ★勝ちやすい（単語数が多い）順にソート
    const sortedKeywords = allKeywords.sort((a, b) => {
        return b.split(' ').length - a.split(' ').length;
    });

    const targets = sortedKeywords.slice(0, 100);

    console.log(`\n🧠 Phase 2: Human Scouting (${targets.length} keywords)`);
    console.log(`   Strategy: Prioritizing long-tail keywords.`);

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const winners = [];
    let count = 0;

    for (const kw of targets) {
        count++;
        process.stdout.write(`   [${count}/${targets.length}] Checking: "${kw}" `);

        const serpData = await getSerpData(page, kw);

        if (serpData.length === 0) {
            console.log("-> ⚠️  Blocked/No Data");
            await delay(10000);
            continue;
        }

        const analysis = await runStrategist(kw, serpData);

        if (analysis && analysis.verdict === "GO") {
            console.log(`-> ✅ GO!`);
            winners.push({ keyword: kw, ...analysis });
        } else {
            console.log(`-> ❌ saturated`);
        }

        if (winners.length > 0 && winners.length % 5 === 0) {
            fs.writeFileSync('winners_human_temp.json', JSON.stringify(winners, null, 2));
        }

        const waitTime = 10000 + Math.random() * 10000;
        await delay(waitTime);
    }

    await browser.close();

    if (winners.length > 0) {
        const filename = `winners_${SEED_KEYWORD.replace(/\s+/g, '_')}_human.json`;
        fs.writeFileSync(filename, JSON.stringify(winners, null, 2));
        console.log(`\n🏆 Done. Found ${winners.length} winners.`);
        console.log(`   Saved to: ${filename}`);
    } else {
        console.log("\n❌ No winners found.");
    }
}

main();
