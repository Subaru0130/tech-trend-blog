const { extractComparisonAxes } = require('./content_guardrails');

const GENERIC_LABEL_PATTERNS = [
    /^タイプ/i,
    /^接続/i,
    /^カラー$/i,
    /^色$/i,
    /^マイク$/i,
    /^リモコン$/i,
    /^満足度/i,
    /^特集$/i,
    /^ワイヤレス$/i,
    /^bluetoothバージョン$/i,
];

const AXIS_RULES = [
    { axis: /ノイズキャンセリング|ノイキャン|騒音対策/i, specs: [/ノイズキャンセリング|ノイキャン/i] },
    { axis: /外音取り込み|アンビエント|ヒアスルー/i, specs: [/外音取り込み|アンビエント|ヒアスルー/i] },
    { axis: /バッテリー|連続再生|稼働時間|電池|持続/i, specs: [/連続再生時間|稼働時間|バッテリー|電池|充電時間/i] },
    { axis: /防水|防塵/i, specs: [/防水|防塵/i] },
    { axis: /マルチポイント|マルチペアリング/i, specs: [/マルチポイント|マルチペアリング/i] },
    { axis: /コーデック|ldac|aptx|aac|ssc/i, specs: [/対応コーデック|コーデック/i] },
    { axis: /重量|軽さ/i, specs: [/重量|重さ/i] },
    { axis: /サイズ|寸法|幅|奥行|高さ|コンパクト/i, specs: [/サイズ|寸法|幅|奥行|高さ/i] },
    { axis: /容量/i, specs: [/容量|定格内容積|冷蔵室|冷凍室/i] },
    { axis: /省エネ|電気代/i, specs: [/省エネ|消費電力|年間消費電力量|年間電気代/i] },
    { axis: /静音|騒音/i, specs: [/静音|騒音|運転音/i] },
    { axis: /吸引力/i, specs: [/吸引力|真空度/i] },
    { axis: /水拭き|モップ/i, specs: [/水拭き|モップ/i] },
    { axis: /自動ゴミ収集|ゴミ収集|ゴミ捨て/i, specs: [/自動ゴミ収集|ゴミ収集|紙パック/i] },
    { axis: /障害物回避|マッピング|センサー/i, specs: [/障害物回避|マッピング|センサー/i] },
    { axis: /ランバーサポート|腰/i, specs: [/ランバー|腰|サポート/i] },
    { axis: /リクライニング/i, specs: [/リクライニング/i] },
    { axis: /座面/i, specs: [/座面/i] },
    { axis: /ヘッドレスト/i, specs: [/ヘッドレスト/i] },
];

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

function isGenericLabel(label) {
    return GENERIC_LABEL_PATTERNS.some((pattern) => pattern.test(String(label || '')));
}

function collectSignalsFromProduct(product = {}) {
    const signals = [];

    Object.entries(product.kakakuSpecs || {}).forEach(([label, value]) => {
        if (!label || isGenericLabel(label)) return;
        signals.push({
            source: 'kakaku',
            label,
            value: String(value || ''),
            normalizedLabel: normalizeText(label),
        });
    });

    (product.specs || []).forEach((item) => {
        const label = item?.label;
        if (!label || isGenericLabel(label)) return;
        signals.push({
            source: 'derived',
            label,
            value: String(item?.value || ''),
            normalizedLabel: normalizeText(label),
        });
    });

    return signals;
}

function buildAxisPatterns(axis) {
    const normalizedAxis = normalizeText(axis);
    const directPatterns = normalizedAxis ? [normalizedAxis] : [];
    const matchedRule = AXIS_RULES.find((rule) => rule.axis.test(axis));

    return {
        normalizedAxis,
        directPatterns,
        specPatterns: matchedRule ? matchedRule.specs : [],
    };
}

