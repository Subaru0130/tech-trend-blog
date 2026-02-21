/**
 * 訣 Universal Miner GOD v11 (Blueprint Architect Edition)
 * * [騾ｲ蛹也せ: "譁・ц"縺ｮ謾ｯ驟江
 * 1. Deep Context Analysis: 蜊倥↑繧九く繝ｼ繝ｯ繝ｼ繝画歓蜃ｺ縺ｧ縺ｯ縺ｪ縺上√後↑縺懊◎繧後ｒ讀懃ｴ｢縺励◆縺ｮ縺具ｼ溘・Search Intent)繧定ｨ隱槫喧縺励∪縺吶・
 * 2. Dynamic Blueprint: "繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ"縺ｮ蜑阪↓縲∝ｿ・★"蜴溷屏縺ｨ隗｣豎ｺ遲悶・謠千､ｺ"・医・繝ｭ繝ｭ繝ｼ繧ｰ・峨ｒ險ｭ險亥峙縺ｫ邨・∩霎ｼ縺ｿ縺ｾ縺吶・
 * 3. Writer-Ready JSON: 繝ｩ繧､繧ｿ繝ｼAI縺後◎縺ｮ縺ｾ縺ｾ菴ｿ縺医ｋ蠖｢蠑上〒縲∬ｨ倅ｺ区ｧ区・・亥ｰ主・縲憺∈縺ｳ譁ｹ縲懃ｵ占ｫ厄ｼ峨ｒ螳悟・螳夂ｾｩ縺励∪縺吶・
 * * [菴ｿ縺・婿]
 * node scripts/universal_miner_god_v11.js "繝ｯ繧､繝､繝ｬ繧ｹ繧､繝､繝帙Φ"
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

if (!GEMINI_API_KEY) process.exit(1);

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

// ==========================================
// ｧ PHASE 0: INTENT BRAINSTORMING
// ==========================================
async function generateBuyingKeywords(seed) {
    console.log(`\nｧ Phase 0: Brainstorming buying intents for "${seed}"...`);
    // 繧医ｊ蜈ｷ菴鍋噪縺ｧ縲∬ｧ｣豎ｺ遲悶ｒ豎ゅａ縺ｦ縺・ｋ繧ｭ繝ｼ繝ｯ繝ｼ繝峨ｒ迢吶≧
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
        return ['螳峨＞', '螢翫ｌ縺・雋ｷ縺・崛縺・, '蟇ｿ蜻ｽ', '逞帙＞', '驕・ｻｶ', '髻ｳ雉ｪ 謔ｪ縺・, '邏帛､ｱ', '迚・ｳ', '繝槭う繧ｯ 閨槭％縺医↑縺・];
    }
}

// ==========================================
// 剥 PHASE 1: BROAD MINING & DEDUPLICATION
// ==========================================
const TRASH_WORDS = ['wiki', '諢丞袖', '縺ｨ縺ｯ', '險ｭ螳・, '繝ｭ繧ｰ繧､繝ｳ', '蠎苓・', '荳ｭ蜿､', '繧ｲ繧ｪ', '逶ｴ縺玲婿', '菫ｮ逅・, '貂ｬ螳・, '繝壹い繝ｪ繝ｳ繧ｰ', '蟇ｿ蜻ｽ 縺ｩ縺ｮ縺上ｉ縺・];

async function fetchSuggestions(query) {
    try {
        const url = `http://suggestqueries.google.com/complete/search?client=firefox&hl=ja&gl=jp&q=${encodeURIComponent(query)}`;
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
        return (res.data && res.data[1]) ? res.data[1] : [];
    } catch { return []; }
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function broadMining(seed, aiKeywords) {
    console.log(`\n剥 Phase 1: Broad Mining`);
    let candidates = new Set();
    const suffixes = [...aiKeywords.map(k => ` ${k}`), ' 縺翫☆縺吶ａ', ' 隧募愛', ' 譛蠑ｷ', ' 螳峨＞'];

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
    const WEAKS = ['chiebukuro', 'detail.chiebukuro', 'okwave', 'ameblo', 'note.com', 'hatenablog', 'quora', '2ch', '5ch', 'togetter'];

    let giantCount = 0;
    let weakCount = 0;
    let genericTitleCount = 0;

    serpData.forEach(item => {
        let domain = '';
        try { domain = new URL(item.url).hostname; } catch (e) { }
        if (GIANTS.some(g => domain.includes(g))) giantCount++;
        if (WEAKS.some(w => domain.includes(w))) weakCount++;
        if (item.title.includes("20驕ｸ") || item.title.includes("繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ")) genericTitleCount++;
    });

    let score = (weakCount * 10) - (giantCount * 5) + (genericTitleCount * 2);
    score += keyword.split(' ').length * 2;

    if (score >= 5 || weakCount >= 1) {
        return { verdict: "GO", score: score, serp: serpData };
    }
    return { verdict: "NO_GO", score: score };
}

// ==========================================
// 女・・PHASE 3: ARCHITECT (Dynamic Blueprint)
// ==========================================
async function generateArchitectBlueprint(keyword, serpData) {
    // 繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ隕∵悍: 縲瑚レ譎ｯ縲阪梧､懃ｴ｢諢丞峙縲阪ｒ縺上∩蜿悶▲縺ｦ縲∬ｨ倅ｺ九・蠎冗乢縺ｧ縺昴ｌ繧定ｪ槭ｌ繧九ｈ縺・↓縺吶ｋ縲・
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
    console.log(`虫 UNIVERSAL MINER GOD v11 (Blueprint Architect Edition)`);
    console.log(`   Target: "${SEED_KEYWORD}"`);

    // Phase 0 & 1
    const aiKeywords = await generateBuyingKeywords(SEED_KEYWORD);
    const allKeywords = await broadMining(SEED_KEYWORD, aiKeywords);

    const targets = allKeywords
        .sort((a, b) => b.length - a.length)
        .slice(0, 100);

    console.log(`\nｧ Phase 2: Logic Scouting (${targets.length} keywords)`);
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
            console.log("\n      笘・Coffee Break (60s)...");
            await delay(60000);
            console.log("      噫 Resuming...");
        }

        let serpData = [];
        try {
            await page.goto(`https://www.google.co.jp/search?q=${encodeURIComponent(kw)}&hl=ja&gl=jp`, { waitUntil: 'domcontentloaded', timeout: 0 });

            // Wait Logic (v8/v9/v10 same)
            console.log("");
            while (true) {
                const wait = 3000 + Math.random() * 3000; // slightly faster for demo, adjust for prod
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

        } catch (e) { }

        if (serpData.length === 0) { console.log("-> 笞・・No Data"); continue; }

        const result = evaluateCompetitors(kw, serpData);

        if (result.verdict === "GO") {
            const scoreDisplay = result.score >= 20 ? "櫨" : "";
            console.log(`-> 笨・GO! ${scoreDisplay} (Score: ${result.score})`);
            candidates.push({ keyword: kw, serp: result.serp, score: result.score });
        } else {
            console.log(`-> 笶形);
        }

        const rest = 5000 + Math.random() * 5000;
        await delay(rest);
    }
    await browser.close();

    // ==========================================
    // 鋤・・PHASE 3: ARCHITECT (FINAL OUTPUT)
    // ==========================================
    if (candidates.length === 0) return console.log("\n笶・No candidates found.");

    console.log(`\n鋤・・Phase 3: Architecting Article Blueprints for ${candidates.length} winners...`);

    const finalResults = [];

    for (let i = 0; i < candidates.length; i++) {
        const cand = candidates[i];
        process.stdout.write(`   [${i + 1}/${candidates.length}] Designing: "${cand.keyword}"... `);

        const architectPlan = await generateArchitectBlueprint(cand.keyword, cand.serp);

        if (architectPlan && architectPlan.status === "APPROVED") {
            console.log("笨・APPROVED");
            // Add technical metadata to help the writer later (optional)
            architectPlan.mined_score = cand.score;
            finalResults.push(architectPlan);
        } else {
            const reason = architectPlan ? architectPlan.reason : "Unknown";
            console.log(`卵・・REJECT (${reason})`);
        }
        await delay(2000);
    }

    const filename = `ARCHITECT_BLUEPRINTS_${SEED_KEYWORD.replace(/\s+/g, '_')}.json`;
    fs.writeFileSync(filename, JSON.stringify(finalResults, null, 2));

    console.log(`\n笨ｨ MISSION COMPLETE 笨ｨ`);
    console.log(`   Saved ${finalResults.length} Blueprints to: ${filename}`);
    console.log(`   Next Step: Feed this JSON to your AI Writer to generate the full articles.`);
}

main();
