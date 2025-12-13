
export interface Product {
    id: string;
    rank: number;
    manufacturer: string;
    modelName: string;
    score: number;
    noiseCancelingRank: string;
    batteryLife: string;
    weight: string;
    description: string;
    price: string;
    starRating: number;
    imageUrl: string;
    pros?: string[];
    cons?: string[];
    features?: string[];
    amazonLink: string;
}
