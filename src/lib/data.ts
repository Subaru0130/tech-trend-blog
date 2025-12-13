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
    return CATEGORY_MAP[slug];
}
