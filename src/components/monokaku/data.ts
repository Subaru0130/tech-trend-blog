import { Product } from './types';

export const products: Product[] = [
    {
        id: 'wh-1000xm5',
        rank: 1,
        manufacturer: 'SONY (ソニー)',
        modelName: 'WH-1000XM5',
        score: 9.8,
        noiseCancelingRank: 'S',
        batteryLife: '30時間',
        weight: '250g',
        description: '前モデルから大幅に刷新されたデザインと、業界最高クラスのノイズキャンセリング性能。装着した瞬間に別世界へ誘う、静寂のマスターピース。',
        price: '¥48,000',
        starRating: 5.0,
        imageUrl: 'https://images.unsplash.com/photo-1610438235354-a6ae5528385c?auto=format&fit=crop&q=80&w=800',
        pros: [
            '圧倒的なノイズ除去能力',
            '通話品質が非常にクリア',
            '長時間つけても疲れない軽量設計'
        ],
        cons: [
            '折りたたみができない',
            '価格が高め'
        ],
        amazonLink: '#'
    },
    {
        id: 'qc-ultra',
        rank: 2,
        manufacturer: 'BOSE (ボーズ)',
        modelName: 'QuietComfort Ultra',
        score: 9.6,
        noiseCancelingRank: 'S',
        batteryLife: '24時間',
        weight: '253g',
        description: 'Bose独自の「イマーシブオーディオ」で、まるで目の前で演奏されているような臨場感を実現。空間オーディオを楽しみたいならこの一台。',
        price: '¥54,000',
        starRating: 4.5, // Display logic will handle half stars if needed, simulating 4.5 visually as 4 full + 1 half
        imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800',
        features: ['空間オーディオ', 'Snapdragon Sound'],
        amazonLink: '#'
    },
    {
        id: 'airpods-max',
        rank: 3,
        manufacturer: 'APPLE (アップル)',
        modelName: 'AirPods Max',
        score: 9.3,
        noiseCancelingRank: 'A',
        batteryLife: '20時間',
        weight: '384g',
        description: 'Appleエコシステムの頂点。iPhoneとの魔法のような連携と、高級感あふれるアルミニウムボディ。ファッションアイテムとしての存在感も抜群。',
        price: '¥84,800',
        starRating: 4.0,
        imageUrl: 'https://images.unsplash.com/photo-1628202926206-c63a34b1618f?auto=format&fit=crop&q=80&w=800',
        features: ['Apple H1チップ', 'ダイナミックEQ'],
        amazonLink: '#'
    }
];
