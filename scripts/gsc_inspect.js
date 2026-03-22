const {
    createGscContext,
    inspectUrl,
    parseArgs,
    parseNumber,
    summarizeInspectionPayload,
    writeJsonReport,
} = require('./lib/gsc_client');
const { buildProjectPageInventory } = require('./lib/gsc_inventory');

function pickInspectionTargets(args, publicBaseUrl) {
    if (args.url) {
        return [{ type: 'manual', title: args.url, url: args.url }];
    }

    let entries = buildProjectPageInventory(publicBaseUrl);
    if (args.type === 'article' || args.type === 'review') {
        entries = entries.filter((entry) => entry.type === args.type);
    }

    const limit = parseNumber(args.limit, 10);
    return entries.slice(0, limit);
}

async function main() {
    const args = parseArgs();
    const { authClient, config } = await createGscContext();
    const targets = pickInspectionTargets(args, config.publicBaseUrl);

    if (targets.length === 0) {
        console.log('[GSC] No URLs selected for inspection.');
        return;
    }

    const results = [];
    for (const target of targets) {
        const payload = await inspectUrl(authClient, config.siteUrl, target.url);
        const summary = summarizeInspectionPayload(payload);
        results.push({
            ...target,
            ...summary,
            raw: payload,
        });
        console.log(`- ${target.url} => ${summary.verdict} / ${summary.coverageState}`);
    }

    const report = writeJsonReport(config, 'gsc-inspect', {
        generatedAt: new Date().toISOString(),
        siteUrl: config.siteUrl,
        inspectedCount: results.length,
        results,
    });

    console.log(`[GSC] Inspected URLs: ${results.length}`);
    console.log(`[GSC] Saved report: ${report.latestPath}`);
}

main().catch((error) => {
    console.error('[GSC] Failed to inspect URLs.');
    console.error(error.message);
    process.exitCode = 1;
});
