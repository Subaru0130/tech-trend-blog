import { Article } from '@/types';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toTimestamp(value?: string): number {
    if (!value) return 0;

    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function getArticleDisplayDate(article: Pick<Article, 'publishDate' | 'publishedAt' | 'updatedDate'>): string {
    return article.publishDate || article.publishedAt || article.updatedDate || '';
}

export function getArticleTimestamp(article: Pick<Article, 'publishDate' | 'publishedAt' | 'updatedDate'>): number {
    return toTimestamp(getArticleDisplayDate(article));
}

export function normalizeArticle(article: Article): Article {
    return {
        ...article,
        image: article.image || article.thumbnail,
        publishDate: getArticleDisplayDate(article),
        tags: article.tags || [],
    };
}

export function isRankingArticle(article: Article): boolean {
    const tags = article.tags || [];

    return Boolean(
        article.rankingCriteria ||
        article.rankingItems?.length ||
        tags.includes('ランキング') ||
        article.title.includes('ランキング') ||
        article.title.includes('TOP')
    );
}

export function sortArticlesByNewest(articles: Article[]): Article[] {
    return [...articles]
        .map(normalizeArticle)
        .sort((a, b) => getArticleTimestamp(b) - getArticleTimestamp(a));
}

export function getArticleFeatureScore(article: Article, newestTimestamp: number): number {
    let score = 0;
    const publishedTimestamp = getArticleTimestamp(article);
    const tags = article.tags || [];

    if (article.isFeatured) {
        score += 200;
    }

    if (newestTimestamp > 0 && publishedTimestamp > 0) {
        const ageInDays = Math.max(0, Math.floor((newestTimestamp - publishedTimestamp) / DAY_IN_MS));
        score += Math.max(0, 90 - ageInDays * 3);
    }

    score += Math.min(40, (article.rankingItems?.length || 0) * 5);
    score += Math.min(20, (article.buyingGuide?.steps?.length || 0) * 3);
    score += Math.min(15, tags.length * 3);

    if (article.thumbnail || article.image) {
        score += 5;
    }

    if (article.subCategoryId) {
        score += 5;
    }

    return score;
}

export function sortArticlesByFeatured(articles: Article[]): Article[] {
    const normalizedArticles = articles.map(normalizeArticle);
    const newestTimestamp = normalizedArticles.reduce((latest, article) => {
        return Math.max(latest, getArticleTimestamp(article));
    }, 0);

    return [...normalizedArticles].sort((a, b) => {
        const scoreDiff = getArticleFeatureScore(b, newestTimestamp) - getArticleFeatureScore(a, newestTimestamp);
        if (scoreDiff !== 0) {
            return scoreDiff;
        }

        return getArticleTimestamp(b) - getArticleTimestamp(a);
    });
}

export function getFeaturedArticleIds(articles: Article[], limit = 6): string[] {
    return sortArticlesByFeatured(articles)
        .slice(0, limit)
        .map((article) => article.id);
}

export function getRelatedArticles(sourceArticle: Article, articles: Article[], limit = 3): Article[] {
    const normalizedSource = normalizeArticle(sourceArticle);
    const sourceTags = new Set(normalizedSource.tags || []);
    const sourceProductIds = new Set((normalizedSource.rankingItems || []).map((item) => item.productId));
    const newestTimestamp = articles.reduce((latest, article) => {
        return Math.max(latest, getArticleTimestamp(article));
    }, 0);

    return articles
        .map(normalizeArticle)
        .filter((article) => article.id !== normalizedSource.id)
        .map((article) => {
            let relevance = 0;

            if (article.subCategoryId && article.subCategoryId === normalizedSource.subCategoryId) {
                relevance += 80;
            } else if (article.category === normalizedSource.category) {
                relevance += 40;
            }

            const sharedTags = (article.tags || []).filter((tag) => sourceTags.has(tag)).length;
            relevance += sharedTags * 12;

            const sharedProducts = (article.rankingItems || []).filter((item) => sourceProductIds.has(item.productId)).length;
            relevance += sharedProducts * 10;

            return {
                article,
                relevance,
            };
        })
        .filter(({ relevance }) => relevance > 0)
        .sort((a, b) => {
            if (b.relevance !== a.relevance) {
                return b.relevance - a.relevance;
            }

            const featureDiff = getArticleFeatureScore(b.article, newestTimestamp) - getArticleFeatureScore(a.article, newestTimestamp);
            if (featureDiff !== 0) {
                return featureDiff;
            }

            return getArticleTimestamp(b.article) - getArticleTimestamp(a.article);
        })
        .slice(0, limit)
        .map(({ article }) => article);
}
