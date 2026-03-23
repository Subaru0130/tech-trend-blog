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

function pickTop(entries, limit = 5) {
    return Array.isArray(entries) ? entries.slice(0, limit) : [];
}

function renderEntry(entry, index) {
    return [
        `${index + 1}. ${entry.title || entry.slug || entry.id}`,
        `   URL: ${entry.url}`,
        `   指標: imp=${entry.impressions || 0}, click=${entry.clicks || 0}, ctr=${formatPercent(entry.ctr)}, pos=${formatPosition(entry.position)}`,
    ].join('\n');
}

function renderSection(title, entries, emptyMessage, recommendation) {
    const lines = [`## ${title}`];

    if (!entries || entries.length === 0) {
        lines.push(emptyMessage);
    } else {
        lines.push(...entries.map((entry, index) => renderEntry(entry, index)));
    }

    if (recommendation) {
        lines.push('');
        lines.push(`次の一手: ${recommendation}`);
    }

    return lines.join('\n');
}

function main() {
    const config = getGscConfig({ requireSiteUrl: false });
    const latestJsonPath = path.join(config.outputDir, 'gsc-report-latest.json');

    if (!fs.existsSync(latestJsonPath)) {
        console.error('[GSC Weekly] 最新レポートがありません。先に `npm run gsc:report` を実行してください。');
        process.exitCode = 1;
        return;
    }

    const report = JSON.parse(fs.readFileSync(latestJsonPath, 'utf8'));
    const issues = report.issues || {};
    const generatedAt = report.generatedAt || new Date().toISOString();
    const dateRange = report.dateRange || {};

    const quickWins = pickTop(issues.quickWin, 5);
    const growthSeeds = pickTop(issues.growthSeeds, 5);
    const lowCtr = pickTop(issues.lowCtr, 5);
    const zeroImpression = pickTop(issues.zeroImpression, 5);

    const overview = [
        '# ChoiceGuide 週次GSCレポート',
        '',
        `- 生成日時: ${generatedAt}`,
        `- 集計期間: ${dateRange.startDate || '-'} ～ ${dateRange.endDate || '-'}`,
        `- 対象サイト: ${report.publicBaseUrl || config.publicBaseUrl}`,
        '',
        '## サマリー',
        `- 公開・技術状態: pending deploy ${report.totals?.pendingDeployCount || 0} / indexing issues ${report.totals?.indexingIssueCount || 0} / canonical issues ${report.totals?.canonicalIssueCount || 0}`,
        `- 先に直す候補: quick-win ${report.totals?.quickWinCount || 0} 件`,
        `- 次に伸ばす候補: growth-seed ${report.totals?.growthSeedCandidateCount || 0} 件`,
        `- 低CTRページ: ${report.totals?.lowCtrCount || 0} 件`,
        `- 表示ゼロページ: ${report.totals?.zeroImpressionCount || 0} 件`,
        '',
        renderSection(
            '先に直す価値が高いページ',
            quickWins,
            '該当なし',
            'タイトル、description、導入文、関連記事導線を優先して見直します。'
        ),
        '',
        renderSection(
            '次に伸ばす候補クラスター',
            growthSeeds,
            '該当なし',
            '周辺の別意図記事を増やすなら、このクラスターから着手します。'
        ),
        '',
        renderSection(
            '低CTRページ',
            lowCtr,
            '該当なし',
            '表示はあるのにクリックされていないページなので、見出しと説明文を優先して改善します。'
        ),
        '',
        renderSection(
            '表示ゼロページ',
            zeroImpression,
            '該当なし',
            '公開済みなのに表示されていないページです。重複、内部リンク、インデックス状態を確認します。'
        ),
        '',
        '## 今週の結論',
    ];

    if (quickWins.length === 0 && growthSeeds.length === 0) {
        overview.push('- 先に動くべき候補は少なく、技術面とインデックス監視を優先します。');
    } else {
        if (quickWins.length > 0) {
            overview.push(`- 先に直すなら: ${quickWins.map((entry) => entry.slug).join(' / ')}`);
        }
        if (growthSeeds.length > 0) {
            overview.push(`- 次に増やすなら: ${growthSeeds.map((entry) => entry.slug).join(' / ')}`);
        }
    }

    const markdown = overview.join('\n');
    const latestMarkdownPath = path.join(config.outputDir, 'weekly-report-latest.md');
    const timestamp = new Date(generatedAt).toISOString().replace(/[:.]/g, '-');
    const datedMarkdownPath = path.join(config.outputDir, `weekly-report-${timestamp}.md`);

    fs.mkdirSync(config.outputDir, { recursive: true });
    fs.writeFileSync(latestMarkdownPath, markdown, 'utf8');
    fs.writeFileSync(datedMarkdownPath, markdown, 'utf8');

    console.log(markdown);
    console.log(`\n[GSC Weekly] Saved: ${latestMarkdownPath}`);
}

main();
