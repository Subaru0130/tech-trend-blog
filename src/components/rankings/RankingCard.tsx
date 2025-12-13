import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';

type RankingCardProps = {
    product: Product;
};

import { getAmazonLink, getRakutenLink } from '@/lib/affiliate';

export default function RankingCard({ product }: RankingCardProps) {
    const isRank1 = product.rank === 1;
    const rankColorClass = isRank1 ? 'bg-rank-gold' : product.rank === 2 ? 'bg-rank-silver' : 'bg-rank-bronze';
    const rankTextColorClass = isRank1 ? 'text-rank-gold' : product.rank === 2 ? 'text-rank-silver' : 'text-rank-bronze';

    // Use centralized helper
    const amazonLink = getAmazonLink(product.asin, product.affiliateLinks?.amazon);

    return (
        <article className="scroll-mt-28" id={`rank-${product.rank}`}>
            <div className="flex items-center gap-4 mb-4">
                <div className={`flex items-center justify-center size-12 ${rankColorClass} text-white rounded-xl shadow-lg shadow-${isRank1 ? 'rank-gold' : 'gray-400'}/30`}>
                    <span className="material-symbols-outlined text-[28px]">trophy</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-primary">第{product.rank}位</h2>
                {product.tags.bestBuy && (
                    <span className="bg-rank-gold/10 text-rank-gold px-3 py-1 rounded text-xs font-bold border border-rank-gold/20">総合No.1</span>
                )}
                {product.tags.editorPick && (
                    <span className="bg-accent/10 text-accent px-3 py-1 rounded text-xs font-bold border border-accent/20">編集部おすすめ</span>
                )}
            </div>
            <div className={`bg-white rounded-3xl shadow-soft border border-border-color overflow-hidden ring-1 ${isRank1 ? 'ring-rank-gold/20' : 'ring-border-color/50'}`}>
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                        <div className="md:w-1/2">
                            <Link href={`/reviews/${product.id}`} className="block aspect-[4/3] rounded-2xl overflow-hidden bg-surface-subtle border border-border-color relative group">
                                <img alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={product.image} />
                                {product.tags.flagship && (
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-white/90 backdrop-blur text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                            Flagship Model
                                        </span>
                                    </div>
                                )}
                            </Link>
                        </div>
                        <div className="md:w-1/2 flex flex-col">
                            <Link href={`/reviews/${product.id}`} className="group-hover:text-accent transition-colors">
                                <h3 className="text-2xl font-bold text-primary mb-2 leading-tight group-hover:text-accent group-hover:underline decoration-2 underline-offset-4 decoration-accent/30">{product.name}</h3>
                            </Link>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`flex ${rankTextColorClass}`}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <span key={i} className={`material-symbols-outlined text-[20px] ${i <= product.rating ? 'filled' : ''}`} style={i <= product.rating ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                            star
                                        </span>
                                    ))}
                                </div>
                                <span className="text-xl font-black text-primary">{product.rating.toFixed(1)}</span>
                                <span className="text-xs text-text-sub font-medium ml-auto">レビュー数: {product.reviewCount.toLocaleString()}件</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {product.specs.map((spec, idx) => (
                                    <div key={idx} className="bg-surface-subtle p-3 rounded-lg border border-border-color">
                                        <div className="text-[10px] text-text-sub font-bold mb-1">{spec.label}</div>
                                        <div className="text-sm font-bold text-primary">{spec.value}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-auto grid grid-cols-1 gap-2">
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-xs text-text-sub font-bold mb-1">参考価格</span>
                                    <span className="text-3xl font-black text-primary">{product.price}</span>
                                    <span className="text-xs text-text-sub mb-1">（税込）</span>
                                </div>
                                {amazonLink && (
                                    <a className="group w-full text-white py-3 rounded-xl bg-[#FF9900] hover:bg-[#FF9900]/90 text-white text-center font-bold shadow-lg shadow-[#FF9900]/20 transition-all flex items-center justify-center gap-2" href={amazonLink} target="_blank" rel="noopener noreferrer">
                                        Amazonで見る
                                        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">open_in_new</span>
                                    </a>
                                )}
                                {product.affiliateLinks?.rakuten && (
                                    <a className="group w-full text-white py-3 rounded-xl bg-[#BF0000] hover:bg-[#BF0000]/90 text-white text-center font-bold shadow-lg shadow-[#BF0000]/20 transition-all flex items-center justify-center gap-2" href={product.affiliateLinks.rakuten} target="_blank" rel="noopener noreferrer">
                                        楽天で見る
                                        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">open_in_new</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-[#E8F5E9]/50 border border-[#E8F5E9] p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2 text-[#2E7D32] font-bold text-sm">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                ここがおすすめ（メリット）
                            </div>
                            <ul className="space-y-2 text-sm text-primary">
                                {product.pros.map((pro, idx) => (
                                    <li key={idx} className="flex items-start gap-2"><span className="text-[#2E7D32] mt-1">•</span>{pro}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-[#FFEBEE]/50 border border-[#FFEBEE] p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2 text-[#C62828] font-bold text-sm">
                                <span className="material-symbols-outlined text-[18px]">warning</span>
                                ここは注意（デメリット）
                            </div>
                            <ul className="space-y-2 text-sm text-primary">
                                {product.cons.map((con, idx) => (
                                    <li key={idx} className="flex items-start gap-2"><span className="text-[#C62828] mt-1">•</span>{con}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
