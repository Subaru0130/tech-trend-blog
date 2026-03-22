const axios = require('axios');

function normalizeComparableUrl(rawUrl) {
    if (!rawUrl) return '';

    try {
        const url = new URL(rawUrl);
        url.hash = '';
        url.search = '';
        url.hostname = url.hostname.replace(/^www\./, '');

        if (url.pathname !== '/') {
            url.pathname = url.pathname.replace(/\/+$/, '');
        }

        return url.toString();
    } catch (error) {
        return String(rawUrl).trim().replace(/\/+$/, '');
    }
}

function extractFirstMatch(text, pattern) {
    const match = text.match(pattern);
    return match?.[1] || '';
}

async function fetchText(url) {
    const response = await axios.get(url, {
        maxRedirects: 5,
        timeout: 15000,
        responseType: 'text',
        validateStatus: () => true,
        headers: {
            'User-Agent': 'ChoiceGuide GSC Monitor/1.0',
        },
    });

    return response;
}

async function checkLiveUrl(targetUrl) {
    const response = await fetchText(targetUrl);
    const html = typeof response.data === 'string' ? response.data : '';
    const robotsMeta = extractFirstMatch(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);

    return {
        url: targetUrl,
        status: response.status,
        finalUrl: response.request?.res?.responseUrl || targetUrl,
        canonical: extractFirstMatch(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i),
        hasNoindex: /(^|,\s*)noindex(\s*,|$)/i.test(robotsMeta),
        title: extractFirstMatch(html, /<title>([^<]+)<\/title>/i),
    };
}

function extractLocs(xml) {
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());
}

async function loadSitemapUrlSet(baseUrl) {
    const sitemapIndexUrl = `${baseUrl.replace(/\/$/, '')}/sitemap.xml`;
    const indexResponse = await fetchText(sitemapIndexUrl);

    if (indexResponse.status !== 200 || typeof indexResponse.data !== 'string') {
        return new Set();
    }

    const indexLocs = extractLocs(indexResponse.data);
    const childSitemaps = indexLocs.filter((loc) => /sitemap-\d+\.xml/i.test(loc));
    const finalLocs = [];

    if (childSitemaps.length === 0) {
        finalLocs.push(...indexLocs);
    } else {
        for (const childSitemapUrl of childSitemaps) {
            const childResponse = await fetchText(childSitemapUrl);
            if (childResponse.status === 200 && typeof childResponse.data === 'string') {
                finalLocs.push(...extractLocs(childResponse.data));
            }
        }
    }

    return new Set(finalLocs.map(normalizeComparableUrl));
}

module.exports = {
    checkLiveUrl,
    loadSitemapUrlSet,
    normalizeComparableUrl,
};
