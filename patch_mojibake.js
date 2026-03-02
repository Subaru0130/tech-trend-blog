const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split(/\r?\n/);

// Line 127: ['プロも認めぁE, '専門家が選ぶ', '徹底取杁E, '決定版']
lines[126] = "    const bannedPhrases = ['プロも認める', '専門家が選ぶ', '徹底取材', '決定版'];";

// Line 131: safeTitle = safeTitle.replace(phrase, '【忁E、E);
lines[130] = "            safeTitle = safeTitle.replace(phrase, '【必見】');";

// Line 148: if (kw.match(/イヤホン|ヘ...
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('nces\';ン/)) return \'home-applian')) {
        // Corrupted block around line 150
        lines[i - 1] = "    if (kw.match(/イヤホン|ヘッドホン|スピーカー/)) return 'audio';";
        lines[i] = "    // Home appliances";
        lines[i + 1] = "    if (kw.match(/冷蔵庫|洗濯機|エアコン/)) return 'home-appliances';";
        lines[i + 2] = "    // Camera";
        lines[i + 3] = "    if (kw.match(/カメラ|レンズ/)) return 'camera';";
        lines[i + 4] = "    return 'electronics';";
        console.log("Fixed corrupted categories");
    }

    if (lines[i].includes("res.join(', ') : '特になぁE}")) {
        lines[i] = "   【必須機能リスト】 ${requiredFeatures.length > 0 ? requiredFeatures.join(', ') : '特になし'}";
    }

    if (lines[i].includes("、E*?、Eg")) {
        lines[i] = lines[i].replace(/、E\*\?、Eg/g, "【.*?】/g");
    }

    if (lines[i].includes("丁EE以丁E")) {
        lines[i] = lines[i].replace(/丁EE以丁E/g, "万円以下");
    }
}

fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
console.log('Fixed Mojibake');
