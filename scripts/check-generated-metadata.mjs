import fs from 'fs';
import path from 'path';

const TODAY = new Date().toISOString().split('T')[0];
const ARTICLES_PATH = path.resolve(process.cwd(), 'src/data/articles.json');
const ARTICLES_DIR = path.resolve(process.cwd(), 'src/content/articles');

const MIN_TITLE_LENGTH = 16;
const MAX_TITLE_LENGTH = 52;
const MIN_DESCRIPTION_LENGTH = 40;
const MAX_DESCRIPTION_LENGTH = 125;

function normalizeAxisKey(value) {
    return String(value || '')
        .normalize('NFKC')
        .replace(/\s+/g, '')
        .replace(/[【】()[\]{}「」『』、,・:：]/g, '')
        .replace(/の有無$/u, '')
        .replace(/機能$|性能$|対応$/u, '')
        .replace(/自動(?=リフトアップ)/u, '')
        .trim();
}

function looksCutOff(text) {
    return /[しでとやがのにへをもは・「『【]$/u.test(text) ||
        /失敗し$|選び$|ための$|向けの$|比較し$/u.test(text);
}

function hasBalancedQuotes(text) {
    const pairs = [
        ['「', '」'],
        ['『', '』'],
        ['【', '】'],
    ];

    return pairs.every(([open, close]) => {
        const openCount = (text.match(new RegExp(open, 'gu')) || []).length;
        const closeCount = (text.match(new RegExp(close, 'gu')) || []).length;
        return openCount === closeCount;
    });
}

function fail(message) {
    console.error(`[METADATA] ERROR: ${message}`);
}

function warn(message) {
    console.warn(`[METADATA] WARN: ${message}`);
}

function info(message) {
    console.log(`[METADATA] ${message}`);
}

function normalize(value) {
    return String(value || '').trim();
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const articles = readJson(ARTICLES_PATH);
let exitCode = 0;

const slugCounts = new Map();
const titleCounts = new Map();

for (const article of articles) {
    const slug = normalize(article.slug || article.id);
    const title = normalize(article.title);

    if (slug) {
        slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
    }

    if (title) {
        titleCounts.set(title, (titleCounts.get(title) || 0) + 1);
    }
}

for (const [slug, count] of slugCounts.entries()) {
    if (count > 1) {
        fail(`Duplicate slug detected: ${slug}`);
        exitCode = 1;
    }
}

const focusArticles = articles.filter((article) => {
    const publishedAt = normalize(article.publishedAt);
    const updatedDate = normalize(article.updatedDate);
    return publishedAt === TODAY || updatedDate === TODAY;
});

if (focusArticles.length === 0) {
    info(`No articles were published or updated on ${TODAY}. Skipping per-article checks.`);
    process.exit(exitCode);
}

info(`Checking ${focusArticles.length} article(s) updated on ${TODAY}.`);

for (const article of focusArticles) {
    const slug = normalize(article.slug || article.id);
    const title = normalize(article.title);
    const description = normalize(article.description);
    const rankingCriteria = article.rankingCriteria || {};
    const rankingPoints = Array.isArray(rankingCriteria.points) ? rankingCriteria.points : [];
    const uniqueRankingTitles = new Set(
        rankingPoints.map((point) => normalize(point?.title)).filter(Boolean)
    );
    const normalizedRankingTitles = new Set(
        rankingPoints.map((point) => normalizeAxisKey(point?.title)).filter(Boolean)
    );
    const buyingGuideSteps = Array.isArray(article.buyingGuide?.steps) ? article.buyingGuide.steps : [];
    const uniqueStepTitles = new Set(
        buyingGuideSteps.map((step) => normalize(step?.title)).filter(Boolean)
    );
    const specLabels = article.specLabels || {};
    const articlePath = path.join(ARTICLES_DIR, `${slug}.md`);

    if (!slug) {
        fail(`Article is missing slug/id: ${title || '(untitled)'}`);
        exitCode = 1;
        continue;
    }

    if (!fs.existsSync(articlePath)) {
        fail(`Missing markdown file for slug "${slug}"`);
        exitCode = 1;
    }

    if (!title) {
        fail(`Missing title for "${slug}"`);
        exitCode = 1;
    } else {
        if (title.length < MIN_TITLE_LENGTH) {
            warn(`Title is short for "${slug}" (${title.length} chars): ${title}`);
        }
        if (title.length > MAX_TITLE_LENGTH) {
            fail(`Title is too long for "${slug}" (${title.length} chars): ${title}`);
            exitCode = 1;
        }
        if (looksCutOff(title)) {
            fail(`Title looks cut off for "${slug}": ${title}`);
            exitCode = 1;
        }
        if (!hasBalancedQuotes(title)) {
            fail(`Title has unbalanced quotes/brackets for "${slug}": ${title}`);
            exitCode = 1;
        }
        if ((titleCounts.get(title) || 0) > 1) {
            fail(`Duplicate title detected for "${slug}": ${title}`);
            exitCode = 1;
        }
    }

    if (!description) {
        fail(`Missing description for "${slug}"`);
        exitCode = 1;
    } else {
        if (description.length < MIN_DESCRIPTION_LENGTH) {
            warn(`Description is short for "${slug}" (${description.length} chars).`);
        }
        if (description.length > MAX_DESCRIPTION_LENGTH) {
            fail(`Description is too long for "${slug}" (${description.length} chars).`);
            exitCode = 1;
        }
        if (looksCutOff(description)) {
            fail(`Description looks cut off for "${slug}".`);
            exitCode = 1;
        }
        if (!hasBalancedQuotes(description)) {
            fail(`Description has unbalanced quotes/brackets for "${slug}".`);
            exitCode = 1;
        }
    }

    if (!normalize(rankingCriteria.description)) {
        fail(`Missing rankingCriteria.description for "${slug}"`);
        exitCode = 1;
    }

    if (uniqueRankingTitles.size < 3) {
        fail(`rankingCriteria.points must contain at least 3 distinct items for "${slug}"`);
        exitCode = 1;
    }
    if (normalizedRankingTitles.size < 3) {
        fail(`rankingCriteria.points are too repetitive after normalization for "${slug}"`);
        exitCode = 1;
    }

    if (buyingGuideSteps.length < 3 || uniqueStepTitles.size < 3) {
        fail(`buyingGuide.steps must contain at least 3 distinct steps for "${slug}"`);
        exitCode = 1;
    }

    const labelValues = Object.values(specLabels).map((value) => normalize(value)).filter(Boolean);
    if (labelValues.length < 3) {
        fail(`specLabels must contain at least 3 labels for "${slug}"`);
        exitCode = 1;
    }
    const normalizedSpecLabels = new Set(labelValues.map((value) => normalizeAxisKey(value)).filter(Boolean));
    if (normalizedSpecLabels.size < 3) {
        fail(`specLabels are too repetitive after normalization for "${slug}"`);
        exitCode = 1;
    }
}

if (exitCode === 0) {
    info('Generated metadata checks passed.');
}

process.exit(exitCode);
