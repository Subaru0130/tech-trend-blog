"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { getAmazonLink } from '@/lib/affiliate';
import { Product, Article, Specification } from '@/types';
import { getArticleDisplayDate, isRankingArticle } from '@/lib/article-utils';
import EditorialPolicyCard from '@/components/shared/EditorialPolicyCard';

interface ProductContentProps {
    product: Product;
    children?: React.ReactNode;
    parentArticle?: Article;
    parentArticles?: Article[];
    relatedProducts?: Product[];
    relatedArticles?: Article[];
    reviewUpdatedAt?: string;
}

const INVALID_SPEC_VALUES = new Set(['-', 'N/A', '不明', 'なし']);
const HIDDEN_SPEC_LABELS = [
    'asin',
    'jan',
    'ean',
    'upc',
    'pv',
    'amazon',
    'package dimensions',
    'item weight',
    'product weight',
    'manufacturer',
    'country',
    'warranty',
    'item model number',
];

function isUsefulSpec(spec: Specification): boolean {
    const normalizedLabel = spec.label.trim().toLowerCase();
    const normalizedValue = spec.value.trim();

    if (!normalizedLabel || !normalizedValue || INVALID_SPEC_VALUES.has(normalizedValue)) {
        return false;
    }

    return !HIDDEN_SPEC_LABELS.some((label) => normalizedLabel.includes(label));
}

function dedupeSpecs(specs: Specification[]): Specification[] {
    const seen = new Set<string>();
    return specs.filter((spec) => {
        const normalizedLabel = spec.label.trim().toLowerCase();
        if (seen.has(normalizedLabel)) {
            return false;
        }
        seen.add(normalizedLabel);
        return true;
    });
}

function resolveParentFromHash(allParentArticles: Article[], fallback?: Article): Article | undefined {
    if (typeof window === 'undefined') {
        return fallback;
    }

    const hash = window.location.hash;
    if (!hash.startsWith('#from-')) {
        return fallback;
    }

    const fromSlug = hash.replace('#from-', '');
    return allParentArticles.find((article) => article.id === fromSlug) || fallback;
}

