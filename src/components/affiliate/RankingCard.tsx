import React from 'react';
import { Star, Check, X, Crown, ShoppingCart, ExternalLink, Award, ThumbsUp, ThumbsDown } from 'lucide-react';

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
    const displayImage = image || (asin
        ? `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.LZZZZZZZ.jpg`
        : "/images/placeholder.png");

    const getAffiliateUrl = (url: string | undefined, asin: string | undefined, type: 'amazon' | 'rakuten') => {
        const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || 'demo-22';

        if (type === 'amazon' && asin) {
            return `https://www.amazon.co.jp/dp/${asin}?tag=${tag}&linkCode=ogi&th=1&psc=1`;
        }

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
        <div id={`rank-${rank}`} className={`relative flex flex-col md:flex-row gap-8 p-6 md:p-8 rounded-3xl mb-12 scroll-mt-32 border ${isFirst ? 'bg-white shadow-2xl border-yellow-400/50 ring-4 ring-yellow-50' : 'bg-white shadow-lg border-slate-100'}`}>

            {/* No.1 Crown for First Place */}
            {isFirst && (
                <div className="absolute -top-5 -left-3 z-20 transform -rotate-6">
                    <div className="bg-gradient-to-br from-yellow-400 to-amber-600 text-white font-serif font-black px-6 py-2 rounded-lg shadow-xl flex items-center gap-2 text-xl border-2 border-white">
                        <Crown className="w-6 h-6 fill-current" />
                        No.1 ベストバイ
                    </div>
                </div>
            )}

            {/* Rank Badge (Non-1st) */}
            {!isFirst && (
                <div className="absolute -top-5 -left-5 w-16 h-16 bg-slate-800 text-white rounded-full flex flex-col items-center justify-center shadow-xl z-10 border-4 border-white font-serif tracking-tighter">
                    <span className="text-xs font-bold leading-none mt-1">第</span>
                    <span className="text-2xl font-bold leading-none">{rank}</span>
                    <span className="text-xs font-bold leading-none mb-1">位</span>
                </div>
            )}

            {/* Left Column: Image & Basic Info */}
            <div className="w-full md:w-1/3 flex flex-col gap-6">
                <div className="aspect-square bg-white rounded-2xl overflow-hidden p-6 flex items-center justify-center relative border border-slate-100">
                    <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-sm font-bold px-3 py-1 rounded-full z-10">
                        {isFirst ? '総合1位' : `第${rank}位`}
                    </div>
                    <img
                        src={displayImage}
                        alt={displayTitle}
                        className="w-full h-full object-contain mx-auto transition-transform duration-500 hover:scale-105"
                    />
                </div>

                {/* Visual Score Chart */}
                {ratings && (
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <h4 className="text-base font-bold text-slate-700 uppercase tracking-wider mb-5 border-b-2 border-slate-200 pb-2 text-center">検証評価スコア</h4>
                        <div className="space-y-4">
                            {Object.entries(ratings).map(([key, score]) => {
                                const translationMap: { [key: string]: string } = {
                                    scent: "香り", cost: "コスパ", usage: "使いやすさ",
                                    lather: "泡立ち", smoothness: "指通り", scalpCare: "頭皮ケア",
                                    moisture: "保湿力", cleansing: "洗浄力", finish: "仕上がり",
                                    airflow: "風量", weight: "軽さ", heatControl: "温度調節",
                                    care: "ヘアケア", design: "デザイン", quietness: "静音性",
                                    filtration: "ろ過能力", taste: "おいしさ", flow: "水量調整",
                                    ease: "手入れ", maintenance: "手入れ"
                                };
                                const label = translationMap[key] || key;
                                const percentage = Math.min(score * 20, 100);

                                // Color logic
                                const barColor = score >= 4.5 ? 'bg-emerald-500' : score >= 3.5 ? 'bg-blue-500' : 'bg-slate-400';

                                return (
                                    <div key={key} className="flex items-center gap-4">
                                        <span className="w-24 text-base font-bold text-slate-800 text-right shrink-0">{label}</span>
                                        <div className="flex-1 h-5 bg-white rounded-full overflow-hidden border border-slate-200 shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="w-10 text-right font-black text-slate-900 text-xl tabular-nums">{score}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Content */}
            <div className="flex-1 flex flex-col">

                {/* Header Area */}
                <div className="mb-6">
                    {/* Best For Badge (High Visibility) */}
                    {bestFor && (
                        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 border-2 border-amber-200 px-4 py-2 rounded-lg text-base font-bold mb-5 shadow-sm">
                            <Award className="w-5 h-5 text-amber-600" />
                            {bestFor}
                        </div>
                    )}

                    {/* Product Title (div to avoid TOC duplication) */}
                    <div className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug mb-5">
                        <span className="text-slate-400 mr-3 opacity-60 font-serif italic text-xl">#{rank}</span>
                        {displayTitle}
                    </div>

                    <div className="flex flex-wrap items-center gap-5 text-base mb-7">
                        <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-200 font-bold shadow-sm">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xl leading-none pt-0.5">{rating}</span>
                        </div>
                        {reviewCount && (
                            <span className="text-slate-500 text-sm font-medium">口コミ {reviewCount}件</span>
                        )}
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-slate-700 text-xl">{price}</span>
                    </div>

                    <p className="text-slate-800 leading-relaxed text-base md:text-lg border-l-4 border-slate-200 pl-6 py-2 mb-2 font-medium">
                        {displayDescription}
                    </p>
                </div>

                {/* Pros & Cons (Final Winning Design) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 mb-10">
                    <div className="grid md:grid-cols-2 gap-8 relative">
                        {/* Vertical Divider (Desktop only) */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2"></div>

                        {/* Pros */}
                        <div className="md:pr-4">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
                                <ThumbsUp className="w-5 h-5 text-blue-600 fill-current" />
                                <span className="text-blue-900">良い点 (Pros)</span>
                            </h4>
                            <ul className="space-y-4">
                                {pros.map((pro, i) => (
                                    <li key={i} className="text-[15px] text-slate-700 leading-relaxed flex items-start group">
                                        <div className="mt-1 mr-3 shrink-0">
                                            <Check className="w-5 h-5 text-blue-500 stroke-[3]" />
                                        </div>
                                        <span>{pro}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Cons */}
                        <div className="md:pl-4">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
                                <ThumbsDown className="w-5 h-5 text-red-500 fill-current" />
                                <span className="text-red-900">気になる点 (Cons)</span>
                            </h4>
                            <ul className="space-y-4">
                                {cons.map((con, i) => (
                                    <li key={i} className="text-[15px] text-slate-700 leading-relaxed flex items-start group">
                                        <div className="mt-1 mr-3 shrink-0">
                                            <X className="w-5 h-5 text-red-500 stroke-[3]" />
                                        </div>
                                        <span>{con}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* CTAs (Simplified & High Contrast) */}
                <div className="mt-auto grid grid-cols-2 gap-3">
                    {links.amazon && (
                        <a
                            href={links.amazon}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#232F3E] hover:bg-[#1a232f] text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span>Amazonで見る</span>
                        </a>
                    )}
                    {links.rakuten && (
                        <a
                            href={links.rakuten}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#BF0000] hover:bg-[#a00000] text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <ExternalLink className="w-5 h-5" />
                            <span>楽天で見る</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
