const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { processRakutenLink } = require('./affiliate_processor');
const {
    extractComparisonAxes,
    buildRankingCriteriaSummary,
    stripQuotes,
} = require('./content_guardrails');

/**
 * Convert Japanese keyword to English slug for URL compatibility
 * Xserver Apache doesn't handle Japanese URLs properly
 */
function keywordToEnglishSlug(keyword) {
    // Product category mappings (order matters: longer phrases first)
    const productMappings = {
        'ワイヤレスイヤホン': 'wireless-earphones',
        'ノイズキャンセリング': 'noise-cancelling',
        'イヤホン': 'earphones',
        'ヘッドホン': 'headphones',
        'スピーカー': 'speaker',
        '冷蔵庫': 'refrigerator',
        '洗濯機': 'washing-machine',
        'エアコン': 'air-conditioner',
        'ロボット掃除機': 'robot-vacuum',
        '掃除機': 'vacuum-cleaner',
        'カメラ': 'camera',
        '一眼レフ': 'dslr-camera',
        'ミラーレス': 'mirrorless-camera',
        'テレビ': 'tv',
        'モニター': 'monitor',
        'キーボード': 'keyboard',
        'マウス': 'mouse',
        'タブレット': 'tablet',
        'スマートウォッチ': 'smartwatch',
        '電子レンジ': 'microwave',
        '炊飯器': 'rice-cooker',
        'ドライヤー': 'hair-dryer',
        '空気清浄機': 'air-purifier',
        '加湿器': 'humidifier',
        '除湿機': 'dehumidifier',
        'プロジェクター': 'projector',
        '食洗機': 'dishwasher',
        'オフィスチェア': 'office-chair',
    };

    // Situation / modifier mappings
    const situationMappings = {
        '耳が小さい': 'small-ears',
        'ジム': 'gym',
        '防水': 'waterproof',
        'テレワーク': 'telework',
        '飛行機': 'airplane',
        '睡眠': 'sleep',
        'ゲーム': 'gaming',
        'FPS': 'fps',
        '低遅延': 'low-latency',
        'PC接続': 'pc-connect',
        'パソコン': 'desktop-pc',
        'PC': 'pc',
        'Pixel': 'pixel',
        'Galaxy': 'galaxy',
        'iPhone15': 'iphone15',
        'iPhone14': 'iphone14',
        'iPhone': 'iphone',
        'Mac': 'mac',
        'MacBook': 'macbook',
        'Windows': 'windows',
        'ランニング': 'running',
        '通勤': 'commute',
        '通学': 'school-commute',
        '勉強': 'study',
        'Web会議': 'web-meeting',
        'オンライン会議': 'online-meeting',
        'ASMR': 'asmr',
        '音楽鑑賞': 'music',
        '映画鑑賞': 'movie',
        'おすすめ': 'recommended',
        '1万円以下': 'under-10000yen',
        '2万円以下': 'under-20000yen',
        '3万円以下': 'under-30000yen',
        '5万円以下': 'under-50000yen',
        '高級': 'premium',
        'コスパ': 'cost-effective',
        '初心者': 'beginner',
        '一人暮らし': 'single-living',
        '子供': 'kids',
        'シニア': 'senior',
        '女性': 'women',
        '男性': 'men',
        // Added for blueprint keywords
        'お風呂': 'bath',
        '耳垢': 'earwax',
        '電車': 'train',
        '難聴': 'hearing-loss',
        '落ちない': 'secure-fit',
        '高齢者': 'elderly',
        '中学生': 'junior-high',
        'ライブ': 'live-concert',
        '寝ホン': 'sleep-earphones',
        'スポーツ': 'sports',
        '映画': 'movie',
        'デザイン': 'design',
        '長時間': 'long-hours',
        'コンパクト': 'compact',
        'ゲーミング': 'gaming-chair',
        '小さい': 'small',
        '小さめ': 'petite',
        'リモートワーク': 'remote-work',
        '在宅勤務': 'work-from-home',
        '軽い': 'lightweight',
        '防水': 'waterproof',
        '水拭き': 'mopping',
        '段差': 'step-climbing',
        'カーペット': 'carpet',
        '障害物回避': 'obstacle-avoidance',
        '静音': 'quiet',
        'ペットの毛': 'pet-hair',
        '自動ゴミ収集': 'auto-empty',
        '狭い部屋': 'small-room',
        '二階建て': 'two-story',
        '2階建て': 'two-story',
    };

    // Merge all mappings (product first for exact match)
    const allMappings = { ...productMappings, ...situationMappings };

    // Check for exact match first
    if (allMappings[keyword]) {
        return allMappings[keyword];
    }

    // Try to build a slug from parts
    let slug = keyword;
    const sortedEntries = Object.entries(allMappings).sort((a, b) => b[0].length - a[0].length);
    sortedEntries.forEach(([jp, en]) => {
        slug = slug.replace(new RegExp(jp, 'g'), en);
    });

    // Clean up: replace spaces with hyphens, remove non-ASCII
    slug = slug
        .trim()
        .replace(/\s+/g, '-')           // spaces to hyphens
        .replace(/[^\w\-]/g, '')        // remove non-word chars except hyphens
        .replace(/--+/g, '-')           // collapse multiple hyphens
        .replace(/^-|-$/g, '')          // trim hyphens from ends
        .toLowerCase();

    const productSlugs = new Set(Object.values(productMappings));
    const matchedSituationValues = Object.entries(situationMappings)
        .filter(([jp]) => keyword.includes(jp))
        .map(([, en]) => en);
    const hasModifier = keyword.trim().split(/\s+/).length > 1 || matchedSituationValues.length > 0;

    if (hasModifier && productSlugs.has(slug) && matchedSituationValues.length === 0) {
        const stableSuffix = crypto.createHash('md5').update(keyword).digest('hex').slice(0, 6);
        slug = `${slug}-${stableSuffix}`;
    }

    // If still contains no useful chars, generate a stable hash-based slug
    if (!slug || slug.length < 3) {
        const stableSuffix = crypto.createHash('md5').update(keyword).digest('hex').slice(0, 8);
        slug = `article-${stableSuffix}`;
    }

    return slug;
}

