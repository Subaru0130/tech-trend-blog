/**
 * 🎯 Multi-Factor Rating Calculator
 * 
 * 5つの要素で製品を多角的に評価:
 * 1. メディア評価 (25%) - レビューサイトからの評価
 * 2. ユーザー口コミ (25%) - 価格.com/MyBestのユーザーレビュー
 * 3. 専門家評価 (20%) - VGPアワード、専門誌の評価
 * 4. ブランド信頼度 (15%) - 信頼ブランドリストマッチング
 * 5. 機能適合度 (15%) - Blueprint要件との一致度
 */

// 信頼できるブランドリスト（カテゴリ別）
const TRUSTED_BRANDS = {
    audio: [
        "Sony", "Sennheiser", "Bose", "Apple", "Anker", "Soundcore", "Audio-Technica", "JBL",
        "Yamaha", "Technics", "EarFun", "AVIOT", "final", "Nothing", "HUAWEI", "Shokz",
        "JPRiDE", "B&O", "Bang & Olufsen", "Beats", "Denon", "AKG", "Jabra", "Marshall"
    ],
    electronics: [
        "Sony", "Samsung", "LG", "Panasonic", "Sharp", "Toshiba", "Hitachi", "Philips",
        "Apple", "Google", "Microsoft", "Dell", "HP", "Lenovo", "ASUS", "Xiaomi"
    ],
    appliances: [
        "Panasonic", "Sharp", "Toshiba", "Hitachi", "Mitsubishi Electric", "Daikin",
        "Dyson", "iRobot", "BALMUDA", "Haier", "LG", "Samsung"
    ],
    // 汎用（カテゴリ不明時）
    general: [
        "Sony", "Apple", "Samsung", "Panasonic", "Sharp", "LG", "Dyson", "Bose",
        "Canon", "Nikon", "Nintendo", "Anker", "HUAWEI", "Xiaomi"
    ]
};

// VGPアワード受賞ブランド（オーディオ）
const VGP_AWARD_BRANDS = [
    "Sony", "Sennheiser", "Bose", "Audio-Technica", "Technics", "JBL", "Yamaha",
    "AVIOT", "final", "Denon", "AKG", "Bang & Olufsen"
];

/**
 * 5要素に基づく製品評価を計算
 * @param {Object} product - 製品データ
 * @param {Object} blueprint - 記事のブループリント
 * @param {Object} researchData - 市場調査データ
 * @returns {Object} - { rating, scores: { media, user, expert, brand, feature } }
 */
