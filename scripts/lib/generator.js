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
        '繝ｯ繧､繝､繝ｬ繧ｹ繧､繝､繝帙Φ': 'wireless-earphones',
        '繝弱う繧ｺ繧ｭ繝｣繝ｳ繧ｻ繝ｪ繝ｳ繧ｰ': 'noise-cancelling',
        '繧､繝､繝帙Φ': 'earphones',
        '繝倥ャ繝峨・繝ｳ': 'headphones',
        '繧ｹ繝斐・繧ｫ繝ｼ': 'speaker',
        '蜀ｷ阡ｵ蠎ｫ': 'refrigerator',
        '豢玲ｿｯ讖・: 'washing-machine',
        '繧ｨ繧｢繧ｳ繝ｳ': 'air-conditioner',
        '繝ｭ繝懊ャ繝域祉髯､讖・: 'robot-vacuum',
        '謗・勁讖・: 'vacuum-cleaner',
        '繧ｫ繝｡繝ｩ': 'camera',
        '荳逵ｼ繝ｬ繝・: 'dslr-camera',
        '繝溘Λ繝ｼ繝ｬ繧ｹ': 'mirrorless-camera',
        '繝・Ξ繝・: 'tv',
        '繝｢繝九ち繝ｼ': 'monitor',
        '繧ｭ繝ｼ繝懊・繝・: 'keyboard',
        '繝槭え繧ｹ': 'mouse',
        '繧ｿ繝悶Ξ繝・ヨ': 'tablet',
        '繧ｹ繝槭・繝医え繧ｩ繝・メ': 'smartwatch',
        '髮ｻ蟄舌Ξ繝ｳ繧ｸ': 'microwave',
        '轤企｣ｯ蝎ｨ': 'rice-cooker',
        '繝峨Λ繧､繝､繝ｼ': 'hair-dryer',
        '遨ｺ豌玲ｸ・ｵ・ｩ・: 'air-purifier',
        '蜉貉ｿ蝎ｨ': 'humidifier',
        '髯､貉ｿ讖・: 'dehumidifier',
        '繝励Ο繧ｸ繧ｧ繧ｯ繧ｿ繝ｼ': 'projector',
        '鬟滓ｴ玲ｩ・: 'dishwasher',
    };

    // Situation / modifier mappings
    const situationMappings = {
        '閠ｳ縺悟ｰ上＆縺・: 'small-ears',
        '繧ｸ繝': 'gym',
        '髦ｲ豌ｴ': 'waterproof',
        '繝・Ξ繝ｯ繝ｼ繧ｯ': 'telework',
        '鬟幄｡梧ｩ・: 'airplane',
        '逹｡逵': 'sleep',
        '繧ｲ繝ｼ繝': 'gaming',
        'FPS': 'fps',
        '菴朱≦蟒ｶ': 'low-latency',
        'PC謗･邯・: 'pc-connect',
        '繝代た繧ｳ繝ｳ': 'pc',
        'PC': 'pc',
        'Pixel': 'pixel',
        'Galaxy': 'galaxy',
        'iPhone15': 'iphone15',
        'iPhone14': 'iphone14',
        'iPhone': 'iphone',
        'Mac': 'mac',
        'MacBook': 'macbook',
        'Windows': 'windows',
        '繝ｩ繝ｳ繝九Φ繧ｰ': 'running',
        '騾壼共': 'commute',
        '騾壼ｭｦ': 'school-commute',
        '蜍牙ｼｷ': 'study',
        'Web莨夊ｭｰ': 'web-meeting',
        '繧ｪ繝ｳ繝ｩ繧､繝ｳ莨夊ｭｰ': 'online-meeting',
        'ASMR': 'asmr',
        '髻ｳ讌ｽ髑題ｳ・: 'music',
        '譏逕ｻ髑題ｳ・: 'movie',
        '縺翫☆縺吶ａ': 'recommended',
        '1荳・・莉･荳・: 'under-10000yen',
        '2荳・・莉･荳・: 'under-20000yen',
        '3荳・・莉･荳・: 'under-30000yen',
        '5荳・・莉･荳・: 'under-50000yen',
        '鬮倡ｴ・: 'premium',
        '繧ｳ繧ｹ繝・: 'cost-effective',
        '蛻晏ｿ・・: 'beginner',
        '荳莠ｺ證ｮ繧峨＠': 'single-living',
        '蟄蝉ｾ・: 'kids',
        '繧ｷ繝九い': 'senior',
        '螂ｳ諤ｧ': 'women',
        '逕ｷ諤ｧ': 'men',
    };

    // Merge all mappings (product first for exact match)
    const allMappings = { ...productMappings, ...situationMappings };

    // Check for exact match first
    if (allMappings[keyword]) {
        return allMappings[keyword];
    }

    // Build slug by replacing known terms (longer phrases first to avoid partial matches)
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

    if (kw.match(/繧､繝､繝帙Φ|繝倥ャ繝峨・繝ｳ|繝倥ャ繝峨ヵ繧ｩ繝ｳ/)) {
        return { category: 'audio', categoryId: 'audio', subCategoryId: 'wireless-headphones' };
    }
    if (kw.match(/繧ｹ繝斐・繧ｫ繝ｼ/)) {
        return { category: 'audio', categoryId: 'audio', subCategoryId: 'speakers' };
    }
    if (kw.match(/蜀ｷ阡ｵ蠎ｫ/)) {
        return { category: 'appliances', categoryId: 'appliances', subCategoryId: 'refrigerators' };
    }
    if (kw.match(/豢玲ｿｯ讖・)) {
        return { category: 'appliances', categoryId: 'appliances', subCategoryId: 'washing-machines' };
    }
    if (kw.match(/繧ｨ繧｢繧ｳ繝ｳ/)) {
        return { category: 'appliances', categoryId: 'appliances', subCategoryId: 'air-conditioners' };
    }
    if (kw.match(/謗・勁讖・)) {
        return { category: 'appliances', categoryId: 'appliances', subCategoryId: 'vacuum-cleaners' };
    }
    if (kw.match(/繧ｫ繝｡繝ｩ|荳逵ｼ|繝溘Λ繝ｼ繝ｬ繧ｹ/)) {
        return { category: 'camera', categoryId: 'camera', subCategoryId: 'cameras' };
    }
    if (kw.match(/繝・Ξ繝倒繝｢繝九ち繝ｼ/)) {
        return { category: 'display', categoryId: 'display', subCategoryId: 'tvs' };
    }
    if (kw.match(/繧ｭ繝ｼ繝懊・繝榎繝槭え繧ｹ/)) {
        return { category: 'pc-peripherals', categoryId: 'pc-peripherals', subCategoryId: 'input-devices' };
    }
    if (kw.match(/繧ｿ繝悶Ξ繝・ヨ/)) {
        return { category: 'mobile', categoryId: 'mobile', subCategoryId: 'tablets' };
    }
    if (kw.match(/繧ｹ繝槭・繝医え繧ｩ繝・メ/)) {
        return { category: 'wearable', categoryId: 'wearable', subCategoryId: 'smartwatches' };
    }
    if (kw.match(/髮ｻ蟄舌Ξ繝ｳ繧ｸ|轤企｣ｯ蝎ｨ|鬟滓ｴ玲ｩ・)) {
        return { category: 'kitchen', categoryId: 'kitchen', subCategoryId: 'kitchen-appliances' };
    }
    if (kw.match(/繝峨Λ繧､繝､繝ｼ/)) {
        return { category: 'beauty', categoryId: 'beauty', subCategoryId: 'hair-dryers' };
    }
    if (kw.match(/遨ｺ豌玲ｸ・ｵ・ｩ毫蜉貉ｿ蝎ｨ|髯､貉ｿ讖・)) {
        return { category: 'appliances', categoryId: 'appliances', subCategoryId: 'air-quality' };
    }
    if (kw.match(/繝励Ο繧ｸ繧ｧ繧ｯ繧ｿ繝ｼ/)) {
        return { category: 'display', categoryId: 'display', subCategoryId: 'projectors' };
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
    if (kw.match(/繧､繝､繝帙Φ|繝倥ャ繝峨・繝ｳ|繧ｹ繝斐・繧ｫ繝ｼ/)) {
        return { spec1: "髻ｳ雉ｪ", spec2: "繝弱う繧ｭ繝｣繝ｳ", spec3: "繝舌ャ繝・Μ繝ｼ", spec4: "讖溯・" };
    }
    // Home appliances
    if (kw.match(/蜀ｷ阡ｵ蠎ｫ/)) {
        return { spec1: "螳ｹ驥・, spec2: "逵√お繝・, spec3: "讖溯・", spec4: "繧ｵ繧､繧ｺ" };
    }
    if (kw.match(/豢玲ｿｯ讖・)) {
        return { spec1: "螳ｹ驥・, spec2: "荵ｾ辯･讖溯・", spec3: "髱咎浹諤ｧ", spec4: "逵√お繝・ };
    }
    if (kw.match(/繧ｨ繧｢繧ｳ繝ｳ/)) {
        return { spec1: "驕ｩ逕ｨ逡ｳ謨ｰ", spec2: "逵√お繝・, spec3: "讖溯・", spec4: "髱咎浹諤ｧ" };
    }
    if (kw.match(/謗・勁讖・)) {
        return { spec1: "蜷ｸ蠑募鴨", spec2: "遞ｼ蜒肴凾髢・, spec3: "霆ｽ縺・, spec4: "讖溯・" };
    }
    // Camera
    if (kw.match(/繧ｫ繝｡繝ｩ|荳逵ｼ/)) {
        return { spec1: "逕ｻ雉ｪ", spec2: "AF諤ｧ閭ｽ", spec3: "蜍慕判諤ｧ閭ｽ", spec4: "謳ｺ蟶ｯ諤ｧ" };
    }
    // Default/generic
    return { spec1: "諤ｧ閭ｽ", spec2: "讖溯・", spec3: "繧ｳ繧ｹ繝・, spec4: "隧穂ｾ｡" };
}

/**
 * Generate dynamic buying guide steps based on keyword/blueprint
 */
function generateBuyingGuideSteps(keyword, blueprint = {}) {
    const kw = keyword.toLowerCase();
    const axis = blueprint.comparison_axis || '';

    // Audio category
    if (kw.match(/繧､繝､繝帙Φ|繝倥ャ繝峨・繝ｳ/)) {
        return [
            { icon: "check", title: "1. 繝弱う繧ｺ繧ｭ繝｣繝ｳ繧ｻ繝ｪ繝ｳ繧ｰ", description: "髱吝ｯよｧ閭ｽ縺後←縺薙∪縺ｧ騾ｲ蛹悶＠縺溘°縲・ },
            { icon: "check", title: "2. 髻ｳ雉ｪ繝ｻ繧ｳ繝ｼ繝・ャ繧ｯ", description: "蟇ｾ蠢懊さ繝ｼ繝・ャ繧ｯ縺ｧ髻ｳ雉ｪ縺悟､峨ｏ繧九・ },
            { icon: "check", title: "3. 繝舌ャ繝・Μ繝ｼ謖√■", description: "菴ｿ逕ｨ譎る俣縺ｨ蜈・崕縺ｮ蛻ｩ萓ｿ諤ｧ縲・ }
        ];
    }
    // Refrigerator
    if (kw.match(/蜀ｷ阡ｵ蠎ｫ/)) {
        return [
            { icon: "check", title: "1. 螳ｹ驥上・逶ｮ螳・, description: "螳ｶ譌丈ｺｺ謨ｰﾃ・0L+蟶ｸ蛯吝刀縺悟渕譛ｬ縲・ },
            { icon: "check", title: "2. 逵√お繝肴ｧ閭ｽ", description: "蟷ｴ髢馴崕豌嶺ｻ｣縺ｮ繝√ぉ繝・け譁ｹ豕輔・ },
            { icon: "check", title: "3. 險ｭ鄂ｮ繧ｵ繧､繧ｺ", description: "謳ｬ蜈･邨瑚ｷｯ繧ょ性繧√◆遒ｺ隱阪・繧､繝ｳ繝医・ }
        ];
    }
    // Camera
    if (kw.match(/繧ｫ繝｡繝ｩ|荳逵ｼ/)) {
        return [
            { icon: "check", title: "1. 繧ｻ繝ｳ繧ｵ繝ｼ繧ｵ繧､繧ｺ", description: "逕ｻ雉ｪ縺ｨ證玲園諤ｧ閭ｽ繧呈ｱｺ繧√ｋ隕∫ｴ縲・ },
            { icon: "check", title: "2. AF諤ｧ閭ｽ", description: "陲ｫ蜀吩ｽ楢ｿｽ蠕薙→繝斐Φ繝育ｲｾ蠎ｦ縲・ },
            { icon: "check", title: "3. 蜍慕判諤ｧ閭ｽ", description: "4K謦ｮ蠖ｱ縺ｨ謇九ヶ繝ｬ陬懈ｭ｣縲・ }
        ];
    }
    // Dynamic from comparison_axis if available
    if (axis) {
        const axes = axis.split(/[縲・\/]/).slice(0, 3);
        return axes.map((a, i) => ({
            icon: "check",
            title: `${i + 1}. ${a.trim()}`,
            description: `${a.trim()}縺ｮ繝√ぉ繝・け繝昴う繝ｳ繝医Ａ
        }));
    }
    // Default
    return [
        { icon: "check", title: "1. 蝓ｺ譛ｬ諤ｧ閭ｽ", description: "譬ｸ蠢・ｩ溯・繧偵メ繧ｧ繝・け縲・ },
        { icon: "check", title: "2. 繧ｳ繧ｹ繝医ヱ繝輔か繝ｼ繝槭Φ繧ｹ", description: "萓｡譬ｼ縺ｫ隕句粋縺・ｾ｡蛟､縺九・ },
        { icon: "check", title: "3. 菴ｿ縺・ｄ縺吶＆", description: "譌･蟶ｸ縺ｧ縺ｮ蛻ｩ萓ｿ諤ｧ縲・ }
    ];
}

/**
 * Helper: Select icon based on label text
 */
function getIconForLabel(label) {
    if (!label) return "check_circle";
    const l = label.toLowerCase();
    if (l.match(/髻ｳ|繧ｵ繧ｦ繝ｳ繝榎sound/)) return "graphic_eq";
    if (l.match(/繝弱う繧ｭ繝｣繝ｳ|髱吝ｯ・noise/)) return "noise_control_off";
    if (l.match(/繝舌ャ繝・Μ繝ｼ|髮ｻ豎|蜈・崕|遞ｼ蜒鋼battery/)) return "battery_charging_full";
    if (l.match(/讖溯・|螟壽ｩ溯・|function/)) return "settings";
    if (l.match(/繧ｵ繧､繧ｺ|螟ｧ縺阪＆|蟇ｸ豕怖size|width/)) return "straighten";
    if (l.match(/驥阪＆|驥埼㍼|霆ｽ縺怖weight/)) return "weight";
    if (l.match(/螳ｹ驥楯蜿守ｴ鋼capacity/)) return "inventory_2";
    if (l.match(/逕ｻ雉ｪ|隗｣蜒丞ｺｦ|image|reoslution/)) return "hd";
    if (l.match(/逵√お繝鋼髮ｻ豌嶺ｻ｣|eco/)) return "eco";
    if (l.match(/繝・じ繧､繝ｳ|隕九◆逶ｮ|color|design/)) return "palette";
    if (l.match(/蜷ｸ蠑募鴨|suction/)) return "cleaning_services";
    if (l.match(/荵ｾ辯･/)) return "wb_sunny";
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
            console.warn(`  笘｢・・Generator: Deduplication Triggered for ${path.basename(filePath)}`);
            const parts = content.split(anchor);
            content = parts[0] + anchor + parts[1];
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  統 Saved: ${path.basename(filePath)}`);
}

// 1. Generate Main Ranking Article (Buying Guide Only)
// 1. Generate Main Ranking Article (Buying Guide Only)
function generateRankingArticle(targetKeyword, products, productsData, bodyContent, seoMetadata, overrideImage = null) {
    const dateStr = new Date().toISOString().split('T')[0];
    const topProduct = productsData.find(p => p.id === products[0].id);

    // Use Override Image (AI Thumbnail) if provided, otherwise Top Product Image
    const topImage = overrideImage ? overrideImage : (topProduct.image ? topProduct.image.trim() : "");

    // Use AI Material if provided, otherwise fallback
    const articleBody = bodyContent || "繧ｳ繝ｳ繝・Φ繝・函謌蝉ｸｭ...";
    const title = seoMetadata ? seoMetadata.title : `縲・025蟷ｴ縲・{targetKeyword} 縺翫☆縺吶ａ繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ`;
    const description = seoMetadata ? seoMetadata.description : `2025蟷ｴ譛譁ｰ縺ｮ${targetKeyword}蟶ょｴ繧定ｪｿ譟ｻ縲Ａ;

    // NOTE: Ranking table removed - frontend components handle the rich display
    // The ranking table was causing duplicate content in the article

    const { category } = detectCategoryFromKeyword(targetKeyword);

    const content = `---
title: "${title}"
description: "${description}"
date: "${dateStr}"
category: "${category}"
author: "ChoiceGuide邱ｨ髮・Κ"
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
title: "${safeName} 繝ｬ繝薙Η繝ｼ・壹・繝ｭ縺梧蕗縺医ｋ縲瑚ｲｷ縺・阪・逅・罰"
description: "${safeName}縺ｮ螳滓ｩ溘Ξ繝薙Η繝ｼ縲ゅΓ繝ｪ繝・ヨ繝ｻ繝・Γ繝ｪ繝・ヨ縺九ｉ縲∬ｪｰ縺ｫ縺翫☆縺吶ａ縺九∪縺ｧ蠕ｹ蠎戊ｧ｣隱ｬ縲・
date: "${dateStr}"
category: "Reviews"
product_id: "${product.id}"
author: "ChoiceGuide邱ｨ髮・Κ"
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
    const title = seoMetadata?.title || `縲・025蟷ｴ縲・{targetKeyword} 縺翫☆縺吶ａ繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ`;
    const description = seoMetadata?.description || `繝励Ο縺碁∈縺ｶ${targetKeyword}縺ｮ縺翫☆縺吶ａ莠ｺ豌励Λ繝ｳ繧ｭ繝ｳ繧ｰ縲る∈縺ｳ譁ｹ繧・ｯ碑ｼ・・繧､繝ｳ繝医ｂ隗｣隱ｬ縲Ａ;

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
        author: "ChoiceGuide邱ｨ髮・Κ",
        ...detectCategoryFromKeyword(targetKeyword),
        tags: ["繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ", "2025譛譁ｰ", "縺翫☆縺吶ａ"],
        rankingCriteria: {
            description: "莉雁屓縺ｮ繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ縺ｯ縲∽ｻ･荳九・蝓ｺ貅悶〒蜴ｳ驕ｸ縺励∪縺励◆縲・,
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
                badge: data.badge || "縺翫☆縺吶ａ",
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
            title: "螟ｱ謨励＠縺ｪ縺・∈縺ｳ譁ｹ",
            steps: generateBuyingGuideSteps(targetKeyword, blueprint)
        },
        products: products.map(p => p.id)
    };

    // Remove existing if exists (check both old Japanese and new English slugs)
    db = db.filter(item => item.id !== englishSlug && item.id !== targetKeyword);
    // Add new (at top)
    db.unshift(newEntry);

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 4), 'utf8');
    console.log(`  沈 Database Updated: articles.json`);
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
        console.error('  笞・・Failed to read articles.json for sitemap:', e.message);
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
    console.log(`  亮・・ Sitemap Updated: sitemap.xml (${urls.size} URLs)`);
}

module.exports = { generateRankingArticle, generateReviewPage, updateDatabase, generateDefaultLabels, generateSitemap, keywordToEnglishSlug, detectCategoryFromKeyword };
