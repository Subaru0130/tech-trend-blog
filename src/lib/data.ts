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