/**
 * Generate tags from keyword for article categorization
 * e.g., "ワイヤレスイヤホン ジム" → ["ワイヤレスイヤホン", "ジム", "ランキング", "2026最新"]
 */
function generateTagsFromKeyword(keyword) {
    const currentYear = new Date().getFullYear();
    const parts = keyword.trim().split(/\s+/);
    const tags = [];

    // Add each word as a tag
    parts.forEach(part => {
        if (part && !tags.includes(part)) {
            tags.push(part);
        }
    });

    // Add standard tags
    tags.push("ランキング");
    tags.push(`${currentYear}最新`);

    return tags;
}

/**
 * Detect category and subCategory from keyword
 * Returns { category, categoryId, subCategoryId }
 */
function detectCategoryFromKeyword(keyword) {
    const kw = keyword.toLowerCase();

    if (kw.match(/イヤホン/) && !kw.match(/ヘッドホン|ヘッドフォン/)) {
        return { category: 'audio', categoryId: 'audio', subCategoryId: 'wireless-earphones' };
    }
    if (kw.match(/ヘッドホン|ヘッドフォン/)) {
        return { category: 'audio', categoryId: 'audio', subCategoryId: 'wireless-headphones' };
    }
    if (kw.match(/スピーカー/)) {
        return { category: 'audio', categoryId: 'audio', subCategoryId: 'speakers' };
    }
    if (kw.match(/冷蔵庫/)) {
        return { category: 'appliances', categoryId: 'appliances', subCategoryId: 'refrigerators' };
    }
    if (kw.match(/洗濯機/)) {
        return { category: 'appliances', categoryId: 'appliances', subCategoryId: 'washing-machines' };
    }
    if (kw.match(/エアコン/)) {
        return { category: 'appliances', categoryId: 'appliances', subCategoryId: 'air-conditioners' };
    }
    if (kw.match(/掃除機/)) {
        return { category: 'appliances', categoryId: 'appliances', subCategoryId: 'vacuum-cleaners' };
    }
    if (kw.match(/カメラ|一眼|ミラーレス/)) {
        return { category: 'camera', categoryId: 'camera', subCategoryId: 'cameras' };
    }
    if (kw.match(/テレビ|モニター/)) {
        return { category: 'display', categoryId: 'display', subCategoryId: 'tvs' };
    }
    if (kw.match(/キーボード|マウス/)) {
        return { category: 'pc-peripherals', categoryId: 'pc-peripherals', subCategoryId: 'input-devices' };
    }
    if (kw.match(/タブレット/)) {
        return { category: 'mobile', categoryId: 'mobile', subCategoryId: 'tablets' };
    }
    if (kw.match(/スマートウォッチ/)) {
        return { category: 'wearable', categoryId: 'wearable', subCategoryId: 'smartwatches' };
    }
    if (kw.match(/電子レンジ|炊飯器|食洗機/)) {
        return { category: 'kitchen', categoryId: 'kitchen', subCategoryId: 'kitchen-appliances' };
    }
    if (kw.match(/ドライヤー/)) {
        return { category: 'beauty', categoryId: 'beauty', subCategoryId: 'hair-dryers' };
    }
    if (kw.match(/空気清浄機|加湿器|除湿機/)) {
        return { category: 'appliances', categoryId: 'appliances', subCategoryId: 'air-quality' };
    }
    if (kw.match(/プロジェクター/)) {
        return { category: 'display', categoryId: 'display', subCategoryId: 'projectors' };
    }
    if (kw.match(/オフィスチェア|椅子/)) {
        return { category: 'interior', categoryId: 'interior', subCategoryId: 'office-chairs' };
    }
    // Default
    return { category: 'gadgets', categoryId: 'gadgets', subCategoryId: 'general' };
}

