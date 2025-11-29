import React from 'react';
import { Star, Check, X, ExternalLink, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankingCardProps {
    rank: number;
    title: string;
    image: string;
    rating: number;
    description: string;
    pros: string[];
    cons: string[];
    price?: string;
    affiliateLinks?: {
        amazon?: string;
        rakuten?: string;
        yahoo?: string;
    };
}

export function RankingCard({ rank, title, image, rating, description, pros, cons, price, affiliateLinks }: RankingCardProps) {
    const isTop3 = rank <= 3;
    const badgeColor = rank === 1 ? 'ranking-badge' : rank === 2 ? 'ranking-badge silver' : rank === 3 ? 'ranking-badge bronze' : 'bg-slate-500 text-white px-3 py-1 rounded-full font-bold';

    return (
        <div className={cn("friendly-card overflow-hidden mb-8 border-2", isTop3 ? "border-primary/20" : "border-transparent")}>
            {/* Header Badge */}
            <div className="bg-slate-50 p-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <span className={cn("text-lg shadow-sm", badgeColor)}>
                        {rank}位
                    </span>
                    {rank === 1 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">ベストバイ</span>}
                    <h3 className="font-bold text-lg md:text-xl text-slate-800">{title}</h3>
                </div>
                <div className="flex items-center text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("w-5 h-5", i < Math.floor(rating) ? "fill-current" : "text-slate-300")} />
                    ))}
                    <span className="ml-2 text-slate-600 font-bold">{rating.toFixed(1)}</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="md:w-1/3 p-6 flex items-center justify-center bg-white">
                    <div className="relative w-full aspect-square max-w-[250px]">
                        <img src={image} alt={title} className="object-contain w-full h-full hover:scale-105 transition-transform" />
                    </div>
                </div>

                {/* Details Section */}
                <div className="md:w-2/3 p-6 bg-white flex flex-col justify-between">
                    <div>
                        <p className="text-slate-600 mb-4 leading-relaxed text-sm md:text-base">
                            {description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-green-50 p-3 rounded-lg">
                                <h4 className="font-bold text-green-700 text-sm mb-2 flex items-center"><Check className="w-4 h-4 mr-1" /> メリット</h4>
                                <ul className="text-sm text-slate-700 space-y-1">
                                    {pros.map((pro, i) => (
                                        <li key={i} className="flex items-start"><span className="mr-2 text-green-500">•</span>{pro}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg">
                                <h4 className="font-bold text-red-700 text-sm mb-2 flex items-center"><X className="w-4 h-4 mr-1" /> デメリット</h4>
                                <ul className="text-sm text-slate-700 space-y-1">
                                    {cons.map((con, i) => (
                                        <li key={i} className="flex items-start"><span className="mr-2 text-red-500">•</span>{con}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* CV Buttons */}
                    <div className="space-y-3">
                        {price && <p className="text-right text-sm text-slate-500 font-bold mb-2">参考価格: {price}</p>}
                        <div className="grid grid-cols-3 gap-2 md:gap-4">
                            <a href={affiliateLinks?.amazon || "#"} className="cv-button cv-amazon h-12 text-sm md:text-base">
                                Amazon
                            </a>
                            <a href={affiliateLinks?.rakuten || "#"} className="cv-button cv-rakuten h-12 text-sm md:text-base">
                                楽天
                            </a>
                            <a href={affiliateLinks?.yahoo || "#"} className="cv-button cv-yahoo h-12 text-sm md:text-base">
                                Yahoo!
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