function signalMatchesAxis(signal, axisPatterns) {
    if (!signal) return false;
    const rawLabel = String(signal.label || '');
    const normalizedLabel = signal.normalizedLabel || normalizeText(rawLabel);

    if (axisPatterns.directPatterns.some((token) => token && normalizedLabel.includes(token))) {
        return true;
    }

    if (axisPatterns.specPatterns.some((pattern) => pattern.test(rawLabel))) {
        return true;
    }

    return false;
}

function formatSampleValues(matches = []) {
    return dedupe(matches.map((match) => `${match.label}: ${match.value}`).filter((text) => text && !text.endsWith(': '))).slice(0, 4);
}

function simplifyAxisIdentity(value = '') {
    return normalizeText(value)
        .replace(/の有無$/u, '')
        .replace(/機能$|性能$|対応$/u, '')
        .replace(/自動(?=リフトアップ)/u, '')
        .trim();
}

function cleanDisplayAxisLabel(value = '') {
    return String(value || '')
        .normalize('NFKC')
        .replace(/\s+/g, ' ')
        .replace(/（.*?[)）]/gu, '')
        .replace(/の有無$/u, '')
        .replace(/機能$|性能$|対応$/u, '')
        .replace(/自動(?=リフトアップ)/u, '')
        .trim();
}

function buildCanonicalAxisMeta(detail) {
    const sourceLabels = detail?.matchedKakakuLabels?.length > 0
        ? detail.matchedKakakuLabels
        : (detail?.matchedLabels || []);
    const normalizedLabels = dedupe(sourceLabels.map((label) => simplifyAxisIdentity(label)).filter(Boolean)).sort();
    const canonicalKey = normalizedLabels.join('|') || simplifyAxisIdentity(detail?.axis || '');
    const originalAxis = cleanDisplayAxisLabel(detail?.axis || '');
    const displayCandidates = dedupe(sourceLabels.map((label) => cleanDisplayAxisLabel(label)).filter(Boolean));
    displayCandidates.sort((a, b) => a.length - b.length);

    return {
        canonicalKey,
        displayAxis: (originalAxis && !isGenericLabel(originalAxis) ? originalAxis : displayCandidates[0]) || detail.axis,
    };
}

function dedupeAxisDetails(details = []) {
    const seen = new Set();
    const deduped = [];

    const sorted = [...details].sort((a, b) => {
        const kakakuDiff = (b.kakakuCoverageCount || 0) - (a.kakakuCoverageCount || 0);
        if (kakakuDiff !== 0) return kakakuDiff;
        const coverageDiff = (b.coverageCount || 0) - (a.coverageCount || 0);
        if (coverageDiff !== 0) return coverageDiff;
        return String(a.axis || '').length - String(b.axis || '').length;
    });

    for (const detail of sorted) {
        const { canonicalKey, displayAxis } = buildCanonicalAxisMeta(detail);
        if (!canonicalKey || seen.has(canonicalKey)) {
            continue;
        }

        seen.add(canonicalKey);
        deduped.push({
            ...detail,
            canonicalKey,
            axis: displayAxis,
        });
    }

    return deduped;
}

function resolveAxisAgainstProducts(axis, products) {
    const axisPatterns = buildAxisPatterns(axis);
    const matchedLabels = new Map();
    const matchedKakakuLabels = new Map();
    const matchedProducts = [];

    products.forEach((product) => {
        const signals = collectSignalsFromProduct(product);
        const matches = signals.filter((signal) => signalMatchesAxis(signal, axisPatterns));

        if (matches.length === 0) {
            return;
        }

        const kakakuMatches = matches.filter((match) => match.source === 'kakaku');
        const derivedMatches = matches.filter((match) => match.source === 'derived');

        matchedProducts.push({
            id: product.id,
            name: product.name,
            matches,
            kakakuMatches,
            derivedMatches,
        });

        matches.forEach((match) => {
            matchedLabels.set(match.label, (matchedLabels.get(match.label) || 0) + 1);
        });

        kakakuMatches.forEach((match) => {
            matchedKakakuLabels.set(match.label, (matchedKakakuLabels.get(match.label) || 0) + 1);
        });
    });

    const coverageCount = matchedProducts.length;
    const kakakuCoverageCount = matchedProducts.filter((item) => item.kakakuMatches.length > 0).length;
    const derivedCoverageCount = matchedProducts.filter((item) => item.derivedMatches.length > 0).length;
    const kakakuSampleValues = formatSampleValues(matchedProducts.flatMap((item) => item.kakakuMatches));
    const sampleValues = kakakuSampleValues.length > 0
        ? kakakuSampleValues
        : formatSampleValues(matchedProducts.flatMap((item) => item.matches));

    return {
        axis,
        coverageCount,
        kakakuCoverageCount,
        derivedCoverageCount,
        matchedLabels: [...matchedLabels.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([label]) => label)
            .slice(0, 4),
        matchedKakakuLabels: [...matchedKakakuLabels.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([label]) => label)
            .slice(0, 4),
        sampleValues,
        productNames: matchedProducts.map((item) => item.name).slice(0, 3),
    };
}

