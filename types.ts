export interface Product {
  id: string;
  rank: number;
  modelName: string;
  manufacturer: string;
  score: number;
  noiseCancelingRank: 'S' | 'A' | 'B';
  batteryLife: string;
  weight: string;
  description: string;
  price: string;
  imageUrl: string;
  starRating: number; // 0-5
  pros?: string[];
  cons?: string[];
  features?: string[];
  amazonLink?: string;
}

export interface TableRowData {
  id: string;
  rank: number;
  modelName: string;
  score: number;
  noiseCancelingRank: 'S' | 'A' | 'B';
  batteryLife: string;
  weight: string;
  imageUrl: string;
}