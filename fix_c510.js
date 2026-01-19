
const fs = require('fs');
const path = './src/data/products.json';
const products = require(path);

// 1. Filter OUT all existing C510 variations
// We filter by ID or Name containing "C510" to catch all 3 duplicates
const cleanProducts = products.filter(p => {
    const isC510 = (p.id && p.id.includes('C510')) || (p.name && p.name.includes('C510'));
    return !isC510;
});

console.log(`Original count: ${products.length}`);
console.log(`Cleaned count: ${cleanProducts.length}`);
console.log(`Removed: ${products.length - cleanProducts.length} entries (Duplicates)`);

// 2. Create the PERFECT C510 Entry (Black Model)
const correctEntry = {
    "id": "scout-B0DDKHF9XY",
    "name": "SONY WF-C510",
    "asin": "B0DDKHF9XY",
    "price": "¥7,924",
    "priceVal": 7924,
    "image": "https://m.media-amazon.com/images/I/41TKLAOZXuL.jpg", // Verified High-Res Black
    "rating": 4.5,
    "reviewCount": 0,
    "description": "密閉型ながら外音取り込みに対応したエントリーモデル",
    "brand": "SONY",
    "category": "audio",
    "affiliateLinks": {
        "amazon": "https://www.amazon.co.jp/dp/B0DDKHF9XY?tag=subaru0130-22",
        "rakuten": "https://hb.afl.rakuten.co.jp/hgc/4fdf3396.84b13b68.4fdf3397.fac2a811/?pc=https%3A%2F%2Fsearch.rakuten.co.jp%2Fsearch%2Fmall%2FSONY%2520WF-C510"
    },
    "specs": [
        { "label": "音質", "value": "A" },
        { "label": "ノイキャン", "value": "C" }, // Not active NC, but passive
        { "label": "バッテリー", "value": "単体11時間" },
        { "label": "機能", "value": "マルチポイント/外音取り込み/IPX4" },
        { "label": "タイプ*1", "value": "カナル型" },
        { "label": "接続タイプ", "value": "完全ワイヤレス(左右分離型)" },
        { "label": "Bluetoothバージョン", "value": "Ver.5.3" },
        { "label": "連続再生時間", "value": "最大11時間" },
        { "label": "対応コーデック", "value": "SBC AAC" },
        { "label": "マルチポイント対応", "value": "○" },
        { "label": "外音取り込み", "value": "○" }
    ],
    "pros": [
        "耳の中にすっぽり収まる小型サイズで、長時間着用や寝転びながらの使用でも耳が痛くなりにくいフィット感",
        "ノイズキャンセリング機能はないものの、耳栓のような高い密閉性で周囲の話し声やジムの環境音を物理的にカット",
        "スマホとPCなど2台の機器に同時接続できるマルチポイント対応で、毎回のペアリング切り替えの手間が不要"
    ],
    "cons": [
        "アクティブノイズキャンセリング機能は非搭載のため、地下鉄の走行音などを完全に消したい人には静寂性が物足りないかもしれません",
        "重低音の振動や圧力を重視する人にとっては、音の迫力が少し控えめに感じる場合があるため試聴をおすすめします"
    ],
    "badge": "おすすめ",
    "tags": {},
    "hasNoiseCancel": false,
    "themeScore": 8.0,
    "themeReason": "ソニー品質の音と高いコスパ、圧倒的な小型軽量性。"
};

// 3. Insert and Save
cleanProducts.push(correctEntry);
fs.writeFileSync(path, JSON.stringify(cleanProducts, null, 4));
console.log('Successfully rewrote products.json with corrected C510 entry.');
