const fs = require('fs');
const path = require('path');
const { getGscConfig } = require('./lib/gsc_client');

function formatPercent(value) {
    return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

function formatPosition(value) {
    const num = Number(value || 0);
    return Number.isFinite(num) && num > 0 ? num.toFixed(1) : '-';
}

function printSection(title, entries, limit, recommendation) {
    console.log(`\n[${title}]`);

    if (!entries || entries.length === 0) {
        console.log('なし');
        return;
    }

    entries.slice(0, limit).forEach((entry, index) => {
        console.log(
            `${index + 1}. ${entry.slug || entry.id} | imp=${entry.impressions || 0} click=${entry.clicks || 0} ctr=${formatPercent(entry.ctr)} pos=${formatPosition(entry.position)}`
        );
        console.log(`   ${entry.url}`);
        if (entry.title) {
            console.log(`   ${entry.title}`);
        }
    });

    if (recommendation) {
        console.log(`=> ${recommendation}`);
    }
}

function main() {
    const config = getGscConfig({ requireSiteUrl: false });
    const latestPath = path.join(config.outputDir, 'gsc-report-latest.json');

    if (!fs.existsSync(latestPath)) {
        console.error('[GSC Actions] Report not found. Run `npm run gsc:report` first.');
        process.exitCode = 1;
        return;
    }

    const report = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
    const issues = report.issues || {};

    console.log(`[GSC Actions] Source: ${latestPath}`);
    console.log(`[GSC Actions] Generated: ${report.generatedAt || 'unknown'}`);

    printSection(
        'Quick Wins',
        issues.quickWin || [],
        5,
        'タイトル、description、導入文、内部リンクを先に見直す価値があるページです。'
    );

    printSection(
        'Growth Seeds',
        issues.growthSeeds || [],
        5,
        '周辺の別意図記事を増やす価値があるクラスターです。'
    );

    printSection(
        'Low CTR',
        issues.lowCtr || [],
        5,
        '順位の割にクリックが弱いので、検索結果上の見え方を優先して改善します。'
    );

    printSection(
        'Zero Impression',
        issues.zeroImpression || [],
        5,
        '公開済みなのに表示されないページです。重複、内部リンク、インデックス状態を確認します。'
    );
}

main();
