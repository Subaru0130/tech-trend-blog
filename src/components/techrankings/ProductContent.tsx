"use client";

import { useRef, useState, useEffect } from 'react';
import { getAmazonLink } from '@/lib/affiliate';
import { Product, Article } from '@/types';

interface ProductContentProps {
    product: Product;
    children?: React.ReactNode;
    parentArticle?: Article;
    parentArticles?: Article[];  // ★ All articles that contain this product
    relatedProducts?: Product[];
    relatedArticles?: Article[];
}

const ProductContent: React.FC<ProductContentProps> = ({
    product,
    children,
    parentArticle: parentArticleProp,
    parentArticles: parentArticlesProp,
    relatedProducts = [],
    relatedArticles = []
}) => {
    // ★ Support both single and multi-article props
    const allParentArticles = parentArticlesProp || (parentArticleProp ? [parentArticleProp] : []);
    const defaultParent = allParentArticles[0] || undefined;

    // ★ Client-side: read ?from= param to select the correct parent article
    const [parentArticle, setParentArticle] = useState<Article | undefined>(defaultParent);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const fromSlug = params.get('from');
        if (fromSlug) {
            const matched = allParentArticles.find(a => a.id === fromSlug);
            if (matched) setParentArticle(matched);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
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
                                {product.rank && product.rank > 0 && (
                                    <span className="bg-surface-subtle text-text-sub text-[11px] font-bold px-3 py-1 rounded-full border border-border-color">
                                        おすすめランキング {product.rank}位
                                    </span>
                                )}
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
                    <a className="text-sm font-bold text-accent border-b-2 border-accent h-full flex items-center px-1" href="#overview">スペック徹底検証</a>
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
                            <h2 className="!m-0 !border-0 text-3xl">スペック徹底分析<br className="hidden md:block" />{product.name}の実力とは？</h2>
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
                                    {(() => {
                                        // Filter useless labels
                                        const uselessLabels = [
                                            'お届け', 'ニュース', '関連', '保証', '在庫', '特集', '満足度',
                                            'ランキング', 'PV', '記事', 'ASIN', 'JAN', 'EAN', 'UPC',
                                            'Amazon', 'ベストセラー', 'Date First', '発売日', 'カスタマーレビュー',
                                            'Package Dimensions', 'Item Weight', 'Product Weight', 'Batteries',
                                            'Manufacturer', 'Country', '原産国', '販売元', '出品者', 'Number of Items',
                                            'Age Range', 'Included Components', '付属品', 'Warranty', 'Item Model Number'
                                        ];

                                        // English to Japanese value translations
                                        const valueTranslations: Record<string, string> = {
                                            'Waterproof': '防水対応',
                                            'Water Resistant': '防滴対応',
                                            'Yes': '対応',
                                            'No': '非対応',
                                            'True': '対応',
                                            'False': '非対応',
                                            'Wireless': 'ワイヤレス',
                                            'Wired': '有線',
                                            'Both': '両対応',
                                            'Active Noise Cancellation': 'アクティブノイズキャンセリング',
                                            'Black': 'ブラック',
                                            'White': 'ホワイト',
                                            'Silver': 'シルバー',
                                            'Gold': 'ゴールド',
                                            'Bluetooth': 'Bluetooth',
                                        };

                                        // Label normalization (merge duplicates)
                                        const labelNormalization: Record<string, string> = {
                                            '接続タイプ': '接続方式',
                                            'Connectivity Technology': '接続方式',
                                            'Wireless Communication Technology': 'ワイヤレス技術',
                                            '防水性能': '防水',
                                            'Waterproof Rating': '防水',
                                            'Bluetoothバージョン': 'Bluetooth',
                                            'Bluetooth Version': 'Bluetooth',
                                            'Control Type': '操作方式',
                                            'Control Method': '操作方式',
                                            '重量': '本体重量',
                                            'Weight': '本体重量',
                                            '再生時間': 'バッテリー',
                                            'Battery Life': 'バッテリー',
                                            'Playtime': 'バッテリー',
                                        };

                                        // Filter and process specs
                                        const filteredSpecs = (product.specs || [])
                                            .filter(spec => {
                                                // Remove useless labels
                                                const isUseless = uselessLabels.some(ul =>
                                                    spec.label.toLowerCase().includes(ul.toLowerCase())
                                                );
                                                if (isUseless) return false;

                                                // Remove empty or placeholder values
                                                if (!spec.value || spec.value === '-' || spec.value === '記載なし' || spec.value === 'N/A') return false;

                                                return true;
                                            })
                                            .map(spec => {
                                                // Normalize label
                                                let normalizedLabel = labelNormalization[spec.label] || spec.label;

                                                // Translate value
                                                let translatedValue = spec.value;
                                                Object.entries(valueTranslations).forEach(([en, ja]) => {
                                                    if (translatedValue === en) translatedValue = ja;
                                                });

                                                // Clean up "Ver.X.X" format
                                                if (normalizedLabel === 'Bluetooth' && translatedValue.match(/^Ver\.?\s*\d/i)) {
                                                    translatedValue = translatedValue.replace(/^Ver\.?\s*/i, '');
                                                }

                                                return { label: normalizedLabel, value: translatedValue };
                                            });

                                        // Deduplicate by label (keep first occurrence)
                                        const seenLabels = new Set<string>();
                                        const deduplicatedSpecs = filteredSpecs.filter(spec => {
                                            if (seenLabels.has(spec.label)) return false;
                                            seenLabels.add(spec.label);
                                            return true;
                                        });

                                        // Limit to 12 most useful specs
                                        return deduplicatedSpecs.slice(0, 12).map((spec, i) => (
                                            <tr key={i} className={i % 2 === 0 ? "bg-surface-subtle/30" : ""}>
                                                <th className="py-5 px-8 font-bold text-primary w-1/3">{spec.label}</th>
                                                <td className="py-5 px-8 text-text-main">{spec.value}</td>
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Affiliate Buttons (Moved to bottom) */}
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {product.affiliateLinks.amazon && (
                            <a
                                className="relative group flex items-center justify-center gap-3 w-full py-5 px-8 bg-[#FF9900] hover:bg-[#E68A00] text-white rounded-2xl shadow-lg transition-all hover:-translate-y-1"
                                href={getAmazonLink(product.asin, product.affiliateLinks.amazon, product.id) || '#'}
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
                                    <a key={p.id || index} className="flex items-center gap-4 group" href={`/reviews/${p.id}${parentArticle ? `?from=${parentArticle.id}` : ''}`}>
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
                        <div className="mt-8 pt-6 border-t border-border-color">
                            {allParentArticles.length > 0 ? (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">この商品が紹介されている記事</p>
                                    {allParentArticles.map((article) => (
                                        <a key={article.id} className="text-xs font-bold text-accent hover:underline flex items-center gap-1" href={`/rankings/${article.id}`}>
                                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                            <span className="line-clamp-1">{article.title}</span>
                                        </a>
                                    ))}
                                </div>
                            ) : null}
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
