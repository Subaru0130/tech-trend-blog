/**
 * 訣 Universal Miner GOD v15 (Amazon Affiliate Sniper)
 * * [菫ｮ豁｣轤ｹ: Amazon迚ｹ蛹悶ヵ繧｣繝ｫ繧ｿ]
 * 1. Store Filter: 縲・00蝮・阪後ム繧､繧ｽ繝ｼ縲阪後ラ繝ｳ繧ｭ縲阪後さ繝ｳ繝薙ル縲阪↑縺ｩ縲・
 * Amazon縺ｧ螢ｲ繧九・縺碁屮縺励＞・亥ｮ溷ｺ苓・蠢怜髄縺ｮ・峨く繝ｼ繝ｯ繝ｼ繝峨ｒ蠕ｹ蠎慕噪縺ｫ蠑ｾ縺阪∪縺吶・
 * 2. Intent Filter: 縲梧婿豕輔阪御ｿｮ逅・阪↑縺ｩ縺ｮ髱櫁ｳｼ蜈･繧ｭ繝ｼ繝ｯ繝ｼ繝峨ｂ蠑輔″邯壹″蠑ｾ縺阪∪縺吶・
 * 3. AI Audit: 縲窟mazon縺ｧ螢ｲ繧後ｋ蝠・刀縺具ｼ溘阪ｒ譛邨ょｯｩ譟ｻ蝓ｺ貅悶↓霑ｽ蜉縲・
 * * [菴ｿ縺・婿]
 * node scripts/universal_miner_god_v15.js "繝ｯ繧､繝､繝ｬ繧ｹ繧､繝､繝帙Φ"
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

puppeteer.use(StealthPlugin());

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const SEED_KEYWORD = process.argv[2] || "繝ｯ繧､繝､繝ｬ繧ｹ繧､繝､繝帙Φ";

if (!GEMINI_API_KEY) {
    console.error("笶・Error: API Key is missing.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

// ==========================================
// 圻 PHASE 2.5: STATIC BLACKLIST (The Gatekeeper)
// ==========================================

// 1. 繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ險倅ｺ九↓縺ｪ繧峨↑縺・ｼ域ュ蝣ｱ蜿朱寔繝ｻ菫ｮ逅・ｼ峨Ρ繝ｼ繝・
const NON_RANKING_TRIGGERS = [
    '譁ｹ豕・, '莉墓婿', '繧・ｊ譁ｹ', '謇矩・, '險ｭ螳・, '菴ｿ縺・婿', '繝槭ル繝･繧｢繝ｫ', '隱ｬ譏取嶌',
    '逶ｴ縺玲婿', '菫ｮ逅・, '蠕ｩ譌ｧ', '繧ｨ繝ｩ繝ｼ', '螻翫°縺ｪ縺・, '縺､縺ｪ縺後ｉ縺ｪ縺・, '閨槭％縺医↑縺・,
    '蜴溷屏', '縺ｪ縺・, '逅・罰', '諢丞袖', '縺ｨ縺ｯ', '莉慕ｵ・∩', '豁ｴ蜿ｲ', 'wiki',
    '遒ｺ隱・, '險ｺ譁ｭ', '繝・せ繝・, '隱ｿ縺ｹ譁ｹ', '蝠上＞蜷医ｏ縺・, '髮ｻ隧ｱ逡ｪ蜿ｷ', '繝ｭ繧ｰ繧､繝ｳ', '隗｣邏・,
    '迚・婿', '迚・ｳ', '邏帛､ｱ', '縺ｪ縺上＠縺・, '繧ｱ繝ｼ繧ｹ縺ｮ縺ｿ'
];

// 2. Amazon繧｢繝輔ぅ繝ｪ縺ｧ遞ｼ縺偵↑縺・ｼ亥ｮ溷ｺ苓・繝ｻ菴主腰萓｡繝ｻ迚ｹ螳壼ｺ玲欠蜷搾ｼ峨Ρ繝ｼ繝・笘・％縺薙ｒ霑ｽ蜉
const NON_AMAZON_TRIGGERS = [
    // 100蜀・す繝ｧ繝・・邉ｻ
    '100蝮・, '逋ｾ蝮・, '繝繧､繧ｽ繝ｼ', '繧ｻ繝ｪ繧｢', '繧ｭ繝｣繝ｳ繝峨ぇ', '繝ｯ繝・ヤ',
    // 髮題ｲｨ繝ｻ繝・ぅ繧ｹ繧ｫ繧ｦ繝ｳ繝育ｳｻ
    '繧ｹ繝ｪ繝ｼ繧ｳ繧､繝ｳ繧ｺ', '繧ｹ繝ｪ繧ｳ', '3coins', '3COINS', '繝峨Φ繧ｭ', '繝峨Φ繝ｻ繧ｭ繝帙・繝・,
    '繧ｳ繧ｹ繝医さ', '辟｡蜊ｰ', '繝九ヨ繝ｪ', '繝ｯ繝ｼ繧ｯ繝槭Φ', '縺励∪繧繧・, '繧ｫ繧､繝ｳ繧ｺ',
    // 繧ｳ繝ｳ繝薙ル繝ｻ霄ｫ霑代↑蠎・
    '繧ｳ繝ｳ繝薙ル', '繧ｻ繝悶Φ', '繝ｭ繝ｼ繧ｽ繝ｳ', '繝輔ぃ繝溘・',
    // CtoC繝ｻ荳ｭ蜿､・・mazon譁ｰ蜩∽ｻ･螟厄ｼ・
    '繝｡繝ｫ繧ｫ繝ｪ', '繝､繝輔が繧ｯ', '繝ｩ繧ｯ繝・, '繧ｸ繝｢繝・ぅ繝ｼ', '荳ｭ蜿､', '繧ｸ繝｣繝ｳ繧ｯ', '繧ｲ繧ｪ', '繧ｻ繧ｫ繧ｹ繝・
];

// 蜈ｨ繝輔ぅ繝ｫ繧ｿ邨仙粋
const GLOBAL_IGNORE_LIST = [...NON_RANKING_TRIGGERS, ...NON_AMAZON_TRIGGERS];

// ==========================================
// ｧ PHASE 0: DYNAMIC STRATEGY GENERATION
// ==========================================
async function generateStrategy(seed) {
    console.log(`\nｧ Phase 0: Analyzing Market Strategy for "${seed}"...`);
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
            buying_intents: ['縺翫☆縺吶ａ', '譛蠑ｷ', '螳峨＞'],
            negative_keywords: []
        };
    }
}

// ==========================================
// 剥 PHASE 1: BROAD MINING
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
    console.log(`\n剥 Phase 1: Broad Mining`);
    let candidates = new Set();
    const suffixes = [...strategy.buying_intents.map(k => ` ${k}`), ' 縺翫☆縺吶ａ', ' 豈碑ｼ・, ' 繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ'];

    // Phase 1逕ｨ繝輔ぅ繝ｫ繧ｿ (繝上・繝峨さ繝ｼ繝・+ AI逕滓・)
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
        // 笘・％縺薙〒繧ｬ繝・ヤ繝ｪ蠑ｾ縺・
        if (combinedTrash.some(t => kw.includes(t))) return false;
        return kw.split(' ').length >= 2;
    });

    console.log(`\n   ｧｹ Deduplicating ${list.length} keywords...`);
    list.sort((a, b) => b.length - a.length);
    const uniqueList = [];
    for (const kw of list) {
        const isDuplicate = uniqueList.some(existing => existing.includes(kw.replace(seed, '').trim()));
        if (!isDuplicate) uniqueList.push(kw);
    }
    console.log(`   痩 Reduced to ${uniqueList.length} unique keywords.`);
    return uniqueList;
}

// ==========================================
// 笞厄ｸ・PHASE 2: LOGIC JUDGE
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
        if (item.title.includes("20驕ｸ") || item.title.includes("繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ") || item.title.includes("豈碑ｼ・)) genericTitleCount++;
    });

    let score = (weakCount * 10) - (giantCount * 5) + (genericTitleCount * 2);
    score += keyword.split(' ').length * 2;

    if (score >= 5 || weakCount >= 1) {
        return { verdict: "GO", score: score, serp: serpData };
    }
    return { verdict: "NO_GO", score: score };
}

// ==========================================
// 統 PHASE 3: AI AUDIT (Amazon Affiliate Focus)
// ==========================================
async function generateArticleBlueprint(keyword, serpData) {
    const prompt = `
    Role: Professional Amazon Affiliate Marketer.
    Target Keyword: "${keyword}"
    Competitors: ${serpData.map(d => d.title).join(", ")}
    
    Goal: Determine if this keyword is profitable for **Amazon Affiliate Marketing**.
    
    ## 圻 REJECT CRITERIA (Status: REJECT)
    1. **Offline Store Intent:** User wants to buy at Daiso, 3COINS, Costco, Convenience Stores. (Low profit / Not online).
    2. **Troubleshooting/Repair:** User wants to fix an existing item.
    3. **Used/Flea Market:** User wants Mercari/Yahoo Auctions.
    4. **Single Fact:** User wants "release date" or "meaning".
    
    ## 笨・APPROVE CRITERIA (Status: APPROVED)
    1. **Online Buying Intent:** User is looking for a product that is commonly sold on Amazon.
    2. **Comparison/Ranking:** User wants to see "Best X" or "Ranking".
    
    Task:
    If APPROVED, create a blueprint for a **Product Ranking/Comparison Article** monetized via Amazon.
    
    Analyze the keyword carefully to determine:
    - ranking_count: How many products to rank (5 for narrow niche, 10 for standard, 15-20 for broad).
    - price_min / price_max: Parse price constraints from keyword (e.g., "1荳・・蜿ｰ" = price_min: 10000, price_max: 19999, "5000蜀・ｻ･荳・ = price_min: 0, price_max: 5000, "3荳・・莉･荳・ = price_min: 0, price_max: 30000). If no price constraint, set both to null.
    - required_features: Array of features/attributes the products MUST have based on keyword (e.g., ["繝弱う繧ｺ繧ｭ繝｣繝ｳ繧ｻ繝ｪ繝ｳ繧ｰ", "髦ｲ豌ｴ"] for "繝弱う繧ｺ繧ｭ繝｣繝ｳ繧ｻ繝ｪ繝ｳ繧ｰ 髦ｲ豌ｴ 繧､繝､繝帙Φ", or ["鬪ｨ莨晏ｰ・] for "鬪ｨ莨晏ｰ弱う繝､繝帙Φ"). Empty array if no specific features required.
    
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
      "required_features": ["繝弱う繧ｺ繧ｭ繝｣繝ｳ繧ｻ繝ｪ繝ｳ繧ｰ"]
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
// 鹿 STEALTH FUNCTIONS
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
// 噫 MAIN EXECUTION
// ==========================================
async function main() {
    console.log(`虫 UNIVERSAL MINER GOD v15 (Amazon Affiliate Sniper)`);
    console.log(`   Target: "${SEED_KEYWORD}"`);

    const strategy = await generateStrategy(SEED_KEYWORD);
    const allKeywords = await broadMining(SEED_KEYWORD, strategy);

    const targets = allKeywords
        .sort((a, b) => b.length - a.length)
        .slice(0, 100);

    console.log(`\nｧ Phase 2: Logic Scouting (${targets.length} unique keywords)`);
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
            console.log("\n      笘・Taking a coffee break (60s)...");
            await delay(60000);
            console.log("      噫 Resuming...");
        }

        let serpData = [];
        try {
            await page.goto(`https://www.google.co.jp/search?q=${encodeURIComponent(kw)}&hl=ja&gl=jp`, { waitUntil: 'domcontentloaded', timeout: 0 });

            console.log("");
            while (true) {
                const wait = 5000 + Math.random() * 5000;
                process.stdout.write(`      竢ｳ Waiting... (${Math.round(wait / 1000)}s)\r`);
                await delay(wait);

                const hasResults = await page.$('h3');
                const content = await page.content();
                const isCaptcha = content.includes("遘√・繝ｭ繝懊ャ繝医〒縺ｯ縺ゅｊ縺ｾ縺帙ｓ") || content.includes("unusual traffic");

                if (hasResults && !isCaptcha) {
                    process.stdout.write("      笨・Page Loaded. Scrolling...                  \n");
                    await humanScroll(page);
                    break;
                } else {
                    if (isCaptcha) console.log("      圷 CAPTCHA Detected! Solve it please.");
                    else console.log("      笞・・Loading...");
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

        if (serpData.length === 0) { console.log("-> 笞・・No Data"); continue; }

        const result = evaluateCompetitors(kw, serpData);

        if (result.verdict === "GO") {
            // 笘・・笘・Phase 2.5: Amazon Filter (髢逡ｪ) 笘・・笘・
            // 縲・00蝮・阪後ム繧､繧ｽ繝ｼ縲阪↑縺ｩ縺ｮ遞ｼ縺偵↑縺・ｺ怜錐縺悟・縺｣縺ｦ縺・◆繧峨％縺薙〒谿ｺ縺・
            const hasIgnoreWord = GLOBAL_IGNORE_LIST.some(trash => kw.includes(trash));
            const hasSpecificTrash = strategy.negative_keywords.some(trash => kw.includes(trash));

            if (hasIgnoreWord || hasSpecificTrash) {
                console.log(`-> 圻 PRE-FILTERED (Non-Amazon/Non-Ranking Intent)`);
            } else {
                console.log(`-> 笨・Potential Winner (Score: ${result.score})`);
                candidates.push({ keyword: kw, serp: result.serp, score: result.score });
            }
        } else {
            console.log(`-> 笶形);
        }

        const rest = 10000 + Math.random() * 15000;
        await delay(rest);
    }
    await browser.close();

    if (candidates.length === 0) return console.log("\n笶・No candidates found.");

    console.log(`\n雰・・Phase 3: AI Amazon Profit Audit for ${candidates.length} candidates...`);

    const finalResults = [];

    for (let i = 0; i < candidates.length; i++) {
        const cand = candidates[i];
        process.stdout.write(`   [${i + 1}/${candidates.length}] Auditing: "${cand.keyword}"... `);

        const result = await generateArticleBlueprint(cand.keyword, cand.serp);

        if (result && result.status === "APPROVED") {
            console.log("腸 APPROVED! (Amazon Profitable)");
            finalResults.push({
                keyword: cand.keyword,
                score: cand.score,
                blueprint: result
            });
        } else {
            const reason = result ? result.reason : "AI Error";
            console.log(`卵・・REJECTED (${reason})`);
        }
        await delay(2000);
    }

    const filename = `BATCH_BLUEPRINTS_${SEED_KEYWORD.replace(/\s+/g, '_')}.json`;
    fs.writeFileSync(filename, JSON.stringify(finalResults, null, 2));

    console.log(`\n笨ｨ MISSION COMPLETE 笨ｨ`);
    console.log(`   Saved ${finalResults.length} Amazon-Focused Blueprints to: ${filename}`);
}

main();