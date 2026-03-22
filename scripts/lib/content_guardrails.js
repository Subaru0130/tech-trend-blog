const MAX_TITLE_LENGTH = 48;
const MAX_DESCRIPTION_LENGTH = 120;
const MIN_DESCRIPTION_LENGTH = 72;

const BANNED_TITLE_PHRASES = [
    'プロが認める',
    '専門家が選ぶ',
    '完全版',
    '決定版',
    'プロ監修',
    '神',
    '最強',
    'ガチ勢が選ぶ',
];

const TITLE_INTENT_TOKENS = ['おすすめ', '選び方', '比較', 'ランキング', 'レビュー', '失敗しない'];
const TITLE_SEARCH_NOISE_PATTERN = /(完全版|決定版|ガチ勢|神|一択|最強|最終結論|これで決まり)/u;
const DESCRIPTION_SEARCH_NOISE_PATTERN = /(プロが選ぶ|編集部が厳選|完全ガイド|徹底解説しつつ|人気ランキング)/u;

const TITLE_REWRITE_RULES = [
    [/厳選\d+選/gu, 'おすすめ'],
    [/ガチ勢が選ぶ[！!]?/gu, ''],
    [/勝利を掴む/gu, ''],
    [/遅延なし[！!]?/gu, '低遅延で選ぶ'],
    [/ボイスチャット快適[！!]?/gu, '通話しやすさで選ぶ'],
    [/【([^】]+)最強】/gu, '【$1】'],
    [/最強/gu, 'おすすめ'],
];

const GENERIC_AXIS_LABELS = new Set([
    '基本性能',
    'コストパフォーマンス',
    'コスパ',
    '使いやすさ',
    '性能',
    '機能',
    '比較',
    '選び方',
    '評価',
    'ユーザー',
    'ユーザー評価',
]);

const AXIS_REWRITE_RULES = [
    [/^ランバーサポート$/u, '腰の支え方'],
    [/S字カーブを強制維持するランバーサポートの有無と調整幅/u, '体格への合わせやすさ'],
    [/ランバーサポートの有無と調整幅/u, '腰の支え方と調整幅'],
    [/体圧を分散し、?お尻の[『「"]?底付き感[』」"]?を解消する座面クオリティ/u, '座面クッション性'],
    [/体圧を分散し、?お尻の[『「"]?底付き感[』」"]?を抑える座面クオリティ/u, '座面クッション性'],
    [/座面の素材/u, '座り心地と蒸れにくさ'],
    [/を強制維持する/u, 'を支える'],
    [/の有無と調整幅/u, 'の調整幅'],
    [/の有無$/u, '対応の有無'],
];

const BODY_COPY_REPLACEMENTS = [
    [/数百件のリアルな口コミ/gu, '実際のレビューやスペック情報'],
    [/数百件のレビューを分析した結果/gu, 'レビューやスペック情報をもとに'],
    [/が最強！/gu, 'がおすすめです。'],
    [/がベスト！/gu, 'が第一候補です。'],
    [/一択！/gu, 'が有力候補です。'],
    [/最適解/gu, '有力候補'],
    [/最高クラス/gu, '高水準'],
    [/文句なし/gu, '満足しやすい'],
    [/極上のリラックス/gu, '深く休憩しやすいこと'],
    [/極上の回復時間/gu, '休憩しやすい時間'],
    [/極上/gu, '快適'],
    [/圧倒的な安定感/gu, 'しっかりした安定感'],
    [/圧倒的なガッシリ感/gu, 'がっしりした安定感'],
    [/圧倒的にこちらが良い/gu, 'こちらのほうが合う'],
    [/20〜30万円クラスの超高級チェアに匹敵する/gu, '上位クラスと比べても見劣りしにくい'],
    [/救世主/gu, '助けになりやすい存在'],
    [/必須です/gu, '必要になりやすいです'],
    [/必須だ/gu, '必要になりやすいです'],
    [/必須/gu, '必要になりやすい'],
    [/劇的に/gu, '大きく'],
    [/最高のパフォーマンスを発揮する/gu, '力を発揮しやすい'],
];

function normalizeText(value) {
    return String(value || '')
        .normalize('NFKC')
        .replace(/\s+/g, ' ')
        .trim();
}

function dedupe(values) {
    return Array.from(new Set(values.filter(Boolean)));
}

