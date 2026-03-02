const axios = require('axios');
const fs = require('fs');

// 🛡️ Anti-Detection (Bot対策)
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 * 🌍 CONFIGURATION
 */
const SEED_KEYWORD = process.argv[2] || "ワイヤレスイヤホン";

// 共通のレッドオーシャン（大手）
const RED_DOMAINS = [
    'mybest.com', 'kakaku.com', 'amazon.co.jp', 'rakuten.co.jp',
    'the360.life', 'iecolle.com', 'moov.ooo', 'customlife-media.jp',
    'rentio.jp', 'biccamera.com', 'yodobashi.com'
];

// 狙い目のブルーオーシャン（個人・Q&A）
const BLUE_DOMAINS = [
    'chiebukuro.yahoo.co.jp', 'oshiete.goo.ne.jp', 'detail.chiebukuro',
    'twitter.com', 'x.com', 'note.com', 'ameblo.jp', 'hatenablog.com', 'qiita.com', 'zenn.dev'
];

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 🔍 Google Suggest API (Official-ish endpoint)
 * 修正点: client=firefox を指定することで安定したJSONを取得
 */
async function fetchSuggestions(query) {
    try {
        const url = `http://suggestqueries.google.com/complete/search?client=firefox&hl=ja&gl=jp&q=${encodeURIComponent(query)}`;
        // User-Agentを偽装しないと弾かれることがあるためヘッダー追加
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        // response.data = ["query", ["sug1", "sug2", ...]]
        if (Array.isArray(response.data) && Array.isArray(response.data[1])) {
            return response.data[1];
        }
        return [];
    } catch (e) {
        return [];
    }
}

/**
 * 🌊 Deep Mining Logic
 * 「あ～ん」「a～z」を付加して、大量のサジェストを掘り起こす
 */
async function getCandidates(seed) {
    console.log(`\n🔍 Phase 1: Expansion (Seed: "${seed}")`);

    let allCandidates = new Set();

    // 1. まず普通に検索
    const base = await fetchSuggestions(seed);
    base.forEach(c => allCandidates.add(c));
    process.stdout.write(`   Base: ${base.length} keywords found.\n`);

    // 2. 「あ～ん」総当たり (Deep Mining)
    // 時間短縮のため、ここでは主要な文字だけを例示しますが、
    // 本気なら hiragana 配列を 'あ'...'ん' まで増やしてください。
    const hiragana = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ', 'おすすめ', 'とは', '評判'];

    console.log(`   ⛏️  Deep Mining with suffixes...`);

    for (const char of hiragana) {
        process.stdout.write(`.`); // 進行状況
        await delay(300); // API制限回避のウェイト
        const suggestions = await fetchSuggestions(`${seed} ${char}`);
        suggestions.forEach(c => allCandidates.add(c));
    }
    console.log("");

    // フィルタリング: 種キーワードを含まないゴミを除去 & 2語以上
    const cleanList = Array.from(allCandidates).filter(q => q.includes(seed) && q.includes(' '));

    console.log(`   👉 Total Unique Candidates: ${cleanList.length}`);
    return cleanList;
}

async function checkSerp(browser, query) {
    const page = await browser.newPage();
    try {
        const searchUrl = `https://www.google.co.jp/search?q=${encodeURIComponent(query)}`;
        await delay(1500 + Math.random() * 1000); // Bot対策ウェイト

        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

        const links = await page.evaluate(() => {
            const results = Array.from(document.querySelectorAll('div.g a'));
            return results.map(a => a.href).filter(h => h && h.startsWith('http'));
        });

        const distinctDomains = [...new Set(links.map(link => {
            try { return new URL(link).hostname; } catch { return null; }
        }).filter(Boolean))].slice(0, 3); // Top 3

        return distinctDomains;
    } catch (e) {
        // console.warn(`   ⚠️ Error: ${e.message}`);
        return [];
    } finally {
        await page.close();
    }
}

async function analyze() {
    console.log(`🚀 Starting Blue Ocean Mining v3...`);

    // 1. Expansion (大量取得)
    const candidates = await getCandidates(SEED_KEYWORD);

    // テストのため、最初の10件だけチェックする（本番は .slice(0, 10) を外す）
    const targets = candidates.slice(0, 10); // 時短テスト用

    if (targets.length === 0) {
        console.log("❌ No candidates found. API might be blocked.");
        return;
    }

    // 2. Recon & Judge
    console.log(`\n🕵️ Phase 2: Reconnaissance (${targets.length} keywords)`);
    console.log(`   Estimated time: ${Math.round(targets.length * 3 / 60)} mins`);

    const browser = await puppeteer.launch({ headless: "new" });
    const winners = [];

    let count = 0;
    for (const query of targets) {
        count++;
        // 進捗表示
        process.stdout.write(`[${count}/${targets.length}] "${query}" `);

        const domains = await checkSerp(browser, query);

        if (domains.length === 0) {
            console.log(` -> ⚠️ Skipped (Error)`);
            continue;
        }

        const hasRed = domains.some(d => RED_DOMAINS.some(r => d.includes(r)));
        const hasBlue = domains.some(d => BLUE_DOMAINS.some(b => d.includes(b)));

        if (hasRed) {
            console.log(`-> RED ❌ (${domains[0]})`);
        } else if (hasBlue) {
            console.log(`-> 💎 BLUE OCEAN! 💎`);
            winners.push({
                keyword: query,
                top_domains: domains,
                score: 100
            });
        } else {
            console.log(`-> GRAY ⬜`);
            // グレーも一応保存（競合が個人ブログなどの可能性があるため）
            winners.push({
                keyword: query,
                top_domains: domains,
                score: 50
            });
        }
    }

    await browser.close();

    // 3. Output
    if (winners.length > 0) {
        // スコア順（Blue優先）にして保存
        const sorted = winners.sort((a, b) => b.score - a.score);
        const best = sorted[0];

        const outputData = {
            seed: SEED_KEYWORD,
            total_scanned: targets.length,
            best_keyword: best.keyword,
            market_type: best.score === 100 ? "Niche/UGC" : "Content Battle",
            competitors: best.top_domains,
            candidates: sorted.map(w => w.keyword) // 全候補も保存
        };

        fs.writeFileSync('mining_result_v3.json', JSON.stringify(outputData, null, 2));

        console.log(`\n🏆 Best Keyword: "${best.keyword}"`);
        console.log(`💾 Saved ${winners.length} potentials to mining_result_v3.json`);
    } else {
        console.log("\n❌ No winners found. Try a different seed.");
    }
}

analyze();
