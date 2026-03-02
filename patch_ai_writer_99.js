const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split('\n');

lines[98] = "        return { title: `【2025】${keyword} おすすめランキング`, description: \"通勤や通学が快適になるガジェットを厳選紹介。\" };";

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
console.log('Fixed line 99.');