function shorten(text, maxLength) {
    const normalized = normalizeText(text);
    if (normalized.length <= maxLength) {
        return normalized;
    }

    return normalized
        .slice(0, maxLength)
        .replace(/[、。,・\s]+$/u, '')
        .trim();
}

function shortenAtBoundary(text, maxLength, preferredTokens = []) {
    const normalized = normalizeText(text);
    if (normalized.length <= maxLength) {
        return normalized;
    }

    const safeFloor = Math.max(12, maxLength - 18);
    let bestIndex = -1;

    preferredTokens.forEach((token) => {
        const index = normalized.lastIndexOf(token, maxLength);
        if (index >= safeFloor) {
            bestIndex = Math.max(bestIndex, index + token.length);
        }
    });

    if (bestIndex > 0) {
        return normalized.slice(0, bestIndex).trim();
    }

    return shorten(normalized, maxLength);
}

function hasSuspiciousTitleEnding(title) {
    return /[しでとやがのにへをもは・「『【]$/u.test(title) ||
        /失敗し$|選び$|ための$|向けの$|比較し$|必要$|おすすめす$|ランキングす$/u.test(title);
}

function extractPainSnippet(values = []) {
    const pain = firstMeaningful(values);
    if (!pain) {
        return '';
    }

    const quoted = pain.match(/「([^」]{4,40})」/u);
    if (quoted) {
        return `「${quoted[1]}」が気になる人にも`;
    }

    const sentence = pain.split(/[。！？]/u)[0] || pain;
    const clause = sentence.split(/[、]/u)[0] || sentence;
    return shorten(clause, 34);
}

function finalizeDescription(text) {
    let normalized = normalizeText(text);
    if (!normalized) {
        return normalized;
    }

    if (normalized.length <= MAX_DESCRIPTION_LENGTH) {
        if (!/[。！？]$/u.test(normalized)) {
            normalized += '。';
        }
        return normalized;
    }

    const sentences = normalized.match(/[^。！？]+[。！？]?/gu) || [normalized];
    let picked = '';

    for (const sentence of sentences) {
        if ((picked + sentence).length > MAX_DESCRIPTION_LENGTH) {
            break;
        }
        picked += sentence;
    }

    if (picked.length >= MIN_DESCRIPTION_LENGTH) {
        return picked.trim();
    }

    normalized = normalized
        .slice(0, MAX_DESCRIPTION_LENGTH - 1)
        .replace(/[、,・\s]+$/u, '')
        .trim();

    if (!/[。！？]$/u.test(normalized)) {
        normalized += '。';
    }

    return normalized;
}

function stripQuotes(text) {
    return String(text || '')
        .replace(/"/g, "'")
        .replace(/\r?\n/g, ' ')
        .trim();
}

function cleanAxisLabel(value) {
    return humanizeAxisLabel(
        normalizeText(value)
        .replace(/^[0-9０-９]+[.)．:：\s-]*/u, '')
        .replace(/[（(].*?[)）]/gu, '')
        .replace(/の有無$/u, '')
        .replace(/を重視.*$/u, '')
        .replace(/口コミ.*$/u, '')
        .replace(/チェックポイント$/u, '')
        .trim()
    );
}

function humanizeAxisLabel(value) {
    let next = normalizeText(value);

    AXIS_REWRITE_RULES.forEach(([pattern, replacement]) => {
        next = next.replace(pattern, replacement);
    });

    return next
        .replace(/・{2,}/gu, '・')
        .replace(/\s{2,}/gu, ' ')
        .trim();
}