/**
 * Generate dynamic spec labels based on keyword/category
 */
function toSpecLabels(labels = []) {
    const normalized = Array.from(new Set(labels.filter(Boolean))).slice(0, 4);

    return {
        spec1: normalized[0] || '性能',
        spec2: normalized[1] || '機能',
        spec3: normalized[2] || '価格',
        spec4: normalized[3] || '使いやすさ',
    };
}

function generateDefaultLabels(keyword, blueprint = {}) {
    const kw = keyword.toLowerCase();
    let fallbackLabels = ['性能', '機能', 'コスパ', '評価'];

    // Audio category
    if (kw.match(/イヤホン|ヘッドホン|スピーカー/)) {
        fallbackLabels = ['音質', 'ノイキャン', 'バッテリー', '機能'];
    }
    // Home appliances
    else if (kw.match(/冷蔵庫/)) {
        fallbackLabels = ['容量', '省エネ', '機能', 'サイズ'];
    }
    else if (kw.match(/洗濯機/)) {
        fallbackLabels = ['容量', '乾燥機能', '静音性', '省エネ'];
    }
    else if (kw.match(/エアコン/)) {
        fallbackLabels = ['適用畳数', '省エネ', '機能', '静音性'];
    }
    else if (kw.match(/掃除機/)) {
        fallbackLabels = ['吸引力', '稼働時間', '軽さ', '機能'];
    }
    else if (kw.match(/オフィスチェア|椅子/)) {
        fallbackLabels = ['腰の支え方', '座面クッション性', 'アームレスト調整', '座り心地と蒸れにくさ'];
    }
    // Camera
    else if (kw.match(/カメラ|一眼/)) {
        fallbackLabels = ['画質', 'AF性能', '動画性能', '携帯性'];
    }

    const axes = extractComparisonAxes(blueprint, fallbackLabels);
    return toSpecLabels([...axes, ...fallbackLabels]);
}

/**
 * Generate dynamic buying guide steps based on keyword/blueprint
 */
function getGuideStepDescription(axis) {
    const label = String(axis || '').toLowerCase();

    if (/価格|コスパ|cost|value/.test(label)) {
        return `「${axis}」の差で何が変わるのか、予算とのバランスを見極めます。`;
    }

    if (/サイズ|寸法|幅|奥行|高さ|weight|重さ|軽さ/.test(label)) {
        return `「${axis}」が設置しやすさや毎日の使いやすさにどう影響するかを確認します。`;
    }

    if (/静音|騒音|noise|ノイキャン/.test(label)) {
        return `「${axis}」の違いが生活ストレスや使えるシーンにどう響くかを整理します。`;
    }

    if (/容量|バッテリー|稼働時間|電池|充電|省エネ/.test(label)) {
        return `「${axis}」を見て、毎日の運用コストや持続力に無理がないか判断します。`;
    }

    return `「${axis}」を軸に、用途ごとの向き不向きと選ぶ基準をわかりやすく整理します。`;
}

