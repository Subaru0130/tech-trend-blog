const { sanitizeGeneratedCopy } = require('./content_guardrails');

const REVIEW_COPY_REPLACEMENTS = [
    [/[\r\n\t]+/gu, ' '],
    [/[「」『』]/gu, ''],
    [/！+/gu, ''],
    [/!+/g, ''],
    [/だぞ/gu, 'です'],
    [/だろう/gu, 'です'],
    [/注意だ/gu, '注意したいです'],
    [/向かないぞ/gu, '向きません'],
    [/最高クラス/gu, '高水準'],
    [/最高/gu, '満足度が高い'],
    [/最強/gu, '有力'],
    [/極上/gu, '快適'],
    [/圧倒的/gu, 'かなり'],
    [/段違い/gu, '差を感じやすい'],
    [/大満足/gu, '満足'],
    [/一択/gu, '有力候補'],
    [/救世主/gu, '助けになりやすい製品'],
    [/魔法ではない/gu, '万能ではありません'],
    [/目をつぶる必要がある/gu, '割り切りが必要です'],
    [/必須だ(?:ぞ)?/gu, 'あったほうが安心です'],
    [/絶対試座して/gu, 'できれば試座して'],
    [/絶対/gu, 'できれば'],
    [/プロも認める/gu, '高く評価されやすい'],
];

const HYPE_PATTERN = /(最高|最強|極上|圧倒的|段違い|大満足|神|一択|だぞ|だろう|必須だ|救世主)/u;
const BANNED_TOPIC_PATTERN = /(初期不良|サポート|保証|配送|リセール)/u;
const LOW_SIGNAL_PATTERN = /(すごい|良い|便利|快適|高音質|高性能|おすすめ)$/u;
const CON_SOFTENER_PATTERN = /(?:ですが|けれど|ただし|とはいえ).*(?:問題ない|十分|気にならない|大丈夫|安心)/u;
const CONCRETE_TOKEN_PATTERN = /\d|時間|kg|mm|cm|dB|Hz|回転|座面|ランバー|腰|首|耳|電車|会議|通話|猫|毛|水拭き|段差|静音|障害物|バッテリー|充電|メッシュ|アームレスト|ノイズ|音漏れ|装着/u;
const IMPACT_WORD_PATTERN = /(向く|向かない|使いやすい|使いにくい|痛い|疲れにくい|疲れやすい|邪魔|浮く|蒸れ|ズレ|減る|抑えやすい|安定しやすい|聞き取りやすい|取り回ししやすい|置きやすい|掃除しやすい|座りやすい|合わせやすい)/u;
const GENERIC_OPENING_PATTERN = /^(この製品は|全体として|基本的には|一般的には|スペック上は|レビューでは|使い方によっては|人によっては)/u;

function normalizeWhitespace(text) {
    return String(text || '')
        .normalize('NFKC')
        .replace(/\s+/gu, ' ')
        .trim();
}

function clipAtBoundary(text, maxLength = 56) {
    const normalized = normalizeWhitespace(text);
    if (normalized.length <= maxLength) {
        return normalized;
    }

    const clipped = normalized
        .slice(0, maxLength)
        .replace(/[、,・\s]+$/u, '')
        .trim();

    return clipped;
}

function clipNarrativeText(text, maxLength = 72) {
    const normalized = normalizeWhitespace(text);
    if (normalized.length <= maxLength) {
        return normalized;
    }

    const sentences = normalized.match(/[^。！？]+[。！？]?/gu) || [normalized];
    let picked = '';

    for (const sentence of sentences) {
        if (!sentence) {
            continue;
        }

        if ((picked + sentence).length > maxLength) {
            break;
        }

        picked += sentence;
    }

    if (picked.length >= Math.max(24, maxLength - 18)) {
        return picked.trim();
    }

    const clauses = normalized
        .split(/[、]/u)
        .map((part) => part.trim())
        .filter(Boolean);
    let clauseText = '';

    for (const clause of clauses) {
        const next = clauseText ? `${clauseText}、${clause}` : clause;
        if (next.length > maxLength) {
            break;
        }
        clauseText = next;
    }

    return clipAtBoundary(clauseText || normalized, maxLength);
}

function normalizeBaseCopy(text) {
    let next = sanitizeGeneratedCopy(String(text || ''));

    REVIEW_COPY_REPLACEMENTS.forEach(([pattern, replacement]) => {
        next = next.replace(pattern, replacement);
    });

    return normalizeWhitespace(next)
        .replace(/。{2,}/gu, '。')
        .replace(/、{2,}/gu, '、')
        .replace(/^[・•\-]+\s*/u, '')
        .trim();
}