function sanitizeGeneratedCopy(text) {
    let next = String(text || '');

    BODY_COPY_REPLACEMENTS.forEach(([pattern, replacement]) => {
        next = next.replace(pattern, replacement);
    });

    return next
        .replace(/<mark>圧倒的な/gu, '<mark>しっかりした')
        .replace(/<mark>最強[^<]*<\/mark>/gu, '<mark>おすすめしやすい</mark>')
        .replace(/<mark>一択[^<]*<\/mark>/gu, '<mark>有力候補</mark>')
        .replace(/圧倒的/gu, 'かなり')
        .replace(/匹敵/gu, '見劣りしにくい')
        .replace(/。{2,}/gu, '。')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function normalizeAxisKey(value) {
    return normalizeText(value)
        .replace(/[、,・/]/gu, '')
        .replace(/\s+/g, '')
        .replace(/[「」『』"]/gu, '')
        .trim();
}

function shouldMergeAxisFragments(previous, current) {
    if (!previous || !current) {
        return false;
    }

    return /(?:し|でき|やすい|やすさ|抑え|防ぎ|減らし|支え|高め|保ち|解消する)$/u.test(previous) ||
        (previous.length <= 8 && current.length >= 10) ||
        (/^(お|腰|肩|背中|耳|頭|部屋|床|モップ|ゴミ|静音|障害物|バッテリー|冷凍|座面|底付き感)/u.test(current) && previous.length <= 14);
}

function splitAxisText(value) {
    const normalized = normalizeText(value).replace(/／/gu, '/');
    if (!normalized) {
        return [];
    }

    if (/[\n/]/u.test(normalized)) {
        return normalized
            .split(/[\n/]+/u)
            .map((part) => normalizeText(part))
            .filter(Boolean);
    }

    const parts = normalized
        .split(/[、,]/u)
        .map((part) => normalizeText(part))
        .filter(Boolean);

    if (parts.length <= 1) {
        return parts;
    }

    return parts.reduce((merged, part) => {
        const last = merged[merged.length - 1];
        if (last && shouldMergeAxisFragments(last, part)) {
            merged[merged.length - 1] = `${last}、${part}`;
            return merged;
        }

        merged.push(part);
        return merged;
    }, []);
}

function axisPreferenceScore(label) {
    const normalized = normalizeText(label);
    let score = 0;

    if (normalized.length <= 12) {
        score += 4;
    } else if (normalized.length <= 18) {
        score += 2;
    }

    if (/腰の支え方|体格への合わせやすさ|座面クッション性|座り心地と蒸れにくさ/u.test(normalized)) {
        score += 5;
    }

    if (/調整幅|静音性|容量|サイズ|使いやすさ|耐久性|稼働時間/u.test(normalized)) {
        score += 1;
    }

    if (/[『「」、]/u.test(normalized)) {
        score -= 2;
    }

    if (/強制維持|解消する|クオリティ|体圧を分散し/u.test(normalized)) {
        score -= 3;
    }

    return score;
}

function choosePreferredAxisLabel(current, candidate) {
    const currentScore = axisPreferenceScore(current);
    const candidateScore = axisPreferenceScore(candidate);

    if (candidateScore !== currentScore) {
        return candidateScore > currentScore ? candidate : current;
    }

    return candidate.length < current.length ? candidate : current;
}

function compactAxisList(values = []) {
    const compacted = [];

    values.forEach((value) => {
        const label = cleanAxisLabel(value);
        if (!label || label.length < 2 || GENERIC_AXIS_LABELS.has(label)) {
            return;
        }

        const key = normalizeAxisKey(label);
        const existingIndex = compacted.findIndex((existing) => {
            const existingKey = normalizeAxisKey(existing);
            return existingKey === key ||
                (existingKey.length >= 6 && key.includes(existingKey)) ||
                (key.length >= 6 && existingKey.includes(key));
        });

        if (existingIndex >= 0) {
            compacted[existingIndex] = choosePreferredAxisLabel(compacted[existingIndex], label);
            return;
        }

        compacted.push(label);
    });

    return compacted;
}

function summarizeTargetReader(value) {
    const normalized = normalizeText(value);
    if (!normalized) {
        return '';
    }

    let label = normalized
        .split(/[。！？]/u)
        .map((part) => normalizeText(part))
        .find(Boolean) || normalized;

    label = label
        .replace(/[「『"][^「」『』"]+[」』"]/gu, '')
        .replace(/^特に/u, '')
        .trim();

    const personLikeSegment = label.match(/[^。！？]*(?:人|方|読者|ユーザー|層|エンジニア|学生|作家|会社員|主婦|ワーカー|ゲーマー|親)$/u);
    if (personLikeSegment) {
        label = personLikeSegment[0].trim();
    }

    if (label.length > 34) {
        const clauses = label.split(/[、]/u).map((part) => part.trim()).filter(Boolean);
        label = clauses.find((part) => /(?:人|方|読者|ユーザー|層|エンジニア|学生|作家|会社員|主婦|ワーカー|ゲーマー|親)$/u.test(part)) ||
            clauses.slice(0, 2).join('、') ||
            label;
    }

    if (label.length > 34) {
        label = shortenAtBoundary(label, 34, ['人', '方', '読者', 'ユーザー', '層', 'エンジニア', '学生', '作家', '会社員', '親']);
    }

    if (!label || label.length < 6 || !/(?:人|方|読者|ユーザー|層|エンジニア|学生|作家|会社員|主婦|ワーカー|ゲーマー|親)$/u.test(label)) {
        return 'この条件で商品を探している人';
    }

    return label;
}

function formatAxisSummary(axes = [], limit = 2) {
    const compacted = compactAxisList(axes).slice(0, limit);
    return compacted.join('・');
}

function extractComparisonAxes(blueprint = {}, fallbackLabels = []) {
    const primarySources = [];

    if (Array.isArray(blueprint.ranking_criteria)) {
        primarySources.push(
            ...blueprint.ranking_criteria.map((axis) => cleanAxisLabel(axis))
        );
    }

    if (blueprint.comparison_axis) {
        primarySources.push(
            ...splitAxisText(String(blueprint.comparison_axis))
                .map((axis) => cleanAxisLabel(axis))
        );
    }

    if (Array.isArray(blueprint.required_features)) {
        primarySources.push(
            ...blueprint.required_features.map((axis) => cleanAxisLabel(axis))
        );
    }

    const extracted = compactAxisList(dedupe(primarySources)).slice(0, 6);
    if (extracted.length > 0) {
        return extracted;
    }

    return compactAxisList(fallbackLabels.map((axis) => cleanAxisLabel(axis))).slice(0, 6);
}

function removeAuthorityClaims(title) {
    let nextTitle = normalizeText(title);

    BANNED_TITLE_PHRASES.forEach((phrase) => {
        nextTitle = nextTitle.replace(new RegExp(phrase, 'gu'), '');
    });

    TITLE_REWRITE_RULES.forEach(([pattern, replacement]) => {
        nextTitle = nextTitle.replace(pattern, replacement);
    });

    return normalizeText(
        nextTitle
            .replace(/[!！]{2,}/gu, '！')
            .replace(/！(おすすめ|選び方|比較|レビュー)/gu, '$1')
            .replace(/[【】]{2,}/gu, '')
    );
}

function buildFallbackTitle({ keyword, situationCategory = '' }) {
    const focus = normalizeText(situationCategory || keyword);
    return `【${focus}】失敗しない選び方とおすすめ`;
}

function buildIntentLedTitleVariants({ keyword, axes = [], situationCategory = '', targetReader = '' }) {
    const safeKeyword = normalizeText(keyword);
    const safeSituation = normalizeText(situationCategory);
    const safeAxes = compactAxisList(axes).slice(0, 2);
    const reader = summarizeTargetReader(targetReader).replace(/(?:の)?(人|方|読者|ユーザー|層)$/u, '');
    const variants = [
        safeSituation
            ? `【${safeSituation}】${safeKeyword}の選び方とおすすめ`
            : `【${safeKeyword}】失敗しない選び方とおすすめ`,
        safeAxes.length >= 2
            ? `【${safeKeyword}】${safeAxes.join('・')}で選ぶおすすめ`
            : '',
        reader
            ? `【${safeKeyword}】${reader}向けの選び方とおすすめ`
            : '',
    ];

    return dedupe(variants.filter(Boolean));
}

function scoreTitleCandidate(title, { keyword, axes = [] }) {
    const normalized = normalizeText(title);
    const safeKeyword = normalizeText(keyword);
    let score = 0;

    if (!normalized) {
        return -100;
    }

    if (safeKeyword && normalized.includes(safeKeyword)) {
        score += 6;
    }

    if (safeKeyword && normalized.startsWith(`【${safeKeyword}】`)) {
        score += 3;
    }

    if (TITLE_INTENT_TOKENS.some((token) => normalized.includes(token))) {
        score += 3;
    }

    if (axes.some((axis) => axis && normalized.includes(axis))) {
        score += 2;
    }

    if (TITLE_SEARCH_NOISE_PATTERN.test(normalized)) {
        score -= 4;
    }

    if (/[!！]{2,}/u.test(normalized)) {
        score -= 2;
    }

    if (hasSuspiciousTitleEnding(normalized)) {
        score -= 6;
    }

    if (normalized.length >= 24 && normalized.length <= 42) {
        score += 3;
    } else if (normalized.length >= 18 && normalized.length <= MAX_TITLE_LENGTH) {
        score += 1;
    } else {
        score -= 2;
    }

    return score;
}

function chooseBestTitleCandidate({ keyword, blueprint = {}, situationCategory = '', axes = [] }) {
    const candidates = dedupe([
        sanitizeTitle({ keyword, title: blueprint.title || keyword, situationCategory }),
        ...buildIntentLedTitleVariants({
            keyword,
            axes,
            situationCategory,
            targetReader: blueprint.target_reader || '',
        }).map((candidate) => sanitizeTitle({ keyword, title: candidate, situationCategory })),
        sanitizeTitle({
            keyword,
            title: buildFallbackTitle({ keyword, situationCategory }),
            situationCategory,
        }),
    ]);

    return candidates
        .sort((left, right) =>
            scoreTitleCandidate(right, { keyword, axes }) - scoreTitleCandidate(left, { keyword, axes }) ||
            Math.abs(left.length - 34) - Math.abs(right.length - 34)
        )[0];
}

function sanitizeTitle({ keyword, title, situationCategory = '' }) {
    const safeKeyword = normalizeText(keyword);
    let nextTitle = removeAuthorityClaims(title || safeKeyword);

    if (situationCategory && !nextTitle.includes(situationCategory)) {
        nextTitle = `【${situationCategory}】${nextTitle}`;
    }

    if (safeKeyword && !nextTitle.includes(safeKeyword)) {
        nextTitle = `【${safeKeyword}】${nextTitle}`;
    }

    nextTitle = nextTitle
        .replace(/【([^】]+)】【([^】]+)】/gu, '【$1】$2')
        .replace(/\s+/g, ' ')
        .trim();

    if (nextTitle.length > MAX_TITLE_LENGTH) {
        const shortened = shortenAtBoundary(nextTitle, MAX_TITLE_LENGTH, [
            'おすすめ',
            '選び方',
            'ランキング',
            '比較',
            'レビュー',
            '失敗しない',
            '？',
            '?',
            '！',
            '!',
            '」',
            '』',
            '】',
        ]);

        if (
            shortened.length >= 16 &&
            /おすすめ|選び方|ランキング|比較|レビュー|失敗しない/u.test(shortened) &&
            !hasSuspiciousTitleEnding(shortened)
        ) {
            return shortened;
        }

        return shortenAtBoundary(
            buildFallbackTitle({ keyword: safeKeyword, situationCategory }),
            MAX_TITLE_LENGTH,
            ['おすすめ', '選び方', 'ランキング', '】']
        );
    }

    if (hasSuspiciousTitleEnding(nextTitle)) {
        return shortenAtBoundary(
            buildFallbackTitle({ keyword: safeKeyword, situationCategory }),
            MAX_TITLE_LENGTH,
            ['おすすめ', '選び方', 'ランキング', '】']
        );
    }

    return nextTitle;
}

function firstMeaningful(values) {
    return values
        .map((value) => normalizeText(value))
        .find((value) => value.length >= 12) || '';
}

function sanitizeDescription({ keyword, blueprint = {}, axes = [] }) {
    const safeKeyword = normalizeText(keyword);
    const pain = extractPainSnippet([
        blueprint.persona?.pain_point,
        blueprint.search_intent_analysis,
        blueprint.intro_structure?.hook,
        blueprint.sales_hook,
    ]);
    const reader = summarizeTargetReader(blueprint.target_reader);
    const axisText = formatAxisSummary(axes, 2) || humanizeAxisLabel(normalizeText(blueprint.comparison_axis));
    const candidates = dedupe([
        reader && axisText
            ? `${reader}向けに、${safeKeyword}を${axisText}で比較。選び方とおすすめを解説します。`
            : '',
        pain && axisText
            ? `${safeKeyword}で失敗したくない人向けに、${axisText}を軸に比較。${pain}に悩む人の選び方を解説します。`
            : '',
        axisText
            ? `${safeKeyword}を${axisText}で比較。おすすめモデルと選び方をわかりやすく解説します。`
            : '',
        reader
            ? `${reader}向けに、${safeKeyword}の選び方とおすすめを整理しました。スペックと実用性の両方から比較します。`
            : '',
        `${safeKeyword}の選び方とおすすめを、スペックと実用性の両方からわかりやすく解説します。`,
    ].filter(Boolean).map((candidate) => finalizeDescription(candidate)));

    return candidates
        .sort((left, right) => {
            const leftScore = (
                (left.includes(safeKeyword) ? 5 : 0) +
                (axisText && left.includes(axisText) ? 3 : 0) +
                (reader && left.includes(reader) ? 2 : 0) +
                (DESCRIPTION_SEARCH_NOISE_PATTERN.test(left) ? -4 : 0) +
                (left.length >= MIN_DESCRIPTION_LENGTH && left.length <= MAX_DESCRIPTION_LENGTH ? 2 : 0)
            );
            const rightScore = (
                (right.includes(safeKeyword) ? 5 : 0) +
                (axisText && right.includes(axisText) ? 3 : 0) +
                (reader && right.includes(reader) ? 2 : 0) +
                (DESCRIPTION_SEARCH_NOISE_PATTERN.test(right) ? -4 : 0) +
                (right.length >= MIN_DESCRIPTION_LENGTH && right.length <= MAX_DESCRIPTION_LENGTH ? 2 : 0)
            );
            return rightScore - leftScore || Math.abs(left.length - 96) - Math.abs(right.length - 96);
        })[0];
}

function buildRankingCriteriaSummary({ keyword, blueprint = {}, fallbackLabels = [] }) {
    const axes = extractComparisonAxes(blueprint, fallbackLabels);
    const pointTitles = (axes.length > 0 ? axes : fallbackLabels.filter(Boolean)).slice(0, 4);
    const description = pointTitles.length > 0
        ? `${normalizeText(keyword)}は、${formatAxisSummary(pointTitles, 3)}を軸に比較しました。`
        : `今回のランキングは、基本性能と実用性を軸に比較しました。`;

    return {
        axes,
        description,
        pointTitles,
    };
}

function buildSeoBundle({ keyword, blueprint = {}, fallbackLabels = [] }) {
    const criteria = buildRankingCriteriaSummary({ keyword, blueprint, fallbackLabels });
    const chosenTitle = chooseBestTitleCandidate({
        keyword,
        blueprint,
        situationCategory: blueprint.situation_category || '',
        axes: criteria.axes,
    });

    return {
        title: chosenTitle,
        description: sanitizeDescription({
            keyword,
            blueprint,
            axes: criteria.axes,
        }),
        axes: criteria.axes,
        rankingCriteriaDescription: criteria.description,
        rankingCriteriaTitles: criteria.pointTitles,
    };
}

function buildPromptGuardrails({ keyword, blueprint = {}, axes = [] }) {
    const lines = [
        `Primary keyword: ${normalizeText(keyword)}`,
        `Reader pain: ${firstMeaningful([blueprint.persona?.pain_point, blueprint.search_intent_analysis, blueprint.sales_hook]) || 'Not specified'}`,
        `Reader profile: ${summarizeTargetReader(blueprint.target_reader) || 'Not specified'}`,
        `Opening hook: ${firstMeaningful([blueprint.intro_structure?.hook, blueprint.sales_hook]) || 'Not specified'}`,
        `Comparison axes: ${(axes.length > 0 ? axes : extractComparisonAxes(blueprint)).slice(0, 4).join(', ') || 'Not specified'}`,
        'The first 120 words must explain who this guide is for, what failure it helps avoid, and how products are compared.',
        'Open with 2-3 short sentences only: reader -> regret to avoid -> comparison method.',
        'If the intent implies a concrete scene such as bath, sleep, airplane, commute, train, gaming, or office work, name that scene in the opening heading and first sentence.',
        'If the search intent includes a rule, restriction, compatibility concern, or usage condition, answer it in the first paragraph before the product comparison.',
        'Avoid abstract opening headings such as "失敗しない選び方とは？本当に買うべきモデルはどれ？".',
        'Do not start with generic phrases such as "今回は", "この記事では", or market-wide claims.',
        'Use the primary keyword naturally in the title, first paragraph, and first H2.',
        'Every major section must anchor back to a concrete comparison axis and a real-world purchase tradeoff.',
        'If a sentence could fit any category, rewrite it until it names a concrete use case, tradeoff, or measurable difference.',
        'Benefits and drawbacks must be tied to a spec, a review insight, or a clear usage scenario.',
        'Avoid filler, generic hype, fake authority, and empty superlatives.',
        'Do not invent review counts, percentages, or market-wide claims unless the exact number is available in the provided data.',
    ];

    return lines.join('\n');
}

module.exports = {
    MIN_DESCRIPTION_LENGTH,
    MAX_TITLE_LENGTH,
    MAX_DESCRIPTION_LENGTH,
    extractComparisonAxes,
    humanizeAxisLabel,
    summarizeTargetReader,
    sanitizeTitle,
    sanitizeDescription,
    sanitizeGeneratedCopy,
    buildRankingCriteriaSummary,
    buildSeoBundle,
    buildPromptGuardrails,
    stripQuotes,
};
