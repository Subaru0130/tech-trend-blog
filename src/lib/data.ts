import productsData from '@/data/products.json';
import articlesData from '@/data/articles.json';
import { Product, Article } from '@/types';
import {
    getRelatedArticles,
    normalizeArticle,
    sortArticlesByFeatured,
    sortArticlesByNewest,
} from '@/lib/article-utils';

export function getAllProducts(): Product[] {
    return productsData as unknown as Product[];
}

const CATEGORY_ALIASES: Record<string, string> = {
    furniture: 'interior',
};

export function resolveMajorCategorySlug(slug?: string): string {
    if (!slug) return '';
    return CATEGORY_ALIASES[slug] || slug;
}

export function getProductById(id: string): Product | undefined {
    return productsData.find((product) => product.id === id) as Product | undefined;
}

export function getProductBySlug(slug: string): Product | undefined {
    // Currently using ID as slug
    return getProductById(slug);
}

export function getAllSlugs(): string[] {
    return productsData.map((product) => product.id);
}

export function getRankingProducts(): Product[] {
    // In a real app, this might accept a category or limit
    return getAllProducts().sort((a, b) => a.rank - b.rank);
}

export function getProductsByType(type: string): Product[] {
    // Legacy support or specific use cases
    return getAllProducts().filter((p) => p.category === type);
}

export function getProductsBySubCategory(subCategory: string): Product[] {
    return getAllProducts()
        .filter((p) => ('subCategory' in p ? p.subCategory === subCategory : false))
        .sort((a, b) => a.rank - b.rank);
}

export function getArticlesByCategory(category: string): Article[] {
    const resolvedCategory = resolveMajorCategorySlug(category);

    return sortArticlesByNewest(
        (articlesData as Article[])
            .map(normalizeArticle)
            .filter((a) => {
                const articleCategory = resolveMajorCategorySlug(a.categoryId || a.category);
                return articleCategory === resolvedCategory;
            })
    );
}

export function getArticleBySlug(slug: string): Article | undefined {
    const normalizedArticles = (articlesData as Article[]).map(normalizeArticle);
    let article = normalizedArticles.find((a) => a.id === slug || a.slug === slug);
    if (!article) {
        // Try decoding
        try {
            const decoded = decodeURIComponent(slug);
            article = normalizedArticles.find((a) => a.id === decoded || a.slug === decoded);
        } catch {
            // ignore
        }
    }
    return article;
}

export function getAllArticles(): Article[] {
    return sortArticlesByNewest((articlesData as Article[]).map(normalizeArticle));
}

export function getFeaturedArticles(limit = 4, category?: string): Article[] {
    const sourceArticles = category ? getArticlesByCategory(category) : getAllArticles();
    return sortArticlesByFeatured(sourceArticles).slice(0, limit);
}

export function getArticleByProductId(productId: string): Article | undefined {
    return getAllArticles().find(article => {
        // Check rankingItems
        if (article.rankingItems?.some(item => item.productId === productId)) return true;
        // Check legacy products array
        if (article.products?.includes(productId)) return true;
        return false;
    });
}

// ★ Returns ALL articles that contain this product (for multi-article support)
export function getArticlesByProductId(productId: string): Article[] {
    return getAllArticles().filter(article => {
        if (article.rankingItems?.some(item => item.productId === productId)) return true;
        if (article.products?.includes(productId)) return true;
        return false;
    });
}

export function getRelatedArticlesForArticle(sourceArticle: Article, limit = 3): Article[] {
    return getRelatedArticles(sourceArticle, getAllArticles(), limit);
}

export const CATEGORY_MAP: Record<string, { label: string; icon: string; subCategories: { label: string; slug: string; icon: string }[] }> = {
    'audio': {
        label: 'オーディオ',
        icon: 'headphones',
        subCategories: [
            { label: '完全ワイヤレスイヤホン', slug: 'wireless-earphones', icon: 'earbuds' },
            { label: 'ワイヤレスヘッドホン', slug: 'wireless-headphones', icon: 'headphones' },
            { label: 'Bluetoothスピーカー', slug: 'bluetooth-speakers', icon: 'speaker' }
        ]
    },
    'beauty-health': {
        label: '美容・健康',
        icon: 'health_and_beauty',
        subCategories: [
            { label: '高級ドライヤー', slug: 'hair-dryers', icon: 'air' },
            { label: '美顔器', slug: 'facial-devices', icon: 'face_retouching_natural' }
        ]
    },
    'kitchen-appliances': {
        label: 'キッチン家電',
        icon: 'kitchen',
        subCategories: [
            { label: '冷蔵庫', slug: 'fridges', icon: 'kitchen' },
            { label: '電子レンジ', slug: 'microwaves', icon: 'microwave' },
            { label: '炊飯器', slug: 'rice-cookers', icon: 'rice_bowl' }
        ]
    },
    'home-appliances': {
        label: '生活家電',
        icon: 'local_laundry_service',
        subCategories: [
            { label: '洗濯機', slug: 'washing-machines', icon: 'local_laundry_service' },
            { label: 'ロボット掃除機', slug: 'robot-vacuums', icon: 'smart_toy' },
            { label: '空気清浄機', slug: 'air-purifiers', icon: 'air' }
        ]
    },
    'pc-smartphones': {
        label: 'PC・スマホ',
        icon: 'devices',
        subCategories: [
            { label: 'ノートPC', slug: 'laptops', icon: 'laptop_chromebook' },
            { label: 'タブレット', slug: 'tablets', icon: 'tablet_mac' },
            { label: 'スマートウォッチ', slug: 'smart-watches', icon: 'watch' }
        ]
    },
    'interior': {
        label: 'インテリア',
        icon: 'chair',
        subCategories: [
            { label: 'オフィスチェア', slug: 'office-chairs', icon: 'chair' },
            { label: 'デスク', slug: 'desks', icon: 'table_restaurant' },
            { label: '照明', slug: 'lighting', icon: 'light' }
        ]
    }
};

export function getMajorCategoryInfo(slug: string) {
    return CATEGORY_MAP[resolveMajorCategorySlug(slug)];
}

export function getMajorCategoryLink(slug?: string): string {
    const resolvedSlug = resolveMajorCategorySlug(slug);
    return resolvedSlug ? `/categories/${resolvedSlug}` : '/categories';
}
