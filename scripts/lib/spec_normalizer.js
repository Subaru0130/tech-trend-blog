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
            'Connectivity Technology': '接続方式',
            'Wireless Communication Technology': 'ワイヤレス技術',
            'Included Components': '付属品',
            'Age Range (Description)': '対象年齢',
            'Material': '素材',
            'Specific Uses For Product': '用途',
            'Charging Time': '充電時間',
            'Recommended Uses For Product': '推奨用途',
            'Compatible Devices': '対応機器',
            'Control Type': '操作方式',
            'Control Method': '操作方法',
            'Number of Items': '個数',
            'Batteries Required': 'バッテリー',
            'Manufacturer': 'メーカー',
            'Item Model Number': '型番',
            'Package Dimensions': 'サイズ',
            'ASIN': 'ASIN',
            'Date First Available': '発売日',
            'Customer Reviews': 'カスタマーレビュー',
            'Amazon Bestseller': 'ベストセラーランク',
            'Product Dimensions': 'サイズ',
            'Item Weight': '重量',
            'Product Weight': '重量',
            'Capacity': '容量',
            'Volume': '容量',
            'Wattage': '消費電力',
            'Voltage': '電圧',
            'Color': '色',
            'Warranty Description': '保証',
            'Noise Level': '騒音レベル',
            'Installation Type': '設置タイプ',
            'Form Factor': '形状',
            'Special Features': '機能',
            'Filter Type': 'フィルター',
            'Power Source': '電源',
            'Runtime': '稼働時間',
            'Suction Power': '吸引力',
            'Maximum Weight Recommendation': '耐荷重',
            'Noise Control': 'ノイキャン',
            'Active Noise Cancellation': 'ノイキャン',
            'Headphones Jack': 'ヘッドホンジャック',
            'Cable Feature': 'ケーブル機能',
            'Item Dimensions LxWxH': 'サイズ',
            'Water Resistance Level': '防水性能',
            'Frequency Response': '周波数特性',
            'Impedance': 'インピーダンス',
            'Sensitivity': '感度',
            'Driver Unit': 'ドライバー',
            // Catch-all for common patterns
            'Width': '幅', 'Height': '高さ', 'Depth': '奥行き', 'Weight': '重量'
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
            'お届け', 'ニュース', '配送', '在庫', '価格', '送料', '保証', 'JAN', '型番', '発売日',
            '関連', 'キャンペーン', '決済', 'お支払い', '返品', '取扱', '店舗',
            'Department', 'Date', 'Rank', 'Customer', 'Review', 'Best Sellers', 'Description'
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
            '音質', '画質', '座り心地', '使いやすさ', '効果', '性能', '静音性',
            '装着感', 'ノイキャン', 'ANC', '清掃能力', '吸引力'
        ];
        const isGradeField = gradeKeywords.some(k => label.includes(k));

        if (isGradeField) {
            if (value === '◎' || value === 'High' || value === 'Excellent' || value === 'Very Good' || value.includes('最高')) value = 'S';
            if (value === '○' || value === 'Good' || value === '対応' || value.includes('良好')) value = 'A';
            if (value === '△' || value === 'Average' || value.includes('普通')) value = 'B';
            if (value === '×' || value === 'Low' || value === 'Poor' || value === '非対応' || value.includes('悪い')) value = 'C';
        }

        // B. Battery / Power / Time Fields
        const powerKeywords = ['Battery', 'Power', 'Time', 'バッテリー', '電池', '稼働時間', '再生時間', '連続使用', '運転時間', '持続時間'];
        if (powerKeywords.some(k => label.includes(k))) {
            // Standardize confusing "○" to "要確認" (Verify)
            if (value === '○' || value === '対応') value = '詳細要確認';
        }

        // C. Feature / Function Fields (Cleaning)
        if (['機能', '特徴', 'Features', 'Function', '付属品', 'Accessories'].some(k => label.includes(k))) {
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
            // Case 2: Content conflict -> Prefer specific text over "○"/"A" 
            else if (existingWeight > 0 && newWeight === 0) {
                if (!isGradeField) {
                    uniqueSpecs.set(label, { label, value });
                }
            }
            // Case 3: Text vs Text -> Prefer longer/more detailed? Or AI source?
            else if ((existing.value === '○' || existing.value === '詳細要確認') && value !== '○') {
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
