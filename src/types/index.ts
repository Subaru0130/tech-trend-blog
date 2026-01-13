export interface Specification {
    label: string;
    value: string;
}

export interface AffiliateLinks {
    amazon?: string;
    rakuten?: string;
    yahoo?: string;
    [key: string]: string | undefined;
}

export interface ProductTags {
    bestBuy?: boolean;
    flagship?: boolean;
    editorPick?: boolean;
    [key: string]: boolean | undefined;
}

export interface Product {
    id: string;
    rank: number;
    name: string;
    image: string;
    rating: number;
    reviewCount: number;
    category: string;
    description: string;
    price?: string;
    asin?: string;
    brand: string;
    tags?: { [key: string]: boolean };
    pros?: string[];
    cons?: string[];
    specs: Specification[]; // Changed from Record to array to match JSON
    reviews?: {
        source: string;
        author: string;
        rating: number;
        date: string;
        title: string;
        content: string;
    }[];
    affiliateLinks: {
        amazon?: string;
        rakuten?: string;
        yahoo?: string;
    }
}

export interface RankingItem {
    rank: number;
    productId: string;
    badge?: string;
    rating: number;
    reviewCount: number;
    rankBadge?: 'gold' | 'silver' | 'bronze'; // Visual style
    pros: string[];
    cons: string[];
    specs: { label: string; value: string }[]; // Small grid in card
    editorComment: string;
    bestFor?: string; // e.g. "iPhoneに最適"
}

export interface ComparisonColumn {
    header: string;
    accessorKey: string; // key in product or special field
    center?: boolean;
}

export interface Ranking {
    id: string;
    title: string;
    description: string;
    updatedAt: string;
    products: Product[];
}

export interface Article {
    id: string;
    slug: string;
    title: string;
    description: string;
    publishDate: string;
    publishedAt?: string; // Alias
    updatedDate: string;
    thumbnail: string;
    author: string;
    category: string;
    categoryId?: string; // Alias
    subCategoryId?: string;

    // Rich Content Fields
    rankingCriteria?: {
        description: string;
        points: { icon?: string; title?: string; label?: string; value?: number }[];
    };
    rankingItems?: RankingItem[];
    products?: string[];
    buyingGuide?: {
        title: string;
        steps: {
            icon: string;
            title: string;
            description: string;
        }[];
    };
}
