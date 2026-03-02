const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/generator.js', 'utf8').split(/\r?\n/);

const newBlock = [
    "function generateDefaultLabels(keyword, blueprint = {}) {",
    "    const kw = keyword.toLowerCase();",
    "    if (kw.match(/イヤホン|ヘッドホン|スピーカー/)) {",
    "        return { spec1: '音質', spec2: 'ノイキャン', spec3: 'バッテリー', spec4: '機能' };",
    "    }",
    "    if (kw.match(/冷蔵庫/)) {",
    "        return { spec1: '容量', spec2: '省エネ', spec3: '機能', spec4: 'サイズ' };",
    "    }",
    "    if (kw.match(/洗濯機/)) {",
    "        return { spec1: '容量', spec2: '乾燥機能', spec3: '静音性', spec4: '省エネ' };",
    "    }",
    "    if (kw.match(/エアコン/)) {",
    "        return { spec1: '適用畳数', spec2: '省エネ', spec3: '機能', spec4: '静音性' };",
    "    }",
    "    if (kw.match(/掃除機|ロボット/)) {",
    "        return { spec1: '吸引力', spec2: '稼働時間', spec3: '軽さ', spec4: '機能' };",
    "    }",
    "    if (kw.match(/カメラ|一眼|ミラーレス/)) {",
    "        return { spec1: '画質', spec2: 'AF性能', spec3: '動画性能', spec4: '携帯性' };",
    "    }",
    "    return { spec1: '性能', spec2: '機能', spec3: 'コスパ', spec4: '評価' };",
    "}",
    "",
    "/**",
    " * Generate dynamic buying guide steps based on keyword/blueprint",
    " */",
    "function generateBuyingGuideSteps(keyword, blueprint = {}) {",
    "    const kw = keyword.toLowerCase();",
    "    const axis = blueprint.comparison_axis || '';",
    "    if (kw.match(/イヤホン|ヘッドホン/)) {",
    "        return [",
    "            { icon: 'check', title: '1. ノイズキャンセリング', description: '静寂性能がどこまで進化したか' },",
    "            { icon: 'check', title: '2. 音質・コーデック', description: '対応コーデックで音質が変わる' },",
    "            { icon: 'check', title: '3. バッテリー持ち', description: '使用時間と充電の利便性' }",
    "        ];",
    "    }",
    "    if (kw.match(/冷蔵庫/)) {",
    "        return [",
    "            { icon: 'check', title: '1. 容量の目安', description: '家族人数×70L+常備品が基本' },",
    "            { icon: 'check', title: '2. 省エネ性能', description: '年間電気代のチェック方法' },",
    "            { icon: 'check', title: '3. 設置サイズ', description: '搬入経路も含めた確認ポイント' }",
    "        ];",
    "    }",
    "    if (kw.match(/カメラ|一眼/)) {",
    "        return [",
    "            { icon: 'check', title: '1. センサーサイズ', description: '画質と暗所性能を決める要素' },",
    "            { icon: 'check', title: '2. AF性能', description: '被写体追従とピント精度' },",
    "            { icon: 'check', title: '3. 動画性能', description: '4K撮影と手ブレ補正' }",
    "        ];",
    "    }",
    "    if (axis) {",
    "        const axes = axis.split(/[、\\/]/).slice(0, 3);",
    "        return axes.map((a, i) => ({",
    "            icon: 'check',",
    "            title: `${i + 1}. ${a.trim()}`,",
    "            description: `${a.trim()}のチェックポイント。`",
    "        }));",
    "    }",
    "    return [",
    "        { icon: 'check', title: '1. 基本性能', description: 'コアとなる機能をチェック' },",
    "        { icon: 'check', title: '2. コストパフォーマンス', description: '価格に見合っているか' },",
    "        { icon: 'check', title: '3. 使いやすさ', description: '日常での利便性' }",
    "    ];",
    "}",
    "",
    "/**",
    " * Helper: Select icon based on label text",
    " */",
    "function getIconForLabel(label) {",
    "    if (!label) return 'check_circle';",
    "    const l = label.toLowerCase();",
    "    if (l.match(/音|サウンド|sound/)) return 'graphic_eq';",
    "    if (l.match(/ノイキャン|静寂|noise/)) return 'noise_control_off';",
    "    if (l.match(/バッテリー|電池|充電|稼働|battery/)) return 'battery_charging_full';",
    "    if (l.match(/機能|多機能|function/)) return 'settings';",
    "    if (l.match(/サイズ|大きさ|寸法|size|width/)) return 'straighten';",
    "    if (l.match(/重さ|重量|軽さ|weight/)) return 'weight';",
    "    if (l.match(/容量|収納|capacity/)) return 'inventory_2';",
    "    if (l.match(/画質|解像度|image|reoslution/)) return 'hd';",
    "    if (l.match(/省エネ|電気代|eco/)) return 'eco';",
    "    if (l.match(/デザイン|見た目|color|design/)) return 'palette';",
    "    if (l.match(/吸引力|suction/)) return 'cleaning_services';",
    "    if (l.match(/乾燥/)) return 'wb_sunny';",
    "    return 'check_circle';",
    "}"
];

let start = -1;
let end = -1;
for (let i = 0; i < lines.length; i++) {
    if (start === -1 && lines[i] && lines[i].includes('function generateDefaultLabels(')) {
        start = i;
    }
    if (start !== -1 && lines[i] && lines[i].includes('return "check_circle";')) {
        if (lines[i + 1] === '}') {
            end = i + 1;
            break;
        }
    }
}

if (start !== -1 && end !== -1) {
    lines.splice(start, end - start + 1, ...newBlock);
    console.log('Fixed generateDefaultLabels and helpers');
}

fs.writeFileSync('scripts/lib/generator.js', lines.join('\n'));
