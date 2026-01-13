
"use client";

import React, { useState } from 'react';
import { Product } from '@/types';

interface ProductContentProps {
    product: Product;
}

const ProductContent: React.FC<ProductContentProps> = ({ product }) => {
    const [activeImage, setActiveImage] = useState(0);
    // Use product image and placeholders if only one image exists
    const images = [product.image];

    // Calculate discount if possible (mock logic or real data if available)
    const priceVal = typeof product.price === 'string'
        ? parseInt(product.price.replace(/[^0-9]/g, ''))
        : (product.price || 0);
    const listPrice = Math.floor(priceVal * 1.15); // Mock list price for visual effect

    return (
        <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Product Hero */}
            <div className="bg-white dark:bg-surface-dark rounded-xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800">
                <div className="border-b border-gray-100 dark:border-gray-700 pb-6 mb-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {product.rank === 1 && (
                            <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px] fill-current">emoji_events</span>
                                売れ筋ランキング 1位
                            </span>
                        )}
                        {(product.rating >= 4.5 || product.tags?.editorPick) && (
                            <span className="bg-blue-50 text-brand-blue border border-blue-100 text-[10px] font-bold px-2 py-1 rounded-full">
                                編集部おすすめ
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-main dark:text-white leading-snug mb-3">
                        {product.name}
                    </h1>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-md">
                            <span className="font-bold text-yellow-700 text-base">{product.rating.toFixed(1)}</span>
                            <div className="flex text-accent-yellow">
                                {[1, 2, 3, 4].map(i => (
                                    <span key={i} className={`material-symbols-outlined text-[16px] ${i <= Math.round(product.rating) ? 'fill-current' : ''}`}>star</span>
                                ))}
                                {product.rating % 1 !== 0 && <span className="material-symbols-outlined text-[16px] fill-current">star_half</span>}
                            </div>
                        </div>
                        <span className="text-gray-400 text-xs">({product.reviewCount}件のレビュー)</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-5/12 flex flex-col gap-4">
                        <div className="aspect-square w-full rounded-xl bg-white border border-gray-100 dark:border-gray-700 overflow-hidden relative group shadow-sm flex items-center justify-center p-6">
                            <div
                                className="w-full h-full bg-contain bg-no-repeat bg-center transition-transform duration-500 group-hover:scale-105"
                                style={{ backgroundImage: `url('${images[activeImage]}')` }}
                            ></div>
                        </div>
                    </div>

                    <div className="w-full md:w-7/12 flex flex-col">
                        <div className="mb-6">
                            <p className="text-text-main dark:text-gray-300 text-sm leading-7 mb-5 font-normal">
                                {product.description}
                            </p>

                            {/* Key Features from Pros */}
                            {product.pros && product.pros.length > 0 && (
                                <ul className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700/50">
                                    {product.pros.slice(0, 3).map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm">
                                            <span className="flex items-center justify-center size-5 rounded-full bg-green-100 text-green-600 mt-0.5">
                                                <span className="material-symbols-outlined text-[14px]">check</span>
                                            </span>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="mt-auto bg-gradient-to-br from-[#fffdfd] to-[#fff5f5] dark:from-surface-dark dark:to-surface-dark p-5 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm">
                            <div className="flex flex-wrap items-baseline gap-2 mb-4">
                                <span className="text-xs text-gray-500 font-medium">最安値参考:</span>
                                <span className="text-4xl font-bold text-[#c41e3a] leading-none tracking-tight">{product.price}</span>
                                {priceVal > 0 && <span className="text-sm text-gray-400 line-through">¥{listPrice.toLocaleString()}</span>}
                            </div>
                            <div className="flex flex-col gap-3">
                                {product.affiliateLinks.amazon && (
                                    <a href={product.affiliateLinks.amazon} className="w-full bg-[#ff9900] hover:bg-[#e68a00] text-white font-bold text-lg py-3.5 px-4 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] group">
                                        Amazonで詳細を見る
                                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">open_in_new</span>
                                    </a>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <a href={product.affiliateLinks.rakuten || '#'} className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 hover:border-gray-300 text-text-main dark:text-white text-sm font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm">
                                        <span className="text-red-600 font-black">R</span> 楽天市場
                                    </a>
                                    <a href={product.affiliateLinks.yahoo || '#'} className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 hover:border-gray-300 text-text-main dark:text-white text-sm font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm">
                                        <span className="text-red-600 font-black">Y!</span> Yahoo!
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Affiliate Notice */}
            <div className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[11px] px-4 py-3 rounded-lg flex items-start gap-2 border border-gray-100 dark:border-gray-700">
                <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">info</span>
                <p>当サイトはアフィリエイト広告プログラムに参加しています。記事内で紹介している商品を購入すると、売上の一部が当サイトに還元されることがあります。</p>
            </div>

            {/* Pros/Cons Section */}
            <div id="verdict" className="bg-white dark:bg-surface-dark rounded-xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800 scroll-mt-24">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-brand-blue rounded-full"></span>
                    専門家の評価・レビュー
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <h3 className="font-bold text-blue-800 dark:text-blue-400 mb-4 flex items-center gap-2 text-sm border-b border-blue-200 dark:border-blue-800/30 pb-2">
                            <span className="material-symbols-outlined text-blue-600">thumb_up</span>
                            良い点 (メリット)
                        </h3>
                        <ul className="space-y-3">
                            {product.pros && product.pros.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 text-sm border-b border-gray-200 dark:border-gray-700 pb-2">
                            <span className="material-symbols-outlined text-gray-500">thumb_down</span>
                            気になった点 (デメリット)
                        </h3>
                        <ul className="space-y-3">
                            {product.cons && product.cons.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0"></span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Detailed Specs (Consolidated) */}
            <div className="bg-white dark:bg-surface-dark rounded-xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-brand-blue rounded-full"></span>
                    製品仕様（スペック）
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 text-sm">
                    {product.specs.map((spec, i) => (
                        <div key={i} className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-4 group hover:bg-gray-50 transition-colors px-2 rounded-sm">
                            <span className="text-gray-500">{spec.label}</span>
                            <span className="font-medium text-text-main dark:text-white">{spec.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dynamic User Reviews */}
            {product.reviews && product.reviews.length > 0 ? (
                <div id="reviews" className="bg-white dark:bg-surface-dark rounded-xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-brand-blue rounded-full"></span>
                        ユーザーレビュー
                    </h2>

                    <div className="space-y-6">
                        {product.reviews.map((review, idx) => (
                            <div key={idx} className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-xs font-bold text-brand-blue">
                                            {review.author ? review.author.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-text-main dark:text-white">{review.author || '購入者'}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex text-accent-yellow text-xs">
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <span key={i} className={`material-symbols-outlined text-[14px] ${i <= review.rating ? 'fill-current' : 'text-gray-300'}`}>star</span>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-400">• {review.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <h4 className="font-bold text-sm mb-2 text-text-main dark:text-white">{review.title}</h4>
                                <p className="text-text-main dark:text-gray-300 text-sm leading-relaxed">
                                    {review.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default ProductContent;
