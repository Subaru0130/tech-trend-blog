const { keywordToEnglishSlug, detectCategoryFromKeyword } = require('./generator');

const STOP_TOKENS = new Set([
    'recommended',
    'ranking',
    'best',
    'latest',
    'review',
    'reviews',
    'guide',
    'comparison',
    'compare',
    'choiceguide',
    'top',
    'vs',
    'article',
    '2024',
    '2025',
    '2026',
]);

const CATEGORY_RULES = [
    { canonical: 'wireless-earphones', aliases: ['wireless-earphones', 'earphones', 'earbuds', 'earbud'], rawAliases: ['ワイヤレスイヤホン', 'イヤホン'] },
    { canonical: 'wireless-headphones', aliases: ['wireless-headphones', 'headphones', 'headphone'], rawAliases: ['ワイヤレスヘッドホン', 'ヘッドホン'] },
    { canonical: 'speakers', aliases: ['bluetooth-speakers', 'speaker', 'speakers'], rawAliases: ['bluetoothスピーカー', 'スピーカー'] },
    { canonical: 'refrigerators', aliases: ['refrigerator', 'refrigerators', 'fridge', 'fridges'], rawAliases: ['冷蔵庫'] },
    { canonical: 'washing-machines', aliases: ['washing-machine', 'washing-machines'], rawAliases: ['洗濯機'] },
    { canonical: 'air-conditioners', aliases: ['air-conditioner', 'air-conditioners'], rawAliases: ['エアコン'] },
    { canonical: 'vacuum-cleaners', aliases: ['vacuum-cleaner', 'vacuum-cleaners'], rawAliases: ['掃除機'] },
    { canonical: 'robot-vacuums', aliases: ['robot-vacuum', 'robot-vacuums'], rawAliases: ['ロボット掃除機'] },
    { canonical: 'cameras', aliases: ['camera', 'cameras', 'dslr-camera', 'mirrorless-camera'], rawAliases: ['カメラ', '一眼レフ', 'ミラーレス'] },
    { canonical: 'tvs', aliases: ['tv', 'tvs', 'monitor', 'monitors'], rawAliases: ['テレビ', 'モニター'] },
    { canonical: 'input-devices', aliases: ['keyboard', 'keyboards', 'mouse', 'mice', 'input-devices'], rawAliases: ['キーボード', 'マウス'] },
    { canonical: 'tablets', aliases: ['tablet', 'tablets'], rawAliases: ['タブレット'] },
    { canonical: 'smartwatches', aliases: ['smartwatch', 'smartwatches'], rawAliases: ['スマートウォッチ'] },
    { canonical: 'kitchen-appliances', aliases: ['microwave', 'rice-cooker', 'dishwasher', 'kitchen-appliances'], rawAliases: ['電子レンジ', '炊飯器', '食洗機'] },
    { canonical: 'hair-dryers', aliases: ['hair-dryer', 'hair-dryers'], rawAliases: ['ドライヤー', 'ヘアドライヤー'] },
    { canonical: 'air-quality', aliases: ['air-purifier', 'humidifier', 'dehumidifier', 'air-quality'], rawAliases: ['空気清浄機', '加湿器', '除湿機'] },
    { canonical: 'projectors', aliases: ['projector', 'projectors'], rawAliases: ['プロジェクター'] },
    { canonical: 'office-chairs', aliases: ['office-chair', 'office-chairs', 'work-chair', 'work-chairs', 'desk-chair', 'desk-chairs', 'task-chair', 'task-chairs'], rawAliases: ['オフィスチェア', 'ワークチェア', 'デスクチェア', 'タスクチェア'] },
];

