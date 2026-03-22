function normalizeText(value) {
    return String(value || '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[【】()[\]{}「」『』、,・:：]/g, '')
        .trim();
}

function dedupe(values) {
    return Array.from(new Set(values.filter(Boolean)));
}

function collectSpecMap(product = {}) {
    const specMap = new Map();

    Object.entries(product.kakakuSpecs || {}).forEach(([label, value]) => {
        if (!label || !value) return;
        specMap.set(label, value);
    });

    (product.specs || []).forEach((item) => {
        if (!item?.label || !item?.value || specMap.has(item.label)) return;
        specMap.set(item.label, item.value);
    });

    return specMap;
}

function collectReviewSnippets(product = {}, searchTerms = []) {
    const normalizedTerms = dedupe(searchTerms.map((term) => normalizeText(term))).filter((term) => term.length >= 2);
    const seen = new Set();
    const pool = [];

    const pushReview = (review) => {
        const text = String(review?.text || review?.body || review?.title || '').trim();
        if (!text || seen.has(text)) return;
        seen.add(text);
        pool.push(text);
    };

    (product.rawReviews?.positive || []).forEach(pushReview);
    (product.rawReviews?.negative || []).forEach(pushReview);
    (product.rawReviews?.kakaku?.positive || []).forEach(pushReview);
    (product.rawReviews?.kakaku?.negative || []).forEach(pushReview);

    const matched = pool.filter((text) => {
        const normalized = normalizeText(text);
        return normalizedTerms.some((term) => normalized.includes(term));
    });

    const fallback = pool.slice(0, 2);
    return (matched.length > 0 ? matched : fallback)
        .map((text) => summarizeReviewSignal(text))
        .filter(Boolean)
        .slice(0, 2);
}

function summarizeSupportingEvidence(text) {
    let next = String(text || '')
        .replace(/\s+/g, ' ')
        .replace(/^[「『"]+|[」』"]+$/gu, '')
        .trim();

    if (!next) {
        return '';
    }

    next = next
        .split(/[。！？]/u)
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(0, 2)
        .join('。');

    if (!next) {
        return '';
    }

    if (/(私は|僕は|私も|当方|個人的には|我が家では|うちでは|買って|使ってみると|と思います|と感じます|★[0-9])/u.test(next)) {
        return '';
    }

    return next.length > 72
        ? `${next.slice(0, 72).replace(/[、,・\s]+$/u, '')}…`
        : next;
}

const REVIEW_SIGNAL_RULES = [
    [/組み立て|梱包|初期不良|不良品|キズ|傷|ぐらつき|ガタつき|個体差|左右で違|歪み|ネジ|部品/u, '組み立てや仕上がりに個体差を指摘する声があります'],
    [/重い|重量|持ち上げ|運ぶ|移動/u, '重量があるため設置や移動に手間がかかるという声があります'],
    [/アームレスト|肘掛け|ひじ掛け|ランバー|座面|クッション|背もたれ|リクライニング/u, '調整まわりや座り心地に触れる声があります'],
    [/腰|背中|肩|首|疲れ|負担|姿勢|快適/u, '長時間使ったときの身体の負担差に触れる声があります'],
    [/音|騒音|静か|うるさ/u, '静かさや動作音の感じ方に差が出るという声があります'],
    [/吸引|ゴミ|毛|ほこり|水拭き|モップ|段差|カーペット/u, '掃除性能や日常の使い勝手に触れる声があります'],
    [/アプリ|接続|Wi-?Fi|設定|連携/u, '初期設定や連携のしやすさに差を感じる声があります'],
    [/バッテリー|充電|持ち|電池/u, 'バッテリー持ちや運用のしやすさを評価する声があります'],
    [/冷凍|冷蔵|温度|霜取|野菜室|省エネ/u, '保存性能や使い勝手に触れる声があります'],
];

function summarizeReviewSignal(text) {
    const summarized = summarizeSupportingEvidence(text);
    if (!summarized) {
        return '';
    }

    const matchedRule = REVIEW_SIGNAL_RULES.find(([pattern]) => pattern.test(summarized));
    if (matchedRule) {
        return matchedRule[1];
    }

    if (summarized.length > 36) {
        return 'レビューでは日常運用のしやすさに触れる声があります';
    }

    return `${summarized.replace(/[「」『"]/gu, '')}という声があります`;
}

function buildAxisEvidencePackets(products = [], axisPlan = null) {
    if (!axisPlan || !Array.isArray(axisPlan.axisDetails)) {
        return [];
    }

    return axisPlan.axisDetails.map((detail) => {
        const productPackets = [];
        const kakakuLabels = detail.matchedKakakuLabels?.length > 0
            ? detail.matchedKakakuLabels
            : (detail.matchedLabels || []);
        const searchTerms = [detail.axis, ...kakakuLabels];

        for (const product of products.slice(0, 6)) {
            const specMap = collectSpecMap(product);
            const matchedSpecs = kakakuLabels
                .filter((label) => specMap.has(label))
                .map((label) => `${label}: ${specMap.get(label)}`)
                .slice(0, 3);

            if (matchedSpecs.length === 0) {
                continue;
            }

            productPackets.push({
                name: product.name,
                matchedSpecs,
                specVerification: summarizeSupportingEvidence(product.specVerification),
                userScenario: summarizeSupportingEvidence(product.userScenario),
                reviewSnippets: collectReviewSnippets(product, searchTerms),
                reviewCount: product.reviewInsights?.totalFound || 0,
            });
        }

        return {
            axis: detail.axis,
            matchedLabels: kakakuLabels,
            productPackets: productPackets.slice(0, 4),
        };
    });
}

function buildAxisEvidencePrompt(axisPackets = []) {
    if (!Array.isArray(axisPackets) || axisPackets.length === 0) {
        return '比較軸ごとの追加証拠パックはありません。価格.comの確定情報を優先して書いてください。';
    }

    const lines = [
        '以下は比較軸ごとの証拠パックです。各軸の段落では、この中の根拠を最低2つ以上使ってください。',
        '優先順位は「価格.comのspec > specVerification/userScenario > レビュー補強」です。',
    ];

    axisPackets.forEach((packet) => {
        lines.push(`## Axis: ${packet.axis}`);
        lines.push(`- Kakaku labels: ${(packet.matchedLabels || []).join(' / ')}`);

        packet.productPackets.forEach((item) => {
            lines.push(`- Product: ${item.name}`);
            lines.push(`  - Kakaku evidence: ${item.matchedSpecs.join('、')}`);
            if (item.specVerification) {
                lines.push(`  - Spec reality: ${item.specVerification}`);
            }
            if (item.userScenario) {
                lines.push(`  - Best scenario: ${item.userScenario}`);
            }
            if (item.reviewSnippets.length > 0) {
                lines.push(`  - Review support: ${item.reviewSnippets.join(' / ')}`);
            } else if (item.reviewCount > 0) {
                lines.push(`  - Review support: ${item.reviewCount}件のレビューがあり、本文で傾向に触れてよい`);
            }
        });
    });

    lines.push('各軸の段落では、上の evidence にない断定を増やしすぎないでください。');
    lines.push('レビュー補強は引用せず、編集部の言葉で要約して使ってください。');
    return lines.join('\n');
}

module.exports = {
    buildAxisEvidencePackets,
    buildAxisEvidencePrompt,
};
