import React from 'react';
import Image from 'next/image';
import { ArrowRight, Star, Crown, TrendingUp, Sparkles } from 'lucide-react';

interface ProductSummary {
    rank: number;
    name: string;
    image: string;
    rating: number;
    price: string;
    id?: string;
    asin?: string;
    bestFor?: string;
}

interface QuickSummaryProps {
    products: ProductSummary[];
}

export function QuickSummary({ products }: QuickSummaryProps) {
    const top3 = products.slice(0, 3);

    const getBadgeStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return { icon: Crown, color: 'bg-yellow-400' };
            case 2:
                return { icon: TrendingUp, color: 'bg-slate-300' };
            case 3:
                return { icon: Sparkles, color: 'bg-amber-600' };
            default:
                return null;
        }
    };

    return (
        <div className="my-12">
            <h3 className="font-serif font-bold text-2xl text-center mb-8 text-slate-800">
                まず見たいおすすめ3製品
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {top3.map((product) => {
                    const badgeStyle = getBadgeStyle(product.rank);
                    const badgeText = product.bestFor || (
                        product.rank === 1
                            ? '編集部おすすめ'
                            : product.rank === 2
                                ? '注目モデル'
                                : 'コスパ重視'
                    );
                    const displayImage = product.image || (
                        product.asin
                            ? `https://images-na.ssl-images-amazon.com/images/P/${product.asin}.09.LZZZZZZZ.jpg`
                            : '/images/placeholder.png'
                    );

                    return (
                        <div
                            key={product.rank}
                            className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-100 flex flex-col items-center text-center group"
                        >
                            {badgeStyle && badgeText && (
                                <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${badgeStyle.color} text-white px-4 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1 whitespace-nowrap`}>
                                    <badgeStyle.icon className="w-3 h-3" />
                                    {badgeText}
                                </div>
                            )}

                            <div className="w-32 h-32 mb-4 relative">
                                <Image
                                    src={displayImage}
                                    alt={product.name}
                                    fill
                                    sizes="128px"
                                    className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-0 left-0 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-serif font-bold shadow-md">
                                    {product.rank}
                                </div>
                            </div>

                            <h4 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2 h-10">
                                {product.name}
                            </h4>
                            <div className="flex items-center gap-1 mb-4">
                                <Star className="w-4 h-4 text-primary fill-current" />
                                <span className="font-bold text-slate-800">{product.rating}</span>
                                <span className="text-slate-300 mx-2">|</span>
                                <span className="text-slate-500 text-sm">{product.price}</span>
                            </div>

                            <a
                                href={`#rank-${product.rank}`}
                                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                            >
                                詳しく見る
                                <ArrowRight className="w-3 h-3" />
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