const GLOBAL_INTENT_RULES = [
    { canonical: 'remote-work', aliases: ['telework', 'remote-work', 'work-from-home', 'home-office'], rawAliases: ['テレワーク', '在宅勤務', 'リモートワーク', '在宅ワーク', '自宅勤務'] },
    { canonical: 'web-meeting', aliases: ['web-meeting', 'online-meeting', 'video-meeting', 'video-call', 'online-call'], rawAliases: ['web会議', 'オンライン会議', 'リモート会議', 'zoom会議', 'ビデオ会議'] },
    { canonical: 'senior', aliases: ['senior', 'elderly'], rawAliases: ['シニア', '高齢者', 'お年寄り', '年配'] },
    { canonical: 'women', aliases: ['women', 'female', 'ladies'], rawAliases: ['女性', 'レディース'] },
    { canonical: 'men', aliases: ['men', 'male'], rawAliases: ['男性', 'メンズ'] },
    { canonical: 'kids', aliases: ['kids'], rawAliases: ['子供', 'こども', 'キッズ'] },
    { canonical: 'beginner', aliases: ['beginner'], rawAliases: ['初心者', '初めて'] },
    { canonical: 'single-living', aliases: ['single-living'], rawAliases: ['一人暮らし', 'ひとり暮らし', '単身'] },
    { canonical: 'under-10000yen', aliases: ['under-10000yen'], rawAliases: ['1万円以下', '10000円以下'] },
    { canonical: 'under-20000yen', aliases: ['under-20000yen'], rawAliases: ['2万円以下', '20000円以下'] },
    { canonical: 'under-30000yen', aliases: ['under-30000yen'], rawAliases: ['3万円以下', '30000円以下'] },
    { canonical: 'under-50000yen', aliases: ['under-50000yen'], rawAliases: ['5万円以下', '50000円以下'] },
    { canonical: 'premium', aliases: ['premium'], rawAliases: ['高級', 'プレミアム'] },
    { canonical: 'cost-effective', aliases: ['cost-effective'], rawAliases: ['コスパ', 'コストパフォーマンス'] },
    { canonical: 'long-hours', aliases: ['long-hours'], rawAliases: ['長時間', '長時間作業', '長時間使用', '長時間座る'] },
    { canonical: 'lightweight', aliases: ['lightweight'], rawAliases: ['軽い', '軽量'] },
    { canonical: 'compact', aliases: ['compact'], rawAliases: ['コンパクト'] },
    { canonical: 'small', aliases: ['small'], rawAliases: ['小さい'] },
    { canonical: 'petite', aliases: ['petite'], rawAliases: ['小柄'] },
    { canonical: 'design', aliases: ['design'], rawAliases: ['デザイン'] },
    { canonical: 'noise-cancelling', aliases: ['noise-cancelling', 'anc', 'nc'], rawAliases: ['ノイズキャンセリング', 'ノイキャン'] },
    { canonical: 'commute', aliases: ['commute'], rawAliases: ['通勤'] },
    { canonical: 'school-commute', aliases: ['school-commute'], rawAliases: ['通学'] },
    { canonical: 'train', aliases: ['train'], rawAliases: ['電車'] },
    { canonical: 'study', aliases: ['study'], rawAliases: ['勉強', '受験', '資格勉強'] },
    { canonical: 'airplane', aliases: ['airplane'], rawAliases: ['飛行機'] },
    { canonical: 'bath', aliases: ['bath'], rawAliases: ['お風呂', '風呂'] },
    { canonical: 'sleep', aliases: ['sleep'], rawAliases: ['睡眠', '寝る', '就寝'] },
    { canonical: 'sleep-earphones', aliases: ['sleep-earphones'], rawAliases: ['寝ホン'] },
    { canonical: 'gaming', aliases: ['gaming'], rawAliases: ['ゲーム', 'ゲーミング'] },
    { canonical: 'running', aliases: ['running'], rawAliases: ['ランニング'] },
    { canonical: 'sports', aliases: ['sports'], rawAliases: ['スポーツ'] },
    { canonical: 'gym', aliases: ['gym'], rawAliases: ['ジム'] },
    { canonical: 'music', aliases: ['music'], rawAliases: ['音楽'] },
    { canonical: 'movie', aliases: ['movie'], rawAliases: ['映画', '動画'] },
    { canonical: 'asmr', aliases: ['asmr'], rawAliases: ['asmr'] },
    { canonical: 'hearing-loss', aliases: ['hearing-loss'], rawAliases: ['難聴', '聞こえにくい'] },
    { canonical: 'small-ears', aliases: ['small-ears'], rawAliases: ['耳が小さい', '耳小さい'] },
    { canonical: 'earwax', aliases: ['earwax'], rawAliases: ['耳垢'] },
    { canonical: 'waterproof', aliases: ['waterproof'], rawAliases: ['防水'] },
];

