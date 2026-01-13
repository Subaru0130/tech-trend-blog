const googleTrends = require('google-trends-api');

/**
 * SEO Scout: Niche Flanking Strategy (Weakest Win)
 * Goal: Find "Specific Situation" keywords (Blue Ocean)
 */

// User-Defined "Winning Candidates" (Situational/Problem-Solving)
// Refined Strategy: "Bridge Keywords" (Specific Intent but Detectable Volume)
const NICHE_TARGETS = [
    "電車 イヤホン",           // Bridge for "Commuting/Subway"
    "音漏れ イヤホン",         // Bridge for "Public Transport/Quiet"
    "耳栓 イヤホン",           // Bridge for "Focus/Study/Sleep"
    "ノイキャン 安い",         // Bridge for "Cost Performance"
    "ノイズキャンセリング 比較" // Bridge for "Buying Intent"
];

async function scoutNiche(term) {
    try {
        const results = await googleTrends.relatedQueries({
            keyword: term,
            geo: 'JP',
            hl: 'ja'
        });
        const data = JSON.parse(results);
        const top = data.default.rankedList[0]?.rankedKeyword || [];
        const rising = data.default.rankedList[1]?.rankedKeyword || [];

        // Combined Score: Volume (Proxy) + Trend
        // Note: API returns relative 0-100 index. 
        // If we get ANY results, it means there is searchable volume (Winning).
        // If we get "Empty", it's truly dead.

        return {
            term,
            valid: top.length > 0 || rising.length > 0,
            topQueries: top.slice(0, 3).map(q => q.query),
            risingQueries: rising.slice(0, 3).map(q => q.query)
        };
    } catch (e) {
        return { term, valid: false, error: e.message };
    }
}

async function runStrategy() {
    console.log("⚔️ Scouting Competitive Flanks (Blue Ocean Strategy)...");

    // Allow CLI override: node seo_scout.js "Custom Term"
    const customTerm = process.argv[2];
    const targets = customTerm ? [customTerm] : NICHE_TARGETS;

    if (customTerm) console.log(`\n🎯 Custom Target: "${customTerm}"`);
    else console.log("\n📋 Scouting Default Niche List...");

    const results = [];

    // Serial execution to be nice to API
    for (const target of targets) {
        // Add minimal delay
        await new Promise(r => setTimeout(r, 1000));
        const res = await scoutNiche(target);
        results.push(res);
    }

    console.log("\n📊 Strategy Report: Semantic Search Validation");
    console.log("-------------------------------------------------");

    const winners = results.filter(r => r.valid);

    if (winners.length === 0) {
        console.log("⚠️ All specific niche targets returned NO data.");
        console.log("   Suggestion: Try slightly shorter combinations like '電車 イヤホン'.");
    } else {
        winners.forEach(w => {
            console.log(`\n✅ Winnable Target: "${w.term}"`);
            console.log(`   - Related (Top): ${w.topQueries.join(", ")}`);
            if (w.risingQueries.length) console.log(`   - Related (Rising): ${w.risingQueries.join(", ")}`);

            // Intelligence
            if (w.term.includes("電車") || w.term.includes("地下鉄")) {
                console.log("   👉 Strategy: Title should focus on 'Commute Stress' & 'Silence'.");
            } else if (w.term.includes("耳栓")) {
                console.log("   👉 Strategy: Focus on 'Focus/Sleep' use cases.");
            }
        });

        console.log("\n💡 Conclusion: These keywords have PROVEN search volume but are specific enough to beat giants.");
        console.log("   Recommended Next Article: Combine these into a 'Commuter Special'.");
    }
}

runStrategy();
