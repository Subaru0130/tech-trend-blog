const axios = require('axios');
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const http = require('http');
const path = require('path');
const { execSync } = require('child_process');

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
const URGENT_WORDS = ['痛い', '壊れた', '動かない', 'つながらない', 'おかしい', '聞こえない', '審査落ち', 'できない'];
const BUY_WORDS = ['おすすめ', '比較', 'ランキング', '最安値', '価格', 'レビュー', '口コミ', '新作'];
const INFO_WORDS = ['とは', '意味', 'wiki', '使い方', '設定'];


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

    // B. Hiragana Deep Mining ('あ' to 'ん')
    // Reduced set for prototype speed, but covering main ones
    const suffixes = [
        'あ', 'い', 'う', 'え', 'お',
        'か', 'き', 'く', 'け', 'こ',
        'さ', 'し', 'す', 'せ', 'そ',
        'た', 'ち', 'つ', 'て', 'と',
        'な', 'に', 'ぬ', 'ね', 'の',
        'は', 'ひ', 'ふ', 'へ', 'ほ',
        'ま', 'み', 'む', 'め', 'も',
        'や', 'ゆ', 'よ',
        'ら', 'り', 'る', 'れ', 'ろ',
        'わ', 'を', 'ん',
        'おすすめ', '評判', '比較', 'とは' // Intent suffixes
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

// 5. CHROME DEBUG MODE (connect to user's real Chrome)
async function ensureChromeDebugMode() {
    const checkPort = () => new Promise((resolve) => {
        const req = http.get('http://127.0.0.1:9222/json/version', (res) => {
            resolve(true);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(2000, () => { req.destroy(); resolve(false); });
    });

    if (await checkPort()) {
        console.log('✅ Chrome remote debugging already active');
        return true;
    }

    console.log('🚀 Starting Chrome with remote debugging...');
    const batPath = path.join(__dirname, 'start_chrome_quiet.bat');
    try {
        execSync(`"${batPath}"`, { stdio: 'inherit' });
    } catch (e) {
        console.log(`   ⚠️ Startup script warning: ${e.message}`);
    }

    console.log('   ⏳ Waiting for Chrome to start (timeout: 60s)...');
    for (let i = 0; i < 60; i++) {
        await delay(1000);
        if (await checkPort()) {
            console.log('✅ Chrome started with remote debugging on port 9222');
            return true;
        }
    }

    console.log('❌ Failed to start Chrome in debug mode.');
    return false;
}

// 6. RECON (Puppeteer via Chrome Debug Mode)
async function checkSerp(browser, query) {
    const page = await browser.newPage();
    try {
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

// 7. SCORING
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

    // Limit to top 50 candidates
    console.log(`   (Limiting to Top 50 candidates...)`);
    const targets = candidates.slice(0, 50);

    // Phase 2: Recon via Chrome Debug Mode
    console.log(`\n🕵️ Phase 2: Recon (Scanning ${targets.length} keywords...)`);
    const chromeReady = await ensureChromeDebugMode();
    if (!chromeReady) {
        console.error('❌ Cannot proceed without Chrome debug mode. Please start Chrome manually.');
        process.exit(1);
    }
    const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });

    const results = [];

    for (const item of targets) {
        process.stdout.write(`   Scanning: "${item.keyword}" `);
        await delay(1000 + Math.random() * 1000);

        const topDomains = await checkSerp(browser, item.keyword);
        const score = calculateScore(item, topDomains);

        let label = "GRAY";
        if (score > 80) label = "💎 BLUE";
        if (score < -100) label = "❌ RED";

        console.log(`-> [${label}] (Score: ${Math.round(score)}) Top1: ${topDomains[0] || '?'}`);

        results.push({
            keyword: item.keyword,
            score: score,
            market_type: label,
            top_domains: topDomains,
            intent: "Unknown" // Could implement intent text logic
        });
    }

    await browser.disconnect();

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
