const axios = require('axios');
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/**
 * 🌍 Universal Blue Ocean Miner
 * Automates finding "Winnable Niches" for ANY seed keyword.
 */
const SEED_KEYWORD = process.argv[2] || "ワイヤレスイヤホン";

console.log(`💎 Starting Universal Blue Ocean Miner for: "${SEED_KEYWORD}"`);

// 1. DOMAIN LISTS
const RED_DOMAINS = [
    'amazon', 'rakuten', 'kakaku', 'mybest', 'wikipedia', 'youtube',
    'rentio', 'biccamera', 'yodobashi', 'apple.com', 'sony.jp'
];

const BLUE_DOMAINS = [
    'chiebukuro', 'oshiete', 'twitter', 'x.com', 'note.com',
    'ameblo', 'hatenablog', 'qiita', 'zenn', 'togetter'
];

// 2. INTENT WORDS
const URGENT_WORDS = ['痛い', '壊れぁE, '動かなぁE, 'つながらなぁE, 'おかしい', '聞こえなぁE, '審査落ち', 'できなぁE];
const BUY_WORDS = ['おすすめ', '比輁E, 'ランキング', '最安値', '価格', 'レビュー', '口コチE, '新佁E];
const INFO_WORDS = ['とは', '意味', 'wiki', '使ぁE��', '設宁E];


// 3. UTILS
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 4. EXPANSION (Google Suggest API)
async function fetchSuggestions(query) {
    try {
        const url = `http://suggestqueries.google.com/complete/search?client=firefox&hl=ja&gl=jp&q=${encodeURIComponent(query)}`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        if (Array.isArray(response.data) && Array.isArray(response.data[1])) {
            return response.data[1];
        }
        return [];
    } catch (e) {
        return [];
    }
}

async function deepExpansion(seed) {
    console.log(`\n🔍 Phase 1: Deep Expansion (Mining candidates...)`);
    let candidates = new Map(); // key=keyword, value=rankIndex (smaller is better)

    // A. Base fetch
    const base = await fetchSuggestions(seed);
    base.forEach((k, i) => { if (!candidates.has(k)) candidates.set(k, i); });

    // B. Hiragana Deep Mining ('ぁE to 'めE)
    // Reduced set for prototype speed, but covering main ones
    const suffixes = [
        'ぁE, 'ぁE, 'ぁE, 'ぁE, 'ぁE,
        'ぁE, 'ぁE, 'ぁE, 'ぁE, 'ぁE,
        'ぁE, 'ぁE, 'ぁE, 'ぁE, 'ぁE,
        'ぁE, 'ち', 'つ', 'て', 'と',
        'な', 'に', 'ぬ', 'ね', 'の',
        'は', 'ひ', 'ふ', 'へ', 'ほ',
        'ま', 'み', 'む', 'めE, 'めE,
        'めE, 'めE, 'めE,
        'めE, 'めE, 'めE, 'めE, 'めE,
        'めE, 'めE, 'めE,
        'おすすめ', '評判', '比輁E, 'とは' // Intent suffixes
    ];

    process.stdout.write("   Mining: ");
    for (const char of suffixes) {
        process.stdout.write(".");
        await delay(300); // Rate limit
        const suggs = await fetchSuggestions(`${seed} ${char}`);
        suggs.forEach((k, i) => {
            // Keep the lowest (best) rank if seen multiple times
            if (!candidates.has(k)) candidates.set(k, i);
        });
    }
    console.log(" Done.");

    // Filter
    const list = Array.from(candidates.keys()).filter(k => k.includes(seed) && k.includes(' '));
    console.log(`   👉 Mined ${list.length} unique candidates.`);

    // Return objects with rank info
    return list.map(k => ({ keyword: k, rankIndex: candidates.get(k) }));
}

// 5. RECON (Puppeteer)
async function checkSerp(browser, query) {
    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(`https://www.google.co.jp/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded', timeout: 15000 });

        const links = await page.evaluate(() => {
            const res = Array.from(document.querySelectorAll('div.g a'));
            return res.map(a => a.href).filter(h => h && h.startsWith('http'));
        });

        // Get Top 3 unique domains
        const domains = [...new Set(links.map(link => {
            try { return new URL(link).hostname; } catch { return null; }
        }).filter(Boolean))].slice(0, 3);

        return domains;
    } catch (e) {
        return [];
    } finally {
        await page.close();
    }
}

// 6. SCORING
function calculateScore(item, topDomains) {
    let score = 0;

    // A. Suggest Rank Score (Max 20)
    // 0 -> 20, 10 -> 15...
    score += Math.max(0, 20 - (item.rankIndex * 0.5));

    // B. Competitor Score
    if (topDomains.length > 0) {
        const top1 = topDomains[0].toLowerCase();

        const isRed = RED_DOMAINS.some(r => top1.includes(r));
        const isBlue = BLUE_DOMAINS.some(b => top1.includes(b));

        if (isRed) {
            score -= 999; // Red Ocean
        } else if (isBlue) {
            score += 100; // Blue Ocean (UGC Top)
        } else {
            score += 30; // Gray (Content Battle)
        }
    } else {
        score -= 50; // Unknown/Error
    }

    // C. Intent Score
    const text = item.keyword;
    if (URGENT_WORDS.some(w => text.includes(w))) score += 50;
    else if (BUY_WORDS.some(w => text.includes(w))) score += 20;
    else if (INFO_WORDS.some(w => text.includes(w))) score -= 30;

    return score;
}

// MAIN FLOW
async function main() {
    // Phase 1: Expansion
    let candidates = await deepExpansion(SEED_KEYWORD);

    // Shuffle and pick top 20 for demo/prototype speed (Full run takes too long for interaction)
    // In production, remove this slice.
    console.log("   (Limiting to Top 20 candidates for prototype speed...)");
    const targets = candidates.slice(0, 20);

    // Phase 2: Recon
    console.log(`\n🕵�E�EPhase 2: Recon (Scanning ${targets.length} keywords...)`);
    const browser = await puppeteer.launch({ headless: "new" });

    const results = [];

    for (const item of targets) {
        process.stdout.write(`   Scanning: "${item.keyword}" `);
        await delay(1000 + Math.random() * 1000);

        const topDomains = await checkSerp(browser, item.keyword);
        const score = calculateScore(item, topDomains);

        let label = "GRAY";
        if (score > 80) label = "💎 BLUE";
        if (score < -100) label = "❁ERED";

        console.log(`-> [${label}] (Score: ${Math.round(score)}) Top1: ${topDomains[0] || '?'}`);

        results.push({
            keyword: item.keyword,
            score: score,
            market_type: label,
            top_domains: topDomains,
            intent: "Unknown" // Could implement intent text logic
        });
    }

    await browser.close();

    // Phase 4: Output
    results.sort((a, b) => b.score - a.score);

    if (results.length > 0) {
        const best = results[0];
        const output = {
            seed_keyword: SEED_KEYWORD,
            best_keyword: best.keyword,
            market_type: best.market_type,
            target_intent: "High Viability",
            competitors: best.top_domains,
            all_candidates: results
        };

        fs.writeFileSync('mining_result.json', JSON.stringify(output, null, 2));
        console.log(`\n🏆 Winner: "${best.keyword}" (Score: ${best.score})`);
        console.log(`   Type: ${best.market_type}`);
        console.log(`   Top Domain: ${best.top_domains[0]}`);
        console.log(`💾 Saved to mining_result.json`);
    } else {
        console.log("No valid results.");
    }
}

main();
