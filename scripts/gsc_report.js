const {
    createGscContext,
    getDateRange,
    inspectUrl,
    parseArgs,
    parseNumber,
    querySearchAnalytics,
    summarizeInspectionPayload,
    writeJsonReport,
} = require('./lib/gsc_client');
const { buildProjectPageInventory } = require('./lib/gsc_inventory');
const { checkLiveUrl, loadSitemapUrlSet, normalizeComparableUrl } = require('./lib/gsc_live_check');

function daysSince(dateString) {
    if (!dateString) return Number.POSITIVE_INFINITY;
    const timestamp = new Date(dateString).getTime();
    if (!Number.isFinite(timestamp)) return Number.POSITIVE_INFINITY;
    const diffMs = Date.now() - timestamp;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getEntryAgeDays(entry) {
    const candidates = [entry.updatedDate, entry.publishedAt]
        .map((value) => daysSince(value))
        .filter((value) => Number.isFinite(value));

    if (candidates.length === 0) {
        return null;
    }

    return Math.min(...candidates);
}

function buildAnalyticsMap(rows) {
    const map = new Map();
    for (const row of rows || []) {
        const page = row.keys?.[0];
        if (!page) continue;
        map.set(normalizeComparableUrl(page), {
            clicks: row.clicks || 0,
            impressions: row.impressions || 0,
            ctr: row.ctr || 0,
            position: row.position || 0,
        });
    }
    return map;
}

function collectInspectionCandidates(entries, inspectionLimit) {
    const ranked = [...entries]
        .map((entry) => {
            const ageDays = entry.ageDays;
            let priority = 0;

            if (typeof ageDays === 'number' && ageDays >= 14 && entry.impressions === 0) priority += 50;
            if (typeof ageDays === 'number' && ageDays <= 30) priority += 25;
            if (entry.impressions >= 50 && entry.position >= 4 && entry.position <= 20 && entry.ctr < 0.01) priority += 15;
            if (entry.type === 'article') priority += 5;

            return { ...entry, priority };
        })
        .sort((left, right) => right.priority - left.priority || (left.ageDays ?? 99999) - (right.ageDays ?? 99999));

    return ranked.slice(0, inspectionLimit);
}

function sortByOpportunity(entries) {
    return [...entries].sort((left, right) => {
        const leftScore = (left.impressions || 0) * (20 - Math.min(left.position || 20, 20));
        const rightScore = (right.impressions || 0) * (20 - Math.min(right.position || 20, 20));
        return rightScore - leftScore || (right.impressions || 0) - (left.impressions || 0);
    });
}

async function main() {
    const args = parseArgs();
    const { authClient, config } = await createGscContext();
    const range = getDateRange(parseNumber(args.days, 28));
    const inventory = buildProjectPageInventory(config.publicBaseUrl);
    const sitemapUrlSet = await loadSitemapUrlSet(config.publicBaseUrl);

    const analyticsPayload = await querySearchAnalytics(authClient, config.siteUrl, {
        startDate: args.startDate || range.startDate,
        endDate: args.endDate || range.endDate,
        dimensions: ['page'],
        rowLimit: parseNumber(args.rowLimit, 25000),
        searchType: args.searchType || 'web',
        dataState: args.dataState || 'final',
    });

    const analyticsRows = analyticsPayload.rows || [];
    const analyticsMap = buildAnalyticsMap(analyticsRows);
    const lowCtrThreshold = parseNumber(args.ctrThreshold, 0.01);
    const lowCtrImpressionFloor = parseNumber(args.minImpressions, 50);
    const quickWinCtrThreshold = parseNumber(args.quickWinCtrThreshold, 0.02);
    const quickWinImpressionFloor = parseNumber(args.quickWinMinImpressions, 10);
    const quickWinMinPosition = parseNumber(args.quickWinMinPosition, 5);
    const quickWinMaxPosition = parseNumber(args.quickWinMaxPosition, 12);
    const growthMinClicks = parseNumber(args.growthMinClicks, 1);
    const growthMinImpressions = parseNumber(args.growthMinImpressions, 15);
    const growthMinPosition = parseNumber(args.growthMinPosition, 6);
    const growthMaxPosition = parseNumber(args.growthMaxPosition, 16);
    const liveCheckCache = new Map();

    async function getLiveResult(url) {
        if (liveCheckCache.has(url)) {
            return liveCheckCache.get(url);
        }

        const result = await checkLiveUrl(url);
        liveCheckCache.set(url, result);
        return result;
    }

    const zeroImpressionCandidates = [];
    const lowCtrCandidates = [];
    const quickWinCandidates = [];
    const growthSeedCandidates = [];

    for (const entry of inventory) {
        const normalizedUrl = normalizeComparableUrl(entry.url);
        const metrics = analyticsMap.get(normalizedUrl) || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
        const ageDays = getEntryAgeDays(entry);
        const inSitemap = sitemapUrlSet.has(normalizedUrl);

        if (typeof ageDays === 'number' && ageDays >= 14 && metrics.impressions === 0) {
            zeroImpressionCandidates.push({
                ...entry,
                ageDays,
                inSitemap,
                ...metrics,
                reason: 'published_or_updated_more_than_14_days_ago_but_has_zero_impressions',
            });
        }

        if (
            metrics.impressions >= lowCtrImpressionFloor &&
            metrics.position >= 4 &&
            metrics.position <= 20 &&
            metrics.ctr < lowCtrThreshold
        ) {
            lowCtrCandidates.push({
                ...entry,
                ageDays,
                inSitemap,
                ...metrics,
                reason: 'page_is_in_striking_distance_but_ctr_is_low',
            });
        }

        if (
            metrics.impressions >= quickWinImpressionFloor &&
            metrics.position >= quickWinMinPosition &&
            metrics.position <= quickWinMaxPosition &&
            metrics.ctr <= quickWinCtrThreshold
        ) {
            quickWinCandidates.push({
                ...entry,
                ageDays,
                inSitemap,
                ...metrics,
                reason: 'page_is_close_to_page_one_but_not_winning_clicks',
            });
        }

        if (
            metrics.clicks >= growthMinClicks &&
            metrics.impressions >= growthMinImpressions &&
            metrics.position >= growthMinPosition &&
            metrics.position <= growthMaxPosition
        ) {
            growthSeedCandidates.push({
                ...entry,
                ageDays,
                inSitemap,
                ...metrics,
                reason: 'page_has_early_traction_and_can_support_related_articles',
            });
        }
    }

    const pendingDeployIssues = [];
    const zeroImpressionIssues = [];
    const lowCtrIssues = [];
    const quickWinIssues = [];

    for (const candidate of [...zeroImpressionCandidates, ...lowCtrCandidates, ...quickWinCandidates]) {
        const live = await getLiveResult(candidate.url);
        const enriched = {
            ...candidate,
            live,
        };
        const isPublishedAndReachable = candidate.inSitemap && live.status < 400 && !live.hasNoindex;

        if (!isPublishedAndReachable) {
            pendingDeployIssues.push({
                ...enriched,
                reason:
                    !candidate.inSitemap ? 'not_in_live_sitemap' :
                    live.status >= 400 ? 'live_url_returns_http_error' :
                    'live_url_contains_noindex',
            });
            continue;
        }

        if (candidate.reason === 'published_or_updated_more_than_14_days_ago_but_has_zero_impressions') {
            zeroImpressionIssues.push(enriched);
        } else if (candidate.reason === 'page_is_close_to_page_one_but_not_winning_clicks') {
            quickWinIssues.push(enriched);
        } else {
            lowCtrIssues.push(enriched);
        }
    }

    const inspectionLimit = parseNumber(args.inspectionLimit, 15);
    const inspectionTargets = collectInspectionCandidates(
        [...zeroImpressionIssues, ...lowCtrIssues, ...quickWinIssues],
        inspectionLimit
    );
    const inspected = [];
    const indexingIssues = [];
    const canonicalIssues = [];
    const liveIssues = [];

    for (const target of inspectionTargets) {
        const payload = await inspectUrl(authClient, config.siteUrl, target.url);
        const summary = summarizeInspectionPayload(payload);
        const inspectionEntry = {
            ...target,
            ...summary,
        };
        inspected.push(inspectionEntry);

        if (summary.verdict !== 'PASS') {
            indexingIssues.push({
                ...inspectionEntry,
                reason: 'url_inspection_verdict_is_not_pass',
            });
        }

        if (
            summary.googleCanonical &&
            summary.userCanonical &&
            summary.googleCanonical !== summary.userCanonical
        ) {
            canonicalIssues.push({
                ...inspectionEntry,
                reason: 'google_canonical_differs_from_user_canonical',
            });
        }

        if (target.live.status >= 400 || target.live.hasNoindex) {
            liveIssues.push({
                ...inspectionEntry,
                reason: target.live.status >= 400 ? 'live_url_returns_http_error' : 'live_url_contains_noindex',
            });
        }
    }

    const reportPayload = {
        generatedAt: new Date().toISOString(),
        siteUrl: config.siteUrl,
        publicBaseUrl: config.publicBaseUrl,
        dateRange: {
            startDate: args.startDate || range.startDate,
            endDate: args.endDate || range.endDate,
        },
        thresholds: {
            lowCtrThreshold,
            lowCtrImpressionFloor,
            quickWinCtrThreshold,
            quickWinImpressionFloor,
            quickWinMinPosition,
            quickWinMaxPosition,
            growthMinClicks,
            growthMinImpressions,
            growthMinPosition,
            growthMaxPosition,
            inspectionLimit,
        },
        totals: {
            inventoryCount: inventory.length,
            analyticsRows: analyticsRows.length,
            zeroImpressionCandidateCount: zeroImpressionCandidates.length,
            lowCtrCandidateCount: lowCtrCandidates.length,
            quickWinCandidateCount: quickWinCandidates.length,
            growthSeedCandidateCount: growthSeedCandidates.length,
            pendingDeployCount: pendingDeployIssues.length,
            inspectedCount: inspected.length,
            zeroImpressionCount: zeroImpressionIssues.length,
            lowCtrCount: lowCtrIssues.length,
            quickWinCount: quickWinIssues.length,
            indexingIssueCount: indexingIssues.length,
            canonicalIssueCount: canonicalIssues.length,
            liveIssueCount: liveIssues.length,
        },
        issues: {
            zeroImpressionCandidates,
            lowCtrCandidates,
            quickWinCandidates: sortByOpportunity(quickWinCandidates),
            growthSeeds: sortByOpportunity(growthSeedCandidates),
            pendingDeploy: pendingDeployIssues,
            zeroImpression: zeroImpressionIssues,
            lowCtr: lowCtrIssues,
            quickWin: sortByOpportunity(quickWinIssues),
            indexing: indexingIssues,
            canonical: canonicalIssues,
            live: liveIssues,
        },
        inspected,
        recommendations: [
            pendingDeployIssues.length > 0 ? 'Pending deploy pages should be published or removed from the local inventory before SEO analysis.' : null,
            zeroImpressionIssues.length > 0 ? 'Published no-impression pages should be checked for internal links, content uniqueness, and query intent fit.' : null,
            lowCtrIssues.length > 0 ? 'Low-CTR pages should be reviewed for title, description, and search-intent alignment.' : null,
            quickWinIssues.length > 0 ? 'Quick-win pages are already near page one; tighten titles, intros, and internal links before creating more content.' : null,
            growthSeedCandidates.length > 0 ? 'Growth-seed pages are already getting traction; expand adjacent intents around those clusters first.' : null,
            canonicalIssues.length > 0 ? 'Canonical mismatch pages should be checked in Next metadata and rendered head tags.' : null,
            liveIssues.length > 0 ? 'Live HTTP issues should be fixed before waiting for Google to index the affected URLs.' : null,
        ].filter(Boolean),
    };

    const report = writeJsonReport(config, 'gsc-report', reportPayload);

    console.log(`[GSC] Inventory: ${inventory.length} pages`);
    console.log(`[GSC] Analytics rows: ${analyticsRows.length}`);
    console.log(`[GSC] Pending deploy / non-live pages: ${pendingDeployIssues.length}`);
    console.log(`[GSC] Zero-impression pages: ${zeroImpressionIssues.length}`);
    console.log(`[GSC] Low-CTR pages: ${lowCtrIssues.length}`);
    console.log(`[GSC] Quick-win pages: ${quickWinIssues.length}`);
    console.log(`[GSC] Growth-seed pages: ${growthSeedCandidates.length}`);
    console.log(`[GSC] Indexing issues: ${indexingIssues.length}`);
    console.log(`[GSC] Canonical issues: ${canonicalIssues.length}`);
    console.log(`[GSC] Live HTTP/noindex issues: ${liveIssues.length}`);
    console.log(`[GSC] Saved report: ${report.latestPath}`);
}

main().catch((error) => {
    console.error('[GSC] Failed to build the Search Console report.');
    console.error(error.message);
    process.exitCode = 1;
});
