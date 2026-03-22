const {
    createGscContext,
    getDateRange,
    parseArgs,
    parseNumber,
    querySearchAnalytics,
    writeJsonReport,
} = require('./lib/gsc_client');

function buildFilters(args) {
    const filters = [];

    if (args.page) {
        filters.push({
            dimension: 'page',
            operator: 'equals',
            expression: args.page,
        });
    }

    if (args.query) {
        filters.push({
            dimension: 'query',
            operator: 'contains',
            expression: args.query,
        });
    }

    return filters;
}

async function main() {
    const args = parseArgs();
    const { authClient, config } = await createGscContext();
    const range = getDateRange(parseNumber(args.days, 28));
    const dimensions = String(args.dimensions || 'page,query')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

    const filters = buildFilters(args);

    const requestBody = {
        startDate: args.startDate || range.startDate,
        endDate: args.endDate || range.endDate,
        dimensions,
        rowLimit: parseNumber(args.rowLimit, 25000),
        startRow: parseNumber(args.startRow, 0),
        searchType: args.searchType || 'web',
        dataState: args.dataState || 'final',
    };

    if (filters.length > 0) {
        requestBody.dimensionFilterGroups = [{ groupType: 'and', filters }];
    }

    const payload = await querySearchAnalytics(authClient, config.siteUrl, requestBody);
    const rows = payload.rows || [];

    const report = writeJsonReport(config, 'gsc-analytics', {
        generatedAt: new Date().toISOString(),
        siteUrl: config.siteUrl,
        requestBody,
        rowCount: rows.length,
        response: payload,
    });

    console.log(`[GSC] Analytics rows: ${rows.length}`);
    console.log(`[GSC] Date range: ${requestBody.startDate} -> ${requestBody.endDate}`);
    console.log(`[GSC] Saved report: ${report.latestPath}`);

    for (const row of rows.slice(0, 20)) {
        const keys = row.keys || [];
        const label = keys.join(' | ');
        console.log(
            `- ${label || '(no keys)'} | clicks=${row.clicks || 0} impressions=${row.impressions || 0} ctr=${((row.ctr || 0) * 100).toFixed(2)}% position=${(row.position || 0).toFixed(2)}`
        );
    }
}

main().catch((error) => {
    console.error('[GSC] Failed to fetch analytics data.');
    console.error(error.message);
    process.exitCode = 1;
});
