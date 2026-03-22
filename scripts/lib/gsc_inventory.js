const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.resolve(process.cwd(), 'src/data/articles.json');
const PRODUCTS_PATH = path.resolve(process.cwd(), 'src/data/products.json');

function readJsonArray(filePath) {
    if (!fs.existsSync(filePath)) {
        return [];
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn(`[GSC] Failed to parse ${filePath}: ${error.message}`);
        return [];
    }
}

function toTimestamp(value) {
    if (!value) return 0;
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
}

function buildProjectPageInventory(publicBaseUrl) {
    const baseUrl = publicBaseUrl.replace(/\/$/, '');
    const articles = readJsonArray(ARTICLES_PATH);
    const products = readJsonArray(PRODUCTS_PATH);
    const seenUrls = new Set();
    const entries = [];

    for (const article of articles) {
        if (!article?.slug) continue;

        const url = `${baseUrl}/rankings/${article.slug}/`;
        if (seenUrls.has(url)) continue;
        seenUrls.add(url);

        entries.push({
            type: 'article',
            id: article.id || article.slug,
            slug: article.slug,
            title: article.title || '',
            url,
            publishedAt: article.publishedAt || '',
            updatedDate: article.updatedDate || article.publishedAt || '',
            sortTime: Math.max(toTimestamp(article.updatedDate), toTimestamp(article.publishedAt)),
        });
    }

    for (const product of products) {
        if (!product?.id) continue;

        const url = `${baseUrl}/reviews/${product.id}/`;
        if (seenUrls.has(url)) continue;
        seenUrls.add(url);

        entries.push({
            type: 'review',
            id: product.id,
            slug: product.id,
            title: product.name || product.id,
            url,
            publishedAt: product.publishedAt || '',
            updatedDate: product.updatedDate || product.publishedAt || '',
            sortTime: Math.max(toTimestamp(product.updatedDate), toTimestamp(product.publishedAt)),
        });
    }

    entries.sort((left, right) => right.sortTime - left.sortTime || left.url.localeCompare(right.url));

    return entries;
}

module.exports = {
    buildProjectPageInventory,
};
