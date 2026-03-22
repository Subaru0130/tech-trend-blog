/**
 * 🎯 Universal Miner - Situation Edition v1
 * 
 * 従来のランキング記事（価格帯、おすすめ）ではなく、
 * 「特定の状況にいるユーザー」を対象としたニッチなキーワードを発掘
 * 
 * [戦略]
 * 1. 「ユーザーの状況」を表すサフィックスを網羅的に試す
 * 2. Googleサジェストで需要を検証
 * 3. 需要があるものだけをBlueprint化
 * 
 * [使い方]
 * node scripts/universal_miner_situation_v1.js "ワイヤレスイヤホン"
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { buildKeywordFingerprint, compareFingerprints } = require('./lib/intent_fingerprint');
const { keywordToEnglishSlug } = require('./lib/generator');
const { evaluateSituationKeywordViability } = require('./lib/kakaku_viability_rules');
require('dotenv').config({ path: '.env.local' });

const ROOT_DIR = path.resolve(__dirname, '..');
const ARTICLES_JSON_PATH = path.join(ROOT_DIR, 'src', 'data', 'articles.json');
const MINER_CACHE_DIR = path.join(ROOT_DIR, '.cache', 'miner_viability');

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const SEED_KEYWORD = process.argv[2] || "ワイヤレスイヤホン";

if (!GEMINI_API_KEY) {
    console.error("❌ Error: API Key is missing.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

function getCategorySpecificSituationSuffixes(seed) {
    const normalized = String(seed || '').normalize('NFKC');

    if (normalized.includes('\u30ed\u30dc\u30c3\u30c8\u6383\u9664\u6a5f')) {
        return [
            '\u30da\u30c3\u30c8\u306e\u6bdb',
            '\u72ac\u732b\u306e\u6bdb',
            '\u6c34\u62ed\u304d',
            '\u81ea\u52d5\u30b4\u30df\u53ce\u96c6',
            '\u969c\u5bb3\u7269\u56de\u907f',
            '\u9759\u97f3',
            '\u591c\u9593',
            '\u6bb5\u5dee',
            '\u30ab\u30fc\u30da\u30c3\u30c8',
            '\u5bb6\u5177\u306e\u4e0b',
            '\u8584\u578b',
            '\u5171\u50cd\u304d',
            '\u5b50\u80b2\u3066',
            '\u4e00\u4eba\u66ae\u3089\u3057',
            '\u30a2\u30d7\u30ea\u4e0d\u8981',
            '\u30b4\u30df\u6368\u3066\u304c\u697d',
        ];
    }

    if (normalized.includes('\u51b7\u8535\u5eab')) {
        return [
            '\u4e00\u4eba\u66ae\u3089\u3057',
            '\u4e8c\u4eba\u66ae\u3089\u3057',
            '\u81ea\u708a\u5411\u3051',
            '\u51b7\u51cd\u5eab\u304c\u5e83\u3044',
            '\u51b7\u51cd\u91cd\u8996',
            '\u7701\u30a8\u30cd',
            '\u9759\u97f3',
            '\u30b9\u30ea\u30e0',
            '\u5c0f\u578b',
            '\u5927\u5bb9\u91cf',
            '\u4f5c\u308a\u7f6e\u304d',
            '\u91ce\u83dc\u5ba4',
            '\u89b3\u97f3\u958b\u304d',
            '\u53f3\u958b\u304d',
            '\u5de6\u958b\u304d',
            '\u5f15\u3063\u8d8a\u3057',
        ];
    }

    if (normalized.includes('\u30aa\u30d5\u30a3\u30b9\u30c1\u30a7\u30a2')) {
        return [
            '\u8170\u75db',
            '\u30c6\u30ec\u30ef\u30fc\u30af',
            '\u5728\u5b85\u52e4\u52d9',
            '\u9577\u6642\u9593\u4f5c\u696d',
            '\u4f4e\u8eab\u9577',
            '\u9ad8\u8eab\u9577',
            '\u5c0f\u67c4',
            '\u30e1\u30c3\u30b7\u30e5',
            '\u84b8\u308c\u306b\u304f\u3044',
            '\u72ed\u3044\u90e8\u5c4b',
            '\u4e00\u4eba\u66ae\u3089\u3057',
            '\u30d8\u30c3\u30c9\u30ec\u30b9\u30c8',
            '\u30e9\u30f3\u30d0\u30fc\u30b5\u30dd\u30fc\u30c8',
            '\u75b2\u308c\u306b\u304f\u3044',
            '\u96c6\u4e2d\u3067\u304d\u308b',
        ];
    }

    if (normalized.includes('\u30ef\u30a4\u30e4\u30ec\u30b9\u30a4\u30e4\u30db\u30f3')) {
        return [
            '\u901a\u8a71',
            '\u30c6\u30ec\u30ef\u30fc\u30af',
            '\u5728\u5b85\u52e4\u52d9',
            '\u30e9\u30f3\u30cb\u30f3\u30b0',
            '\u30b8\u30e0',
            '\u901a\u52e4',
            '\u96fb\u8eca',
            '\u8033\u304c\u5c0f\u3055\u3044',
            '\u5bdd\u30db\u30f3',
            '\u5916\u97f3\u53d6\u308a\u8fbc\u307f',
            '\u30de\u30eb\u30c1\u30dd\u30a4\u30f3\u30c8',
            '\u30ce\u30a4\u30ad\u30e3\u30f3',
            '\u9577\u6642\u9593',
            'ASMR',
            '\u304a\u98a8\u5442',
        ];
    }

    return [];
}

// ==========================================
// 🧠 AI動的サフィックス生成
// ==========================================
// seedキーワードに応じて、そのジャンル特有の状況サフィックスをAIが生成
// 例: "ワイヤレスイヤホン" → 眼鏡, 骨伝導, 耳が小さい, ASMR, 音漏れ
// 例: "オフィスチェア" → 腰痛, 猫背, 長時間デスクワーク, 在宅勤務
async function generateSituationSuffixes(seed, specDetails = '') {
    const categoryFallbacks = getCategorySpecificSituationSuffixes(seed);
    console.log(`\n🧠 AIが「${seed}」向けの状況サフィックスをブレインストーミング中...`);
    if (specDetails) console.log(`   → 価格.comスペック情報を参考に生成`);

    try {
        const result = await model.generateContent(`
あなたは「${seed}」という製品ジャンルの専門家です。

## この製品ジャンルのスペック情報（価格.comから実際に取得）
${specDetails || '（スペック情報なし）'}
上記スペックを参考に、各スペックが活きる状況・使ない場面を考えてください。

## 目的
「${seed}」を検索するユーザーが、**特定の状況・悩み・条件**で絞り込み検索する時に使うサフィックスを網羅的にリストアップしてください。

## ルール
- 「${seed} ○○○」の形で実際にGoogleで検索されそうな語句のみ
- 1〜4語の短いフレーズ（例: "耳が小さい", "腰痛持ち", "一人暮らし"）
- 以下のカテゴリを網羅すること:
  1. **身体的条件** — 体格、身体的制約、持病など
  2. **使用環境** — 仕事場、移動中、自宅、屋外など
  3. **アクティビティ** — 運動、趣味、作業など
  4. **年齢・属性** — 子供、女性、シニア、学生など
  5. **悩み・課題** — その製品ジャンル特有の困りごと
  6. **予算・購入動機** — コスパ、プレゼント、初心者など
  7. **スペック・機能ニーズ** — その製品特有の機能要件

## 除外するもの (NG)
- 「おすすめ」「ランキング」「比較」「最強」「人気」（汎用すぎる）
- ブランド名やモデル名（Sony, Appleなど）
- トラブルシューティング（「故障」「修理」など）
- 特定デバイス名（iPhone, PS5など — 内容が同じになる）

## 出力形式
カンマ区切りのリストのみを出力してください。説明は不要です。
`);

        let text = result.response.text();
        const suffixes = text.split(/,|、|\n/).map(s => s.trim().replace(/・/g, '')).filter(s => s.length > 1 && s.length < 20);

        // 重複除去 + 上限50
        const uniqueSuffixes = [...new Set([...categoryFallbacks, ...suffixes])].slice(0, 50);
        console.log(`   ✨ ${uniqueSuffixes.length} 個の状況サフィックスを生成:`);
        console.log(`   ${uniqueSuffixes.slice(0, 10).join(', ')} ...`);
        return uniqueSuffixes;

    } catch (e) {
        if (categoryFallbacks.length > 0) {
            return categoryFallbacks;
        }
        console.log(`   ⚠️ AI生成失敗: ${e.message}。フォールバックリストを使用。`);
        // 最低限の汎用フォールバック
        return [
            'テレワーク', '在宅勤務', '通勤', 'オフィス',
            '初心者', '女性', '子供', 'シニア',
            'コスパ', '高級', 'プレゼント',
            '一人暮らし', '長時間',
            '小さい', 'コンパクト', '軽い',
        ];
    }
}

// ==========================================
// 🚫 EXCLUDE PATTERNS (除外パターン)
// ==========================================
const EXCLUDE_PATTERNS = [
    'ランキング', 'おすすめ', '比較', '最強', '人気',
    '修理', '故障', '接続できない',
    '100均', 'ダイソー', 'セリア', 'ドンキ', 'コストコ',
    'メルカリ', 'ヤフオク', '中古',
];
// ==========================================
// 📋 動的スペック発見：記事生成と同じ market_research.js を使用
// ==========================================
// produce_from_blueprint.js と全く同じ手法で価格.comにアクセスし、
// そのカテゴリで実際に取得可能なスペック項目を調査する
// ※ 記事生成時のAIフィルタは全スペックをAIに渡して判断させるため、
//    ON/OFF限定ではなく全スペック項目を返す
async function discoverFilterableSpecs(seed) {
    console.log(`\n📋 価格.comスペック調査: 「${seed}」の利用可能スペックを探索中...`);
    console.log(`   → market_research.js (記事生成と同じ手法) を使用`);

    try {
        const { scrapeKakakuRankingWithEnrichment } = require('./lib/market_research');

        // 少数の商品だけ取得してスペック項目を調査（3商品で十分）
        const products = await scrapeKakakuRankingWithEnrichment(seed, {
            targetCount: 5,
            maxEnrich: 3,  // スペック調査なので3商品で十分
        });

        if (products.length === 0) {
            console.log('   ⚠️ 価格.comで商品が見つかりませんでした');
            return { labels: [], details: '' };
        }

        // 返ってきた商品の kakakuSpecs から全スペック項目を収集
        const specLabels = new Map(); // label → { sampleValue, count }

        products.forEach(p => {
            if (p.kakakuSpecs && typeof p.kakakuSpecs === 'object') {
                Object.entries(p.kakakuSpecs).forEach(([label, value]) => {
                    if (!specLabels.has(label)) {
                        specLabels.set(label, { sampleValue: String(value).slice(0, 40), count: 0 });
                    }
                    specLabels.get(label).count++;
                });
            }
        });

        // 全スペック項目をレポート
        const labels = [...specLabels.keys()];
        const details = [...specLabels.entries()]
            .map(([label, info]) => `${label} (例: ${info.sampleValue})`)
            .join('\n  ');

        console.log(`\n   📋 スペック調査結果 (${specLabels.size} 項目):`);
        specLabels.forEach((info, label) => {
            console.log(`      ${label} = ${info.sampleValue} (${info.count}商品)`);
        });
        console.log(`\n   🎯 利用可能スペック: ${labels.length} 項目`);

        return { labels, details };

    } catch (e) {
        console.log(`   ⚠️ スペック調査エラー: ${e.message}`);
        return { labels: [], details: '' };
    }
}

// ==========================================
// 📊 Googleサジェストで需要を検証
// ==========================================
async function fetchSuggestions(query) {
    try {
        const url = `http://suggestqueries.google.com/complete/search?client=firefox&hl=ja&gl=jp&q=${encodeURIComponent(query)}`;
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
        return (res.data && res.data[1]) ? res.data[1] : [];
    } catch { return []; }
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function safeReadJson(filePath, fallback = []) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
        return fallback;
    }
}

function legacyNormalizeIntentText(value) {
    return String(value || '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[\s\u3000\-_/・、。,.!！?？"'`()\[\]{}]+/g, '')
        .trim();
}

function legacyBuildKeywordTailSignal(seed, keyword) {
    const seedSlug = keywordToEnglishSlug(seed);
    const keywordSlug = keywordToEnglishSlug(keyword);

    if (keywordSlug.startsWith(`${seedSlug}-`)) {
        return keywordSlug.slice(seedSlug.length + 1).toLowerCase();
    }

    return keywordSlug.toLowerCase();
}

function legacyBuildPublishedIntentIndex(seed) {
    const articles = safeReadJson(ARTICLES_JSON_PATH, []);
    const seedSlug = keywordToEnglishSlug(seed);
    const exactKeywordSignals = new Set();
    const slugSignals = new Set();
    const situationSignals = new Set();

    const relevantArticles = articles.filter((article) => {
        const tags = Array.isArray(article.tags) ? article.tags : [];
        const slug = String(article.slug || article.id || '');

        return (
            tags.includes(seed) ||
            String(article.title || '').includes(seed) ||
            slug === seedSlug ||
            slug.startsWith(`${seedSlug}-`)
        );
    });

    relevantArticles.forEach((article) => {
        const slug = String(article.slug || article.id || '').toLowerCase();
        const tags = Array.isArray(article.tags) ? article.tags : [];

        if (slug) {
            slugSignals.add(slug);
        }

        const tailSignal = legacyBuildKeywordTailSignal(seed, slug);
        if (tailSignal && tailSignal !== seedSlug) {
            situationSignals.add(tailSignal);
        }

        tags
            .filter((tag) => tag && tag !== seed && tag !== 'ランキング' && !/^20\d{2}/.test(tag))
            .forEach((tag) => {
                const normalizedTag = legacyNormalizeIntentText(tag);
                const tagSlug = keywordToEnglishSlug(tag).toLowerCase();

                if (normalizedTag) {
                    situationSignals.add(normalizedTag);
                    exactKeywordSignals.add(legacyNormalizeIntentText(`${seed} ${tag}`));
                }

                if (tagSlug) {
                    situationSignals.add(tagSlug);
                }
            });
    });

    return {
        relevantArticleCount: relevantArticles.length,
        exactKeywordSignals,
        slugSignals,
        situationSignals,
    };
}

function legacyPreFilterSituationKeywords(seed, candidates) {
    const publishedIntentIndex = legacyBuildPublishedIntentIndex(seed);
    const seenSignals = new Set();
    const approvedCandidates = [];
    const skippedCandidates = [];

    for (const candidate of candidates) {
        const keywordSignal = legacyNormalizeIntentText(candidate.baseQuery);
        const situationSignal = legacyNormalizeIntentText(candidate.situation);
        const keywordSlug = keywordToEnglishSlug(candidate.baseQuery).toLowerCase();
        const tailSignal = legacyBuildKeywordTailSignal(seed, candidate.baseQuery);
        const candidateSignals = [keywordSignal, situationSignal, keywordSlug, tailSignal].filter(Boolean);

        let skipReason = '';

        if (!situationSignal) {
            skipReason = 'empty_intent_signal';
        } else if ((candidate.demandScore || 0) <= 0) {
            skipReason = 'zero_demand';
        } else if (candidateSignals.some((signal) =>
            publishedIntentIndex.exactKeywordSignals.has(signal) ||
            publishedIntentIndex.slugSignals.has(signal) ||
            publishedIntentIndex.situationSignals.has(signal)
        )) {
            skipReason = 'already_published';
        } else if (candidateSignals.some((signal) => seenSignals.has(signal))) {
            skipReason = 'duplicate_in_run';
        }

        if (skipReason) {
            skippedCandidates.push({ ...candidate, skipReason });
            continue;
        }

        candidateSignals.forEach((signal) => seenSignals.add(signal));
        approvedCandidates.push(candidate);
    }

    return {
        approvedCandidates,
        skippedCandidates,
        publishedIntentIndex,
    };
}

function buildPublishedIntentIndex(seed) {
    const articles = safeReadJson(ARTICLES_JSON_PATH, []);
    const seedFingerprint = buildKeywordFingerprint({
        seed,
        keyword: seed,
        tags: [seed],
    });
    const seedSlug = String(seedFingerprint.seedSlug || seedFingerprint.baseSlug || '').toLowerCase();

    const relevantArticles = articles
        .map((article) => {
            const tags = Array.isArray(article.tags) ? article.tags : [];
            const fingerprint = buildKeywordFingerprint({
                seed,
                keyword: `${seed} ${tags.join(' ')}`.trim(),
                slug: article.slug || article.id,
                title: article.title,
                tags,
                categoryId: article.categoryId || article.category,
                subCategoryId: article.subCategoryId,
            });

            return {
                articleId: String(article.id || article.slug || ''),
                slug: String(article.slug || article.id || ''),
                title: String(article.title || ''),
                tags,
                fingerprint,
            };
        })
        .filter((entry) => {
            if (seedFingerprint.canonicalSubCategoryId && entry.fingerprint.canonicalSubCategoryId) {
                return entry.fingerprint.canonicalSubCategoryId === seedFingerprint.canonicalSubCategoryId;
            }

            return (
                entry.tags.includes(seed) ||
                entry.title.includes(seed) ||
                entry.slug.toLowerCase() === seedSlug ||
                entry.slug.toLowerCase().startsWith(`${seedSlug}-`)
            );
        });

    return {
        relevantArticleCount: relevantArticles.length,
        seedFingerprint,
        existingFingerprints: relevantArticles,
    };
}

function preFilterSituationKeywords(seed, candidates) {
    const publishedIntentIndex = buildPublishedIntentIndex(seed);
    const acceptedFingerprints = [];
    const approvedCandidates = [];
    const skippedCandidates = [];

    for (const candidate of candidates) {
        let skipReason = '';
        let matchedAgainst = '';
        const candidateFingerprint = buildKeywordFingerprint({
            seed,
            keyword: candidate.baseQuery,
            tags: [candidate.situation],
        });
        const hasDistinctIntent = (
            candidateFingerprint.intentTokens.length > 0 ||
            (
                candidateFingerprint.baseSlug &&
                candidateFingerprint.seedSlug &&
                candidateFingerprint.baseSlug !== candidateFingerprint.seedSlug
            )
        );

        if (!candidateFingerprint.canonicalSubCategoryId || !hasDistinctIntent) {
            skipReason = 'empty_intent_signal';
        } else if ((candidate.demandScore || 0) <= 0) {
            skipReason = 'zero_demand';
        } else {
            const publishedMatch = publishedIntentIndex.existingFingerprints.find((entry) => {
                const comparison = compareFingerprints(candidateFingerprint, entry.fingerprint);
                if (!comparison.isDuplicate) {
                    return false;
                }

                matchedAgainst = `article:${entry.articleId || entry.slug}:${comparison.reason}`;
                return true;
            });

            if (publishedMatch) {
                skipReason = 'already_published';
            }
        }

        if (!skipReason) {
            const inRunMatch = acceptedFingerprints.find((entry) => {
                const comparison = compareFingerprints(candidateFingerprint, entry.fingerprint);
                if (!comparison.isDuplicate) {
                    return false;
                }

                matchedAgainst = `run:${entry.baseQuery}:${comparison.reason}`;
                return true;
            });

            if (inRunMatch) {
                skipReason = 'duplicate_in_run';
            }
        }

        if (skipReason) {
            skippedCandidates.push({ ...candidate, skipReason, matchedAgainst });
            continue;
        }

        approvedCandidates.push(candidate);
        acceptedFingerprints.push({
            baseQuery: candidate.baseQuery,
            fingerprint: candidateFingerprint,
        });
    }

    return {
        approvedCandidates,
        skippedCandidates,
        publishedIntentIndex,
    };
}

function validateBlueprintShape(blueprint) {
    if (!blueprint || blueprint.status !== 'APPROVED') {
        return { isValid: true };
    }

    const issues = [];

    if (!blueprint.title || blueprint.title.length < 12) {
        issues.push('title');
    }
    if (!blueprint.search_intent_analysis || blueprint.search_intent_analysis.length < 40) {
        issues.push('search_intent_analysis');
    }
    if (!blueprint.target_reader || blueprint.target_reader.length < 10) {
        issues.push('target_reader');
    }
    if (!blueprint.comparison_axis || blueprint.comparison_axis.length < 4) {
        issues.push('comparison_axis');
    }
    if (!blueprint.intro_structure?.hook || !blueprint.intro_structure?.background_explanation) {
        issues.push('intro_structure');
    }
    if (!Array.isArray(blueprint.ranking_criteria) || blueprint.ranking_criteria.length < 2) {
        issues.push('ranking_criteria');
    }
    if (!Array.isArray(blueprint.required_features)) {
        blueprint.required_features = [];
    }
    if (
        Number.isFinite(blueprint.price_min) &&
        Number.isFinite(blueprint.price_max) &&
        blueprint.price_max > 0 &&
        blueprint.price_min > blueprint.price_max
    ) {
        const temp = blueprint.price_min;
        blueprint.price_min = blueprint.price_max;
        blueprint.price_max = temp;
    }

    return {
        isValid: issues.length === 0,
        reason: issues.length > 0 ? `Incomplete blueprint: ${issues.join(', ')}` : '',
    };
}

function safeFileSegment(value) {
    return String(value || '')
        .normalize('NFKC')
        .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
        .replace(/\s+/g, '_')
        .slice(0, 120);
}

async function precheckSituationKeywordsWithKakaku(seed, candidates) {
    const { scrapeKakakuRankingWithEnrichment } = require('./lib/market_research');
    if (!fs.existsSync(MINER_CACHE_DIR)) {
        fs.mkdirSync(MINER_CACHE_DIR, { recursive: true });
    }

    const viableCandidates = [];
    const skippedCandidates = [];

    console.log(`\n🧪 Phase 1.75: Kakaku viability precheck (${candidates.length} situations)...\n`);

    for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        process.stdout.write(`   [${i + 1}/${candidates.length}] "${candidate.baseQuery}" `);

        const cachePath = path.join(MINER_CACHE_DIR, `${safeFileSegment(candidate.baseQuery)}.json`);
        let cachedResult = null;

        if (fs.existsSync(cachePath)) {
            try {
                cachedResult = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            } catch (error) {
                cachedResult = null;
            }
        }

        let viabilityResult = cachedResult;

        if (!viabilityResult) {
            try {
                const products = await scrapeKakakuRankingWithEnrichment(candidate.baseQuery, {
                    targetCount: 6,
                    maxEnrich: 4,
                });

                const evaluation = evaluateSituationKeywordViability({
                    seed,
                    situationData: candidate,
                    products,
                });

                viabilityResult = {
                    fetchedAt: new Date().toISOString(),
                    productCount: products.length,
                    evaluation,
                };
                fs.writeFileSync(cachePath, JSON.stringify(viabilityResult, null, 2));
            } catch (error) {
                viabilityResult = {
                    fetchedAt: new Date().toISOString(),
                    productCount: 0,
                    evaluation: {
                        isViable: false,
                        skipReason: 'kakaku_lookup_failed',
                        measurableAxes: [],
                    },
                    error: error.message,
                };
                fs.writeFileSync(cachePath, JSON.stringify(viabilityResult, null, 2));
            }
        }

        const evaluation = viabilityResult.evaluation || {};
        if (evaluation.isViable) {
            const axisSummary = (evaluation.measurableAxes || [])
                .map((axis) => `${axis.axisTitle} (${axis.matchedLabels.join(' / ')})`)
                .join(', ');
            console.log(`✅ measurable: ${axisSummary}`);
            viableCandidates.push({
                ...candidate,
                kakakuViability: evaluation,
            });
        } else {
            console.log(`❌ ${evaluation.skipReason || 'not_viable'}`);
            skippedCandidates.push({
                ...candidate,
                skipReason: evaluation.skipReason || 'not_viable',
                kakakuViability: evaluation,
            });
        }

        await delay(300);
    }

    return {
        viableCandidates,
        skippedCandidates,
    };
}

// ==========================================
// 🔍 PHASE 1: SITUATION KEYWORD MINING
// ==========================================
async function mineSituationKeywords(seed, specDetails = '') {
    // AIが seed + スペック情報 に合わせた状況サフィックスを動的生成
    const SITUATION_SUFFIXES = await generateSituationSuffixes(seed, specDetails);

    console.log(`\n🎯 Phase 1: Mining Situation-Based Keywords for "${seed}"...`);
    console.log(`   Testing ${SITUATION_SUFFIXES.length} situation suffixes...\n`);

    const validatedKeywords = [];
    let count = 0;

    for (const suffix of SITUATION_SUFFIXES) {
        count++;
        const query = `${seed} ${suffix}`;
        process.stdout.write(`   [${count}/${SITUATION_SUFFIXES.length}] "${query}" `);

        // Get suggestions for this query
        const suggestions = await fetchSuggestions(query);

        // Check if the query itself or similar appears in suggestions
        const hasExactMatch = suggestions.some(s => s.toLowerCase().includes(suffix.toLowerCase()));
        const hasSeedMatch = suggestions.length > 0;

        if (hasExactMatch || hasSeedMatch) {
            // Filter out excluded patterns
            const isExcluded = EXCLUDE_PATTERNS.some(p =>
                suggestions.some(s => s.includes(p))
            );

            // Get related suggestions that are NOT generic rankings
            const relevantSuggestions = suggestions.filter(s => {
                // Must contain the seed keyword
                if (!s.includes(seed)) return false;
                // Must contain the situation suffix
                if (!s.toLowerCase().includes(suffix.toLowerCase())) return false;
                // Must NOT be a generic ranking keyword
                if (EXCLUDE_PATTERNS.some(p => s.includes(p))) return false;
                return true;
            });

            if (relevantSuggestions.length > 0 || hasExactMatch) {
                console.log(`✅ DEMAND FOUND (${suggestions.length} suggestions)`);
                validatedKeywords.push({
                    situation: suffix,
                    baseQuery: query,
                    suggestions: relevantSuggestions.slice(0, 3),
                    demandScore: suggestions.length
                });
            } else if (hasSeedMatch && !isExcluded) {
                console.log(`⚙️ Partial (${suggestions.length})`);
                // Still include if there's some demand
                validatedKeywords.push({
                    situation: suffix,
                    baseQuery: query,
                    suggestions: suggestions.filter(s => s.includes(seed)).slice(0, 2),
                    demandScore: Math.floor(suggestions.length / 2)
                });
            } else {
                console.log(`❌ Excluded/Weak`);
            }
        } else {
            console.log(`❌ No demand`);
        }

        await delay(200); // Rate limiting
    }

    // Sort by demand score
    validatedKeywords.sort((a, b) => b.demandScore - a.demandScore);

    console.log(`\n📊 Found ${validatedKeywords.length} situation-based keywords with demand`);
    return validatedKeywords;
}

// ==========================================
// 🏗️ PHASE 2: BLUEPRINT GENERATION
// ==========================================
async function generateSituationBlueprint(seed, situationData, specResult) {
    const { situation, baseQuery, suggestions } = situationData;
    const specDetails = specResult.details || '';
    const viability = situationData.kakakuViability || {};
    const measurableAxes = Array.isArray(viability.measurableAxes) ? viability.measurableAxes : [];
    const viabilityPromptBlock = measurableAxes.length > 0
        ? measurableAxes
            .map((axis) => `- ${axis.axisTitle}: ${axis.matchedLabels.join(' / ')}`)
            .join('\n')
        : '（事前検証で有効軸なし）';

    // スペック情報は main() で事前取得済み → 引数から受け取る

    const prompt = `
あなたはWebコンテンツ戦略の分析官です。
「${seed}」を「${situation}」という**特定の状況**で使いたいユーザー向けの記事を設計してください。

重要: これは「ランキング記事」ではありません。
「${situation}」という検索ワードには、一般的なおすすめ記事では満たせない**独自の悩み**があります。

## Googleサジェストで見つかった関連キーワード
${suggestions.join(', ') || baseQuery}

## 価格.com 事前検証で「実際に測れる」と確認できた軸
${viabilityPromptBlock}

重要:
- comparison_axis と ranking_criteria は、原則として上の事前検証済みの軸から組み立ててください
- 上の軸にない主観的な評価軸（装着感、音質の良さ、座り心地の良さ等）を comparison_axis に入れてはいけません
- 事前検証済みの軸が1つしかない場合でも、その1軸を中心にして required_features と ranking_criteria を設計してください

## タスク
1. この「状況」で検索する人の**具体的な悩み・不安**を深堀りしてください
2. 一般的なランキング記事では解決できない**この状況特有の選び方ポイント**を特定してください
3. この状況に最適な製品の**必須条件**を、下記の「使用可能スペック」の中から選んでください

## 🚫 禁止事項
- 「○○おすすめランキング」のような汎用タイトルは禁止
- 「通勤電車で〜」のような**他の状況を混ぜる**のは禁止
- 「${situation}」に特化していない内容は禁止

## ✅ 承認基準 (status: APPROVED)
1. **独自性**: この状況ならではの「選び方の基準」が存在する
2. **需要**: 深刻な悩みや、強いこだわりがある
3. **スペック判定可能**: 下記「使用可能スペック」で客観的に製品を絞り込める

## 設計指示

### 1. 検索意図の深掘り (search_intent_analysis)
- この状況にいるユーザーの「隠れた悩み」「本当のペイン」は何か？

### 2. タイトル設計 (title)
- **「誰の」「どんな悩みを」「どう解決するか」**が一目でわかるタイトル
- 必ず「【${situation}】」や状況を示す言葉を含める

### 3. ターゲット読者 (target_reader)
- **徹底的に具体的かつニッチな状況**を描写する。

### 4. 比較軸 (comparison_axis) ★重要★
- そのターゲット層が**「共通して最も重視するポイント」**を主軸にする。
- ★★★ ただし、以下の制約を守ること ★★★
  - 比較軸は**上記のスペック項目で客観的に比較・検証できるもの**に限る
  - ⭕️ 良い例: 「ノイズキャンセリング有無」「防水等級」「重量」「バッテリー時間」「マルチポイント対応」
  - ❌ 悪い例: 「マイク品質」「装着感」「音質の良さ」（スペック表で判定不能、レビューなしでは評価できない）
  - 主観的な評価軸は記事の文章では触れてOKだが、comparison_axisには入れないこと
- カンマ区切りの文字列

### 5. セールスフック (sales_hook)
- その悩みを持つ層全体に対し、「この記事が最適解である」と約束する。

### 6. 導入部設計 (intro_structure)
- hook: 多くの読者が「自分のことだ」と感じる共感
- background_explanation: 従来品ではなぜダメなのか？

### 7. フィルタリング情報 (★最重要: 記事生成スクリプト互換性★)
- **price_min / price_max**: ★★★ 必ず実際の円の数値を入れること。絶対に0にしないこと ★★★
  - その状況のターゲット層が買う現実的な価格帯を設定する（例: 学生向けなら3000〜15000、高級志向なあ20000〜80000）
  - price_min: 0 は密店など高すぎる商品を混ぜない場合のOKだが、price_max: 0 は絶対禁止
  - price_max は「この状況の人が出せる上限」を入れる
- **required_features**: ★★★ 以下のルールを絶対に守ること ★★★
  **【価格.comから実際に取得したスペック項目】**
  以下は実際の商品のスペック表から取得した項目と値の例です。
  required_featuresには、この中から**その状況で必須となるスペック項目名**を選んでください：
  ${specDetails || '（データなし — 空配列 [] にしてください）'}

  - ⭕️ 上記リストに存在するスペック項目名のみ使用可能
  - ⭕️ 値が「○」「対応」のスペック → そのまま有無で判定できる（例: "ノイズキャンセリング"）
  - ⭕️ 値が数値やテキストのスペック → AIが解釈して判定する（例: "防水・防塵性能" の値が "IPX4" → 防水ありと判定）
  - ❌ 上記リストにない項目は絶対に指定禁止（例: "耳掛けフック", "心拍数計測" 等）
  - ※ 該当するスペックがない場合は required_features: [] （空配列）にしてください

### 8. ランキング基準 (ranking_criteria)
- ★ comparison_axis と同様、**スペック表で客観的に検証可能な基準のみ**にすること
- 各基準は上記スペック項目リストと対応していること

## 出力JSON (承認時 - Universal Miner God v12完全互換)
{
  "status": "APPROVED",
  "keyword": "${baseQuery}", 
  "title": "...",
  "search_intent_analysis": "...",
  "intro_structure": { "hook": "...", "background_explanation": "..." },
  "ranking_criteria": ["基準1", "基準2", "基準3"],  // ★スペック検証可能な基準のみ★
  "target_reader": "...",
  "user_demographics": {
    "situation": "${situation}",
    "pain_point": "...",
    "desire": "..."
  },
  "is_specialized_theme": true,
  "comparison_axis": "...",
  "sales_hook": "...",
  "ranking_count": 10,
  "price_min": 3000,   // ★実際の円の数値を入れること。0は禁止★
  "price_max": 30000,  // ★その状況のターゲット層の上限価格★
  "required_features": ["..."]  // ★上記リストからのみ選択★
}

## 出力JSON (却下時)
{ "status": "REJECT", "reason": "却下理由" }
`;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const blueprint = JSON.parse(text);

        // バリデーション: price_max が 0 の場合はデフォルト値を設定
        if (blueprint.status === 'APPROVED') {
            if (!blueprint.price_max || blueprint.price_max === 0) {
                console.log(`   ⚠️ price_max が 0 → 自動修正: 50000`);
                blueprint.price_max = 50000;
            }
            if (blueprint.price_min === undefined || blueprint.price_min === null) {
                blueprint.price_min = 0;
            }
        }

        return blueprint;
    } catch (e) {
        console.log(`   ⚠️ Blueprint generation failed: ${e.message}`);
        return null;
    }
}

// ==========================================
// 🚀 MAIN EXECUTION
// ==========================================
async function main() {
    console.log(`\n🎯 UNIVERSAL MINER - SITUATION EDITION v1`);
    console.log(`   Target: "${SEED_KEYWORD}"`);
    console.log(`   Strategy: Find situation-based niches with verified demand\n`);
    console.log('='.repeat(60));

    // Phase 0: 価格.comからスペック情報を事前取得（1回だけ）
    const specResult = await discoverFilterableSpecs(SEED_KEYWORD);

    // Phase 1: Mine situation keywords（スペック情報込みでAI生成）
    const situationKeywords = await mineSituationKeywords(SEED_KEYWORD, specResult.details);

    if (situationKeywords.length === 0) {
        console.log("\n❌ No situation-based keywords found with demand.");
        return;
    }

    const {
        approvedCandidates,
        skippedCandidates,
        publishedIntentIndex,
    } = preFilterSituationKeywords(SEED_KEYWORD, situationKeywords);

    console.log(`\n🔎 Phase 1.5: Pre-filter before blueprint generation`);
    console.log(`   Published intents checked: ${publishedIntentIndex.relevantArticleCount}`);
    console.log(`   Passed pre-filter: ${approvedCandidates.length}`);
    console.log(`   Skipped before AI: ${skippedCandidates.length}`);

    if (skippedCandidates.length > 0) {
        const skipSummary = skippedCandidates.reduce((acc, item) => {
            acc[item.skipReason] = (acc[item.skipReason] || 0) + 1;
            return acc;
        }, {});

        Object.entries(skipSummary).forEach(([reason, count]) => {
            console.log(`   - ${reason}: ${count}`);
        });
    }

    if (approvedCandidates.length === 0) {
        console.log("\n笶・All mined situations were filtered out before blueprint generation.");
        return;
    }

    // Take top 12 by demand after duplicate filtering to keep the expensive Kakaku precheck practical
    const demandFilteredCandidates = approvedCandidates.slice(0, 12);

    const {
        viableCandidates,
        skippedCandidates: viabilitySkippedCandidates,
    } = await precheckSituationKeywordsWithKakaku(SEED_KEYWORD, demandFilteredCandidates);

    console.log(`\n🔎 Phase 1.75 Summary`);
    console.log(`   Passed Kakaku viability: ${viableCandidates.length}`);
    console.log(`   Rejected by Kakaku viability: ${viabilitySkippedCandidates.length}`);

    if (viabilitySkippedCandidates.length > 0) {
        const viabilitySummary = viabilitySkippedCandidates.reduce((acc, item) => {
            acc[item.skipReason] = (acc[item.skipReason] || 0) + 1;
            return acc;
        }, {});

        Object.entries(viabilitySummary).forEach(([reason, count]) => {
            console.log(`   - ${reason}: ${count}`);
        });
    }

    if (viableCandidates.length === 0) {
        console.log('\n❌ No situations passed Kakaku viability precheck.');
        return;
    }

    const topSituations = viableCandidates;

    console.log(`\n🏗️ Phase 2: Generating Blueprints for top ${topSituations.length} situations...\n`);

    const blueprints = [];
    for (let i = 0; i < topSituations.length; i++) {
        const sit = topSituations[i];
        process.stdout.write(`   [${i + 1}/${topSituations.length}] "${sit.situation}" (Demand: ${sit.demandScore})... `);

        const blueprint = await generateSituationBlueprint(SEED_KEYWORD, sit, specResult);
        const validation = validateBlueprintShape(blueprint);

        if (blueprint && blueprint.status === "APPROVED" && validation.isValid) {
            console.log("✅ APPROVED");
            blueprint.demandScore = sit.demandScore;
            blueprint.googleSuggestions = sit.suggestions;
            blueprints.push({
                keyword: sit.baseQuery,
                situation: sit.situation,
                demandScore: sit.demandScore,
                blueprint: blueprint
            });
        } else {
            const reason = validation.isValid
                ? (blueprint?.reason || blueprint?.status || "Generation failed")
                : validation.reason;
            console.log(`❌ ${reason}`);
        }

        await delay(1500); // Rate limiting for Gemini
    }

    // Save results
    const filename = `SITUATION_BLUEPRINTS_${SEED_KEYWORD.replace(/\s+/g, '_')}.json`;
    fs.writeFileSync(filename, JSON.stringify(blueprints, null, 2));

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✨ MISSION COMPLETE ✨`);
    console.log(`   Found ${situationKeywords.length} situation keywords with demand`);
    console.log(`   Passed pre-filter: ${approvedCandidates.length}`);
    console.log(`   Passed Kakaku viability: ${viableCandidates.length}`);
    console.log(`   Generated ${blueprints.length} approved blueprints`);
    console.log(`   Saved to: ${filename}`);
    console.log(`\n📋 Approved Situations:`);
    blueprints.forEach((b, i) => {
        console.log(`   ${i + 1}. [${b.situation}] ${b.blueprint.title?.slice(0, 50)}...`);
    });
}

main();
