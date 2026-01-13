"use client";

import React, { useState } from 'react';
import { Product, Article } from '@/types';

interface ProductContentProps {
    product: Product;
    children?: React.ReactNode;
    parentArticle?: Article;
    relatedProducts?: Product[];
    relatedArticles?: Article[];
}

const ProductContent: React.FC<ProductContentProps> = ({
    product,
    children,
    parentArticle,
    relatedProducts = [],
    relatedArticles = []
}) => {
    const [activeImage, setActiveImage] = useState(0);
    // Use product image and placeholders if only one image exists or mock multiple images
    const images = [product.image];
    // Mock additional images for carousel effect if needed, or use real ones if available in future
    if (images.length < 4) {
        images.push(product.image, product.image, product.image);
    }

    const priceVal = typeof product.price === 'string'
        ? parseInt(product.price.replace(/[^0-9]/g, ''))
        : (product.price || 0);

    return (
        <main className="pt-24 pb-20 md:pt-32">
            <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex items-center text-xs md:text-sm text-text-sub overflow-x-auto whitespace-nowrap pb-2 md:pb-0 mb-6">
                    <a className="hover:text-accent transition-colors" href="/">ホーム</a>
                    <span className="mx-2 text-stone-300">/</span>
                    <a className="hover:text-accent transition-colors" href="/categories">カテゴリ</a>
                    <span className="mx-2 text-stone-300">/</span>
                    {/* Contextual Link to Parent Article */}
                    {parentArticle ? (
                        <>
                            <a className="hover:text-accent transition-colors max-w-[150px] md:max-w-xs truncate" href={`/rankings/${parentArticle.id}`}>
                                {parentArticle.title}
                            </a>
                            <span className="mx-2 text-stone-300">/</span>
                        </>
                    ) : (
                        <>
                            <span className="text-stone-400">商品詳細</span>
                            <span className="mx-2 text-stone-300">/</span>
                        </>
                    )}
                    <span className="font-bold text-primary truncate">{product.name}</span>
                </nav>

                {/* Hero Section */}
                <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-float border border-border-color mb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-surface-subtle shadow-inner relative group">
                                <img
                                    alt={product.name}
                                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                                    src={images[activeImage]}
                                />
                            </div>
                            {/* Thumbnail selection could go here if implemented */}
                        </div>
                        <div className="flex flex-col justify-center h-full">
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                                {product.rank === 1 && (
                                    <span className="bg-accent text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                        2025年ベストバイ
                                    </span>
                                )}
                                <span className="bg-surface-subtle text-text-sub text-[11px] font-bold px-3 py-1 rounded-full border border-border-color">
                                    おすすめランキング {product.rank}位
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight mb-6">
                                {product.name}
                            </h1>
                            <p className="text-lg text-text-sub font-medium mb-8 leading-relaxed">
                                {product.description}
                            </p>
                            <div className="space-y-8">
                                <div className="flex items-baseline gap-3 pb-6 border-b border-border-color">
                                    <span className="text-sm font-bold text-stone-500">参考価格</span>
                                    <span className="text-5xl font-black text-primary tracking-tight">
                                        {product.price}
                                        <span className="text-lg font-bold text-text-sub ml-1">~</span>
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {product.affiliateLinks.amazon && (
                                        <a
                                            className="relative group flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#FF9900] hover:bg-[#E68A00] text-white rounded-xl shadow-lg transition-all hover:-translate-y-1"
                                            href={product.affiliateLinks.amazon}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                                            <span className="font-bold text-base whitespace-nowrap">Amazonで見る</span>
                                        </a>
                                    )}
                                    {product.affiliateLinks.rakuten && (
                                        <a
                                            className="relative group flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#BF0000] hover:bg-[#A00000] text-white rounded-xl shadow-lg transition-all hover:-translate-y-1"
                                            href={product.affiliateLinks.rakuten}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span className="material-symbols-outlined text-2xl">local_mall</span>
                                            <span className="font-bold text-base whitespace-nowrap">楽天市場で見る</span>
                                        </a>
                                    )}
                                </div>
                                <p className="text-[11px] text-stone-400 text-center leading-relaxed">*最新の価格・在庫状況は各ストアにてご確認ください。</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Navigation */}
            <div className="sticky top-16 md:top-20 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-border-color mb-16">
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-10 h-14">
                    <a className="text-sm font-bold text-accent border-b-2 border-accent h-full flex items-center px-1" href="#overview">専門家による検証</a>
                    <a className="text-sm font-bold text-text-sub hover:text-primary transition-colors h-full flex items-center px-1" href="#specs">詳細スペック</a>
                    <div className="ml-auto hidden sm:flex items-center gap-4">
                        <span className="text-sm font-bold text-primary">{product.price}</span>
                        {product.affiliateLinks.amazon && (
                            <a
                                className="bg-accent hover:bg-accent-dark text-white text-xs font-bold px-5 py-2 rounded-full transition-colors shadow-sm"
                                href={product.affiliateLinks.amazon}
                            >
                                Amazonで購入
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8">
                    <article className="prose max-w-none" id="overview">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="size-12 rounded-2xl bg-accent-light flex items-center justify-center text-accent">
                                <span className="material-symbols-outlined text-3xl">verified</span>
                            </div>
                            <h2 className="!m-0 !border-0 text-3xl">専門家による徹底検証<br className="hidden md:block" />{product.name}の実力とは？</h2>
                        </div>
                        <p className="text-xl font-medium text-primary mb-10 leading-relaxed border-l-4 border-accent-light pl-6">
                            {product.description}
                        </p>

                        <div className="my-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-pros-bg/50 p-8 rounded-[1.5rem] border border-pros-bg">
                                <h3 className="!mt-0 flex items-center gap-2 text-pros-text font-bold text-base">
                                    <span className="material-symbols-outlined text-[20px]">check_circle</span> ここがおすすめ(メリット)
                                </h3>
                                <ul className="!mb-0 text-sm font-bold leading-relaxed text-primary mt-4 space-y-2">
                                    {product.pros && product.pros.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-pros-text mt-0.5">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-cons-bg/50 p-8 rounded-[1.5rem] border border-cons-bg">
                                <h3 className="!mt-0 flex items-center gap-2 text-cons-text font-bold text-base">
                                    <span className="material-symbols-outlined text-[20px]">warning</span> ここは注意(デメリット)
                                </h3>
                                <ul className="!mb-0 text-sm font-bold leading-relaxed text-primary mt-4 space-y-2">
                                    {product.cons && product.cons.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-cons-text mt-0.5">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Dynamic Review Content passed from server page */}
                        <div className="prose-headings:font-black prose-headings:text-primary prose-p:text-text-main prose-li:text-text-main prose-strong:text-primary prose-a:text-blue-600 prose-a:font-bold prose-a:underline prose-a:decoration-blue-600/30 prose-a:underline-offset-4 hover:prose-a:decoration-blue-600 hover:prose-a:text-blue-700 transition-colors">
                            {children}
                        </div>
                    </article>

                    <section className="mt-20" id="specs">
                        <div className="flex items-center gap-3 mb-8 border-b border-border-color pb-4">
                            <span className="material-symbols-outlined text-accent text-2xl">list_alt</span>
                            <h2 className="text-2xl font-black text-primary">詳細スペック</h2>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-border-color bg-white">
                            <table className="w-full text-sm text-left">
                                <tbody className="divide-y divide-border-color">
                                    {product.specs.filter(spec =>
                                        !spec.label.includes("お届け") &&
                                        !spec.label.includes("ニュース") &&
                                        !spec.label.includes("関連") &&
                                        !spec.label.includes("保証") &&
                                        !spec.label.includes("在庫") &&
                                        !spec.label.includes("特集") &&
                                        !spec.label.includes("満足度") &&
                                        !spec.label.includes("ランキング") &&
                                        !spec.label.includes("PV") &&
                                        !spec.label.includes("記事")
                                    ).map((spec, i) => (
                                        <tr key={i} className={i % 2 === 0 ? "bg-surface-subtle/30" : ""}>
                                            <th className="py-5 px-8 font-bold text-primary w-1/3">{spec.label}</th>
                                            <td className="py-5 px-8 text-text-main">{spec.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Affiliate Buttons (Moved to bottom) */}
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {product.affiliateLinks.amazon && (
                            <a
                                className="relative group flex items-center justify-center gap-3 w-full py-5 px-8 bg-[#FF9900] hover:bg-[#E68A00] text-white rounded-2xl shadow-lg transition-all hover:-translate-y-1"
                                href={product.affiliateLinks.amazon}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                                <span className="font-bold text-lg whitespace-nowrap">Amazonで在庫を見る</span>
                            </a>
                        )}
                        {product.affiliateLinks.rakuten && (
                            <a
                                className="relative group flex items-center justify-center gap-3 w-full py-5 px-8 bg-[#BF0000] hover:bg-[#A00000] text-white rounded-2xl shadow-lg transition-all hover:-translate-y-1"
                                href={product.affiliateLinks.rakuten}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className="material-symbols-outlined text-3xl">local_mall</span>
                                <span className="font-bold text-lg whitespace-nowrap">楽天市場で在庫を見る</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-white p-8 rounded-3xl shadow-card border border-border-color">
                        <h3 className="font-bold text-primary mb-6 flex items-center gap-2 whitespace-nowrap text-sm">
                            <span className="material-symbols-outlined text-rank-gold">auto_awesome</span>
                            同ジャンルの人気商品
                        </h3>
                        {/* Dynamic Related Products */}
                        <div className="space-y-6">
                            {relatedProducts.length > 0 ? (
                                relatedProducts.map((p, index) => (
                                    <a key={p.id || index} className="flex items-center gap-4 group" href={`/reviews/${p.id}`}>
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-subtle border border-border-color shrink-0">
                                            <img
                                                alt={p.name}
                                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                                src={p.image}
                                            />
                                            {p.rank > 0 && (
                                                <div className={`absolute top-0 left-0 text-white text-[10px] font-bold px-2 py-0.5 rounded-br z-10 ${p.rank === 1 ? 'bg-rank-gold' :
                                                    p.rank === 2 ? 'bg-rank-silver' :
                                                        p.rank === 3 ? 'bg-rank-bronze' : 'bg-stone-500'
                                                    }`}>
                                                    {p.rank}位
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-primary line-clamp-2 group-hover:text-accent transition-colors">
                                                {p.name}
                                            </h4>
                                            <div className="text-xs text-stone-400 mt-1 font-bold">{p.price}</div>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <p className="text-sm text-text-sub">関連商品はありません。</p>
                            )}
                        </div>
                        <div className="mt-8 pt-6 border-t border-border-color text-center">
                            {parentArticle && (
                                <a className="text-xs font-bold text-accent hover:underline flex items-center justify-center gap-1 whitespace-nowrap" href={`/rankings/${parentArticle.id}`}>
                                    ランキングをもっと見る <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Read Also Section */}
                    <div className="bg-[#F2F4F2] p-8 rounded-3xl border border-border-color">
                        <h3 className="font-bold text-primary mb-6 text-sm tracking-widest uppercase">あわせて読みたい</h3>
                        <ul className="space-y-6">
                            {relatedArticles.length > 0 ? (
                                relatedArticles.slice(0, 3).map((article) => (
                                    <li key={article.id}>
                                        <a className="group block" href={`/rankings/${article.id}`}>
                                            <span className="text-[10px] font-bold text-accent mb-1 block">
                                                {article.id.includes('guide') ? 'BUYING GUIDE' : 'RANKING'}
                                            </span>
                                            <h4 className="text-sm font-bold text-primary leading-snug group-hover:text-accent transition-colors">
                                                {article.title}
                                            </h4>
                                        </a>
                                    </li>
                                ))
                            ) : (
                                <li>
                                    <a className="group block" href="/categories">
                                        <span className="text-[10px] font-bold text-accent mb-1 block">CATEGORY</span>
                                        <h4 className="text-sm font-bold text-primary leading-snug group-hover:text-accent transition-colors">
                                            さらに多くの記事を探す
                                        </h4>
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProductContent;
