/**
 * Normalize specs to ensure consistent formatting for comparison tables
 * Generic version for ALL categories (Audio, Furniture, Appliances, etc.)
 */
function normalizeSpecs(specs) {
    if (!specs || !Array.isArray(specs)) return [];

    // Prioritize specs with meaningful values
    const uniqueSpecs = new Map();

    // Helper: Convert grade to numeric weight for comparison (S=4, A=3, B=2, C=1)
    const getGradeWeight = (v) => {
        if (v === 'S') return 4;
        if (v === 'A') return 3;
        if (v === 'B') return 2;
        if (v === 'C') return 1;
        return 0;
    };

    specs.forEach(spec => {
        if (!spec.label) return;
        let label = spec.label.trim();
        let value = spec.value ? String(spec.value).trim() : '';

        // --- 0. TRANSLATION (English -> Japanese) ---
        const TRANSLATION_MAP = {
            'Model Name': '型番',
            'Connectivity Technology': '接続方弁E,
            'Wireless Communication Technology': 'ワイヤレス技衁E,
            'Included Components': '付属品',
            'Age Range (Description)': '対象年齢',
            'Material': '素杁E,
            'Specific Uses For Product': '用送E,
            'Charging Time': '允E��時間',
            'Recommended Uses For Product': '推奨用送E,
            'Compatible Devices': '対応機器',
            'Control Type': '操作方弁E,
            'Control Method': '操作方況E,
            'Number of Items': '個数',
            'Batteries Required': 'バッチE��ー',
            'Manufacturer': 'メーカー',
            'Item Model Number': '型番',
            'Package Dimensions': 'サイズ',
            'ASIN': 'ASIN',
            'Date First Available': '発売日',
            'Customer Reviews': 'カスタマ�Eレビュー',
            'Amazon Bestseller': 'ベストセラーランク',
            'Product Dimensions': 'サイズ',
            'Item Weight': '重量',
            'Product Weight': '重量',
            'Capacity': '容釁E,
            'Volume': '容釁E,
            'Wattage': '消費電劁E,
            'Voltage': '電圧',
            'Color': '色',
            'Warranty Description': '保証',
            'Noise Level': '騒音レベル',
            'Installation Type': '設置タイチE,
            'Form Factor': '形状',
            'Special Features': '機�E',
            'Filter Type': 'フィルター',
            'Power Source': '電溁E,
            'Runtime': '稼働時閁E,
            'Suction Power': '吸引力',
            'Maximum Weight Recommendation': '耐荷釁E,
            'Noise Control': 'ノイキャン',
            'Active Noise Cancellation': 'ノイキャン',
            'Headphones Jack': 'ヘッド�EンジャチE��',
            'Cable Feature': 'ケーブル機�E',
            'Item Dimensions LxWxH': 'サイズ',
            'Water Resistance Level': '防水性能',
            'Frequency Response': '周波数特性',
            'Impedance': 'インピ�Eダンス',
            'Sensitivity': '感度',
            'Driver Unit': 'ドライバ�E',
            // Catch-all for common patterns
            'Width': '幁E, 'Height': '高さ', 'Depth': '奥行き', 'Weight': '重量'
        };

        // Fuzzy Match / Cleanup keys
        // Remove invisible chars (U+200E etc.)
        label = label.replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '').trim();

        // Check map
        if (TRANSLATION_MAP[label]) {
            label = TRANSLATION_MAP[label];
        } else {
            // Case-insensitive check
            const upperKey = Object.keys(TRANSLATION_MAP).find(k => k.toLowerCase() === label.toLowerCase());
            if (upperKey) {
                label = TRANSLATION_MAP[upperKey];
            }
        }


        // --- 1. JUNK FILTERING (Global Strict) ---
        const junkKeywords = [
            'お届け', 'ニュース', '配送E, '在庫', '価格', '送料', '保証', 'JAN', '型番', '発売日',
            '関連', 'キャンペ�Eン', '決渁E, 'お支払い', '返品', '取扱', '店�E',
            'Department', 'Date', 'Rank', 'Customer', 'Review', 'Best Sellers', 'Description',
            // User Requested Blacklist (Irrelevant/Verbose metadata)
            '付属品', '対象年齢', '素杁E, '用送E, '推奨用送E, '対応機器',
            '操作方弁E, '操作方況E, 'ケーブル機�E', '個数', 'カスタマ�Eレビュー',
            'ベストセラーランク', 'メーカー', 'ASIN', '啁E��モチE��番号', '電池', '保証'
        ];
        // Filter if LABEL contains junk OR VALUE contains junk (long text only)
        if (junkKeywords.some(k => label.includes(k) || (value.length > 50 && value.includes(k)))) return;
        if (value === '' || value === '-') return;

        // --- 1.5. UNKNOWN ENGLISH FILTER ---
        // If label is still English (ASCII only) after translation, it means it wasn't mapped.
        // Assume it's irrelevant technical metadata and remove it.
        // Regex: Matches strings composed entirely of ASCII alphanumeric, space, parens, hyphens
        if (/^[A-Za-z0-9\s().-]+$/.test(label)) {
            // Exceptions: Some English acronyms might be valid (e.g. "IPX4"), but usually those are Values not Labels.
            // If we really want to keep "USB", "HDMI", we should mapped them in TRANSLATION_MAP to themselves or Japanese.
            return;
        }

        // --- 2. FIELD NORMALIZATION ---

        // A. Quality/Performance Fields (Convert Symbols to Grades)
        // Generic keywords that imply a qualitative rating
        const gradeKeywords = [
            'Quality', 'Performance', 'Comfort', 'Effect', 'Ease',
            '音質', '画質', '座り忁E��', '使ぁE��すさ', '効极E, '性能', '静音性',
            '裁E��愁E, 'ノイキャン', 'ANC', '渁E��能劁E, '吸引力'
        ];
        const isGradeField = gradeKeywords.some(k => label.includes(k));

        if (isGradeField) {
            if (value === '◁E || value === 'High' || value === 'Excellent' || value === 'Very Good' || value.includes('最髁E)) value = 'S';
            if (value === '◁E || value === 'Good' || value === '対忁E || value.includes('良好')) value = 'A';
            if (value === '△' || value === 'Average' || value.includes('普送E)) value = 'B';
            if (value === 'ÁE || value === 'Low' || value === 'Poor' || value === '非対忁E || value.includes('悪ぁE)) value = 'C';
        }

        // B. Battery / Power / Time Fields
        const powerKeywords = ['Battery', 'Power', 'Time', 'バッチE��ー', '電池', '稼働時閁E, '再生時間', '連続使用', '運転時間', '持続時閁E];
        if (powerKeywords.some(k => label.includes(k))) {
            // Standardize confusing "◁E to "要確誁E (Verify)
            if (value === '◁E || value === '対忁E) value = '詳細要確誁E;
        }

        // C. Feature / Function Fields (Cleaning)
        if (['機�E', '特徴', 'Features', 'Function', '付属品', 'Accessories'].some(k => label.includes(k))) {
            // If value looks like an object/array, clean it
            if (value.startsWith('[') || value.startsWith('{')) {
                try {
                    const parsed = JSON.parse(value);
                    if (Array.isArray(parsed)) value = parsed.join(', ');
                    else if (typeof parsed === 'object') value = Object.values(parsed).join(', ');
                } catch (e) { /* ignore */ }
            }
            // Remove "Ver" numbers if just versions
            if (value.match(/^Ver\d+\.\d+$/)) return;
        }

        // --- 3. DEDUPLICATION LOGIC ---
        if (uniqueSpecs.has(label)) {
            const existing = uniqueSpecs.get(label);
            const existingWeight = getGradeWeight(existing.value);
            const newWeight = getGradeWeight(value);

            // Case 1: Grading conflict -> Higher/Better grade
            if (newWeight > 0 && newWeight >= existingWeight) {
                uniqueSpecs.set(label, { label, value });
            }
            // Case 2: Content conflict -> Prefer specific text over "◁E/"A" 
            else if (existingWeight > 0 && newWeight === 0) {
                if (!isGradeField) {
                    uniqueSpecs.set(label, { label, value });
                }
            }
            // Case 3: Text vs Text -> Prefer longer/more detailed? Or AI source?
            else if ((existing.value === '◁E || existing.value === '詳細要確誁E) && value !== '◁E) {
                uniqueSpecs.set(label, { label, value });
            }
        } else {
            uniqueSpecs.set(label, { label, value });
        }
    });

    return Array.from(uniqueSpecs.values());
}


/**
 * Normalize Object-style specs (used in ComparisonTable)
 * @param {Array} products - Array of product objects with .specs { key: val }
 * @param {Object} specLabels - Map of { key: label }
 * @returns {Array} - Normalized products
 */
function normalizeObjectSpecs(products, specLabels) {
    if (!products || !Array.isArray(products) || !specLabels) return products;

    return products.map(p => {
        if (!p.specs) return p;
        const newSpecs = { ...p.specs };

        Object.keys(newSpecs).forEach(key => {
            const label = specLabels[key] || key; // Use Japanese label if available
            const value = newSpecs[key];

            // Re-use the array-based logic by mocking a single item
            const result = normalizeSpecs([{ label, value }]);

            if (result && result.length > 0) {
                newSpecs[key] = result[0].value;
            } else {
                // If filtered out (junk), remove the key so it shows as empty/dash in table
                delete newSpecs[key];
            }
        });

        return { ...p, specs: newSpecs };
    });
}

module.exports = { normalizeSpecs, normalizeObjectSpecs };
