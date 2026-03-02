/**
 * 🌍 Universal Miner GOD v12 (Ultimate Edition)
 * 
 * ★ v10 + v11 統合版
 * 
 * [v10から継承]
 * - 60語以上の厳格なAmazonフィルタ（100均、ダイソー等除外）
 * - price_min, price_max, required_features 出力
 * 
 * [v11から継承]
 * - 問題解決志向のキーワード生成
 * - search_intent_analysis（検索意図分析）
 * - intro_structure（記事導入部設計）
 * - ranking_criteria（ランキング基準）
 * 
 * [使い方]
 * node scripts/universal_miner_god_v12.js "ワイヤレスイヤホン"
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
const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

// ==========================================
// 🚫 BLACKLIST (v10から継承 - 厳格なAmazonフィルタ)
// ==========================================

// 1. ランキング記事にならない（情報収集・修理）ワード
const NON_RANKING_TRIGGERS = [
    '方法', '仕方', 'やり方', '手順', '設定', '使い方', 'マニュアル', '説明書',
    '直し方', '修理', '復旧', 'エラー', '届かない', 'つながらない', '聞こえない',
    '原因', 'なぜ', '理由', '意味', 'とは', '仕組み', '歴史', 'wiki',
    '確認', '診断', 'テスト', '調べ方', '問い合わせ', '電話番号', 'ログイン', '解約',
    '片方', '片耳', '紛失', 'なくした', 'ケースのみ'
];

// 2. Amazonアフィリで稼げない（実店舗・低単価・特定店指名）ワード
const NON_AMAZON_TRIGGERS = [
    // 100円ショップ系
    '100均', '百均', 'ダイソー', 'セリア', 'キャンドゥ', 'ワッツ',
    // 雑貨・ディスカウント系
    'スリーコインズ', 'スリコ', '3coins', '3COINS', 'ドンキ', 'ドン・キホーテ',
    'コストコ', '無印', 'ニトリ', 'ワークマン', 'しまむら', 'カインズ',
    // コンビニ・身近な店
    'コンビニ', 'セブン', 'ローソン', 'ファミマ',
    // CtoC・中古（Amazon新品以外）
    'メルカリ', 'ヤフオク', 'ラクマ', 'ジモティー', '中古', 'ジャンク', 'ゲオ', 'セカスト',
    // Q&Aサイト（記事として不適切）
    '知恵袋',
    // 他ECサイト・家電量販店（Amazon以外で買いたい人）
    '楽天', 'ヨドバシ', 'ビックカメラ'
];

const GLOBAL_IGNORE_LIST = [...NON_RANKING_TRIGGERS, ...NON_AMAZON_TRIGGERS];

// ==========================================
// 🧠 PHASE 0: INTENT BRAINSTORMING (v11から継承)
// ==========================================
async function generateBuyingKeywords(seed) {
    console.log(`\n🧠 Phase 0: Brainstorming buying intents for "${seed}"...`);
    const prompt = `
    Target: "${seed}"
    Generate 20 keyword phrases implying **"dissatisfaction"**, **"specific problem"**, or **"urgent need"**.
    Also include **commercial buying intent** modifiers like "おすすめ", "比較", "ランキング", "コスパ", "安い".
    Exclude pure "how to" or "repair" queries.
    Output ONLY JSON Array.
    Example: ["おすすめ", "比較", "ランキング", "コスパ 最強", "安い", "1万円以下", "ノイズキャンセリング", "iphone対応", "通話 最強", "遅延なし ゲーム"]
    `;
    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (e) {
        return ['おすすめ', '比較', 'ランキング', 'コスパ', '安い', '1万円以下', 'ノイズキャンセリング'];
    }
}

// ==========================================
// 🔍 PHASE 1: BROAD MINING & DEDUPLICATION
// ==========================================
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
    const suffixes = [...aiKeywords.map(k => ` ${k}`), ' おすすめ', ' 比較', ' ランキング', ' 最強', ' 安い'];

    process.stdout.write(`   Mining: `);
    for (const suffix of suffixes) {
        process.stdout.write(".");
        const sub = await fetchSuggestions(seed + suffix);
        sub.forEach(s => candidates.add(s));

        // Deep mining for buying-intent keywords
        if (aiKeywords.some(k => suffix.includes(k)) && sub.length > 0) {
            for (const deep of sub.slice(0, 3)) {
                const sub2 = await fetchSuggestions(deep + " ");
                sub2.forEach(s => candidates.add(s));
            }
        }
        await delay(200);
    }

    // Apply v10's strict filter
    let list = Array.from(candidates).filter(kw => {
        if (!kw.includes(seed)) return false;
        if (GLOBAL_IGNORE_LIST.some(t => kw.includes(t))) return false;
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
    // GIANTS = 本当の強敵（ランキング記事を書いているサイト）
    // amazon, rakuten, kakaku は商品一覧なので競合ではない
    const GIANTS = ['mybest', 'biccamera', 'yodobashi', 'apple', 'sony', 'panasonic'];
    const WEAKS = ['chiebukuro', 'detail.chiebukuro', 'okwave', 'ameblo', 'note.com', 'hatenablog', 'quora', '2ch', '5ch', 'togetter'];

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
// 🏗️ PHASE 3: ULTIMATE BLUEPRINT (v10 + v11 統合)
// ==========================================
async function generateUltimateBlueprint(keyword, serpData) {
    const prompt = `
    あなたはプロのWebエディターであり、記事の「有用性」を設計するアーキテクトです。
    Googleの"Helpful Content System"に基づき、**「特定のユーザー」**の**「特定の悩み」**を解決する**「情報の充足度が高い」**記事を設計してください。
    
    ターゲットキーワード: "${keyword}"
    競合記事タイトル: ${serpData.map(d => d.title).join(", ")}
    
    ## タスク
    このキーワードに対して、ユーザーが「これだけ読めば十分」と感じる高密度の記事を設計してください。
    
    ## 🚫 却下基準 (status: REJECT)
    1. **実店舗購入意図**: ダイソー、100均、コストコ、コンビニで買いたい
    2. **トラブルシューティング**: 修理方法、設定方法、使い方を知りたい
    3. **中古/フリマ意図**: メルカリ、ヤフオクで買いたい
    4. **単純な事実確認**: 発売日、意味、スペックを知りたいだけ
    5. **対象が曖昧**: 「誰にでもおすすめ」のようなターゲット不在の記事
    
    ## ✅ 承認基準 (status: APPROVED)
    1. **オンライン購入意図**: Amazonで販売される商品を探している
    2. **比較/ランキング意図**: 「おすすめ」「最強」「比較」を求めている
    
    ## 設計指示
    
    ### 1. 検索意図の深掘り (search_intent_analysis)
    - このキーワードで検索するユーザーの「隠れた悩み」「本当のペイン」は何か？
    - 表面的な検索ワードの裏にある「解決したい問題」を言語化してください
    - 例: 「1万円台 イヤホン」→「3万円のハイエンドは予算オーバーだが、安物買いで失敗して『音がスカスカ』なのは絶対に嫌」
    
    ### 2. タイトル設計 (title)
    - **「誰の」「どんな悩みを」「どう解決するか」**が一目でわかるタイトル
    - 抽象的な「おすすめランキング」は禁止。具体的なベネフィットを入れる
    - 例: 
      - ❌ 「ワイヤレスイヤホンおすすめランキング」
      - ⭕️ 「【2025年】通勤ストレスが消える！ノイキャンイヤホンおすすめ5選｜口コミ徹底分析」
    
    ### 3. ターゲット読者 (target_reader)
    - **「キーワードから論理的に導かれる最も深いユーザー層（マイクロペルソナ）」**を定義してください。
    - ❌ 「30代男性」のような属性定義は無意味なので禁止。
    - ❌ 「全員におすすめ」も禁止。
    - ⭕️ **徹底的に具体的かつニッチな状況**を描写する:
      - NG: 「通勤中に音楽を聴く人」
      - OK: 「往復2時間の満員電車通勤で、騒音に邪魔されずに『Audible』で自己研鑽したいと考えているビジネスパーソン」
      - OK: 「カフェでリモートワークをするが、周囲の会話が気になって集中できず、耳栓代わりの強力なノイキャンを求めているフリーランス」

    ### 4. 比較軸 (comparison_axis) ★重要★
    - そのターゲット層が**「共通して最も重視するポイント」**を主軸にする。
    - 例: 「電車の走行音を消すノイズキャンセリング性能」と「長時間つけても疲れない装着感」

    ### 5. セールスフック (sales_hook)
    - その悩みを持つ層全体に対し、「この記事が最適解である」と約束する。
    - 例: 「『静寂』を手に入れるための最短ルート。通勤ストレスを過去のものにする最強の選択肢。」

    ### 6. 導入部設計 (intro_structure)
    - hook: 多くの読者が「自分のことだ」と感じる、**最大公約数的な深い共感**
    - background_explanation: 従来品では満足できない本質的な理由

    ### 7. ランキング基準 (ranking_criteria)
    - 具体的な基準を3〜5個。

    ### 8. フィルタリング情報
    - price_min / price_max: キーワードから価格制約を抽出
    - required_features: 商品が必須で持つべき機能の配列
    - ranking_count: 5, 10, 15 (狭いテーマほど少なく、濃く)

    ## 出力JSON (承認時)
    {
      "status": "APPROVED",
      "keyword": "${keyword}",
      "title": "...",
      "search_intent_analysis": "...",
      "intro_structure": { "hook": "...", "background_explanation": "..." },
      "ranking_criteria": ["..."],
      "target_reader": "...", // 戦略的ターゲット記述
      "user_demographics": { // ターゲット構成要素
        "situation": "...", // 共通の状況（例: 電車通勤）
        "pain_point": "...", // 共通の悩み（例: 騒音ストレス）
        "desire": "..." // 共通の願望（例: 静寂が欲しい）
      },
      "is_specialized_theme": true/false,
      "primary_evaluation_focus": "...",
      "comparison_axis": "...",
      "sales_hook": "...",
      "ranking_count": 10,
      "price_min": 0,
      "price_max": 0,
      "required_features": ["..."]
    }
    
    ## 出力JSON (却下時)
    { "status": "REJECT", "reason": "却下理由" }
    
    重要: 全ての出力は必ず**日本語**で、**詳細かつ具体的**に記述してください。
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
    console.log(`💎 UNIVERSAL MINER GOD v12 (Ultimate Edition)`);
    console.log(`   Target: "${SEED_KEYWORD}"`);
    console.log(`   ✅ v10 Amazon Filter: Active (${GLOBAL_IGNORE_LIST.length} words)`);
    console.log(`   ✅ v11 Intent Analysis: Active`);

    // Phase 0 & 1
    const aiKeywords = await generateBuyingKeywords(SEED_KEYWORD);
    const allKeywords = await broadMining(SEED_KEYWORD, aiKeywords);

    const targets = allKeywords
        .sort((a, b) => b.length - a.length)
        .slice(0, 100);

    console.log(`\n🧠 Phase 2: Logic Scouting (${targets.length} keywords)`);
    console.log(`   NOTE: Stealth Mode ON. Filter: [Non-Ranking] + [Non-Amazon]`);

    // Connect to existing Chrome (user profile) to avoid CAPTCHA
    let browser;
    try {
        const http = require('http');
        const wsUrl = await new Promise((resolve, reject) => {
            const req = http.get('http://127.0.0.1:9222/json/version', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        resolve(json.webSocketDebuggerUrl);
                    } catch (e) { reject(e); }
                });
            });
            req.on('error', reject);
            req.setTimeout(2000, () => { req.destroy(); reject(new Error('timeout')); });
        });
        browser = await puppeteer.connect({ browserWSEndpoint: wsUrl, defaultViewport: null });
        console.log("      ✅ Connected to Chrome Remote Debugging (User Profile)");
    } catch (e) {
        console.log("      ⚠️ Could not connect to remote Chrome. Launching fresh instance (CAPTCHA risk high)...");
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
        });
    }

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
            // v10's strict pre-filter
            const hasIgnoreWord = GLOBAL_IGNORE_LIST.some(trash => kw.includes(trash));

            if (hasIgnoreWord) {
                console.log(`-> 🚫 PRE-FILTERED (Non-Amazon/Non-Ranking)`);
            } else {
                const scoreDisplay = result.score >= 20 ? "🔥" : "";
                console.log(`-> ✅ GO! ${scoreDisplay} (Score: ${result.score})`);
                candidates.push({ keyword: kw, serp: result.serp, score: result.score });
            }
        } else {
            console.log(`-> ❌`);
        }

        const rest = 10000 + Math.random() * 15000;
        await delay(rest);
    }
    await browser.close();

    // ==========================================
    // 🏛️ PHASE 3: ULTIMATE BLUEPRINT
    // ==========================================
    if (candidates.length === 0) return console.log("\n❌ No candidates found.");

    console.log(`\n🏛️ Phase 3: Generating Ultimate Blueprints for ${candidates.length} winners...`);

    const finalResults = [];

    for (let i = 0; i < candidates.length; i++) {
        const cand = candidates[i];
        process.stdout.write(`   [${i + 1}/${candidates.length}] Designing: "${cand.keyword}"... `);

        const blueprint = await generateUltimateBlueprint(cand.keyword, cand.serp);

        if (blueprint && blueprint.status === "APPROVED") {
            console.log("💰 APPROVED!");
            blueprint.mined_score = cand.score;
            finalResults.push({
                keyword: cand.keyword,
                score: cand.score,
                blueprint: blueprint
            });
        } else {
            const reason = blueprint ? blueprint.reason : "AI Error";
            console.log(`🗑️ REJECTED (${reason})`);
        }
        await delay(2000);
    }

    const filename = `BATCH_BLUEPRINTS_${SEED_KEYWORD.replace(/\s+/g, '_')}.json`;
    fs.writeFileSync(filename, JSON.stringify(finalResults, null, 2));

    console.log(`\n✨ MISSION COMPLETE ✨`);
    console.log(`   Saved ${finalResults.length} Ultimate Blueprints to: ${filename}`);
    console.log(`   Next Step: node scripts/produce_from_blueprint.js ${filename} "<KEYWORD>"`);
}

main();