function calculateMultiFactorRating(product, blueprint, researchData = {}) {
    const scores = {
        media: 0,      // 0-100
        user: 0,       // 0-100
        expert: 0,     // 0-100
        brand: 0,      // 0-100
        feature: 0     // 0-100
    };

    const productName = (product.name || '').toLowerCase();
    const productInfo = productName + ' ' + (product.description || '') + ' ' + (product.features || []).join(' ');

    // 1. メディア評価 (25%) - 言及数とソース優先度に基づく
    if (researchData.mentionCount) {
        // 5回以上言及 = 100点, 1回 = 20点
        scores.media = Math.min(100, researchData.mentionCount * 20);
    }
    if (researchData.marketScore) {
        // marketScoreを0-100にスケール
        scores.media = Math.max(scores.media, Math.min(100, researchData.marketScore * 5));
    }

    // 2. ユーザー口コミ (25%) - レビュー数と評価星
    if (product.reviewCount) {
        // 1000件以上 = 50点, 100件 = 25点
        const reviewScore = Math.min(50, Math.log10(product.reviewCount + 1) * 15);
        scores.user += reviewScore;
    }
    if (product.rating && product.rating >= 3.5) {
        // 4.5★ = 50点, 4.0★ = 40点
        scores.user += Math.min(50, (product.rating - 3.0) * 33);
    }

    // 3. 専門家評価 (20%) - VGPアワード、専門誌での評価
    const hasVGPAward = VGP_AWARD_BRANDS.some(brand =>
        productName.includes(brand.toLowerCase())
    );
    if (hasVGPAward) {
        scores.expert += 40;
    }
    // 高評価ソース（phileweb, av.watchなど）での言及
    if (researchData.sources) {
        const expertSources = ['phileweb', 'av.watch', 'ascii.jp', 'itmedia'];
        const expertMentions = researchData.sources.filter(s =>
            expertSources.some(es => s.toLowerCase().includes(es))
        ).length;
        scores.expert += Math.min(60, expertMentions * 20);
    }

    // 4. 機能適合度 (40%) - Blueprint要件との一致度（最重要！）
    // 記事テーマに合わない製品が上位に来るのを防ぐ
    if (blueprint) {
        const axes = (blueprint.comparison_axis || '').toLowerCase();
        const keywords = (blueprint.target_keyword || '').toLowerCase();
        const info = productInfo.toLowerCase();

        // NC要件（ノイズキャンセリング記事では最重要）
        if (axes.includes('ノイズ') || axes.includes('nc') || keywords.includes('ノイズ')) {
            // hasNoiseCancel フラグがある場合は高得点
            if (product.hasNoiseCancel === true) {
                scores.feature += 60;
            } else if (info.includes('anc') || info.includes('ノイズ') || info.includes('noise cancel')) {
                scores.feature += 40;
            } else {
                // NC記事なのにNC非対応は大きく減点
                scores.feature -= 30;
            }
        }

        // 音質要件
        if (axes.includes('音質') || keywords.includes('音質') || keywords.includes('ハイレゾ')) {
            if (info.includes('ldac') || info.includes('ハイレゾ') || info.includes('hi-res') || info.includes('aptx')) {
                scores.feature += 30;
            }
        }

        // バッテリー要件
        if (axes.includes('バッテリー') || keywords.includes('バッテリー')) {
            if (info.includes('長時間') || info.includes('時間再生')) {
                scores.feature += 20;
            }
        }

        // 価格要件（予算内なら加点）
        if (blueprint.constraints) {
            const priceMatch = blueprint.constraints.match(/(\d+)万円/);
            if (priceMatch && product.priceVal) {
                const targetPrice = parseInt(priceMatch[1], 10) * 10000;
                if (product.priceVal <= targetPrice + 5000) {
                    scores.feature += 20;
                }
            }
        }

        // 価格.comランキング順位ボーナス（上位ほど人気）
        if (product.kakakuRank && product.kakakuRank <= 10) {
            scores.feature += 30 - (product.kakakuRank * 2);
        }
    }

    // 加重平均で最終評価を計算
    // 新しい配分: メディア25% + ユーザー25% + 専門家10% + 機能適合度40%
    const weightedScore = (
        scores.media * 0.25 +
        scores.user * 0.25 +
        scores.expert * 0.10 +
        scores.feature * 0.40
    );

    // 0-100 → 4.0-4.9 の範囲に変換
    // 80点以上 = 4.9, 0点 = 4.0
    const rating = Math.round((4.0 + (weightedScore / 100) * 0.9) * 10) / 10;

    return {
        rating: Math.min(4.9, Math.max(4.0, rating)),
        weightedScore,
        scores
    };
}

/**
 * 製品名からカテゴリを自動検出
 */
function detectProductCategory(productName) {
    const name = productName.toLowerCase();

    if (name.match(/イヤホン|ヘッドホン|earphone|headphone|earbud|イヤーピース/)) {
        return 'audio';
    }
    if (name.match(/冷蔵庫|洗濯機|エアコン|掃除機|炊飯器|電子レンジ/)) {
        return 'appliances';
    }
    if (name.match(/カメラ|レンズ|camera|lens/)) {
        return 'camera';
    }
    if (name.match(/pc|パソコン|laptop|タブレット|スマホ|スマートフォン/)) {
        return 'electronics';
    }

    return 'general';
}

/**
 * 製品リストを多要素評価でスコアリング
 * @param {Array} products - 製品リスト
 * @param {Object} blueprint - ブループリント
 * @returns {Array} - スコア付き製品リスト（降順）
 */
function scoreProducts(products, blueprint) {
    return products
        .map(product => {
            const { rating, weightedScore, scores } = calculateMultiFactorRating(
                product,
                blueprint,
                {
                    mentionCount: product.mentionCount,
                    marketScore: product.marketScore,
                    sources: product.sources
                }
            );

            return {
                ...product,
                calculatedRating: rating,
                _weightedScore: weightedScore,
                _scores: scores
            };
        })
        .sort((a, b) => b._weightedScore - a._weightedScore);
}

module.exports = {
    calculateMultiFactorRating,
    scoreProducts,
    detectProductCategory,
    TRUSTED_BRANDS,
    VGP_AWARD_BRANDS
};
