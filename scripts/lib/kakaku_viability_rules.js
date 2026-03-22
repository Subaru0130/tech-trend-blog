const { buildKeywordFingerprint } = require('./intent_fingerprint');

function normalizeText(value) {
    return String(value || '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[\s\u3000_\-/.,!?'"`()\[\]{}:;]+/g, '')
        .trim();
}

const CATEGORY_VIABILITY_RULES = {
    'robot-vacuums': [
        {
            id: 'step-climb',
            aliases: ['段差', '段差乗り越え', '乗り越え', '敷居'],
            axisTitle: '段差対応',
            labelPatterns: [/段差乗り越え|最大乗り越え段差|落下防止|進入禁止|マッピング/i],
        },
        {
            id: 'obstacle-avoidance',
            aliases: ['障害物回避', '物体回避', 'コード回避', 'ケーブル回避'],
            axisTitle: '障害物回避',
            labelPatterns: [/障害物回避|衝突防止|センサー|マッピング/i],
        },
        {
            id: 'self-empty',
            aliases: ['自動ゴミ収集', 'ごみ収集', 'ゴミ捨て不要', 'ダストステーション'],
            axisTitle: '自動ゴミ収集',
            labelPatterns: [/ダストステーション|自動ゴミ収集|紙パック|集じん容積/i],
        },
        {
            id: 'quietness',
            aliases: ['静音', '静か', '夜間'],
            axisTitle: '静音性',
            labelPatterns: [/騒音値|静音|運転音/i],
        },
        {
            id: 'thin-body',
            aliases: ['薄型', '家具の下', 'ベッド下', 'ソファ下'],
            axisTitle: '薄型設計',
            labelPatterns: [/高さ|サイズ|薄型/i],
        },
        {
            id: 'small-room',
            aliases: ['一人暮らし', 'ワンルーム', '狭い部屋', 'コンパクト'],
            axisTitle: 'コンパクト性',
            labelPatterns: [/サイズ|幅|奥行|高さ|質量/i],
        },
    ],
    'office-chairs': [
        {
            id: 'back-pain',
            aliases: ['腰痛', '腰が痛い', '腰'],
            axisTitle: 'ランバーサポート',
            labelPatterns: [/ランバー|腰/i],
        },
        {
            id: 'long-hours',
            aliases: ['長時間', '長時間作業', '疲れにくい'],
            axisTitle: '長時間向けサポート',
            labelPatterns: [/ランバー|アームレスト|ヘッドレスト|座面|リクライニング/i],
        },
        {
            id: 'compact',
            aliases: ['コンパクト', '狭い部屋', '省スペース', '一人暮らし'],
            axisTitle: '省スペース性',
            labelPatterns: [/幅|奥行|高さ|サイズ|質量/i],
        },
        {
            id: 'mesh',
            aliases: ['メッシュ', '蒸れない', '蒸れにくい', '通気性'],
            axisTitle: '通気性',
            labelPatterns: [/メッシュ|素材|張地/i],
        },
        {
            id: 'gaming',
            aliases: ['ゲーミング'],
            axisTitle: 'ゲーミング向け機能',
            labelPatterns: [/アームレスト|ヘッドレスト|ランバー|リクライニング/i],
        },
        {
            id: 'petite',
            aliases: ['低身長', '小柄'],
            axisTitle: '座面高さ調整',
            labelPatterns: [/座面高|座面|高さ/i],
        },
        {
            id: 'tall',
            aliases: ['高身長'],
            axisTitle: '大型体格対応',
            labelPatterns: [/座面高|背もたれ|高さ|耐荷重/i],
        },
    ],
    'refrigerators': [
        {
            id: 'single-living',
            aliases: ['一人暮らし', '単身'],
            axisTitle: '容量バランス',
            labelPatterns: [/定格内容積|容量|冷蔵室|冷凍室/i],
        },
        {
            id: 'freezer',
            aliases: ['冷凍庫が広い', '冷凍重視', '作り置き'],
            axisTitle: '冷凍室容量',
            labelPatterns: [/冷凍室|容量|定格内容積/i],
        },
        {
            id: 'slim',
            aliases: ['スリム', '幅が狭い', 'コンパクト'],
            axisTitle: '設置しやすさ',
            labelPatterns: [/幅|奥行|高さ|サイズ/i],
        },
        {
            id: 'energy-saving',
            aliases: ['省エネ', '電気代'],
            axisTitle: '省エネ性能',
            labelPatterns: [/年間消費電力量|省エネ|消費電力/i],
        },
        {
            id: 'quietness',
            aliases: ['静音', '静か'],
            axisTitle: '静音性',
            labelPatterns: [/騒音|静音|運転音/i],
        },
    ],
    'wireless-earphones': [
        {
            id: 'noise-cancelling',
            aliases: ['ノイキャン', 'ノイズキャンセリング', '通勤', '電車', '飛行機'],
            axisTitle: 'ノイズキャンセリング',
            labelPatterns: [/ノイズキャンセリング|ノイキャン/i],
        },
        {
            id: 'battery',
            aliases: ['長時間', '通勤', '通学', '旅行'],
            axisTitle: 'バッテリー持ち',
            labelPatterns: [/連続再生時間|バッテリー|充電時間/i],
        },
        {
            id: 'waterproof',
            aliases: ['防水', 'ランニング', 'ジム', 'お風呂'],
            axisTitle: '防水性能',
            labelPatterns: [/防水|防塵/i],
        },
        {
            id: 'multipoint',
            aliases: ['テレワーク', '在宅勤務', 'マルチポイント', 'pc接続'],
            axisTitle: 'マルチポイント対応',
            labelPatterns: [/マルチポイント|マルチペアリング/i],
        },
        {
            id: 'small-ears',
            aliases: ['耳が小さい', '小さい'],
            axisTitle: '軽量・小型',
            labelPatterns: [/重量|重さ|サイズ/i],
        },
        {
            id: 'ambient',
            aliases: ['外音取り込み'],
            axisTitle: '外音取り込み',
            labelPatterns: [/外音取り込み|アンビエント|ヒアスルー/i],
        },
    ],
};

function getMatchingRules(categoryId, situation) {
    const rules = CATEGORY_VIABILITY_RULES[categoryId] || [];
    const normalizedSituation = normalizeText(situation);

    return rules.filter((rule) => {
        return rule.aliases.some((alias) => normalizedSituation.includes(normalizeText(alias)));
    });
}

function collectProductLabels(product = {}) {
    const labels = [];

    Object.keys(product.kakakuSpecs || {}).forEach((label) => {
        labels.push(String(label || ''));
    });

    (product.specs || []).forEach((spec) => {
        if (spec?.label) {
            labels.push(String(spec.label));
        }
    });

    return Array.from(new Set(labels));
}

function countCoverage(products = [], rule) {
    const matchedLabels = new Map();
    let coverageCount = 0;

    for (const product of products) {
        const labels = collectProductLabels(product);
        const productMatches = labels.filter((label) => {
            return rule.labelPatterns.some((pattern) => pattern.test(label));
        });

        if (productMatches.length > 0) {
            coverageCount += 1;
            productMatches.forEach((label) => {
                matchedLabels.set(label, (matchedLabels.get(label) || 0) + 1);
            });
        }
    }

    return {
        coverageCount,
        matchedLabels: [...matchedLabels.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([label]) => label)
            .slice(0, 4),
    };
}

function evaluateSituationKeywordViability({ seed, situationData, products = [] }) {
    const fingerprint = buildKeywordFingerprint({
        seed,
        keyword: situationData.baseQuery,
        tags: [situationData.situation],
    });
    const categoryId = fingerprint.canonicalSubCategoryId;
    const matchingRules = getMatchingRules(categoryId, situationData.situation);

    if (!categoryId) {
        return {
            isViable: false,
            skipReason: 'unknown_category',
            matchedRuleCount: 0,
            measurableAxes: [],
            debug: { categoryId: '' },
        };
    }

    if (matchingRules.length === 0) {
        return {
            isViable: false,
            skipReason: 'no_viability_rule',
            matchedRuleCount: 0,
            measurableAxes: [],
            debug: { categoryId },
        };
    }

    const minCoverage = Math.max(2, Math.ceil(products.length * 0.4));
    const measurableAxes = matchingRules
        .map((rule) => {
            const coverage = countCoverage(products, rule);
            return {
                id: rule.id,
                axisTitle: rule.axisTitle,
                coverageCount: coverage.coverageCount,
                matchedLabels: coverage.matchedLabels,
            };
        })
        .filter((axis) => axis.coverageCount >= minCoverage && axis.matchedLabels.length > 0);

    return {
        isViable: measurableAxes.length > 0,
        skipReason: measurableAxes.length > 0 ? '' : 'kakaku_not_measurable',
        matchedRuleCount: matchingRules.length,
        measurableAxes,
        debug: {
            categoryId,
            minCoverage,
            requestedSituation: situationData.situation,
        },
    };
}

module.exports = {
    evaluateSituationKeywordViability,
};