const CATEGORY_INTENT_RULES = {
    'robot-vacuums': [
        { canonical: 'pet-hair', aliases: ['pet-hair'], rawAliases: ['ペット', '犬', '猫', '犬の毛', '猫の毛', '抜け毛'] },
        { canonical: 'mopping', aliases: ['mopping', 'wet-cleaning'], rawAliases: ['水拭き', '拭き掃除', 'モップ', 'ウェットシート'] },
        { canonical: 'self-empty', aliases: ['self-empty', 'auto-empty', 'dust-station'], rawAliases: ['自動ゴミ収集', '自動ごみ収集', 'ゴミ収集', 'ごみ収集', 'ゴミ捨て不要', '収集ステーション'] },
        { canonical: 'obstacle-avoidance', aliases: ['obstacle-avoidance', 'object-detection'], rawAliases: ['障害物回避', '物体回避', '物体認識', 'AI回避', 'コード回避', 'ケーブル回避'] },
        { canonical: 'quietness', aliases: ['quietness', 'quiet-mode'], rawAliases: ['静音', '静音性', '静か', 'うるさくない', '夜間'] },
        { canonical: 'thin-body', aliases: ['thin-body', 'low-profile'], rawAliases: ['薄型', '薄い', 'ベッド下', 'ソファ下', '椅子の下', '家具の下'] },
        { canonical: 'step-climb', aliases: ['step-climb', 'carpet-climb'], rawAliases: ['段差', '段差乗り越え', '乗り越え', 'カーペット'] },
        { canonical: 'wifi-free', aliases: ['wifi-free', 'offline'], rawAliases: ['wifiなし', 'wifi不要', 'ネット不要', 'インターネット接続不要'] },
        { canonical: 'small-room', aliases: ['small-room', 'one-room'], rawAliases: ['一人暮らし', 'ワンルーム', '1K', '狭い部屋', 'コンパクト'] },
        { canonical: 'tangle-free', aliases: ['tangle-free', 'hair-tangle'], rawAliases: ['髪の毛', '絡まない', '絡みにくい', 'ブラシ絡まり', '毛が絡まない'] },
        { canonical: 'maintenance', aliases: ['maintenance', 'easy-clean'], rawAliases: ['手入れ', 'メンテナンス', '掃除しやすい', '洗いやすい'] },
        { canonical: 'no-go-zone', aliases: ['no-go-zone', 'room-mapping'], rawAliases: ['進入禁止', '立入禁止', 'マッピング', '部屋指定', 'エリア指定'] },
    ],
    'office-chairs': [
        { canonical: 'back-pain', aliases: ['back-pain'], rawAliases: ['腰痛', '腰が痛い', '腰が痛く', '腰に痛み', '腰がつらい'] },
        { canonical: 'shoulder-pain', aliases: ['shoulder-pain'], rawAliases: ['肩こり', '肩がこる', '肩が痛い', '首こり', '首が痛い'] },
        { canonical: 'mesh', aliases: ['mesh'], rawAliases: ['メッシュ'] },
        { canonical: 'heat-relief', aliases: ['heat-relief', 'breathable'], rawAliases: ['蒸れ', '蒸れない', '蒸れにくい', '通気性'] },
        { canonical: 'space-saving', aliases: ['space-saving', 'small-room'], rawAliases: ['省スペース', '狭い部屋', '狭い家', 'ワンルーム', '1k'] },
        { canonical: 'petite', aliases: ['short-height', 'low-height'], rawAliases: ['低身長', '150cm', '160cm以下'] },
        { canonical: 'tall', aliases: ['tall', 'high-height'], rawAliases: ['高身長', '180cm', '190cm'] },
        { canonical: 'pc-work', aliases: ['pc-work'], rawAliases: ['パソコン', 'pc作業', 'デスクワーク', 'タイピング', 'マウス操作'] },
        { canonical: 'gaming-chair', aliases: ['gaming-chair'], rawAliases: ['ゲーミングチェア'] },
        { canonical: 'armrest', aliases: ['armrest'], rawAliases: ['アームレスト', '肘置き'] },
        { canonical: 'lumbar-support', aliases: ['lumbar-support'], rawAliases: ['ランバーサポート'] },
    ],
};

