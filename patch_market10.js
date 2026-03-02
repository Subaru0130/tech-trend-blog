const fs = require('fs');
let content = fs.readFileSync('scripts/lib/market_research.js', 'utf8');

// inStockIndicators
content = content.replace(/'今すぐ買ぁE,/g, "'今すぐ買う',");

// outOfStockIndicators
content = content.replace(/'現在在庫刁EでぁE,/g, "'現在在庫切れです',");
content = content.replace(/'在庫刁E',/g, "'在庫切れ',");
content = content.replace(/'こE啁Eは現在お取り扱ぁEきません',/g, "'この商品は現在お取り扱いできません',");
content = content.replace(/'一時的に在庫刁E',/g, "'一時的に在庫切れ',");
content = content.replace(/'入荷時期は未定でぁE,/g, "'入荷時期は未定です',");
content = content.replace(/'出品老Eらお求めぁEだけまぁE,/g, "'出品者からお求めいただけます',");
content = content.replace(/'要件を満たす出品Eありません'/g, "'要件を満たす出品はありません'");

fs.writeFileSync('scripts/lib/market_research.js', content);
console.log("Fixed market_research.js outOfStockIndicators mojibake quotes");
