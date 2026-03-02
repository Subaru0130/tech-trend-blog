/**
 * 🌍 Universal Miner GOD v11 (Blueprint Architect Edition)
 * * [進化点: "文脈"の支配]
 * 1. Deep Context Analysis: 単なるキーワード抽出ではなく、「なぜそれを検索したのか？」(Search Intent)を言語化します。
 * 2. Dynamic Blueprint: "ランキング"の前に、必ず"原因と解決策の提示"（プロローグ）を設計図に組み込みます。
 * 3. Writer-Ready JSON: ライターAIがそのまま使える形式で、記事構成（導入〜選び方〜結論）を完全定義します。
 * * [使い方]
 * node scripts/universal_miner_god_v11.js "ワイヤレスイヤホン"
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

if (!GEMINI_API_KEY) process.exit(1);

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

// ==========================================
// 🧠 PHASE 0: INTENT BRAINSTORMING
// ==========================================
async function generateBuyingKeywords(seed) {
    console.log(`\n🧠 Phase 0: Brainstorming buying intents for "${seed}"...`);
    // より具体的で、解決策を求めているキーワードを狙う
    const prompt = `
    Target: "${seed}"
    Generate 20 keyword phrases implying **"dissatisfaction"**, **"specific problem"**, or **"urgent need"**.
    Exclude generic "ranking" or "how to".
    Output ONLY JSON Array.
    Example: ["ears hurt after 1 hour", "battery dies during commute", "lost airpods replacement", "gaming latency lag", "web meeting microphone quiet"]
    `;
    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (e) {
        return ['安い', '壊れた 買い替え', '寿命', '痛い', '遅延', '音質 悪い', '紛失', '片耳', 'マイク 聞こえない'];
    }
}

// ==========================================
// 🔍 PHASE 1: BROAD MINING & DEDUPLICATION
// ==========================================
const TRASH_WORDS = ['wiki', '意味', 'とは', '設定', 'ログイン', '店舗', '中古', 'ゲオ', '直し方', '修理', '測定', 'ペアリング', '寿命 どのくらい'];

async function fetchSuggestions(query) {
    try {
        const url = `http://suggestqueries.google.com/complete/search?client=firefox&hl=ja&gl=jp&q=${encodeURIComponent(query)}`;
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
        return (res.data && res.data[1]) ? res.data[1] : [];
    } catch { return []; }
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function broadMining(seed, aiKeywords) {
    console.log(`\n🔍 Phase 1: Broad Mining`);
    let candidates = new Set();
    const suffixes = [...aiKeywords.map(k => ` ${k}`), ' おすすめ', ' 評判', ' 最強', ' 安い'];

    process.stdout.write(`   Mining: `);
    for (const suffix of suffixes) {
        process.stdout.write(".");
        const sub = await fetchSuggestions(seed + suffix);
        sub.forEach(s => candidates.add(s));

        if (aiKeywords.some(k => suffix.includes(k)) && sub.length > 0) {
            for (const deep of sub.slice(0, 3)) {
                const sub2 = await fetchSuggestions(deep + " ");
                sub2.forEach(s => candidates.add(s));
            }
        }
        await delay(200);
    }

    let list = Array.from(candidates).filter(kw => {
        if (!kw.includes(seed)) return false;
        if (TRASH_WORDS.some(t => kw.includes(t))) return false;
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
    const WEAKS = ['chiebukuro', 'detail.chiebukuro', 'okwave', 'ameblo', 'note.com', 'hatenablog', 'quora', '2ch', '5ch', 'togetter'];

    let giantCount = 0;
    let weakCount = 0;
    let genericTitleCount = 0;

    serpData.forEach(item => {
        let domain = '';
        try { domain = new URL(item.url).hostname; } catch (e) { }
        if (GIANTS.some(g => domain.includes(g))) giantCount++;
        if (WEAKS.some(w => domain.includes(w))) weakCount++;
        if (item.title.includes("20選") || item.title.includes("ランキング")) genericTitleCount++;
    });

    let score = (weakCount * 10) - (giantCount * 5) + (genericTitleCount * 2);
    score += keyword.split(' ').length * 2;

    if (score >= 5 || weakCount >= 1) {
        return { verdict: "GO", score: score, serp: serpData };
    }
    return { verdict: "NO_GO", score: score };
}

// ==========================================
// 🏗️ PHASE 3: ARCHITECT (Dynamic Blueprint)
// ==========================================
async function generateArchitectBlueprint(keyword, serpData) {
    // ユーザーの要望: 「背景」「検索意図」をくみ取って、記事の序盤でそれを語れるようにする。
    const prompt = `
    Role: Professional Web Editor.
    Target Keyword: "${keyword}"
    Competitors: ${serpData.map(d => d.title).join(", ")}
    
    Task: Design a high-conversion affiliate article structure tailored to the SEARCH INTENT.
    
    1. **Analyze Intent**: Why is the user searching this? (e.g., "ear hurts" -> "clamping force is too strong").
    2. **Design Intro**: Define the "Background Context" to discuss BEFORE the ranking.
    3. **Design Criteria**: Define specific judging criteria for this problem.
    4. **Evaluate Commercial Viability**: If informational only (e.g. "how to fix"), Reject.
    
    Output JSON (Success):
    {
      "status": "APPROVED",
      "keyword": "${keyword}",
      "title": "Compelling Title (32 chars max)",
      "search_intent_analysis": "Deep analysis of the user's hidden problem/pain.",
      "intro_structure": {
        "hook": "Sympathetic opening sentence.",
        "background_explanation": "Explain the root cause of the problem (e.g., why cheap drivers fail)."
      },
      "ranking_criteria": ["Criteria 1", "Criteria 2", "Criteria 3"],
      "target_persona": "Who is this for?"
    }

    Output JSON (Reject):
    { "status": "REJECT", "reason": "No commercial intent / Too generic" }
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
    console.log(`💎 UNIVERSAL MINER GOD v11 (Blueprint Architect Edition)`);
    console.log(`   Target: "${SEED_KEYWORD}"`);

    // Phase 0 & 1
    const aiKeywords = await generateBuyingKeywords(SEED_KEYWORD);
    const allKeywords = await broadMining(SEED_KEYWORD, aiKeywords);

    const targets = allKeywords
        .sort((a, b) => b.length - a.length)
        .slice(0, 100);

    console.log(`\n🧠 Phase 2: Logic Scouting (${targets.length} keywords)`);
    console.log(`   NOTE: Stealth Mode Active.`);

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
            console.log("\n      ☕ Coffee Break (60s)...");
            await delay(60000);
            console.log("      🚀 Resuming...");
        }

        let serpData = [];
        try {
            await page.goto(`https://www.google.co.jp/search?q=${encodeURIComponent(kw)}&hl=ja&gl=jp`, { waitUntil: 'domcontentloaded', timeout: 0 });

            // Wait Logic (v8/v9/v10 same)
            console.log("");
            while (true) {
                const wait = 3000 + Math.random() * 3000; // slightly faster for demo, adjust for prod
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

        } catch (e) { }

        if (serpData.length === 0) { console.log("-> ⚠️ No Data"); continue; }

        const result = evaluateCompetitors(kw, serpData);

        if (result.verdict === "GO") {
            const scoreDisplay = result.score >= 20 ? "🔥" : "";
            console.log(`-> ✅ GO! ${scoreDisplay} (Score: ${result.score})`);
            candidates.push({ keyword: kw, serp: result.serp, score: result.score });
        } else {
            console.log(`-> ❌`);
        }

        const rest = 5000 + Math.random() * 5000;
        await delay(rest);
    }
    await browser.close();

    // ==========================================
    // 🏛️ PHASE 3: ARCHITECT (FINAL OUTPUT)
    // ==========================================
    if (candidates.length === 0) return console.log("\n❌ No candidates found.");

    console.log(`\n🏛️ Phase 3: Architecting Article Blueprints for ${candidates.length} winners...`);

    const finalResults = [];

    for (let i = 0; i < candidates.length; i++) {
        const cand = candidates[i];
        process.stdout.write(`   [${i + 1}/${candidates.length}] Designing: "${cand.keyword}"... `);

        const architectPlan = await generateArchitectBlueprint(cand.keyword, cand.serp);

        if (architectPlan && architectPlan.status === "APPROVED") {
            console.log("✅ APPROVED");
            // Add technical metadata to help the writer later (optional)
            architectPlan.mined_score = cand.score;
            finalResults.push(architectPlan);
        } else {
            const reason = architectPlan ? architectPlan.reason : "Unknown";
            console.log(`🗑️ REJECT (${reason})`);
        }
        await delay(2000);
    }

    const filename = `ARCHITECT_BLUEPRINTS_${SEED_KEYWORD.replace(/\s+/g, '_')}.json`;
    fs.writeFileSync(filename, JSON.stringify(finalResults, null, 2));

    console.log(`\n✨ MISSION COMPLETE ✨`);
    console.log(`   Saved ${finalResults.length} Blueprints to: ${filename}`);
    console.log(`   Next Step: Feed this JSON to your AI Writer to generate the full articles.`);
}

main();
