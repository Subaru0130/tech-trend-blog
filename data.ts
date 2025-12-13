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
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5Ty1kUbFw2kYCyUi37d01I5YhZNylbKpvLCETMLF4loeE3mXa9hNc-xcQTtmBRMEF-guyy_roFlQLQ0sOdK4eBhZRNHXylvyBM2cuYUdymH1AwFBUMvtMD9qewUyvr3bNP18-wbtZlP2aJ7Gqc35-ni2wjzc-VbD7oRx7Fi7OEaiGvWeHRdNj9wJtLagUSXdlgQa4AOdEg_j3hjdiGSTIHYyarY6kk6vtdppLGf2NLP-_wWiPiHGV-dbf_a_jVm4mwBKYFZSgHHk',
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
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVkDbXs68cCFg0AIrJzP5bnVhsF1K4Sc86_gNLNsi2W_ldSWxouzbTzdrG4MVVzWOJIJqQP6xHCYcqHtCWxMXg2p152VbTQgMOm0_UXX8_d0x5kgi2NRdh9k98gkqUS5jdtXJNyVFsXWsEXKV4954dOqnGkJvAgjD05GsKKgpWTRSuGY8WwSSfXwFLlLPOGxa-gGhvr-aZd4-mFpP5jdankPP6wj5J5t6Tef58g-vD8H9tJ25zmiw2J68A4LRHscKBGCJJN6akyzY',
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
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2LFO78jwe6R4iPjv8yohcRGfaQ1M9I-YC9tbTBG7in-TZLxUED6M2jvCya8MaSKW1hZI0lPc1M00nX4FY_dVC6si56oecimYMNCNHR7A5TU7oPInKgPUM6v1igFbne-HpJR2mjav208mDKqA7Q1EWKUoeEkb1s8wlx2S0ONWZFuSFvwu8U-y5XxBErnagF0ATTZxMyyk3AMGGiSOyABXnsS_6d_7cAxotdaKcKkXlO_NvUGDB3DMRzOQO60KamJNTA0ikRnw7wR4',
    features: ['Apple H1チップ', 'ダイナミックEQ'],
    amazonLink: '#'
  }
];