const ProductContent: React.FC<ProductContentProps> = ({
    product,
    children,
    parentArticle: parentArticleProp,
    parentArticles: parentArticlesProp,
    relatedProducts = [],
    relatedArticles = [],
    reviewUpdatedAt,
}) => {
    const allParentArticles = parentArticlesProp || (parentArticleProp ? [parentArticleProp] : []);
    const defaultParent = allParentArticles[0];
    const [parentArticle] = useState<Article | undefined>(() => resolveParentFromHash(allParentArticles, defaultParent));

    const images = [product.image, product.image, product.image, product.image];
    const activeImage = 0;
    const amazonLink = getAmazonLink(product.asin, product.affiliateLinks.amazon, product.id) || product.affiliateLinks.amazon;
    const displayPrice = product.price || '価格情報なし';
    const specs = dedupeSpecs((product.specs || []).filter(isUsefulSpec)).slice(0, 12);

    return (
        <main className="pt-24 pb-20 md:pt-32">
            <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                <nav aria-label="Breadcrumb" className="flex items-center text-xs md:text-sm text-text-sub overflow-x-auto whitespace-nowrap pb-2 md:pb-0 mb-6">
                    <Link className="hover:text-accent transition-colors" href="/">ホーム</Link>
                    <span className="mx-2 text-stone-300">/</span>
                    <Link className="hover:text-accent transition-colors" href="/categories">カテゴリ</Link>
                    <span className="mx-2 text-stone-300">/</span>
                    {parentArticle ? (
                        <>
                            <Link className="hover:text-accent transition-colors max-w-[150px] md:max-w-xs truncate" href={`/rankings/${parentArticle.id}`}>
                                {parentArticle.title}
                            </Link>
                            <span className="mx-2 text-stone-300">/</span>
                        </>
                    ) : null}
                    <span className="font-bold text-primary truncate">{product.name}</span>
                </nav>

                <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-float border border-border-color mb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-surface-subtle shadow-inner relative group">
                                <Image
                                    alt={product.name}
                                    className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                                    fill
                                    loading="eager"
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    src={images[activeImage]}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col justify-center h-full">
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                                {product.rank === 1 ? (
                                    <span className="bg-accent text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                        Best Buy
                                    </span>
                                ) : null}
                                {product.rank > 0 ? (
                                    <span className="bg-surface-subtle text-text-sub text-[11px] font-bold px-3 py-1 rounded-full border border-border-color">
                                        ランキング {product.rank}位
                                    </span>
                                ) : null}
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
                                        {displayPrice}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {amazonLink ? (
                                        <a
                                            className="relative group flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#FF9900] hover:bg-[#E68A00] text-white rounded-xl shadow-lg transition-all hover:-translate-y-1"
                                            href={amazonLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                                            <span className="font-bold text-base whitespace-nowrap">Amazonで見る</span>
                                        </a>
                                    ) : null}
                                    {product.affiliateLinks.rakuten ? (
                                        <a
                                            className="relative group flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#BF0000] hover:bg-[#A00000] text-white rounded-xl shadow-lg transition-all hover:-translate-y-1"
                                            href={product.affiliateLinks.rakuten}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span className="material-symbols-outlined text-2xl">local_mall</span>
                                            <span className="font-bold text-base whitespace-nowrap">楽天市場で見る</span>
                                        </a>
                                    ) : null}
                                </div>

                                <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                                    掲載価格や在庫状況は変動するため、購入前に最新情報をご確認ください。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sticky top-16 md:top-20 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-border-color mb-16">
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-10 h-14">
                    <a className="text-sm font-bold text-accent border-b-2 border-accent h-full flex items-center px-1" href="#overview">レビュー概要</a>
                    <a className="text-sm font-bold text-text-sub hover:text-primary transition-colors h-full flex items-center px-1" href="#specs">スペック</a>
                    <div className="ml-auto hidden sm:flex items-center gap-4">
                        <span className="text-sm font-bold text-primary">{displayPrice}</span>
                        {amazonLink ? (
                            <a
                                className="bg-accent hover:bg-accent-dark text-white text-xs font-bold px-5 py-2 rounded-full transition-colors shadow-sm"
                                href={amazonLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Amazonへ
                            </a>
                        ) : null}
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
                            <h2 className="!m-0 !border-0 text-3xl">
                                {product.name}のレビュー概要
                            </h2>
                        </div>

                        <p className="text-xl font-medium text-primary mb-10 leading-relaxed border-l-4 border-accent-light pl-6">
                            {product.description}
                        </p>

                        <EditorialPolicyCard
                            variant="review"
                            updatedAt={reviewUpdatedAt}
                            className="mb-10"
                        />

                        <div className="my-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-pros-bg/50 p-8 rounded-[1.5rem] border border-pros-bg">
                                <h3 className="!mt-0 flex items-center gap-2 text-pros-text font-bold text-base">
                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    メリット
                                </h3>
                                <ul className="!mb-0 text-sm font-bold leading-relaxed text-primary mt-4 space-y-2">
                                    {(product.pros || []).map((item, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-pros-text mt-0.5">・</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-cons-bg/50 p-8 rounded-[1.5rem] border border-cons-bg">
                                <h3 className="!mt-0 flex items-center gap-2 text-cons-text font-bold text-base">
                                    <span className="material-symbols-outlined text-[20px]">warning</span>
                                    注意点
                                </h3>
                                <ul className="!mb-0 text-sm font-bold leading-relaxed text-primary mt-4 space-y-2">
                                    {(product.cons || []).map((item, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-cons-text mt-0.5">・</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

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
                                    {specs.map((spec, index) => (
                                        <tr key={`${spec.label}-${index}`} className={index % 2 === 0 ? 'bg-surface-subtle/30' : ''}>
                                            <th className="py-5 px-8 font-bold text-primary w-1/3">{spec.label}</th>
                                            <td className="py-5 px-8 text-text-main">{spec.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {amazonLink ? (
                            <a
                                className="relative group flex items-center justify-center gap-3 w-full py-5 px-8 bg-[#FF9900] hover:bg-[#E68A00] text-white rounded-2xl shadow-lg transition-all hover:-translate-y-1"
                                href={amazonLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                                <span className="font-bold text-lg whitespace-nowrap">Amazonで価格を見る</span>
                            </a>
                        ) : null}
                        {product.affiliateLinks.rakuten ? (
                            <a
                                className="relative group flex items-center justify-center gap-3 w-full py-5 px-8 bg-[#BF0000] hover:bg-[#A00000] text-white rounded-2xl shadow-lg transition-all hover:-translate-y-1"
                                href={product.affiliateLinks.rakuten}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className="material-symbols-outlined text-3xl">local_mall</span>
                                <span className="font-bold text-lg whitespace-nowrap">楽天市場で価格を見る</span>
                            </a>
                        ) : null}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-white p-8 rounded-3xl shadow-card border border-border-color">
                        <h3 className="font-bold text-primary mb-6 flex items-center gap-2 whitespace-nowrap text-sm">
                            <span className="material-symbols-outlined text-rank-gold">auto_awesome</span>
                            関連するおすすめ商品
                        </h3>

                        <div className="space-y-6">
                            {relatedProducts.length > 0 ? (
                                relatedProducts.map((relatedProduct, index) => (
                                    <Link
                                        key={relatedProduct.id || index}
                                        className="flex items-center gap-4 group"
                                        href={`/reviews/${relatedProduct.id}${parentArticle ? `#from-${parentArticle.id}` : ''}`}
                                    >
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-subtle border border-border-color shrink-0">
                                            <Image
                                                alt={relatedProduct.name}
                                                className="object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                                fill
                                                sizes="80px"
                                                src={relatedProduct.image}
                                            />
                                            {relatedProduct.rank > 0 ? (
                                                <div className={`absolute top-0 left-0 text-white text-[10px] font-bold px-2 py-0.5 rounded-br z-10 ${relatedProduct.rank === 1 ? 'bg-rank-gold' :
                                                    relatedProduct.rank === 2 ? 'bg-rank-silver' :
                                                        relatedProduct.rank === 3 ? 'bg-rank-bronze' : 'bg-stone-500'
                                                    }`}>
                                                    {relatedProduct.rank}位
                                                </div>
                                            ) : null}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-primary line-clamp-2 group-hover:text-accent transition-colors">
                                                {relatedProduct.name}
                                            </h4>
                                            <div className="text-xs text-stone-400 mt-1 font-bold">{relatedProduct.price}</div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-sm text-text-sub">関連商品はまだありません。</p>
                            )}
                        </div>

                        {allParentArticles.length > 0 ? (
                            <div className="mt-8 pt-6 border-t border-border-color">
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">掲載中の比較記事</p>
                                <div className="space-y-3">
                                    {allParentArticles.map((article) => (
                                        <Link key={article.id} className="text-xs font-bold text-accent hover:underline flex items-center gap-1" href={`/rankings/${article.id}`}>
                                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                            <span className="line-clamp-1">{article.title}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="bg-[#F2F4F2] p-8 rounded-3xl border border-border-color">
                        <h3 className="font-bold text-primary mb-6 text-sm tracking-widest uppercase">あわせて読みたい</h3>
                        <ul className="space-y-6">
                            {relatedArticles.length > 0 ? (
                                relatedArticles.slice(0, 3).map((article) => (
                                    <li key={article.id}>
                                        <Link className="group block" href={isRankingArticle(article) ? `/rankings/${article.id}` : `/reviews/${article.id}`}>
                                            <span className="text-[10px] font-bold text-accent mb-1 block">
                                                {getArticleDisplayDate(article)}
                                            </span>
                                            <h4 className="text-sm font-bold text-primary leading-snug group-hover:text-accent transition-colors">
                                                {article.title}
                                            </h4>
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li>
                                    <Link className="group block" href="/categories">
                                        <span className="text-[10px] font-bold text-accent mb-1 block">CATEGORY</span>
                                        <h4 className="text-sm font-bold text-primary leading-snug group-hover:text-accent transition-colors">
                                            さらに多くの比較記事を見る
                                        </h4>
                                    </Link>
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
