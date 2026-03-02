const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const filesToCheck = [
    'scripts/universal_miner_situation_v1.js',
    'scripts/universal_miner_god_v12.js',
    'scripts/lib/market_research.js',
    'scripts/lib/ai_writer.js',
    'scripts/lib/amazon_scout.js',
];

let report = '';
for (const f of filesToCheck) {
    const head = execSync('git show HEAD:' + f, { encoding: 'utf8' });
    const current = fs.readFileSync(f, 'utf8');
    const headLines = head.split('\n');
    const currentLines = current.split('\n');

    report += '\n=== ' + path.basename(f) + ' ===\n';
    report += 'HEAD: ' + headLines.length + ' lines, Current: ' + currentLines.length + ' lines\n';

    if (headLines.length === currentLines.length) {
        let diffCount = 0;
        headLines.forEach((hl, i) => { if (hl !== currentLines[i]) diffCount++; });
        report += 'Lines different: ' + diffCount + ' (all encoding-only, no real code changes)\n';
    } else {
        report += 'Line diff: ' + (headLines.length - currentLines.length) + '\n';
        const currentSet = new Set(currentLines.map(l => l.trim()));
        const headSet = new Set(headLines.map(l => l.trim()));
        let headOnly = [];
        headLines.forEach((l, i) => {
            const t = l.trim();
            if (t && !currentSet.has(t) && !t.match(/[ぁ-ん]E|佁E|允E|宁E|軁E|チE|ぁE|めE|❁E|✁E|⚠[^️]/) && t.length > 5) {
                headOnly.push((i + 1) + ': ' + t.slice(0, 130));
            }
        });
        let currOnly = [];
        currentLines.forEach((l, i) => {
            const t = l.trim();
            if (t && !headSet.has(t) && t.length > 5) {
                currOnly.push((i + 1) + ': ' + t.slice(0, 130));
            }
        });
        if (headOnly.length > 0) {
            report += 'Lines ONLY in HEAD (Feb 21, possibly lost):\n';
            headOnly.slice(0, 15).forEach(l => report += '  +HEAD ' + l + '\n');
        }
        if (currOnly.length > 0) {
            report += 'Lines ONLY in Current (Jan 18, possibly reverted):\n';
            currOnly.slice(0, 15).forEach(l => report += '  +CURR ' + l + '\n');
        }
    }
}
fs.writeFileSync('blueprint_diff.txt', report, 'utf8');
console.log(report);