function compileSlugRules(ruleDefinitions) {
    return ruleDefinitions
        .flatMap((rule) => {
            return rule.aliases.map((alias) => ({
                canonical: rule.canonical,
                tokens: alias.split('-').filter(Boolean),
            }));
        })
        .sort((a, b) => b.tokens.length - a.tokens.length);
}

function compileRawRules(ruleDefinitions) {
    return ruleDefinitions
        .map((rule) => ({
            canonical: rule.canonical,
            rawAliases: Array.from(new Set((rule.rawAliases || []).map((alias) => normalizeText(alias)).filter(Boolean))),
        }))
        .filter((rule) => rule.rawAliases.length > 0)
        .sort((a, b) => {
            const aMax = Math.max(...a.rawAliases.map((alias) => alias.length));
            const bMax = Math.max(...b.rawAliases.map((alias) => alias.length));
            return bMax - aMax;
        });
}

const COMPILED_CATEGORY_RULES = compileSlugRules(CATEGORY_RULES);
const COMPILED_CATEGORY_RAW_RULES = compileRawRules(CATEGORY_RULES);
const COMPILED_GLOBAL_INTENT_RULES = compileSlugRules(GLOBAL_INTENT_RULES);
const COMPILED_GLOBAL_RAW_INTENT_RULES = compileRawRules(GLOBAL_INTENT_RULES);
const CATEGORY_CANONICAL_SET = new Set(CATEGORY_RULES.map((rule) => rule.canonical));
const CATEGORY_ALIAS_TO_CANONICAL = new Map(
    CATEGORY_RULES.flatMap((rule) => rule.aliases.map((alias) => [alias, rule.canonical]))
);

