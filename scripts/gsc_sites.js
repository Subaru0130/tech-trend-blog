const {
    createGscContext,
    listSites,
    writeJsonReport,
} = require('./lib/gsc_client');

async function main() {
    const { authClient, config } = await createGscContext({ requireSiteUrl: false });
    const sites = await listSites(authClient);

    const payload = {
        generatedAt: new Date().toISOString(),
        configuredSiteUrl: config.siteUrl || null,
        siteCount: sites.length,
        sites,
    };

    const report = writeJsonReport(config, 'gsc-sites', payload);

    console.log(`[GSC] Accessible properties: ${sites.length}`);
    for (const site of sites) {
        console.log(`- ${site.siteUrl} (${site.permissionLevel})`);
    }
    console.log(`[GSC] Saved report: ${report.latestPath}`);

    if (config.siteUrl) {
        const matched = sites.find((site) => site.siteUrl === config.siteUrl);
        if (!matched) {
            console.warn(`[GSC] Warning: GSC_SITE_URL="${config.siteUrl}" is not visible to this service account.`);
        }
    }
}

main().catch((error) => {
    console.error('[GSC] Failed to list Search Console properties.');
    console.error(error.message);
    process.exitCode = 1;
});
