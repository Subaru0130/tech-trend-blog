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
const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

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
    あなたはプロのWebエディターであり、アフィリエイトマーケティングの専門家です。
    ユーザーの「購入を迷っている」心理を理解し、背中を押す記事を設計します。
    
    ターゲットキーワード: "${keyword}"
    競合記事タイトル: ${serpData.map(d => d.title).join(", ")}
    
    ## タスク
    このキーワードに対して、**高コンバージョンのアフィリエイト記事**を設計してください。
    
    ## 🚫 却下基準 (status: REJECT)
    1. **実店舗購入意図**: ダイソー、100均、コストコ、コンビニで買いたい
    2. **トラブルシューティング**: 修理方法、設定方法、使い方を知りたい
    3. **中古/フリマ意図**: メルカリ、ヤフオクで買いたい
    4. **単純な事実確認**: 発売日、意味、スペックを知りたいだけ
    
    ## ✅ 承認基準 (status: APPROVED)
    1. **オンライン購入意図**: Amazonで販売される商品を探している
    2. **比較/ランキング意図**: 「おすすめ」「最強」「比較」を求めている
    
    ## 設計指示
    
    ### 1. 検索意図の深掘り (search_intent_analysis)
    - このキーワードで検索するユーザーの「隠れた悩み」「本当のペイン」は何か？
    - 表面的な検索ワードの裏にある「解決したい問題」を言語化してください
    - 例: 「1万円台 イヤホン」→「3万円のハイエンドは予算オーバーだが、安すぎると品質が心配」
    
    ### 2. タイトル設計 (title)
    - SEO最適化された日本語タイトル（32〜40文字）
    - 「【2025年】」「おすすめ」「ランキング」「徹底比較」などの要素を含める
    - ユーザーの悩みに直接応える表現を使う
    
    ### 3. ターゲット読者 (target_reader)
    - 具体的なペルソナを2〜3文で詳細に記述
    - 「〇〇だけど△△したい人」という形式で、悩みと願望を明確に
    - 例: 「AirPodsは高すぎて手が出ないが、5000円以下で音質や機能に妥協したくない学生や、通勤・通学用のサブ機を探している人」
    
    ### 4. 比較軸 (comparison_axis) ★重要★
    キーワードの性質に応じて、評価軸の設定方法を変えてください：
    
    **A. 特化キーワード（「最強」「特化」「重視」などを含む場合）**
    - 例: 「ノイキャン最強」「コスパ最強」「高音質」「通話重視」
    - → **単一の主軸**を設定（例: 「ノイズキャンセリング性能」のみ）
    - この主軸が評価の70%を占めることを念頭に置く
    
    **B. 総合キーワード（価格帯指定・一般的な「おすすめ」など）**
    - 例: 「1万円以下」「おすすめ」「ランキング」「比較」
    - → **複数の評価軸を並列で列挙**（例: 「音質、ノイズキャンセリング、機能性、装着感」）
    - 各軸を均等に評価することを意図
    
    **C. 出力形式**
    - is_specialized_theme: true/false（特化キーワードかどうか）
    - primary_evaluation_focus: 特化キーワードの場合は主軸を1つだけ記載、総合キーワードの場合は「総合性能」と記載
    - comparison_axis: 詳細な評価ポイントの説明（従来通り）
    
    ### 5. セールスフック (sales_hook)
    - この記事を読むメリット、なぜ今すぐ行動すべきかを熱く語る
    - 読者の不安（失敗したくない、損したくない）を解消する文章
    - 「この記事を読めば解決する」という確信を与える（3〜4文）
    - 注意: 特定ショップ名（Amazon、楽天など）は使わないこと。記事の中立性を保つ
    - 例: 「『安かろう悪かろう』を回避するため、iPhoneユーザーに必須の『AAC対応』かつ『高評価』なモデルだけを厳選。5000円以下でもノイキャン付きや長時間再生が可能な、価格破壊級の神コスパイヤホンが見つかります。この記事を読めば、あなたにピッタリの一台が必ず見つかります。」
    
    ### 6. 導入部設計 (intro_structure)
    - hook: 読者の共感を呼ぶ導入文（悩みに寄り添う）
    - background_explanation: 問題の根本原因や背景を説明（なぜこの問題が起こるのか）
    
    ### 7. ランキング基準 (ranking_criteria)
    - 商品を評価するための具体的な基準を3〜5個
    
    ### 8. フィルタリング情報
    - price_min / price_max: キーワードから価格制約を抽出（「1万円台」= 10000〜19999、「5000円以下」= 0〜5000、制約なし = null）
    - required_features: 商品が必須で持つべき機能の配列（例: ["ノイズキャンセリング", "防水"]、なければ空配列）
    - ranking_count: ランキング商品数（狭いニッチ=5、標準=10、広いカテゴリ=15-20）
    
    ## 出力JSON (承認時)
    {
      "status": "APPROVED",
      "keyword": "${keyword}",
      "title": "【2025年】〇〇おすすめランキング10選！△△を徹底比較",
      "search_intent_analysis": "このキーワードで検索するユーザーは...という隠れた悩みを抱えている",
      "intro_structure": {
        "hook": "「□□で困っていませんか？」という共感を呼ぶ導入",
        "background_explanation": "なぜこの問題が起こるのか、背景を説明"
      },
      "ranking_criteria": ["基準1（具体的に）", "基準2（具体的に）", "基準3（具体的に）"],
      "target_reader": "〇〇だけど△△したい人。具体的なペルソナを詳細に記述。",
      "is_specialized_theme": true,
      "primary_evaluation_focus": "ノイズキャンセリング性能",
      "comparison_axis": "ノイズキャンセリング性能（低音から高音までの遮音性、圧迫感の有無）",
      "sales_hook": "なぜこの記事を読むべきか、読者の不安を解消し今すぐ行動を促す熱い文章。特定ショップ名は使わない。",
      "ranking_count": 10,
      "price_min": 10000,
      "price_max": 19999,
      "required_features": ["必須機能1", "必須機能2"]
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
