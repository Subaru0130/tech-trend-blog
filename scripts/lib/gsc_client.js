const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { google } = require('googleapis');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const READONLY_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

function resolveMaybeRelativePath(targetPath) {
    if (!targetPath) return null;
    return path.isAbsolute(targetPath) ? targetPath : path.resolve(process.cwd(), targetPath);
}

function getConfiguredKeyFile() {
    const candidates = [
        process.env.GSC_SERVICE_ACCOUNT_KEY_FILE,
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
    ].filter(Boolean);

    for (const candidate of candidates) {
        const resolved = resolveMaybeRelativePath(candidate);
        if (resolved && fs.existsSync(resolved)) {
            return resolved;
        }
    }

    return null;
}

function getGscConfig(options = {}) {
    const { requireSiteUrl = true } = options;
    const keyFile = getConfiguredKeyFile();
    const siteUrl = process.env.GSC_SITE_URL || '';
    const publicBaseUrl = (process.env.GSC_PUBLIC_BASE_URL || 'https://choiceguide.jp').replace(/\/$/, '');
    const outputDir = path.resolve(process.cwd(), process.env.GSC_REPORT_OUTPUT_DIR || '.cache/gsc');

    if (!keyFile) {
        throw new Error(
            'GSC service account key not found. Set GSC_SERVICE_ACCOUNT_KEY_FILE or GOOGLE_APPLICATION_CREDENTIALS in .env.local.'
        );
    }

    if (requireSiteUrl && !siteUrl) {
        throw new Error(
            'GSC_SITE_URL is not set in .env.local. Use either https://example.com/ or sc-domain:example.com.'
        );
    }

    return {
        keyFile,
        siteUrl,
        publicBaseUrl,
        outputDir,
    };
}

async function createGscContext(options = {}) {
    const config = getGscConfig(options);
    const auth = new google.auth.GoogleAuth({
        keyFile: config.keyFile,
        scopes: [READONLY_SCOPE],
    });

    return {
        config,
        authClient: await auth.getClient(),
    };
}

function ensureDirSync(targetDir) {
    fs.mkdirSync(targetDir, { recursive: true });
}

function writeJsonReport(config, prefix, payload) {
    ensureDirSync(config.outputDir);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(config.outputDir, `${prefix}-${timestamp}.json`);
    const latestPath = path.join(config.outputDir, `${prefix}-latest.json`);
    const serialized = JSON.stringify(payload, null, 2);

    fs.writeFileSync(filePath, serialized, 'utf8');
    fs.writeFileSync(latestPath, serialized, 'utf8');

    return { filePath, latestPath };
}

function toIsoDate(dateLike) {
    const value = dateLike instanceof Date ? dateLike : new Date(dateLike);
    return value.toISOString().slice(0, 10);
}

function getDateRange(days = 28) {
    const end = new Date();
    end.setDate(end.getDate() - 1);

    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));

    return {
        startDate: toIsoDate(start),
        endDate: toIsoDate(end),
    };
}

function parseArgs(argv = process.argv.slice(2)) {
    const args = {};

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];
        if (!token.startsWith('--')) {
            continue;
        }

        const key = token.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
        const next = argv[index + 1];

        if (!next || next.startsWith('--')) {
            args[key] = true;
            continue;
        }

        args[key] = next;
        index += 1;
    }

    return args;
}

function parseNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function encodeSiteUrl(siteUrl) {
    return encodeURIComponent(siteUrl);
}

async function listSites(authClient) {
    const response = await authClient.request({
        url: 'https://www.googleapis.com/webmasters/v3/sites',
        method: 'GET',
    });

    return response.data?.siteEntry || [];
}

async function querySearchAnalytics(authClient, siteUrl, requestBody) {
    const response = await authClient.request({
        url: `https://www.googleapis.com/webmasters/v3/sites/${encodeSiteUrl(siteUrl)}/searchAnalytics/query`,
        method: 'POST',
        data: requestBody,
    });

    return response.data || {};
}

async function inspectUrl(authClient, siteUrl, inspectionUrl, languageCode = 'ja-JP') {
    const response = await authClient.request({
        url: 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
        method: 'POST',
        data: {
            inspectionUrl,
            siteUrl,
            languageCode,
        },
    });

    return response.data || {};
}

function summarizeInspectionPayload(payload) {
    const result = payload?.inspectionResult || {};
    const indexStatusResult = result.indexStatusResult || {};

    return {
        verdict: indexStatusResult.verdict || 'UNKNOWN',
        coverageState: indexStatusResult.coverageState || 'UNKNOWN',
        indexingState: indexStatusResult.indexingState || 'UNKNOWN',
        robotsTxtState: indexStatusResult.robotsTxtState || 'UNKNOWN',
        lastCrawlTime: indexStatusResult.lastCrawlTime || '',
        googleCanonical: indexStatusResult.googleCanonical || '',
        userCanonical: indexStatusResult.userCanonical || '',
        referringUrls: indexStatusResult.referringUrls || [],
        crawledAs: indexStatusResult.crawledAs || '',
        pageFetchState: indexStatusResult.pageFetchState || '',
    };
}

module.exports = {
    createGscContext,
    getDateRange,
    getGscConfig,
    inspectUrl,
    listSites,
    parseArgs,
    parseNumber,
    querySearchAnalytics,
    summarizeInspectionPayload,
    toIsoDate,
    writeJsonReport,
};
