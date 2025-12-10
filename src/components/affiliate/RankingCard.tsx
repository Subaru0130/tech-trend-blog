import React from 'react';
import { Star, Check, X, Crown, ShoppingCart, ExternalLink, Award } from 'lucide-react';

interface RankingCardProps {
    rank: number;
    title?: string;
    productName?: string;
    makerName?: string;
    image: string;
    rating?: number;
    reviewCount?: number;
    description: string;
    pros?: string[];
    cons?: string[];
    price?: string;
    affiliateLinks?: {
        amazon?: string;
        rakuten?: string;
        yahoo?: string;
    };
    affiliateLink?: string;
    bestFor?: string;
    asin?: string;
    ratings?: { [key: string]: number };
}

export function RankingCard({
    rank,
    title,
    name,
    productName,
    image,
    rating = 0,
    reviewCount,
    description,
    pros = [],
    cons = [],
    price,
    affiliateLinks = {},
    affiliateLink,
    bestFor,
    asin,
    ratings,
    children
}: RankingCardProps & { name?: string; children?: React.ReactNode }) {
    const displayTitle = title || name || productName || "No Title";
    const isFirst = rank === 1;
    const displayDescription = description || children;

    // Amazon Image URL Logic (Direct Image URL - HTTPS)
    // Prioritize 'image' prop if available (e.g. from Rakuten or verified source)
    const displayImage = image || (asin
        ? `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.LZZZZZZZ.jpg`
        : "/images/placeholder.png");

    const getAffiliateUrl = (url: string | undefined, asin: string | undefined, type: 'amazon' | 'rakuten' | 'yahoo') => {
        const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || 'demo-22';

        // PRIORITY 1: Direct ASIN Link (Highest Conversion)
        if (type === 'amazon' && asin) {
            return `https://www.amazon.co.jp/dp/${asin}?tag=${tag}&linkCode=ogi&th=1&psc=1`;
        }

        // PRIORITY 2: Search Link (Fallback)
        if (url?.startsWith('SEARCH:') || (!url && !asin)) {
            const term = url?.replace('SEARCH:', '') || displayTitle;
            const encodedTerm = encodeURIComponent(term);

            if (type === 'amazon') return `https://www.amazon.co.jp/s?k=${encodedTerm}&tag=${tag}`;
            if (type === 'rakuten') {
                const id = process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID || 'demo-rakuten';
                return `https://search.rakuten.co.jp/search/mall/${encodedTerm}/?a_id=${id}`;
            }
        }
        return url || '#';
    };

    const links = {
        amazon: getAffiliateUrl(affiliateLinks.amazon || affiliateLink, asin, 'amazon'),
        rakuten: getAffiliateUrl(affiliateLinks.rakuten, undefined, 'rakuten'),
    };

    return (
        <div id={`rank-${rank}`} className={`relative flex flex-col md:flex-row gap-8 p-8 md:p-10 rounded-3xl mb-16 scroll-mt-32 transition-all duration-500 ${isFirst ? 'bg-white shadow-2xl ring-4 ring-primary/20' : 'bg-white shadow-lg hover:shadow-xl'}`}>

            {/* No.1 Ribbon */}
            {isFirst && (
                <div className="absolute -top-4 -left-4 z-20">
                    <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-serif font-bold px-8 py-3 rounded-br-3xl rounded-tl-2xl shadow-xl flex items-center gap-2 text-lg">
                        <Crown className="w-6 h-6" />
                        総合ランキング 1位
                    </div>
                </div>
            )}

            {/* Rank Badge (Non-1st) */}
            {!isFirst && (
                <div className="absolute -top-5 -left-5 w-16 h-16 bg-slate-800 text-white rounded-full flex flex-col items-center justify-center shadow-xl z-10 border-4 border-white font-serif tracking-tighter">
                    <span className="text-[10px] font-bold leading-none mt-1">第</span>
                    <span className="text-2xl font-bold leading-none">{rank}</span>
                    <span className="text-[10px] font-bold leading-none mb-1">位</span>
                </div>
            )}

            {/* ... (Left Column) ... */}

            {/* ... (Right Column content) ... */}

            {/* Pros & Cons Grid (Simple Japanese Design) */}
            <div className="grid md:grid-cols-2 gap-4 mb-10">
                <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
                    <h4 className="font-bold text-blue-900 text-sm mb-3 flex items-center gap-2">
                        <Check className="w-5 h-5 text-blue-600" />
                        メリット
                    </h4>
                    <ul className="space-y-2">
                        {pros.map((pro, i) => (
                            <li key={i} className="text-sm text-slate-800 flex items-start leading-relaxed">
                                <span className="text-blue-500 mr-2 font-bold">・</span>
                                <span>{pro}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-red-50 border border-red-200 p-5 rounded-xl">
                    <h4 className="font-bold text-red-900 text-sm mb-3 flex items-center gap-2">
                        <X className="w-5 h-5 text-red-600" />
                        デメリット
                    </h4>
                    <ul className="space-y-2">
                        {cons.map((con, i) => (
                            <li key={i} className="text-sm text-slate-800 flex items-start leading-relaxed">
                                <span className="text-red-500 mr-2 font-bold">・</span>
                                <span>{con}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* CTAs */}
            <div className="mt-auto flex flex-col sm:flex-row gap-4">
                {links.amazon && (
                    <a
                        href={links.amazon}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-slate-900 hover:bg-black !text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-xl hover:shadow-2xl text-lg"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-base">Amazonで在庫を確認</span>
                            <span className="text-[10px] font-normal opacity-80 mt-1">本日のタイムセールをチェック</span>
                        </div>
                    </a>
                )}
                {links.rakuten && (
                    <a
                        href={links.rakuten}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] text-lg"
                    >
                        <ExternalLink className="w-6 h-6" />
                        楽天で見る
                    </a>
                )}
            </div>
        </div>
        </div >
    );
}
