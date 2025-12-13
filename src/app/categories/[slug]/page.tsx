
import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';
import { getMajorCategoryInfo, CATEGORY_MAP, getProductsBySubCategory } from '@/lib/data';
import { Metadata } from 'next';

export async function generateStaticParams() {
    return Object.keys(CATEGORY_MAP).map((slug) => ({
        slug: slug,
    }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const categoryInfo = getMajorCategoryInfo(params.slug);
    if (!categoryInfo) return { title: 'カテゴリが見つかりません' };

    return {
        title: `${categoryInfo.label} 記事一覧 | ChoiceGuide`,
        description: `ChoiceGuideの${categoryInfo.label}に関する記事一覧ページ。最新のランキングやレビューをチェック。`,
    };
}

export default function CategoryHubPage({ params }: { params: { slug: string } }) {
    const slug = params.slug;
    const categoryInfo = getMajorCategoryInfo(slug);

    if (!categoryInfo) {
        notFound();
    }

    // Helper to get a random product image for the thumbnail
    const getThumbnailForSubCategory = (subSlug: string) => {
        const products = getProductsBySubCategory(subSlug);
        if (products && products.length > 0) {
            return products[0].image;
        }
        return '/images/placeholder.jpg'; // Fallback
    };

    return (
        <div className="bg-[#FAFAF9] text-text-body antialiased selection:bg-accent/20 selection:text-primary min-h-screen flex flex-col font-sans">
            <Header />

            {/* Breadcrumb - Simplified from Design 8 */}
            <div className="bg-white border-b border-stone-100 mt-16 md:mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs font-medium text-stone-500 flex items-center">
                    <Link href="/" className="hover:text-primary hover:underline transition-colors">ホーム</Link>
                    <span className="material-symbols-outlined text-[10px] mx-2 text-stone-300">chevron_right</span>
                    <span className="text-text-heading font-bold">{categoryInfo.label}</span>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-white border-b border-stone-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e7e5e4_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="inline-flex items-center justify-center size-12 rounded-xl bg-primary-light text-primary shadow-sm">
                                    <span className="material-symbols-outlined text-2xl">{categoryInfo.icon}</span>
                                </span>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-text-heading tracking-tight">{categoryInfo.label}</h1>
                            </div>
                            <p className="text-stone-500 text-sm md:text-base leading-relaxed">
                                {categoryInfo.label}に関する比較・レビュー記事一覧です。<br className="hidden sm:inline" />
                                プロが厳選した最新の人気ランキングや、失敗しない選び方のポイントを随時更新しています。
                            </p>
                        </div>
                        {/* Search Box - Visual Only for now */}
                        <div className="w-full md:w-80 shrink-0">
                            <div className="relative group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 group-focus-within:text-primary transition-colors">search</span>
                                <input className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none placeholder:text-stone-400 shadow-sm" placeholder="記事を検索..." type="text" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">

                    {/* Main Feed */}
                    <main className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                            <div className="text-sm font-bold text-text-heading flex items-baseline gap-1">
                                <span className="text-xl text-primary font-black">{categoryInfo.subCategories.length}</span>
                                <span className="text-stone-400 text-xs">件の記事</span>
                            </div>
                            {/* Sort - Visual Only */}
                            <div className="flex items-center gap-3">
                                <select className="form-select text-xs font-bold bg-transparent border-none py-1 pr-8 pl-2 text-text-heading focus:ring-0 cursor-pointer hover:bg-stone-50 rounded-lg transition-colors">
                                    <option>おすすめ順</option>
                                    <option>新着順</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Map SubCategories to "Articles" */}
                            {categoryInfo.subCategories.map((sub, idx) => {
                                const thumbnail = getThumbnailForSubCategory(sub.slug);
                                const date = "2024.03.15"; // Mock date for now

                                return (
                                    <article key={idx} className="group flex flex-col md:flex-row bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-card-hover hover:border-primary/20 transition-all duration-300">
                                        <Link href={`/rankings/${sub.slug}`} className="block md:w-2/5 aspect-video md:aspect-auto overflow-hidden relative">
                                            <img alt={sub.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={thumbnail} />
                                            <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur text-primary text-[10px] font-bold rounded-full shadow-sm border border-primary/10">
                                                {categoryInfo.label}
                                            </span>
                                        </Link>
                                        <div className="p-6 md:w-3/5 flex flex-col justify-center">
                                            <div className="flex items-center gap-3 mb-2 text-xs text-stone-400">
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {date}</span>
                                                <span className="flex items-center gap-1 text-accent font-bold"><span className="material-symbols-outlined text-[14px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span> 注目</span>
                                            </div>
                                            <h2 className="text-lg md:text-xl font-bold text-text-heading mb-3 leading-snug group-hover:text-primary transition-colors">
                                                <Link href={`/rankings/${sub.slug}`}>
                                                    【2024年最新】{sub.label}のおすすめランキングTOP5！プロが徹底比較
                                                </Link>
                                            </h2>
                                            <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed mb-4">
                                                最新の{sub.label}を徹底検証。価格、性能、使い勝手など、失敗しない選び方のポイントを解説します。あなたにぴったりの一台が見つかります。
                                            </p>
                                            <div className="mt-auto flex items-center gap-2 flex-wrap">
                                                <span className="px-2 py-1 bg-stone-50 text-stone-500 text-[10px] font-medium rounded border border-stone-100">#ランキング</span>
                                                <span className="px-2 py-1 bg-stone-50 text-stone-500 text-[10px] font-medium rounded border border-stone-100">#{sub.label}</span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </main>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-8">
                        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-soft sticky top-24">
                            <h3 className="font-bold text-text-heading mb-4 flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-primary">category</span>
                                詳細カテゴリ
                            </h3>
                            <div className="flex flex-col gap-1">
                                {categoryInfo.subCategories.map((sub, idx) => (
                                    <Link key={idx} href={`/rankings/${sub.slug}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-primary-light/50 group transition-colors">
                                        <span className="text-sm text-stone-600 group-hover:text-primary font-medium">{sub.label}</span>
                                        <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full group-hover:bg-white text-[10px]"><span className="material-symbols-outlined text-[12px] align-middle">arrow_forward</span></span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Popular Keywords (Mock) */}
                        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-soft">
                            <h3 className="font-bold text-text-heading mb-4 flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-stone-400">label</span>
                                注目のキーワード
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['コスパ', '省エネ', 'デザイン', '一人暮らし', '時短'].map((tag, i) => (
                                    <span key={i} className="px-2.5 py-1 text-xs font-medium bg-stone-50 text-stone-600 rounded-md border border-stone-100 hover:border-primary hover:text-primary transition-colors cursor-pointer">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </aside>

                </div>
            </div>

            <Footer />
        </div>
    );
}
