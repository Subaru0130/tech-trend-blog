"use client";

import React from 'react';
import Image from 'next/image';
import { Star, Check, X, Crown, ShoppingCart, ThumbsUp, ThumbsDown, Award } from 'lucide-react';

interface RankingCardProps {
    rank: number;
    id?: string;
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

type AnalyticsWindow = Window & {
    gtag?: (event: string, action: string, params?: Record<string, string | number>) => void;
};

export function RankingCard({
    rank,
    title,
    name,
    productName,
    image,
    rating = 0,
    description,
    pros = [],
    cons = [],
    price,
    affiliateLinks = {},
    affiliateLink,
    bestFor,
    asin,
    ratings,
    children,
}: RankingCardProps & { name?: string; children?: React.ReactNode }) {
    const displayTitle = title || name || productName || 'No Title';
    const isFirst = rank === 1;
    const displayDescription = description || children;

    const displayImage = image || (
        asin
            ? `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.LZZZZZZZ.jpg`
            : '/images/placeholder.png'
    );

    const getAffiliateUrl = (url: string | undefined, productAsin: string | undefined, type: 'amazon' | 'rakuten') => {
        const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || 'demo-22';

        if (type === 'amazon' && productAsin) {
            return `https://www.amazon.co.jp/dp/${productAsin}?tag=${tag}&linkCode=ogi&th=1&psc=1`;
        }

        if (url?.startsWith('SEARCH:') || (!url && !productAsin)) {
            const term = url?.replace('SEARCH:', '') || displayTitle;
            const encodedTerm = encodeURIComponent(term);

            if (type === 'amazon') return `https://www.amazon.co.jp/s?k=${encodedTerm}&tag=${tag}`;
            if (type === 'rakuten') {
                const affiliateId = process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID || 'demo-rakuten';
                return `https://search.rakuten.co.jp/search/mall/${encodedTerm}/?a_id=${affiliateId}`;
            }
        }

        return url || '#';
    };

    const links = {
        amazon: getAffiliateUrl(affiliateLinks.amazon || affiliateLink, asin, 'amazon'),
        rakuten: getAffiliateUrl(affiliateLinks.rakuten, undefined, 'rakuten'),
    };

    const translationMap: Record<string, string> = {
        scent: '香り',
        cost: 'コスパ',
        usage: '使いやすさ',
        lather: '泡立ち',
        smoothness: 'なめらかさ',
        scalpCare: '頭皮ケア',
        moisture: '保湿感',
        cleansing: '洗浄力',
        finish: '仕上がり',
        airflow: '風量',
        weight: '軽さ',
        heatControl: '温度調整',
        care: 'ヘアケア',
        design: 'デザイン',
        quietness: '静音性',
        filtration: 'ろ過性能',
        taste: '味わい',
        flow: '抽出の安定感',
        ease: '扱いやすさ',
        maintenance: '手入れのしやすさ',
    };

    return (
        <div
            id={`rank-${rank}`}
            className={`relative flex flex-col md:flex-row gap-8 p-6 md:p-8 rounded-3xl mb-12 scroll-mt-32 border ${isFirst ? 'bg-white shadow-2xl border-yellow-400/50 ring-4 ring-yellow-50' : 'bg-white shadow-lg border-slate-100'}`}
        >
            {isFirst && (
                <div className="absolute -top-5 -left-3 z-20 transform -rotate-6">
                    <div className="bg-gradient-to-br from-yellow-400 to-amber-600 text-white font-serif font-black px-6 py-2 rounded-lg shadow-xl flex items-center gap-2 text-xl border-2 border-white">
                        <Crown className="w-6 h-6 fill-current" />
                        No.1 ベストバイ
                    </div>
                </div>
            )}

            <div className="w-full md:w-1/3 flex flex-col gap-6">
                <div className="aspect-square bg-white rounded-2xl overflow-hidden p-6 flex items-center justify-center relative border border-slate-100">
                    <div className={`absolute top-0 left-0 text-white text-base font-bold px-4 py-2 rounded-br-2xl z-10 shadow-md ${isFirst ? 'bg-gradient-to-r from-yellow-500 to-amber-600' : 'bg-slate-700'}`}>
                        {isFirst ? '第1位' : `第${rank}位`}
                    </div>
                    <Image
                        src={displayImage}
                        alt={displayTitle}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain mx-auto transition-transform duration-500 hover:scale-105"
                    />
                </div>

                {ratings && (
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <h4 className="text-base font-bold text-slate-700 uppercase tracking-wider mb-5 border-b-2 border-slate-200 pb-2 text-center">
                            編集部スコア
                        </h4>
                        <div className="space-y-4">
                            {Object.entries(ratings).map(([key, score]) => {
                                const label = translationMap[key] || key;
                                const percentage = Math.min(score * 20, 100);
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

            <div className="flex-1 flex flex-col">
                <div className="mb-6">
                    {bestFor && (
                        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 border-2 border-amber-200 px-4 py-2 rounded-lg text-base font-bold mb-5 shadow-sm">
                            <Award className="w-5 h-5 text-amber-600" />
                            {bestFor}
                        </div>
                    )}

                    <div className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug mb-5">
                        {displayTitle}
                    </div>

                    <div className="flex flex-wrap items-center gap-5 text-base mb-7">
                        <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-200 font-bold shadow-sm">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xl font-black text-primary">{rating.toFixed(1)}</span>
                        </div>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-slate-700 text-xl">{price}</span>
                    </div>

                    <p className="text-slate-800 leading-relaxed text-base md:text-lg border-l-4 border-slate-200 pl-6 py-3 mb-4 font-medium">
                        {displayDescription}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 mb-10">
                    <div className="grid md:grid-cols-2 gap-8 relative">
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2"></div>

                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
                                <ThumbsUp className="w-5 h-5 text-blue-600 fill-current" />
                                <span className="text-blue-900">メリット</span>
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

                        <div className="md:pl-4">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
                                <ThumbsDown className="w-5 h-5 text-red-500 fill-current" />
                                <span className="text-red-900">デメリット</span>
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
            </div>

            <div className="mt-auto grid grid-cols-2 gap-4">
                {links.amazon && (
                    <a
                        href={links.amazon}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                            if (typeof window === 'undefined') return;
                            const analyticsWindow = window as AnalyticsWindow;
                            analyticsWindow.gtag?.('event', 'affiliate_click', { store: 'amazon', product_name: displayTitle, rank });
                        }}
                        className="flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#ffad33] text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 active:translate-y-0 whitespace-nowrap"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        Amazonで見る
                    </a>
                )}
                {links.rakuten && (
                    <a
                        href={links.rakuten}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                            if (typeof window === 'undefined') return;
                            const analyticsWindow = window as AnalyticsWindow;
                            analyticsWindow.gtag?.('event', 'affiliate_click', { store: 'rakuten', product_name: displayTitle, rank });
                        }}
                        className="flex items-center justify-center gap-2 bg-[#BF0000] hover:bg-[#d40000] text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 active:translate-y-0 whitespace-nowrap"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        楽天で見る
                    </a>
                )}
            </div>
        </div>
    );
}
