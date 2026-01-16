const fs = require('fs');
const path = require('path');
const { processRakutenLink } = require('./affiliate_processor');

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

    // NOTE: Ranking table removed - frontend components handle the rich display
    // The ranking table was causing duplicate content in the article

    const content = `---
title: "${title}"
description: "${description}"
date: "${dateStr}"
category: "audio"
author: "ChoiceGuide編集部"
thumbnail: "${topImage}"
---

${articleBody}
`;

    // Ensure directory exists
    const dir = path.resolve(__dirname, '../../src/content/articles');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const fileName = `${targetKeyword}.md`;
    saveMarkdown(path.join(dir, fileName), content);
}

// 2. Generate Individual Review Page
function generateReviewPage(product, bodyContent) {
    const dateStr = new Date().toISOString().split('T')[0];
    const image = product.image ? product.image.trim() : "";

    // NOTE: Spec table REMOVED - ProductContent.tsx handles structured spec display
    // Writing specs here causes duplicate display (frontend already shows product.specs)

    const content = `---
title: "${product.name} レビュー：プロが教える「買い」の理由"
description: "${product.name}の実機レビュー。メリット・デメリットから、誰におすすめかまで徹底解説。"
date: "${dateStr}"
category: "Reviews"
product_id: "${product.id}"
author: "ChoiceGuide編集部"
thumbnail: "${image}"
ranking_url: "/rankings/best-wireless-headphones-2025"
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

    const newEntry = {
        id: targetKeyword,
        slug: targetKeyword,
        title: title,
        description: description,
        publishedAt: dateStr,
        updatedDate: dateStr,
        image: finalThumbnail, // Main image for OG and Listing
        thumbnail: finalThumbnail, // Thumbnail for article header
        author: "ChoiceGuide編集部",
        category: "audio",
        categoryId: "audio",
        subCategoryId: "wireless-headphones",
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

    // Remove existing if exists
    db = db.filter(item => item.id !== targetKeyword);
    // Add new (at top)
    db.unshift(newEntry);

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 4), 'utf8');
    console.log(`  💾 Database Updated: articles.json`);
}

module.exports = { generateRankingArticle, generateReviewPage, updateDatabase, generateDefaultLabels };
