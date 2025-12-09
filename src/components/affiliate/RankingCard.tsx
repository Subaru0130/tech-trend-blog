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
    return (
        <div id={`rank-${rank}`} className={`relative flex flex-col md:flex-row gap-8 p-8 md:p-10 rounded-[4px] mb-12 scroll-mt-32 transition-all duration-500 bg-white ${isFirst ? 'border border-[#EEEEEE] shadow-[0_4px_24px_rgba(0,0,0,0.06)]' : 'border border-[transparent] shadow-[0_2px_8px_rgba(0,0,0,0.03)]'}`}>

            {/* No.1 Badge (Minimal) */}
            {isFirst && (
                <div className="absolute -top-3 -left-3 z-20">
                    <div className="bg-[#333333] text-white text-sm font-bold px-4 py-2 rounded-[4px] shadow-sm flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        総合 1位
                    </div>
                </div>
            )}

            {/* Rank Badge (Non-1st) */}
            {!isFirst && (
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-[#EEEEEE] text-[#333333] rounded-[4px] flex items-center justify-center font-bold text-lg shadow-sm z-10">
                    {rank}
                </div>
            )}

            {/* Left Column: Image & Basic Info */}
            <div className="w-full md:w-1/3 flex flex-col gap-6">
                <div className="aspect-square bg-white rounded-[4px] overflow-hidden p-6 flex items-center justify-center relative border border-[#EEEEEE]">
                    <img
                        src={displayImage}
                        alt={displayTitle}
                        className="w-full h-full object-contain mx-auto mix-blend-multiply hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* Visual Score Chart (Clean) */}
                {ratings && (
                    <div className="bg-[#FAFAFA] rounded-[4px] p-6 border border-[#EEEEEE]">
                        <h4 className="text-[10px] font-bold text-[#999999] uppercase tracking-widest mb-4 text-center">検証スコア</h4>
                        <div className="grid grid-cols-3 gap-y-6 gap-x-2">
                            {Object.entries(ratings).map(([key, score]) => {
                                const translationMap: { [key: string]: string } = {
                                    scent: "香り",
                                    cost: "コスパ",
                                    usage: "使用感",
                                    lather: "泡立ち",
                                    smoothness: "指通り",
                                    scalpCare: "頭皮ケア",
                                    moisture: "保湿力",
                                    cleansing: "洗浄力",
                                    finish: "仕上がり",
                                    airflow: "風量",
                                    weight: "軽さ",
                                    heatControl: "温度調節",
                                    care: "ケア効果",
                                    design: "デザイン",
                                    quietness: "静音性",
                                    filtration: "除去力",
                                    taste: "おいしさ",
                                    flow: "水量",
                                    ease: "使いやすさ"
                                };
                                const label = translationMap[key] || key;
                                return (
                                    <div key={key} className="flex flex-col items-center">
                                        <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-white border border-[#EEEEEE]">
                                            <span className="text-sm font-bold text-[#333333]">{score}</span>
                                        </div>
                                        <span className="text-[10px] text-[#666666] mt-2 font-medium whitespace-nowrap">{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Content */}
            <div className="flex-1 flex flex-col py-2">
                <div className="mb-8">
                    {bestFor && (
                        <span className="inline-block bg-[#F5F5F5] text-[#666666] text-xs font-medium px-3 py-1 rounded-[2px] mb-4">
                            {bestFor}
                        </span>
                    )}
                    <h3 className="text-2xl font-bold text-[#333333] leading-snug mb-5">
                        {displayTitle}
                    </h3>
                    <div className="flex items-center gap-6 mb-6 pb-2 border-b border-[#EEEEEE] w-full">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#999999] font-bold uppercase">Rating</span>
                            <span className="text-xl font-bold text-[#333333]">{rating}</span>
                        </div>
                        {reviewCount && (
                            <span className="text-xs text-[#999999]">
                                ({reviewCount}件)
                            </span>
                        )}
                        <span className="text-[#EEEEEE]">|</span>
                        <span className="text-[#333333] font-bold text-lg">{price}</span>
                    </div>
                    <p className="text-[#666666] leading-[1.9] text-base">
                        {displayDescription}
                    </p>
                </div>

                {/* Pros & Cons Grid (Subtle) */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-[#FAFAFA] p-6 rounded-[4px]">
                        <h4 className="font-bold text-[#333333] text-xs mb-3 flex items-center gap-2">
                            <span className="text-[#666666] text-lg">●</span>
                            良い点
                        </h4>
                        <ul className="space-y-2">
                            {pros.map((pro, i) => (
                                <li key={i} className="text-sm text-[#666666] leading-relaxed pl-4 -indent-4">
                                    ・{pro}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-[#FAFAFA] p-6 rounded-[4px]">
                        <h4 className="font-bold text-[#333333] text-xs mb-3 flex items-center gap-2">
                            <span className="text-[#999999] text-lg">●</span>
                            気になる点
                        </h4>
                        <ul className="space-y-2">
                            {cons.map((con, i) => (
                                <li key={i} className="text-sm text-[#666666] leading-relaxed pl-4 -indent-4">
                                    ・{con}
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
                            className="flex-1 bg-[#333333] hover:opacity-90 text-white font-bold py-3 px-8 rounded-[4px] flex items-center justify-center gap-3 transition-all shadow-sm text-sm"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Amazonで詳細を見る
                        </a>
                    )}
                    {links.rakuten && (
                        <a
                            href={links.rakuten}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-white border border-[#DDDDDD] text-[#333333] hover:bg-[#FAFAFA] font-bold py-3 px-8 rounded-[4px] flex items-center justify-center gap-3 transition-all text-sm"
                        >
                            <ExternalLink className="w-4 h-4 text-[#999999]" />
                            楽天でチェック
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
