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
    category: string; // Major category: 'audio', 'beauty-health'
    subCategory: string; // Sub category: 'wireless-earphones', 'hair-dryers'
    asin?: string;
    price: string;
    description?: string; // Short description for the ranking card
    tags: ProductTags;
    specs: Specification[];
    pros: string[];
    cons: string[];
    affiliateLinks: AffiliateLinks;
}

export interface Ranking {
    id: string;
    title: string;
    description: string;
    updatedAt: string;
    products: Product[];
}
