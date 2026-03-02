const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/generator.js', 'utf8').split(/\r?\n/);

const newBlock = [
    "    // Situation / modifier mappings",
    "    const situationMappings = {",
    "        '耳が小さい': 'small-ears',",
    "        'ジム': 'gym',",
    "        '防水': 'waterproof',",
    "        'テレワーク': 'telework',",
    "        '会議': 'meeting',",
    "        '飛行機': 'airplane',",
    "        '睡眠': 'sleep',",
    "        '寝ホン': 'sleep',",
    "        'ゲーム': 'gaming',",
    "        'FPS': 'fps',",
    "        '低遅延': 'low-latency',",
    "        'PC接続': 'pc-connect',",
    "        'パソコン': 'pc',",
    "        '初心者': 'beginner',",
    "        '女性': 'women',",
    "        'かわいい': 'cute',",
    "        'おしゃれ': 'stylish',",
    "        'ランニング': 'running',",
    "        'プレゼント': 'gift'",
    "    };"
];

for (let i = 35; i < 50; i++) {
    if (lines[i] && lines[i].includes('// Situation / modifier mappings')) {
        let endIdx = i;
        while (!lines[endIdx].includes('};')) {
            endIdx++;
        }
        lines.splice(i, endIdx - i + 1, ...newBlock);
        console.log("Fixed situationMappings");
        break;
    }
}

fs.writeFileSync('scripts/lib/generator.js', lines.join('\n'));
