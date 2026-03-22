import React from 'react';
import Image from 'next/image';
import { getFeaturedArticles, getMajorCategoryInfo, resolveMajorCategorySlug } from '@/lib/data';
import { getArticleDisplayDate, isRankingArticle } from '@/lib/article-utils';
import Link from 'next/link';

export default function ReviewList() {
    const articles = getFeaturedArticles(4);

    return (
        <section className="py-24 bg-white" id="reviews">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between mb-12 border-b border-border-color pb-6">
                    <h2 className="text-2xl md:text-3xl font-black text-primary flex items-center gap-3">
                        <span className="material-symbols-outlined text-accent text-[32px]">article</span>
                        新着レビュー記事
                    </h2>
                    <Link className="text-sm font-bold text-accent hover:text-accent-dark flex items-center gap-1 group" href="/categories">
                        記事一覧 <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">chevron_right</span>
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {articles.map((article) => {
                        const categoryInfo = getMajorCategoryInfo(resolveMajorCategorySlug(article.categoryId || article.category));
                        const linkHref = isRankingArticle(article) ? `/rankings/${article.id}` : `/reviews/${article.id}`;
                        return (
                            <Link key={article.id} className="group cursor-pointer flex flex-col h-full" href={linkHref}>
                                <div className="rounded-2xl overflow-hidden mb-5 relative aspect-[3/2] shadow-sm group-hover:shadow-card-hover transition-all duration-300">
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors z-10"></div>
                                    <Image alt={article.title} className="object-cover transition-transform duration-700 group-hover:scale-105" fill sizes="(max-width: 1024px) 100vw, 25vw" src={article.thumbnail} />
                                    <span className="absolute top-3 left-3 bg-white/90 text-primary px-3 py-1 text-[10px] font-bold rounded-full backdrop-blur-md shadow-sm border border-white z-20">
                                        {categoryInfo ? categoryInfo.label : 'その他'}
                                    </span>
                                </div>
                                <div className="flex flex-col flex-grow">
                                    <h3 className="font-bold text-base leading-snug mb-3 group-hover:text-accent transition-colors text-primary line-clamp-2">{article.title}</h3>
                                    <div className="mt-auto pt-4 border-t border-border-color/50 flex items-center justify-between text-[11px] text-stone-400">
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {getArticleDisplayDate(article)}</span>
                                        <span className="font-bold text-stone-300 group-hover:text-accent transition-colors flex items-center gap-1">Read More <span className="material-symbols-outlined text-[12px]">arrow_forward</span></span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