function cleanupBulletText(text, kind = 'pro') {
    let next = normalizeBaseCopy(text);

    if (!next) {
        return '';
    }

    if (kind === 'con') {
        next = next.replace(/。?(?:ですが|けれど|ただし|とはいえ).*(?:問題ない|十分|気にならない|大丈夫|安心).*$/u, '');
    }

    next = next
        .replace(/^(?:とにかく|かなり|本当に|めちゃくちゃ|すごく)\s*/u, '')
        .replace(/^(?:多くのユーザーが|口コミでは|レビューでは)\s*/u, '')
        .replace(/[。！？]$/u, '')
        .trim();

    return clipAtBoundary(next, kind === 'editor' ? 68 : 56);
}

function cleanupNarrativeText(text, kind = 'generic') {
    let next = normalizeBaseCopy(text);

    if (!next) {
        return '';
    }

    next = next
        .replace(/^(?:結論から言うと|結論として|総合すると|要するに)\s*/u, '')
        .replace(/。?ただし、?/gu, '。ただ、')
        .replace(/。?ですが、?/gu, '。')
        .replace(/。?けれど、?/gu, '。')
        .replace(/満足度が高いだ/gu, '満足度が高いです')
        .replace(/有力だ/gu, '有力です')
        .replace(/高水準だ/gu, '高水準です')
        .replace(/快適だ/gu, '快適です')
        .trim();

    next = clipNarrativeText(next, kind === 'editor' ? 72 : 96);
    if (next && !/[。！？]$/u.test(next)) {
        next += '。';
    }

    return next;
}

function normalizeInsightText(text, kind = 'generic') {
    if (kind === 'editor' || kind === 'spec' || kind === 'scenario') {
        return cleanupNarrativeText(text, kind);
    }

    return cleanupBulletText(text, kind);
}

function deriveInsightKey(text) {
    return normalizeWhitespace(text)
        .replace(/[。、,・!！?？]/gu, '')
        .replace(/\s+/gu, '')
        .trim();
}

function isWeakInsightText(text, kind = 'generic') {
    const raw = normalizeWhitespace(text);
    const normalized = normalizeInsightText(text, kind);

    if (!normalized) {
        return true;
    }

    if (normalized.length < (kind === 'editor' ? 18 : 12)) {
        return true;
    }

    if (BANNED_TOPIC_PATTERN.test(raw)) {
        return true;
    }

    if (HYPE_PATTERN.test(raw)) {
        return true;
    }

    if (kind === 'con' && CON_SOFTENER_PATTERN.test(raw)) {
        return true;
    }

    if ((kind === 'pro' || kind === 'con') && !CONCRETE_TOKEN_PATTERN.test(normalized) && !IMPACT_WORD_PATTERN.test(normalized) && normalized.length < 28) {
        return true;
    }

    if ((kind === 'pro' || kind === 'con') && GENERIC_OPENING_PATTERN.test(normalized) && !CONCRETE_TOKEN_PATTERN.test(normalized)) {
        return true;
    }

    if (kind === 'editor' && !/(人|向き|向く|慎重|注意|候補|おすすめ|合う|合わ)/u.test(normalized)) {
        return true;
    }

    if (LOW_SIGNAL_PATTERN.test(normalized) && normalized.length < 24) {
        return true;
    }

    return false;
}

function scoreInsightText(text, kind = 'generic') {
    const normalized = normalizeInsightText(text, kind);
    if (!normalized) {
        return -100;
    }

    let score = 0;

    if (!isWeakInsightText(text, kind)) {
        score += 4;
    }

    if (CONCRETE_TOKEN_PATTERN.test(normalized)) {
        score += 2;
    }

    if (IMPACT_WORD_PATTERN.test(normalized)) {
        score += 2;
    }

    if (normalized.length >= 16 && normalized.length <= (kind === 'editor' ? 72 : 52)) {
        score += 1;
    }

    if (GENERIC_OPENING_PATTERN.test(normalized)) {
        score -= 2;
    }

    if (kind === 'con' && /(重い|短い|硬い|痛い|蒸れ|遅延|音漏れ|向きません|浮く|掃除|合わない|邪魔|大きい)/u.test(normalized)) {
        score += 1;
    }

    return score;
}

function normalizeInsightList(items = [], kind = 'pro', limit = 3) {
    const seen = new Set();
    const normalized = [];

    items.forEach((item) => {
        const next = normalizeInsightText(item, kind);
        const key = deriveInsightKey(next);
        if (!next || seen.has(key) || BANNED_TOPIC_PATTERN.test(next)) {
            return;
        }

        seen.add(key);
        normalized.push(next);
    });

    return normalized.slice(0, limit);
}

