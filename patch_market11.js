const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/market_research.js', 'utf8').split(/\r?\n/);
let startIdx = lines.findIndex(l => l.includes('const inStockIndicators = ['));
let endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('let hasOutOfStock ='));

if (startIdx !== -1 && endIdx !== -1) {
    const cleanLines = [
        "                                            const inStockIndicators = [",
        "                                                '在庫あり',",
        "                                                'カートに入れる',",
        "                                                '今すぐ買う',",
        "                                                'Add to Cart',",
        "                                                'Buy Now'",
        "                                            ];",
        "                                            const hasInStock = inStockIndicators.some(t => bodyText.includes(t));",
        "",
        "                                            // Check for out-of-stock indicators  ",
        "                                            const outOfStockIndicators = [",
        "                                                '現在在庫切れです',",
        "                                                '在庫切れ',",
        "                                                'Currently unavailable',",
        "                                                'この商品は現在お取り扱いできません',",
        "                                                '一時的に在庫切れ',",
        "                                                '入荷時期は未定です',",
        "                                                '出品者からお求めいただけます',",
        "                                                '要件を満たす出品はありません'",
        "                                            ];"
    ];
    lines.splice(startIdx, endIdx - startIdx, ...cleanLines);
    console.log("Replaced arrays perfectly");
    fs.writeFileSync('scripts/lib/market_research.js', lines.join('\n'));
} else {
    console.log("Could not find array bounds");
}
