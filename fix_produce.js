const fs = require('fs');
let lines = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8').split('\n');
lines[126] = "    const bannedPhrases = ['プロも認める', '専門家が選ぶ', '徹底取材', '決定版'];";
lines[130] = "            safeTitle = safeTitle.replace(phrase, '【必見】');";
fs.writeFileSync('scripts/produce_from_blueprint.js', lines.join('\n'));
console.log("Fixed lines 127 and 131.");