function buildEvidenceSummary(detail) {
    const labels = detail?.matchedKakakuLabels?.length > 0 ? detail.matchedKakakuLabels : detail?.matchedLabels || [];
    if (!detail || labels.length === 0) {
        return '';
    }

    const parts = [
        `軸「${detail.axis}」は価格.comの「${labels.join(' / ')}」で確認できます。`,
    ];

    if (detail.sampleValues.length > 0) {
        parts.push(`例: ${detail.sampleValues.join('、')}`);
    }

    return parts.join(' ');
}

function resolveKakakuComparisonPlan({ keyword, blueprint = {}, products = [], fallbackLabels = [] }) {
    const requestedAxes = dedupe([
        ...extractComparisonAxes(blueprint, fallbackLabels),
        ...(Array.isArray(blueprint.ranking_criteria) ? blueprint.ranking_criteria : []),
        ...(Array.isArray(blueprint.required_features) ? blueprint.required_features : []),
    ]).slice(0, 8);

    const minCoverage = Math.max(2, Math.ceil(products.length * 0.3));
    const details = requestedAxes.map((axis) => {
        const resolved = resolveAxisAgainstProducts(axis, products);
        return {
            ...resolved,
            evidenceSummary: buildEvidenceSummary(resolved),
        };
    });

    const measurable = dedupeAxisDetails(details
        .filter((detail) => detail.kakakuCoverageCount >= minCoverage && detail.matchedKakakuLabels.length > 0)
    ).slice(0, 4);

    const supported = measurable.length > 0
        ? measurable
        : dedupeAxisDetails(details.filter((detail) => detail.coverageCount >= minCoverage && detail.matchedLabels.length > 0)).slice(0, 4);

    const fallbackSupported = supported.length > 0
        ? supported
        : dedupeAxisDetails(details.filter((detail) => detail.matchedLabels.length > 0)).slice(0, 4);

    const keptAxisKeys = new Set(fallbackSupported.map((detail) => detail.canonicalKey || detail.axis));
    const rejected = details
        .filter((detail) => {
            const { canonicalKey } = buildCanonicalAxisMeta(detail);
            return !keptAxisKeys.has(canonicalKey || detail.axis);
        })
        .map((detail) => ({
            axis: detail.axis,
            coverageCount: detail.coverageCount,
        }));

    return {
        keyword,
        minCoverage,
        measurableAxisNames: measurable.map((detail) => detail.axis),
        measurableAxisDetails: measurable,
        hardFail: measurable.length === 0,
        hardFailReason: measurable.length === 0
            ? 'No comparison axis could be measured directly from Kakaku specs.'
            : '',
        axisNames: fallbackSupported.map((detail) => detail.axis),
        axisDetails: fallbackSupported,
        rejectedAxes: rejected,
        promptBlock: fallbackSupported.length > 0
            ? fallbackSupported.map((detail) => `- ${detail.axis}: ${detail.evidenceSummary}`).join('\n')
            : '',
    };
}

module.exports = {
    resolveKakakuComparisonPlan,
};
