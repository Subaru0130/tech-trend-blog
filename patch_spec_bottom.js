const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/spec_normalizer.js', 'utf8').split(/\r?\n/);

const newBlock = [
    "        // --- 1. JUNK FILTERING (Global Strict) ---",
    "        const junkKeywords = [",
    "            'お届け', 'ニュース', '配送', '在庫', '価格', '送料', '保証', 'JAN', '型番', '発売日',",
    "            '関連', 'キャンペーン', '決済', 'お支払い', '返品', '取扱', '店舗',",
    "            'Department', 'Date', 'Rank', 'Customer', 'Review', 'Best Sellers', 'Description',",
    "            // User Requested Blacklist (Irrelevant/Verbose metadata)",
    "            '付属品', '対象年齢', '素材', '用途', '推奨用途', '対応機器',",
    "            '操作方法', '操作方法', 'ケーブル機能', '個数', 'カスタマーレビュー',",
    "            'ベストセラーランク', 'メーカー', 'ASIN', '部品番号', '電池', '保証'",
    "        ];",
    "        // Filter if LABEL contains junk OR VALUE contains junk (long text only)",
    "        if (junkKeywords.some(k => label.includes(k) || (value.length > 50 && value.includes(k)))) return;",
    "        if (value === '' || value === '-') return;",
    "",
    "        // --- 1.5. UNKNOWN ENGLISH FILTER ---",
    "        if (/^[A-Za-z0-9\\s().-]+$/.test(label)) {",
    "            return;",
    "        }",
    "",
    "        // --- 2. FIELD NORMALIZATION ---",
    "        const gradeKeywords = [",
    "            'Quality', 'Performance', 'Comfort', 'Effect', 'Ease',",
    "            '音質', '画質', '座り心地', '使いやすさ', '効果', '性能', '静音性',",
    "            '装着感', 'ノイキャン', 'ANC', '清浄能力', '吸引力'",
    "        ];",
    "        const isGradeField = gradeKeywords.some(k => label.includes(k));",
    "",
    "        if (isGradeField) {",
    "            if (value === '◎' || value === 'High' || value === 'Excellent' || value === 'Very Good' || value.includes('最高')) value = 'S';",
    "            if (value === '〇' || value === 'Good' || value === '対応' || value.includes('良好')) value = 'A';",
    "            if (value === '△' || value === 'Average' || value.includes('普通')) value = 'B';",
    "            if (value === '×' || value === 'Low' || value === 'Poor' || value === '非対応' || value.includes('悪い')) value = 'C';",
    "        }",
    "",
    "        // B. Battery / Power / Time Fields",
    "        const powerKeywords = ['Battery', 'Power', 'Time', 'バッテリー', '電池', '稼働時間', '再生時間', '連続使用', '運転時間', '持続時間'];",
    "        if (powerKeywords.some(k => label.includes(k))) {",
    "            if (value === '〇' || value === '対応') value = '詳細要確認';",
    "        }",
    "",
    "        // C. Feature / Function Fields (Cleaning)",
    "        if (['機能', '特徴', 'Features', 'Function', '付属品', 'Accessories'].some(k => label.includes(k))) {",
    "            if (value.startsWith('[') || value.startsWith('{')) {",
    "                try {",
    "                    const parsed = JSON.parse(value);",
    "                    if (Array.isArray(parsed)) value = parsed.join(', ');",
    "                    else if (typeof parsed === 'object') value = Object.values(parsed).join(', ');",
    "                } catch (e) { /* ignore */ }",
    "            }",
    "            if (value.match(/^Ver\\d+\\.\\d+$/)) return;",
    "        }",
    "",
    "        // --- 3. DEDUPLICATION LOGIC ---",
    "        if (uniqueSpecs.has(label)) {",
    "            const existing = uniqueSpecs.get(label);",
    "            const existingWeight = getGradeWeight(existing.value);",
    "            const newWeight = getGradeWeight(value);",
    "",
    "            if (newWeight > 0 && newWeight >= existingWeight) {",
    "                uniqueSpecs.set(label, { label, value });",
    "            } else if (existingWeight > 0 && newWeight === 0) {",
    "                if (!isGradeField) uniqueSpecs.set(label, { label, value });",
    "            } else if ((existing.value === '〇' || existing.value === '詳細要確認') && value !== '〇') {",
    "                uniqueSpecs.set(label, { label, value });",
    "            }",
    "        } else {",
    "            uniqueSpecs.set(label, { label, value });",
    "        }",
    "    });",
    "",
    "    return Array.from(uniqueSpecs.values());",
    "}"
];

let start = -1; let end = -1;
for (let i = 0; i < lines.length; i++) {
    if (start === -1 && lines[i] && lines[i].includes('// --- 1. JUNK FILTERING')) start = i;
    if (start !== -1 && lines[i] && lines[i].includes('return Array.from(uniqueSpecs.values());')) {
        end = i + 1; // get the closing brace too
        break;
    }
}

if (start !== -1 && end !== -1) {
    // ensure we capture the closing brace on next line
    if (lines[end] === '}') end++;
    lines.splice(start, end - start, ...newBlock);
    console.log('Fixed from JUNK FILTERING to the end of normalizeSpecs');
} else {
    console.log('Could not find start/end.', start, end);
}
fs.writeFileSync('scripts/lib/spec_normalizer.js', lines.join('\n'));
