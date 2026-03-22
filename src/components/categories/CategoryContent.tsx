"use client";

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CategorySidebar from '@/components/categories/CategorySidebar';
import { Article } from '@/types';
import {
    getArticleDisplayDate,
    getFeaturedArticleIds,
    isRankingArticle,
    sortArticlesByFeatured,
    sortArticlesByNewest,
} from '@/lib/article-utils';

type CategoryContentProps = {
    categoryInfo: {
        label: string;
        icon: string;
        slug?: string;
        subCategories: { label: string; slug: string; icon: string }[];
    };
    initialArticles: Article[];
};

export default function CategoryContent({ categoryInfo, initialArticles }: CategoryContentProps) {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
    const [sortOrder, setSortOrder] = useState('newest');

    const featuredIds = useMemo(() => {
        return new Set(getFeaturedArticleIds(initialArticles, Math.min(6, initialArticles.length)));
    }, [initialArticles]);

    const filteredArticles = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const filtered = initialArticles.filter((article) => {
            const tags = article.tags || [];

            return (
                article.title.toLowerCase().includes(query) ||
                article.description.toLowerCase().includes(query) ||
                tags.some((tag) => tag.toLowerCase().includes(query))
            );
        });

        return sortOrder === 'featured'
            ? sortArticlesByFeatured(filtered)
            : sortArticlesByNewest(filtered);
    }, [initialArticles, searchQuery, sortOrder]);

    const popularTags = useMemo(() => {
        const tagCounts: Record<string, number> = {};

        initialArticles.forEach((article) => {
            const tags = article.tags || [];
            tags.forEach((tag) => {
                if (/^\d{4}最新$/.test(tag)) return;
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 12);
    }, [initialArticles]);

    return (
        <>
            <div className="bg-white border-b border-stone-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e7e5e4_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="inline-flex items-center justify-center size-12 rounded-xl bg-accent-light text-accent shadow-sm">
                                    <span className="material-symbols-outlined text-2xl">{categoryInfo.icon}</span>
                                </span>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight">{categoryInfo.label}</h1>
                            </div>
                            <p className="text-stone-500 text-sm md:text-base leading-relaxed">
                                {categoryInfo.label}に関する最新のレビューとランキング記事を一覧で見られます。
                                <br className="hidden sm:inline" />
                                条件を絞り込みながら、気になる用途や悩みに合った記事を探せます。
                            </p>
                        </div>
                        <div className="w-full md:w-80 shrink-0">
                            <div className="relative group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 group-focus-within:text-primary transition-colors">search</span>
                                <input
                                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none placeholder:text-stone-400 shadow-sm"
                                    placeholder={`${categoryInfo.label}の記事を検索...`}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
                    <main className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                            <div className="text-sm font-bold text-text-main flex items-baseline gap-1">
                                <span className="text-xl text-primary font-black">{filteredArticles.length}</span>
                                <span className="text-stone-400 text-xs">件の記事</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <select
                                    className="form-select text-xs font-bold bg-transparent border-none py-1 pr-8 pl-2 text-text-main focus:ring-0 cursor-pointer hover:bg-stone-50 rounded-lg transition-colors"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="newest">新着順</option>
                                    <option value="featured">おすすめ順</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {filteredArticles.length === 0 ? (
                                <div className="text-center py-20 text-stone-400">
                                    <span className="material-symbols-outlined text-4xl mb-2">content_paste_off</span>
                                    <p>「{searchQuery}」に一致する記事は見つかりませんでした。</p>
                                </div>
                            ) : (
                                filteredArticles.map((article) => {
                                    const subCatLabel = categoryInfo.subCategories.find((subCategory) => subCategory.slug === article.subCategoryId)?.label || article.subCategoryId || categoryInfo.label;
                                    const tags = article.tags || [];
                                    const linkHref = isRankingArticle(article) ? `/rankings/${article.id}` : `/reviews/${article.id}`;
                                    const isFeatured = featuredIds.has(article.id);

                                    return (
                                        <article key={article.id} className="group flex flex-col md:flex-row bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-card-hover hover:border-primary/20 transition-all duration-300">
                                            <Link href={linkHref} className="block md:w-2/5 aspect-video md:aspect-auto overflow-hidden relative">
                                                <Image
                                                    alt={article.title}
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 40vw"
                                                    src={article.thumbnail || "https://placehold.co/600x400/e2e8f0/475569?text=No+Image"}
                                                />
                                                <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur text-primary text-[10px] font-bold rounded-full shadow-sm border border-primary/10">
                                                    {subCatLabel}
                                                </span>
                                            </Link>
                                            <div className="p-6 md:w-3/5 flex flex-col justify-center">
                                                <div className="flex items-center gap-3 mb-2 text-xs text-stone-400">
                                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {getArticleDisplayDate(article)}</span>
                                                    {isFeatured && (
                                                        <span className="flex items-center gap-1 text-accent font-bold"><span className="material-symbols-outlined text-[14px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span> 注目</span>
                                                    )}
                                                </div>
                                                <h2 className="text-lg md:text-xl font-bold text-text-main mb-3 leading-snug group-hover:text-primary transition-colors">
                                                    <Link href={linkHref}>
                                                        {article.title}
                                                    </Link>
                                                </h2>
                                                <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed mb-4">
                                                    {article.description}
                                                </p>
                                                <div className="mt-auto flex items-center gap-2 flex-wrap">
                                                    {tags.map((tag, i) => (
                                                        <span key={i} className="px-2 py-1 bg-stone-50 text-stone-500 text-[10px] font-medium rounded border border-stone-100 hover:border-primary/30 hover:text-primary transition-colors">#{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </div>

                        <div className="pt-10 flex justify-center">
                            <nav className="flex items-center gap-1">
                                <a className="size-10 flex items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors" href="#">
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </a>
                                <a className="size-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold shadow-md shadow-primary/20" href="#">1</a>
                                <a className="size-10 flex items-center justify-center rounded-lg border border-transparent text-stone-600 font-medium hover:bg-stone-100 transition-colors" href="#">2</a>
                                <a className="size-10 flex items-center justify-center rounded-lg border border-transparent text-stone-600 font-medium hover:bg-stone-100 transition-colors" href="#">3</a>
                                <span className="size-10 flex items-center justify-center text-stone-400">...</span>
                                <a className="size-10 flex items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-primary transition-colors" href="#">
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </a>
                            </nav>
                        </div>
                    </main>

                    <CategorySidebar popularTags={popularTags} categorySlug={categoryInfo.slug} />
                </div>
            </div>
        </>
    );
}