function generateBuyingGuideSteps(keyword, blueprint = {}) {
    const fallbackLabels = Object.values(generateDefaultLabels(keyword, blueprint));
    const axes = extractComparisonAxes(blueprint, fallbackLabels);
    const stepLabels = Array.from(new Set([
        ...axes,
        ...fallbackLabels,
    ])).filter(Boolean).slice(0, 3);

    return stepLabels.map((label, index) => ({
        icon: 'check',
        title: `${index + 1}. ${label}`,
        description: getGuideStepDescription(label),
    }));
}

/**
 * Helper: Select icon based on label text
 */
function getIconForLabel(label) {
    if (!label) return "check_circle";
    const l = label.toLowerCase();
    if (l.match(/音|サウンド|sound/)) return "graphic_eq";
    if (l.match(/ノイキャン|静寂|noise/)) return "noise_control_off";
    if (l.match(/バッテリー|電池|充電|稼働|battery/)) return "battery_charging_full";
    if (l.match(/機能|多機能|function/)) return "settings";
    if (l.match(/サイズ|大きさ|寸法|size|width/)) return "straighten";
    if (l.match(/重さ|重量|軽さ|weight/)) return "weight";
    if (l.match(/容量|収納|capacity/)) return "inventory_2";
    if (l.match(/画質|解像度|image|reoslution/)) return "hd";
    if (l.match(/省エネ|電気代|eco/)) return "eco";
    if (l.match(/デザイン|見た目|color|design/)) return "palette";
    if (l.match(/吸引力|suction/)) return "cleaning_services";
    if (l.match(/乾燥/)) return "wb_sunny";
    return "check_circle";
}

