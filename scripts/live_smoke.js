const axios = require('axios');
const { getGscConfig, parseArgs } = require('./lib/gsc_client');
const { buildProjectPageInventory } = require('./lib/gsc_inventory');
const { checkLiveUrl, loadSitemapUrlSet, normalizeComparableUrl } = require('./lib/gsc_live_check');

async function fetchStatus(url) {
    const response = await axios.get(url, {
        maxRedirects: 5,
        timeout: 15000,
        responseType: 'text',
        validateStatus: () => true,
        headers: {
            'User-Agent': 'ChoiceGuide Live Smoke Check/1.0',
        },
    });

    return response.status;
}

function pickTargets(publicBaseUrl, inventory) {
    const baseUrl = publicBaseUrl.replace(/\/$/, '');
    const articleTargets = inventory.filter((entry) => entry.type === 'article').slice(0, 2);
    const reviewTargets = inventory.filter((entry) => entry.type === 'review').slice(0, 2);

    return [
        { label: 'home', url: `${baseUrl}/`, sitemapExpected: false, kind: 'system' },
        { label: 'robots', url: `${baseUrl}/robots.txt`, sitemapExpected: false, kind: 'system' },
        { label: 'sitemap', url: `${baseUrl}/sitemap.xml`, sitemapExpected: false, kind: 'system' },
        ...articleTargets.map((entry) => ({
            label: `article:${entry.slug}`,
            url: entry.url,
            sitemapExpected: true,
            kind: 'page',
            title: entry.title,
        })),
        ...reviewTargets.map((entry) => ({
            label: `review:${entry.slug}`,
            url: entry.url,
            sitemapExpected: true,
            kind: 'page',
            title: entry.title,
        })),
    ];
}

async function main() {
    const args = parseArgs();
    const config = getGscConfig({ requireSiteUrl: false });
    const publicBaseUrl = (args.baseUrl || config.publicBaseUrl).replace(/\/$/, '');
    const inventory = buildProjectPageInventory(publicBaseUrl);
    const sitemapUrlSet = await loadSitemapUrlSet(publicBaseUrl);
    const targets = pickTargets(publicBaseUrl, inventory);
    let hasFailure = false;

    console.log(`[Smoke] Base URL: ${publicBaseUrl}`);
    console.log(`[Smoke] Checking ${targets.length} targets...`);

    for (const target of targets) {
        if (target.kind === 'system') {
            const status = await fetchStatus(target.url);
            const ok = status >= 200 && status < 400;
            if (!ok) hasFailure = true;

            console.log(`${ok ? 'OK ' : 'NG '} ${target.label} ${status} ${target.url}`);
            continue;
        }

        const live = await checkLiveUrl(target.url);
        const inSitemap = sitemapUrlSet.has(normalizeComparableUrl(target.url));
        const canonicalOk = normalizeComparableUrl(live.canonical || live.url) === normalizeComparableUrl(target.url);
        const ok = live.status >= 200 && live.status < 400 && !live.hasNoindex && inSitemap && canonicalOk;

        if (!ok) hasFailure = true;

        const issues = [
            live.status >= 400 ? `status=${live.status}` : null,
            live.hasNoindex ? 'noindex' : null,
            !inSitemap ? 'missing_from_sitemap' : null,
            !canonicalOk ? `canonical=${live.canonical || 'missing'}` : null,
        ].filter(Boolean);

        console.log(
            `${ok ? 'OK ' : 'NG '} ${target.label} ${target.url}${issues.length ? ` [${issues.join(', ')}]` : ''}`
        );
    }

    if (hasFailure) {
        console.error('[Smoke] One or more live checks failed.');
        process.exitCode = 1;
        return;
    }

    console.log('[Smoke] All live checks passed.');
}

main().catch((error) => {
    console.error('[Smoke] Failed to run live smoke check.');
    console.error(error.message);
    process.exitCode = 1;
});