function normalizeText(value) {
    return String(value || '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[\s\u3000_\-/.,!?'"`()\[\]{}:;]+/g, '')
        .trim();
}

function normalizeSlugSource(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function slugifySource(value) {
    if (!value) return '';

    const raw = String(value || '');
    if (/^[a-z0-9\-]+$/i.test(raw.trim())) {
        return normalizeSlugSource(raw);
    }

    const slug = keywordToEnglishSlug(raw);
    const normalized = normalizeSlugSource(slug);

    if (!normalized || /^article-\d+$/.test(normalized)) {
        return '';
    }

    return normalized;
}

function splitSlug(slug) {
    return normalizeSlugSource(slug).split('-').filter(Boolean);
}

function compressTokens(tokens, rules) {
    const compressed = [];

    for (let index = 0; index < tokens.length;) {
        let matchedRule = null;

        for (const rule of rules) {
            const slice = tokens.slice(index, index + rule.tokens.length);
            if (slice.length === rule.tokens.length && rule.tokens.every((token, offset) => token === slice[offset])) {
                matchedRule = rule;
                break;
            }
        }

        if (matchedRule) {
            compressed.push(matchedRule.canonical);
            index += matchedRule.tokens.length;
            continue;
        }

        compressed.push(tokens[index]);
        index += 1;
    }

    return compressed;
}

function levenshteinDistance(a, b) {
    const source = a || '';
    const target = b || '';
    const matrix = Array.from({ length: source.length + 1 }, () => new Array(target.length + 1).fill(0));

    for (let i = 0; i <= source.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= target.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= source.length; i++) {
        for (let j = 1; j <= target.length; j++) {
            const cost = source[i - 1] === target[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[source.length][target.length];
}

function similarityRatio(a, b) {
    const longestLength = Math.max((a || '').length, (b || '').length);
    if (longestLength === 0) return 1;
    return 1 - (levenshteinDistance(a, b) / longestLength);
}

function normalizeSubCategoryId(value) {
    if (!value) return '';

    const normalized = normalizeSlugSource(value);
    return CATEGORY_ALIAS_TO_CANONICAL.get(normalized) || normalized;
}

function getCategoryIntentRules(canonicalSubCategoryId) {
    const definitions = CATEGORY_INTENT_RULES[canonicalSubCategoryId] || [];
    return {
        slugRules: compileSlugRules(definitions),
        rawRules: compileRawRules(definitions),
    };
}

function detectCanonicalCategoryFromRawTexts(rawTexts) {
    for (const rawText of rawTexts) {
        for (const rule of COMPILED_CATEGORY_RAW_RULES) {
            if (rule.rawAliases.some((alias) => rawText.includes(alias))) {
                return rule.canonical;
            }
        }
    }

    return '';
}

function detectCanonicalSubCategory({ keyword, title, subCategoryId, categoryId, slugTokens, rawTexts }) {
    const hinted = normalizeSubCategoryId(subCategoryId);
    if (hinted && hinted !== 'general') {
        return hinted;
    }

    const rawMatched = detectCanonicalCategoryFromRawTexts(rawTexts);
    if (rawMatched) {
        return rawMatched;
    }

    for (const token of slugTokens) {
        if (CATEGORY_CANONICAL_SET.has(token)) {
            return token;
        }
    }

    const inferred = detectCategoryFromKeyword(keyword || title || '');
    const inferredSubCategory = normalizeSubCategoryId(inferred.subCategoryId);
    if (inferredSubCategory && inferredSubCategory !== 'general') {
        return inferredSubCategory;
    }

    const normalizedCategoryId = normalizeSlugSource(categoryId);
    if (normalizedCategoryId) {
        return normalizedCategoryId;
    }

    return '';
}

function collectSourceSlugs({ keyword, slug, tags }) {
    const sourceSlugs = [];

    [slug, keyword].forEach((value) => {
        const normalized = slugifySource(value);
        if (normalized) {
            sourceSlugs.push(normalized);
        }
    });

    if (Array.isArray(tags)) {
        tags.forEach((tag) => {
            const normalized = slugifySource(tag);
            if (normalized) {
                sourceSlugs.push(normalized);
            }
        });
    }

    return Array.from(new Set(sourceSlugs));
}

function collectRawTexts({ keyword, title, tags }) {
    const rawValues = [];

    [keyword, title].forEach((value) => {
        const normalized = normalizeText(value);
        if (normalized) {
            rawValues.push(normalized);
        }
    });

    if (Array.isArray(tags)) {
        tags.forEach((tag) => {
            const normalized = normalizeText(tag);
            if (normalized) {
                rawValues.push(normalized);
            }
        });
    }

    return Array.from(new Set(rawValues));
}

function collectRawIntentTokens(rawTexts, rules) {
    const tokens = new Set();

    rawTexts.forEach((rawText) => {
        rules.forEach((rule) => {
            if (rule.rawAliases.some((alias) => rawText.includes(alias))) {
                tokens.add(rule.canonical);
            }
        });
    });

    return Array.from(tokens);
}

function pruneIntentTokens(tokens) {
    let prunedTokens = Array.from(new Set(tokens));

    if (prunedTokens.includes('wifi-free')) {
        prunedTokens = prunedTokens.filter((token) => token !== 'wifi');
    }

    if (prunedTokens.includes('small-room')) {
        prunedTokens = prunedTokens.filter((token) => token !== '1k');
    }

    return prunedTokens;
}

function buildKeywordFingerprint({
    seed = '',
    keyword = '',
    slug = '',
    title = '',
    tags = [],
    categoryId = '',
    subCategoryId = '',
}) {
    const sourceSlugs = collectSourceSlugs({ keyword, slug, tags });
    const rawTexts = collectRawTexts({ keyword, title, tags });
    const rawTokens = sourceSlugs.flatMap((sourceSlug) => splitSlug(sourceSlug));
    const categoryCompressedTokens = compressTokens(rawTokens, COMPILED_CATEGORY_RULES);
    const canonicalSubCategoryId = detectCanonicalSubCategory({
        keyword,
        title,
        subCategoryId,
        categoryId,
        slugTokens: categoryCompressedTokens,
        rawTexts,
    });
    const categoryRules = getCategoryIntentRules(canonicalSubCategoryId);
    const intentCompressedTokens = compressTokens(categoryCompressedTokens, [
        ...categoryRules.slugRules,
        ...COMPILED_GLOBAL_INTENT_RULES,
    ]);
    const slugIntentTokens = intentCompressedTokens
        .filter((token) => token && token !== canonicalSubCategoryId)
        .filter((token) => !STOP_TOKENS.has(token))
        .filter((token) => {
            if (!canonicalSubCategoryId) return true;
            return !canonicalSubCategoryId.split('-').includes(token);
        });
    const rawIntentTokens = collectRawIntentTokens(rawTexts, [
        ...categoryRules.rawRules,
        ...COMPILED_GLOBAL_RAW_INTENT_RULES,
    ]);
    const canonicalIntentTokens = pruneIntentTokens([...slugIntentTokens, ...rawIntentTokens]).sort();
    const seedSlug = slugifySource(seed);
    const baseSlug = slugifySource(slug || keyword || title);

    return {
        seedSlug,
        baseSlug,
        canonicalSubCategoryId,
        intentTokens: canonicalIntentTokens,
        intentKey: canonicalIntentTokens.join('|'),
        signature: `${canonicalSubCategoryId || 'unknown'}::${canonicalIntentTokens.join('|') || 'generic'}`,
        sourceSlugs,
        rawTexts,
    };
}

function compareFingerprints(left, right) {
    if (!left || !right) {
        return { isDuplicate: false, reason: 'missing_fingerprint', confidence: 0 };
    }

    if (!left.canonicalSubCategoryId || !right.canonicalSubCategoryId) {
        return { isDuplicate: false, reason: 'missing_category', confidence: 0 };
    }

    if (left.canonicalSubCategoryId !== right.canonicalSubCategoryId) {
        return { isDuplicate: false, reason: 'different_category', confidence: 0 };
    }

    if (left.signature === right.signature) {
        return { isDuplicate: true, reason: 'signature_exact', confidence: 1 };
    }

    if (
        left.baseSlug &&
        right.baseSlug &&
        left.baseSlug === right.baseSlug &&
        left.baseSlug !== left.seedSlug &&
        right.baseSlug !== right.seedSlug
    ) {
        return { isDuplicate: true, reason: 'slug_exact', confidence: 1 };
    }

    if (left.intentTokens.length === 0 && right.intentTokens.length === 0) {
        return { isDuplicate: true, reason: 'generic_category_exact', confidence: 0.98 };
    }

    if (left.intentTokens.length > 0 && left.intentTokens.length === right.intentTokens.length) {
        const sameTokens = left.intentTokens.every((token, index) => token === right.intentTokens[index]);
        if (sameTokens) {
            return { isDuplicate: true, reason: 'intent_tokens_exact', confidence: 0.99 };
        }
    }

    if (left.intentKey && right.intentKey) {
        const similarity = similarityRatio(left.intentKey, right.intentKey);
        if (similarity >= 0.985) {
            return { isDuplicate: true, reason: 'intent_key_near', confidence: similarity };
        }
    }

    return { isDuplicate: false, reason: 'distinct_intent', confidence: 0 };
}

module.exports = {
    buildKeywordFingerprint,
    compareFingerprints,
};
