import productsData from '@/data/products.json';
import { Product } from '@/types';

export function getAllProducts(): Product[] {
    return productsData as Product[];
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
        .filter((p) => p.subCategory === subCategory)
        .sort((a, b) => a.rank - b.rank);
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
    }
};

export function getMajorCategoryInfo(slug: string) {
    return CATEGORY_MAP[slug];
}
