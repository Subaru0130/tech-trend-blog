const fs = require('fs');
let content = fs.readFileSync('scripts/lib/market_research.js', 'utf8');

// The original line 214 might look like:
// if (title.includes("比輁E) || title.includes("レビュー") || title.includes("実橁E) || title.includes("検証")) {

let newContent = content.replace(/title\.includes\("比輁E\) \|\| title\.includes\("レビュー"\) \|\| title\.includes\("実橁E\) \|\| title\.includes\("検証"\)/g,
    'title.includes("比較") || title.includes("レビュー") || title.includes("実機") || title.includes("検証")');

if (newContent !== content) {
    console.log("Fixed market_research.js title.includes mojibake");
    fs.writeFileSync('scripts/lib/market_research.js', newContent);
} else {
    // try to split and just replace around line 214
    let lines = content.split(/\\r?\\n/);
    for (let i = 200; i < 230; i++) {
        if (lines[i] && lines[i].includes('title.includes(') && lines[i].includes('E)')) {
            lines[i] = '                if (title.includes("比較") || title.includes("レビュー") || title.includes("実機") || title.includes("検証")) {';
            console.log("Fixed market_research.js via line replace");
            break;
        }
    }
    fs.writeFileSync('scripts/lib/market_research.js', lines.join('\\n'));
}