function hasUsableInsightList(items = [], kind = 'pro') {
    return normalizeInsightList(items, kind, kind === 'con' ? 2 : 3)
        .some((item) => !isWeakInsightText(item, kind));
}

function pickInsightList(primary = [], secondary = [], kind = 'pro', limit = 3) {
    const combined = [
        ...normalizeInsightList(primary, kind, limit + 3),
        ...normalizeInsightList(secondary, kind, limit + 3),
    ];

    const deduped = [];
    const seen = new Set();

    combined.forEach((item) => {
        const key = deriveInsightKey(item);
        if (!key || seen.has(key)) {
            return;
        }

        seen.add(key);
        deduped.push(item);
    });

    return deduped
        .sort((left, right) => scoreInsightText(right, kind) - scoreInsightText(left, kind))
        .slice(0, limit);
}

function firstShortClause(text, maxLength = 30) {
    const normalized = normalizeBaseCopy(text);
    if (!normalized) {
        return '';
    }

    const firstSentence = normalized
        .split(/[。！？]/u)
        .map((part) => part.trim())
        .find(Boolean) || normalized;
    const clauses = firstSentence
        .split(/[、]/u)
        .map((part) => part.trim())
        .filter(Boolean);
    const genericClausePattern = /^(構造上|仕様上|サイズ感|本体重量|音質|デザイン|使い方によっては|一方で)$/u;
    const clause = clauses.find((part) => !genericClausePattern.test(part)) || clauses[0] || firstSentence;

    return clipAtBoundary(
        clause.replace(/[がでをにはへとやもからまで]$/u, '').trim(),
        maxLength
    );
}

function buildFallbackPros(context = {}, limit = 3) {
    const scenarioClause = firstShortClause(context.userScenario || '', 28);
    const specClause = firstShortClause(context.specVerification || '', 30);

    const candidates = [
        scenarioClause ? `${scenarioClause}で使いやすい` : '',
        specClause ? `${specClause}を重視する人に合いやすい` : '',
        ...(Array.isArray(context.pros) ? context.pros : []),
    ];

    return pickInsightList(candidates, [], 'pro', limit);
}

function buildFallbackCons(context = {}, limit = 2) {
    const existingCons = Array.isArray(context.cons) ? context.cons : [];
    const specClause = firstShortClause(context.specVerification || '', 28);
    const scenarioClause = firstShortClause(context.userScenario || '', 28);

    const candidates = [
        ...existingCons,
        /重い|痛い|蒸れ|遅延|音漏れ|浮く|邪魔|大きい/u.test(specClause) ? `${specClause}点は注意したいです` : '',
        /向かない|不向き|難しい/u.test(scenarioClause) ? `${scenarioClause}使い方には向きにくいです` : '',
    ];

    return pickInsightList(candidates, [], 'con', limit);
}

function buildFallbackEditorComment(productName, context = {}) {
    const rawScenarioClause = firstShortClause(context.userScenario || '', 28);
    const scenarioClause = /(人|ワーカー|ユーザー|世帯|家庭)/u.test(rawScenarioClause) ? rawScenarioClause : '';
    const specClause = firstShortClause(context.specVerification || '', 28);
    const conClause = firstShortClause(
        (buildFallbackCons(context, 1)[0]) ||
        (Array.isArray(context.cons) && context.cons[0]) || '',
        26
    );

    const benefitLead = scenarioClause
        ? `${scenarioClause}人には候補に入れやすい製品です`
        : specClause
            ? `${specClause}を確認しながら選びたい人には候補に入れやすい製品です`
            : `${productName}は用途が合う人には候補に入れやすい製品です`;

    if (conClause) {
        return `${benefitLead}。${conClause}が気になる人は慎重に選びたいです。`;
    }

    return `${benefitLead}。重視するポイントを絞って見比べると選びやすいです。`;
}

function normalizeEditorComment(text, productName, context = {}) {
    const normalized = normalizeInsightText(text, 'editor');
    const hasBrokenGrammar = /(満足度が高いだ|有力だ。|高水準だ。|快適だ。|しにくいする|[)）]人には|(?:構造上|仕様上)が気になる)/u.test(normalized);

    if (!isWeakInsightText(text, 'editor') && !hasBrokenGrammar) {
        return normalized;
    }

    return buildFallbackEditorComment(productName, context);
}

module.exports = {
    buildFallbackCons,
    buildFallbackEditorComment,
    buildFallbackPros,
    hasUsableInsightList,
    isWeakInsightText,
    normalizeEditorComment,
    normalizeInsightList,
    normalizeInsightText,
    pickInsightList,
    scoreInsightText,
};
