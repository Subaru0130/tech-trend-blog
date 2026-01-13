const { evaluateProductForTheme } = require('./scripts/lib/ai_rating_evaluator');

const BLUEPRINT = { comparison_axis: "ノイズキャンセリング性能" };

// Mock Products
const PRODUCTS = [
    {
        name: "Sony WF-1000XM5",
        brand: "Sony",
        price: "¥40000",
        specs: [
            { label: "ノイズキャンセリング", value: "世界最高クラス (Sランク)" },
            { label: "バッテリー", value: "単体8時間" },
            { label: "音質", value: "ハイレゾ対応" }
        ],
        rawReviews: {
            positive: [
                { text: "電車の音が完全に消えた。今までで一番の静寂性。間違いなく最強。" },
                { text: "人の話し声もかなりカットされる。カフェでの作業に最適。" }
            ],
            negative: []
        }
    },
    {
        name: "Budget Model A (Anker P40i)",
        brand: "Anker",
        price: "¥7990",
        specs: [
            { label: "ノイズキャンセリング", value: "ウルトラノイズキャンセリング2.0" },
            { label: "バッテリー", value: "単体12時間" }
        ],
        rawReviews: {
            positive: [
                { text: "値段の割にノイキャンが効く。コスパは最高。" }
            ],
            negative: [
                { text: "風切り音がひどい。外では使えないレベル。" },
                { text: "高音のノイズは全然消えない。" }
            ]
        }
    },
    {
        name: "Defective Model X",
        brand: "Unknown",
        price: "¥2000",
        specs: [
            { label: "Bluetooth", value: "5.0" }
        ],
        rawReviews: {
            negative: [
                { text: "片耳から音が聞こえない。接続がすぐ切れる。ゴミ。" },
                { text: "充電できない。返品しました。" }
            ]
        }
    }
];

const fs = require('fs');

(async () => {
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync('test_output.txt', msg + '\n');
    };

    log("🧪 Testing AI Scoring Variance (Enriched Data)...");

    // clear previous output
    try { fs.unlinkSync('test_output.txt'); } catch (e) { }

    for (const p of PRODUCTS) {
        log(`\nEvaluating: ${p.name}`);
        const res = await evaluateProductForTheme(p, BLUEPRINT);
        log(`Score: ${res.themeScore}`);
        log(`Reason: ${res.reason}`);
    }
    process.exit(0);
})();
