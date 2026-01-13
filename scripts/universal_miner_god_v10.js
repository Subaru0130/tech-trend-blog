/**
 * 🌍 Universal Miner GOD v15 (Amazon Affiliate Sniper)
 * * [修正点: Amazon特化フィルタ]
 * 1. Store Filter: 「100均」「ダイソー」「ドンキ」「コンビニ」など、
 * Amazonで売るのが難しい（実店舗志向の）キーワードを徹底的に弾きます。
 * 2. Intent Filter: 「方法」「修理」などの非購入キーワードも引き続き弾きます。
 * 3. AI Audit: 「Amazonで売れる商品か？」を最終審査基準に追加。
 * * [使い方]
 * node scripts/universal_miner_god_v15.js "ワイヤレスイヤホン"
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

puppeteer.use(StealthPlugin());

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const SEED_KEYWORD = process.argv[2] || "ワイヤレスイヤホン";

if (!GEMINI_API_KEY) {
    console.error("❌ Error: API Key is missing.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

// ==========================================
// 🚫 PHASE 2.5: STATIC BLACKLIST (The Gatekeeper)
// ==========================================

// 1. ランキング記事にならない（情報収集・修理）ワード
const NON_RANKING_TRIGGERS = [
    '方法', '仕方', 'やり方', '手順', '設定', '使い方', 'マニュアル', '説明書',
    '直し方', '修理', '復旧', 'エラー', '届かない', 'つながらない', '聞こえない',
    '原因', 'なぜ', '理由', '意味', 'とは', '仕組み', '歴史', 'wiki',
    '確認', '診断', 'テスト', '調べ方', '問い合わせ', '電話番号', 'ログイン', '解約',
    '片方', '片耳', '紛失', 'なくした', 'ケースのみ'
];

// 2. Amazonアフィリで稼げない（実店舗・低単価・特定店指名）ワード ★ここを追加
const NON_AMAZON_TRIGGERS = [
    // 100円ショップ系
    '100均', '百均', 'ダイソー', 'セリア', 'キャンドゥ', 'ワッツ',
    // 雑貨・ディスカウント系
    'スリーコインズ', 'スリコ', '3coins', '3COINS', 'ドンキ', 'ドン・キホーテ',
    'コストコ', '無印', 'ニトリ', 'ワークマン', 'しまむら', 'カインズ',
    // コンビニ・身近な店
    'コンビニ', 'セブン', 'ローソン', 'ファミマ',
    // CtoC・中古（Amazon新品以外）
    'メルカリ', 'ヤフオク', 'ラクマ', 'ジモティー', '中古', 'ジャンク', 'ゲオ', 'セカスト'
];

// 全フィルタ結合
const GLOBAL_IGNORE_LIST = [...NON_RANKING_TRIGGERS, ...NON_AMAZON_TRIGGERS];

// ==========================================
// 🧠 PHASE 0: DYNAMIC STRATEGY GENERATION
// ==========================================
async function generateStrategy(seed) {
    console.log(`\n🧠 Phase 0: Analyzing Market Strategy for "${seed}"...`);
    const prompt = `
    Target Niche: "${seed}"
    Task: Generate "Negative" keywords specific to this niche that indicate **Non-Commercial Intent** (Troubleshooting) OR **Offline Store Intent** (User wants to buy at a physical store, not Amazon).
    
    Output JSON:
    {
      "buying_intents": ["recommendation", "comparison", "ranking", "cheap", "best"],
      "negative_keywords": ["repair", "login", "daiso", "costco", "not working"]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (e) {
        return {
            buying_intents: ['おすすめ', '最強', '安い'],
            negative_keywords: []
        };
    }
}

// ==========================================
// 🔍 PHASE 1: BROAD MINING
// ==========================================
async function fetchSuggestions(query) {
    try {
        const url = `http://suggestqueries.google.com/complete/search?client=firefox&hl=ja&gl=jp&q=${encodeURIComponent(query)}`;
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
        return (res.data && res.data[1]) ? res.data[1] : [];
    } catch { return []; }
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function broadMining(seed, strategy) {
    console.log(`\n🔍 Phase 1: Broad Mining`);
    let candidates = new Set();
    const suffixes = [...strategy.buying_intents.map(k => ` ${k}`), ' おすすめ', ' 比較', ' ランキング'];

    // Phase 1用フィルタ (ハードコード + AI生成)
    const combinedTrash = [...GLOBAL_IGNORE_LIST, ...strategy.negative_keywords];

    process.stdout.write(`   Mining: `);
    for (const suffix of suffixes) {
        process.stdout.write(".");
        const sub = await fetchSuggestions(seed + suffix);
        sub.forEach(s => candidates.add(s));
        if (strategy.buying_intents.some(k => suffix.includes(k)) && sub.length > 0) {
            for (const deep of sub.slice(0, 3)) {
                const sub2 = await fetchSuggestions(deep + " ");
                sub2.forEach(s => candidates.add(s));
            }
        }
        await delay(200);
    }

    let list = Array.from(candidates).filter(kw => {
        if (!kw.includes(seed)) return false;
        // ★ここでガッツリ弾く
        if (combinedTrash.some(t => kw.includes(t))) return false;
        return kw.split(' ').length >= 2;
    });

    console.log(`\n   🧹 Deduplicating ${list.length} keywords...`);
    list.sort((a, b) => b.length - a.length);
    const uniqueList = [];
    for (const kw of list) {
        const isDuplicate = uniqueList.some(existing => existing.includes(kw.replace(seed, '').trim()));
        if (!isDuplicate) uniqueList.push(kw);
    }
    console.log(`   👉 Reduced to ${uniqueList.length} unique keywords.`);
    return uniqueList;
}

// ==========================================
// ⚖️ PHASE 2: LOGIC JUDGE
// ==========================================
function evaluateCompetitors(keyword, serpData) {
    const GIANTS = ['amazon', 'rakuten', 'kakaku', 'mybest', 'biccamera', 'yodobashi', 'apple', 'sony', 'panasonic'];
    const WEAKS = ['chiebukuro', 'detail.chiebukuro', 'okwave', 'ameblo', 'note.com', 'hatenablog', 'quora', '2ch', '5ch'];

    let giantCount = 0;
    let weakCount = 0;
    let genericTitleCount = 0;

    serpData.forEach(item => {
        let domain = '';
        try { domain = new URL(item.url).hostname; } catch (e) { }
        if (GIANTS.some(g => domain.includes(g))) giantCount++;
        if (WEAKS.some(w => domain.includes(w))) weakCount++;
        if (item.title.includes("20選") || item.title.includes("ランキング") || item.title.includes("比較")) genericTitleCount++;
    });

    let score = (weakCount * 10) - (giantCount * 5) + (genericTitleCount * 2);
    score += keyword.split(' ').length * 2;

    if (score >= 5 || weakCount >= 1) {
        return { verdict: "GO", score: score, serp: serpData };
    }
    return { verdict: "NO_GO", score: score };
}

// ==========================================
// 📝 PHASE 3: AI AUDIT (Amazon Affiliate Focus)
// ==========================================
async function generateArticleBlueprint(keyword, serpData) {
    const prompt = `
    Role: Professional Amazon Affiliate Marketer.
    Target Keyword: "${keyword}"
    Competitors: ${serpData.map(d => d.title).join(", ")}
    
    Goal: Determine if this keyword is profitable for **Amazon Affiliate Marketing**.
    
    ## 🚫 REJECT CRITERIA (Status: REJECT)
    1. **Offline Store Intent:** User wants to buy at Daiso, 3COINS, Costco, Convenience Stores. (Low profit / Not online).
    2. **Troubleshooting/Repair:** User wants to fix an existing item.
    3. **Used/Flea Market:** User wants Mercari/Yahoo Auctions.
    4. **Single Fact:** User wants "release date" or "meaning".
    
    ## ✅ APPROVE CRITERIA (Status: APPROVED)
    1. **Online Buying Intent:** User is looking for a product that is commonly sold on Amazon.
    2. **Comparison/Ranking:** User wants to see "Best X" or "Ranking".
    
    Task:
    If APPROVED, create a blueprint for a **Product Ranking/Comparison Article** monetized via Amazon.
    
    Analyze the keyword carefully to determine:
    - ranking_count: How many products to rank (5 for narrow niche, 10 for standard, 15-20 for broad).
    - price_min / price_max: Parse price constraints from keyword (e.g., "1万円台" = price_min: 10000, price_max: 19999, "5000円以下" = price_min: 0, price_max: 5000, "3万円以下" = price_min: 0, price_max: 30000). If no price constraint, set both to null.
    - required_features: Array of features/attributes the products MUST have based on keyword (e.g., ["ノイズキャンセリング", "防水"] for "ノイズキャンセリング 防水 イヤホン", or ["骨伝導"] for "骨伝導イヤホン"). Empty array if no specific features required.
    
    Output JSON (Success):
    {
      "status": "APPROVED",
      "title": "SEO Title (Comparison/Ranking style, in Japanese)",
      "target_reader": "Who is this for? (in Japanese)",
      "comparison_axis": "Main comparison criteria (in Japanese)",
      "sales_hook": "Why buy on Amazon? (in Japanese)",
      "ranking_count": 10,
      "price_min": 10000,
      "price_max": 19999,
      "required_features": ["ノイズキャンセリング"]
    }
    Output JSON (Reject): { "status": "REJECT", "reason": "Not profitable for Amazon" }
    `;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (e) { return null; }
}

// ==========================================
// 🎭 STEALTH FUNCTIONS
// ==========================================
async function humanScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (Math.random() < 0.2) window.scrollBy(0, -50);
                if (totalHeight >= scrollHeight / 2) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100 + Math.random() * 150);
        });
    });
}

// ==========================================
// 🚀 MAIN EXECUTION
// ==========================================
async function main() {
    console.log(`💎 UNIVERSAL MINER GOD v15 (Amazon Affiliate Sniper)`);
    console.log(`   Target: "${SEED_KEYWORD}"`);

    const strategy = await generateStrategy(SEED_KEYWORD);
    const allKeywords = await broadMining(SEED_KEYWORD, strategy);

    const targets = allKeywords
        .sort((a, b) => b.length - a.length)
        .slice(0, 100);

    console.log(`\n🧠 Phase 2: Logic Scouting (${targets.length} unique keywords)`);
    console.log(`   NOTE: Stealth Mode ON. Filter Active: [Non-Ranking] + [Non-Amazon]`);

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });
    const page = await browser.newPage();

    const candidates = [];
    let count = 0;

    for (const kw of targets) {
        count++;
        process.stdout.write(`   [${count}/${targets.length}] "${kw}" `);

        if (count > 1 && count % 10 === 0) {
            console.log("\n      ☕ Taking a coffee break (60s)...");
            await delay(60000);
            console.log("      🚀 Resuming...");
        }

        let serpData = [];
        try {
            await page.goto(`https://www.google.co.jp/search?q=${encodeURIComponent(kw)}&hl=ja&gl=jp`, { waitUntil: 'domcontentloaded', timeout: 0 });

            console.log("");
            while (true) {
                const wait = 5000 + Math.random() * 5000;
                process.stdout.write(`      ⏳ Waiting... (${Math.round(wait / 1000)}s)\r`);
                await delay(wait);

                const hasResults = await page.$('h3');
                const content = await page.content();
                const isCaptcha = content.includes("私はロボットではありません") || content.includes("unusual traffic");

                if (hasResults && !isCaptcha) {
                    process.stdout.write("      ✅ Page Loaded. Scrolling...                  \n");
                    await humanScroll(page);
                    break;
                } else {
                    if (isCaptcha) console.log("      🚨 CAPTCHA Detected! Solve it please.");
                    else console.log("      ⚠️ Loading...");
                }
            }

            serpData = await page.evaluate(() => {
                const res = [];
                document.querySelectorAll('h3').forEach(h3 => {
                    let a = h3.closest('a') || h3.querySelector('a');
                    if (a && a.href && a.href.startsWith('http')) res.push({ title: h3.innerText, url: a.href });
                });
                return res.slice(0, 5);
            });

        } catch (e) { console.log(` -> Error: ${e.message}`); }

        if (serpData.length === 0) { console.log("-> ⚠️ No Data"); continue; }

        const result = evaluateCompetitors(kw, serpData);

        if (result.verdict === "GO") {
            // ★★★ Phase 2.5: Amazon Filter (門番) ★★★
            // 「100均」「ダイソー」などの稼げない店名が入っていたらここで殺す
            const hasIgnoreWord = GLOBAL_IGNORE_LIST.some(trash => kw.includes(trash));
            const hasSpecificTrash = strategy.negative_keywords.some(trash => kw.includes(trash));

            if (hasIgnoreWord || hasSpecificTrash) {
                console.log(`-> 🚫 PRE-FILTERED (Non-Amazon/Non-Ranking Intent)`);
            } else {
                console.log(`-> ✅ Potential Winner (Score: ${result.score})`);
                candidates.push({ keyword: kw, serp: result.serp, score: result.score });
            }
        } else {
            console.log(`-> ❌`);
        }

        const rest = 10000 + Math.random() * 15000;
        await delay(rest);
    }
    await browser.close();

    if (candidates.length === 0) return console.log("\n❌ No candidates found.");

    console.log(`\n🕵️ Phase 3: AI Amazon Profit Audit for ${candidates.length} candidates...`);

    const finalResults = [];

    for (let i = 0; i < candidates.length; i++) {
        const cand = candidates[i];
        process.stdout.write(`   [${i + 1}/${candidates.length}] Auditing: "${cand.keyword}"... `);

        const result = await generateArticleBlueprint(cand.keyword, cand.serp);

        if (result && result.status === "APPROVED") {
            console.log("💰 APPROVED! (Amazon Profitable)");
            finalResults.push({
                keyword: cand.keyword,
                score: cand.score,
                blueprint: result
            });
        } else {
            const reason = result ? result.reason : "AI Error";
            console.log(`🗑️ REJECTED (${reason})`);
        }
        await delay(2000);
    }

    const filename = `BATCH_BLUEPRINTS_${SEED_KEYWORD.replace(/\s+/g, '_')}.json`;
    fs.writeFileSync(filename, JSON.stringify(finalResults, null, 2));

    console.log(`\n✨ MISSION COMPLETE ✨`);
    console.log(`   Saved ${finalResults.length} Amazon-Focused Blueprints to: ${filename}`);
}

main();