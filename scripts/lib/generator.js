const fs = require('fs');
const path = require('path');
const { processRakutenLink } = require('./affiliate_processor');

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

    // If still contains no useful chars, generate a timestamp-based slug
    if (!slug || slug.length < 3) {
        slug = `article-${Date.now()}`;
    }

    return slug;
}

/**
 * Detect category and subCategory from keyword
 * Returns { category, categoryId, subCategoryId }
 */
function detectCategoryFromKeyword(keyword) {
    const kw = keyword.toLowerCase();

    if (kw.match(/イヤホン|ヘッドホン|ヘッドフォン/)) {
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
        return { category: 'furniture', categoryId: 'furniture', subCategoryId: 'office-chairs' };
    }
    // Default
    return { category: 'gadgets', categoryId: 'gadgets', subCategoryId: 'general' };
}

/**
 * Generate dynamic spec labels based on keyword/category
 */
function generateDefaultLabels(keyword, blueprint = {}) {
    const kw = keyword.toLowerCase();

    // Audio category
    if (kw.match(/イヤホン|ヘッドホン|スピーカー/)) {
        return { spec1: "音質", spec2: "ノイキャン", spec3: "バッテリー", spec4: "機能" };
    }
    // Home appliances
    if (kw.match(/冷蔵庫/)) {
        return { spec1: "容量", spec2: "省エネ", spec3: "機能", spec4: "サイズ" };
    }
    if (kw.match(/洗濯機/)) {
        return { spec1: "容量", spec2: "乾燥機能", spec3: "静音性", spec4: "省エネ" };
    }
    if (kw.match(/エアコン/)) {
        return { spec1: "適用畳数", spec2: "省エネ", spec3: "機能", spec4: "静音性" };
    }
    if (kw.match(/掃除機/)) {
        return { spec1: "吸引力", spec2: "稼働時間", spec3: "軽さ", spec4: "機能" };
    }
    // Camera
    if (kw.match(/カメラ|一眼/)) {
        return { spec1: "画質", spec2: "AF性能", spec3: "動画性能", spec4: "携帯性" };
    }
    // Default/generic
    return { spec1: "性能", spec2: "機能", spec3: "コスパ", spec4: "評価" };
}

/**
 * Generate dynamic buying guide steps based on keyword/blueprint
 */
function generateBuyingGuideSteps(keyword, blueprint = {}) {
    const kw = keyword.toLowerCase();
    const axis = blueprint.comparison_axis || '';

    // Audio category
    if (kw.match(/イヤホン|ヘッドホン/)) {
        return [
            { icon: "check", title: "1. ノイズキャンセリング", description: "静寂性能がどこまで進化したか。" },
            { icon: "check", title: "2. 音質・コーデック", description: "対応コーデックで音質が変わる。" },
            { icon: "check", title: "3. バッテリー持ち", description: "使用時間と充電の利便性。" }
        ];
    }
    // Refrigerator
    if (kw.match(/冷蔵庫/)) {
        return [
            { icon: "check", title: "1. 容量の目安", description: "家族人数×70L+常備品が基本。" },
            { icon: "check", title: "2. 省エネ性能", description: "年間電気代のチェック方法。" },
            { icon: "check", title: "3. 設置サイズ", description: "搬入経路も含めた確認ポイント。" }
        ];
    }
    // Camera
    if (kw.match(/カメラ|一眼/)) {
        return [
            { icon: "check", title: "1. センサーサイズ", description: "画質と暗所性能を決める要素。" },
            { icon: "check", title: "2. AF性能", description: "被写体追従とピント精度。" },
            { icon: "check", title: "3. 動画性能", description: "4K撮影と手ブレ補正。" }
        ];
    }
    // Dynamic from comparison_axis if available
    if (axis) {
        const axes = axis.split(/[、,\/]/).slice(0, 3);
        return axes.map((a, i) => ({
            icon: "check",
            title: `${i + 1}. ${a.trim()}`,
            description: `${a.trim()}のチェックポイント。`
        }));
    }
    // Default
    return [
        { icon: "check", title: "1. 基本性能", description: "核心機能をチェック。" },
        { icon: "check", title: "2. コストパフォーマンス", description: "価格に見合う価値か。" },
        { icon: "check", title: "3. 使いやすさ", description: "日常での利便性。" }
    ];
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
function generateRankingArticle(targetKeyword, products, productsData, bodyContent, seoMetadata, overrideImage = null) {
    const dateStr = new Date().toISOString().split('T')[0];
    const topProduct = productsData.find(p => p.id === products[0].id);

    // Use Override Image (AI Thumbnail) if provided, otherwise Top Product Image
    const topImage = overrideImage ? overrideImage : (topProduct.image ? topProduct.image.trim() : "");

    // Use AI Material if provided, otherwise fallback
    const articleBody = bodyContent || "コンテンツ生成中...";
    const title = seoMetadata ? seoMetadata.title : `【2025年】${targetKeyword} おすすめランキング`;
    const description = seoMetadata ? seoMetadata.description : `2025年最新の${targetKeyword}市場を調査。`;

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
title: "${safeName} レビュー：プロが教える「買い」の理由"
description: "${safeName}の実機レビュー。メリット・デメリットから、誰におすすめかまで徹底解説。"
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

// 3. Update articles.json Database
function updateDatabase(targetKeyword, products, productsData, seoMetadata, blueprint = {}, aiThumbnail = null) {
    const dbPath = path.resolve(__dirname, '../../src/data/articles.json');
    let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Variable declarations (restored)
    const dateStr = new Date().toISOString().split('T')[0];
    const topProduct = productsData.find(p => p.id === products[0]?.id) || products[0] || {};
    const defaultLabels = generateDefaultLabels(targetKeyword, blueprint);
    const title = seoMetadata?.title || `【2025年】${targetKeyword} おすすめランキング`;
    const description = seoMetadata?.description || `プロが選ぶ${targetKeyword}のおすすめ人気ランキング。選び方や比較ポイントも解説。`;

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
        tags: ["ランキング", "2025最新", "おすすめ"],
        rankingCriteria: {
            description: "今回のランキングは、以下の基準で厳選しました。",
            points: [
                { icon: getIconForLabel(defaultLabels.spec1), title: defaultLabels.spec1 },
                { icon: getIconForLabel(defaultLabels.spec2), title: defaultLabels.spec2 },
                { icon: getIconForLabel(defaultLabels.spec3), title: defaultLabels.spec3 },
                { icon: getIconForLabel(defaultLabels.spec4), title: defaultLabels.spec4 }
            ]
        },
        specLabels: defaultLabels,

        rankingItems: products.map((p, index) => {
            // Search by both ID and ASIN for robustness
            const data = productsData.find(d => d.id === p.id || d.asin === p.asin) || p;

            // MAP SPECS TO KEYS for Comparison Table
            const specsObj = {};
            if (data.specs && Array.isArray(data.specs)) {
                data.specs.forEach((s, i) => {
                    const key = `spec${i + 1}`; // spec1, spec2...
                    specsObj[key] = s.value;
                });
            }

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

module.exports = { generateRankingArticle, generateReviewPage, updateDatabase, generateDefaultLabels, generateSitemap, keywordToEnglishSlug, detectCategoryFromKeyword };