function normalizeSpecLookupText(value) {
    return String(value || '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[【】()[\]{}「」『』、,・:：]/g, '')
        .replace(/の有無$/u, '')
        .replace(/機能$|性能$|対応$/u, '')
        .replace(/自動(?=リフトアップ)/u, '')
        .trim();
}

function buildSpecAliases(label) {
    const normalized = normalizeSpecLookupText(label);
    const aliases = new Set([normalized]);

    if (/モップ.*洗浄.*乾燥/u.test(normalized)) {
        aliases.add('モップ自動洗浄乾燥');
        aliases.add('モップ洗浄乾燥');
    }

    if (/モップ.*リフトアップ/u.test(normalized)) {
        aliases.add('モップリフトアップ');
        aliases.add('モップ自動リフトアップ');
    }

    if (/障害物回避|センサー|マッピング/u.test(normalized)) {
        aliases.add('障害物回避');
        aliases.add('衝突防止');
        aliases.add('センサー');
        aliases.add('マッピング');
    }

    if (/自動ゴミ収集|ゴミ収集|ゴミ捨て/u.test(normalized)) {
        aliases.add('自動ゴミ収集');
        aliases.add('ゴミ収集');
        aliases.add('ダストステーション');
        aliases.add('紙パック');
    }

    if (/静音|騒音|運転音/u.test(normalized)) {
        aliases.add('静音');
        aliases.add('騒音');
        aliases.add('運転音');
    }

    if (/バッテリー|連続再生|稼働時間|運転時間/u.test(normalized)) {
        aliases.add('バッテリー');
        aliases.add('連続再生時間');
        aliases.add('稼働時間');
        aliases.add('最長運転時間連続使用時間');
    }

    return Array.from(aliases).filter(Boolean);
}

function findSpecValueByLabel(product = {}, label = '') {
    const aliases = buildSpecAliases(label);
    if (aliases.length === 0) {
        return '';
    }

    const candidates = [];

    const pushCandidate = (specLabel, value, priority) => {
        if (!specLabel || value === undefined || value === null || value === '') {
            return;
        }

        const normalizedLabel = normalizeSpecLookupText(specLabel);
        if (!normalizedLabel) {
            return;
        }

        let score = -1;
        for (const alias of aliases) {
            if (normalizedLabel === alias) {
                score = Math.max(score, priority + 100);
            } else if (normalizedLabel.includes(alias) || alias.includes(normalizedLabel)) {
                score = Math.max(score, priority + 60);
            }
        }

        if (score < 0) {
            return;
        }

        candidates.push({
            label: specLabel,
            value: String(value),
            score,
        });
    };

    Object.entries(product.kakakuSpecs || {}).forEach(([specLabel, value]) => {
        pushCandidate(specLabel, value, 200);
    });

    (product.specs || []).forEach((spec) => {
        pushCandidate(spec?.label, spec?.value, 100);
    });

    candidates.sort((a, b) => b.score - a.score || a.label.length - b.label.length);
    return candidates[0]?.value || '';
}

// Helper to save file
function saveMarkdown(filePath, content) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Deduplicate any repeated h2 headers
    const h2Match = content.match(/^##\s+(.+)$/m);
    if (h2Match) {
        const anchor = h2Match[0];
        if (content.split(anchor).length > 2) {
            console.warn(`  ☢️ Generator: Deduplication Triggered for ${path.basename(filePath)}`);
            const parts = content.split(anchor);
            content = parts[0] + anchor + parts[1];
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  📝 Saved: ${path.basename(filePath)}`);
}

// 1. Generate Main Ranking Article (Buying Guide Only)
// 1. Generate Main Ranking Article (Buying Guide Only)
function syncSelectionCountInTitle(title, count) {
    if (!title || !count) return title;
    return title.replace(/\d+\s*選/g, `${count}選`);
}

function generateRankingArticle(targetKeyword, products, productsData, bodyContent, seoMetadata, overrideImage = null) {
    const dateStr = new Date().toISOString().split('T')[0];
    const topProduct = productsData.find(p => p.id === products[0].id);

    // Use Override Image (AI Thumbnail) if provided, otherwise Top Product Image
    const topImage = overrideImage ? overrideImage : (topProduct.image ? topProduct.image.trim() : "");

    // Use AI Material if provided, otherwise fallback
    const articleBody = bodyContent || "コンテンツ生成中...";
    const currentYear = new Date().getFullYear();
    const title = syncSelectionCountInTitle(
        stripQuotes(seoMetadata?.title || `【${currentYear}年】${targetKeyword} おすすめランキング`),
        products.length
    );
    const description = stripQuotes(seoMetadata?.description || `${currentYear}年最新の${targetKeyword}市場を調査。`);

    const { category } = detectCategoryFromKeyword(targetKeyword);

    // NOTE: Ranking table removed - frontend components handle the rich display
    // The ranking table was causing duplicate content in the article

    const content = `---
title: "${title}"
description: "${description}"
date: "${dateStr}"
category: "${category}"
author: "ChoiceGuide編集部"
thumbnail: "${topImage}"
---

${articleBody}
`;

    // Ensure directory exists
    const dir = path.resolve(__dirname, '../../src/content/articles');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const englishSlug = keywordToEnglishSlug(targetKeyword);
    const fileName = `${englishSlug}.md`;
    saveMarkdown(path.join(dir, fileName), content);
}

// 2. Generate Individual Review Page
function generateReviewPage(product, bodyContent) {
    const dateStr = new Date().toISOString().split('T')[0];
    const image = product.image ? product.image.trim() : "";

    // Sanitize product name for YAML (escape quotes, remove problematic characters)
    const safeName = product.name
        .replace(/"/g, "'")  // Replace double quotes with single quotes
        .replace(/:/g, "")   // Remove colons that could break YAML
        .slice(0, 80);       // Limit length to avoid overly long titles

    // NOTE: Spec table REMOVED - ProductContent.tsx handles structured spec display
    // Writing specs here causes duplicate display (frontend already shows product.specs)

    // Dynamic ranking URL from the keyword context
    const rankingSlug = product.rankingSlug || keywordToEnglishSlug(product.rankingKeyword || '');
    const rankingUrl = rankingSlug ? `/rankings/${rankingSlug}/` : '/rankings/';

    const content = `---
title: "${safeName} レビュー｜特徴・注意点・向いている人"
description: "${safeName}の特徴や注意点を、スペックとユーザー評価をもとに整理。どんな人に向いているかをわかりやすく解説。"
date: "${dateStr}"
category: "Reviews"
product_id: "${product.id}"
author: "ChoiceGuide編集部"
thumbnail: "${image}"
ranking_url: "${rankingUrl}"
---

${bodyContent || ""}



`;

    // Ensure directory exists
    const dir = path.resolve(__dirname, '../../src/content/reviews');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const fileName = `${product.id}.md`;
    saveMarkdown(path.join(dir, fileName), content);
}

function normalizeLegacyReviewFrontmatter() {
    const reviewDir = path.resolve(__dirname, '../../src/content/reviews');
    if (!fs.existsSync(reviewDir)) {
        return 0;
    }

    const reviewFiles = fs.readdirSync(reviewDir).filter((name) => name.endsWith('.md') || name.endsWith('.mdx'));
    let updatedCount = 0;

    reviewFiles.forEach((fileName) => {
        const filePath = path.join(reviewDir, fileName);
        const raw = fs.readFileSync(filePath, 'utf8');
        const lines = raw.split(/\r?\n/);
        const titleIndex = lines.findIndex((line) => line.startsWith('title:'));
        const descriptionIndex = lines.findIndex((line) => line.startsWith('description:'));
        const authorIndex = lines.findIndex((line) => line.startsWith('author:'));

        const rawTitleValue = titleIndex >= 0 ? lines[titleIndex].replace(/^title:\s*"?/u, '').replace(/"?$/u, '').trim() : '';
        const rawDescriptionValue = descriptionIndex >= 0 ? lines[descriptionIndex].replace(/^description:\s*"?/u, '').replace(/"?$/u, '').trim() : '';
        const baseName = rawTitleValue
            .split('レビュー')[0]
            .replace(/^"+|"+$/gu, '')
            .trim();

        const safeBaseName = baseName || '製品';
        const nextTitle = `${safeBaseName} レビュー｜特徴・注意点・向いている人`;
        const nextDescription = `${safeBaseName}の特徴や注意点を、スペックとユーザー評価をもとに整理。どんな人に向いているかをわかりやすく解説。`;

        const needsNormalization =
            /プロが教える|実機レビュー|編雁|編集部/u.test(raw) ||
            rawTitleValue !== nextTitle ||
            rawDescriptionValue !== nextDescription;

        if (needsNormalization) {
            if (titleIndex >= 0) {
                lines[titleIndex] = `title: "${nextTitle}"`;
            }
            if (descriptionIndex >= 0) {
                lines[descriptionIndex] = `description: "${nextDescription}"`;
            }
            if (authorIndex >= 0) {
                lines[authorIndex] = 'author: "ChoiceGuide編集部"';
            }

            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            updatedCount += 1;
        }
    });

    return updatedCount;
}

// 3. Update articles.json Database
function updateDatabase(targetKeyword, products, productsData, seoMetadata, blueprint = {}, aiThumbnail = null) {
    const dbPath = path.resolve(__dirname, '../../src/data/articles.json');
    let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Variable declarations (restored)
    const dateStr = new Date().toISOString().split('T')[0];
    const topProduct = productsData.find(p => p.id === products[0]?.id) || products[0] || {};
    const defaultLabels = generateDefaultLabels(targetKeyword, blueprint);
    const currentYear = new Date().getFullYear();
    const fallbackLabels = Object.values(defaultLabels);
    const criteriaSummary = buildRankingCriteriaSummary({
        keyword: targetKeyword,
        blueprint,
        fallbackLabels,
    });
    const baseRankingCriteriaTitles = Array.from(new Set([
        ...(seoMetadata?.rankingCriteriaTitles || []),
        ...criteriaSummary.pointTitles,
    ])).filter(Boolean).slice(0, 4);
    const rankingCriteriaTitles = Array.from(new Set([
        ...baseRankingCriteriaTitles,
        ...fallbackLabels,
    ])).filter(Boolean).slice(0, 4);
    const specLabelCandidates = rankingCriteriaTitles.length > 0
        ? rankingCriteriaTitles
        : fallbackLabels;
    const title = syncSelectionCountInTitle(
        stripQuotes(seoMetadata?.title || `【${currentYear}年】${targetKeyword} おすすめランキング`),
        products.length
    );
    const description = stripQuotes(
        seoMetadata?.description || `${targetKeyword}のおすすめ人気ランキング。選び方や比較ポイントも解説。`
    );
    const specLabels = toSpecLabels(specLabelCandidates);

    // Use AI Thumbnail if provided and valid, otherwise fallback to top product image
    const finalThumbnail = (aiThumbnail && aiThumbnail !== '/images/placeholder.jpg')
        ? aiThumbnail
        : (topProduct.image || '/images/placeholder.jpg');

    const englishSlug = keywordToEnglishSlug(targetKeyword);

    const newEntry = {
        id: englishSlug,
        slug: englishSlug,
        title: title,
        description: description,
        publishedAt: dateStr,
        updatedDate: dateStr,
        image: finalThumbnail, // Main image for OG and Listing
        thumbnail: finalThumbnail, // Thumbnail for article header
        author: "ChoiceGuide編集部",
        ...detectCategoryFromKeyword(targetKeyword),
        tags: generateTagsFromKeyword(targetKeyword),
        rankingCriteria: {
            description: stripQuotes(seoMetadata?.rankingCriteriaDescription || criteriaSummary.description),
            points: rankingCriteriaTitles.map((label) => ({
                icon: getIconForLabel(label),
                title: label,
            }))
        },
        specLabels: specLabels,

        rankingItems: products.map((p, index) => {
            // Search by both ID and ASIN for robustness
            const data = productsData.find(d => d.id === p.id || d.asin === p.asin) || p;

            // MAP SPECS TO KEYS for Comparison Table
            const specsObj = {};
            Object.entries(specLabels).forEach(([key, label]) => {
                specsObj[key] = findSpecValueByLabel(data, label);
            });

            return {
                rank: index + 1,
                productId: p.id,
                badge: data.badge || "おすすめ",
                rankBadge: index === 0 ? "gold" : index === 1 ? "silver" : "bronze",
                // Use calculated rating from evaluated list (p), fallback to data, then spread
                rating: p.calculatedRating || data.calculatedRating || Math.round((4.9 - index * 0.1) * 10) / 10,
                pros: data.pros || [],
                cons: data.cons || [],
                specs: data.specs || [],
                ...specsObj
            };
        }),
        buyingGuide: {
            title: "失敗しない選び方",
            steps: generateBuyingGuideSteps(targetKeyword, blueprint)
        },
        products: products.map(p => p.id)
    };

    // Remove existing if exists (check both old Japanese and new English slugs)
    db = db.filter(item => item.id !== englishSlug && item.id !== targetKeyword);
    // Add new (at top)
    db.unshift(newEntry);

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 4), 'utf8');
    console.log(`  💾 Database Updated: articles.json`);
}

/**
 * Generate sitemap.xml from articles.json
 * Idempotent - can be run multiple times without creating duplicates
 */
function generateSitemap() {
    const baseUrl = 'https://choiceguide.jp';
    const today = new Date().toISOString().split('T')[0];

    // Read all articles from database
    const dbPath = path.resolve(__dirname, '../../src/data/articles.json');
    let articles = [];
    try {
        articles = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
        console.error('  ⚠️ Failed to read articles.json for sitemap:', e.message);
    }

    // Use Set to prevent duplicates
    const urls = new Set();

    // Static pages
    const staticPages = [
        { loc: '/', priority: '1.0', changefreq: 'daily' },
        { loc: '/about/', priority: '0.5', changefreq: 'monthly' },
        { loc: '/contact/', priority: '0.5', changefreq: 'monthly' },
        { loc: '/privacy/', priority: '0.3', changefreq: 'yearly' },
    ];

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach(page => {
        const fullUrl = `${baseUrl}${page.loc}`;
        if (!urls.has(fullUrl)) {
            urls.add(fullUrl);
            xml += `  <url>\n`;
            xml += `    <loc>${fullUrl}</loc>\n`;
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += `  </url>\n`;
        }
    });

    // Add article pages (rankings)
    articles.forEach(article => {
        const slug = article.slug || article.id;
        // Skip if slug contains Japanese characters (old format)
        if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(slug)) {
            return;
        }
        const fullUrl = `${baseUrl}/rankings/${encodeURIComponent(slug)}/`;
        if (!urls.has(fullUrl)) {
            urls.add(fullUrl);
            const lastmod = article.updatedDate || article.publishedAt || today;
            xml += `  <url>\n`;
            xml += `    <loc>${fullUrl}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.8</priority>\n`;
            xml += `  </url>\n`;
        }
    });

    xml += '</urlset>\n';

    // Write to public folder
    const sitemapPath = path.resolve(__dirname, '../../public/sitemap.xml');
    fs.writeFileSync(sitemapPath, xml, 'utf8');
    console.log(`  🗺️  Sitemap Updated: sitemap.xml (${urls.size} URLs)`);
}

module.exports = { generateRankingArticle, generateReviewPage, updateDatabase, generateDefaultLabels, generateSitemap, keywordToEnglishSlug, detectCategoryFromKeyword, normalizeLegacyReviewFrontmatter };
