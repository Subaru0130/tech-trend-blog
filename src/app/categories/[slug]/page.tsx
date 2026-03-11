
import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';
import CategoryContent from '@/components/categories/CategoryContent';
import { getMajorCategoryInfo, CATEGORY_MAP, getArticlesByCategory } from '@/lib/data';
import { Metadata } from 'next';

export async function generateStaticParams() {
    return Object.keys(CATEGORY_MAP).map((slug) => ({
        slug: slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const categoryInfo = getMajorCategoryInfo(slug);
    if (!categoryInfo) return { title: 'カテゴリが見つかりません' };

    return {
        title: categoryInfo.label + ' 記事一覧',
        description: 'ChoiceGuideの' + categoryInfo.label + 'に関する記事一覧ページ。最新のランキングやレビューをチェック。',
    };
}

export default async function CategoryHubPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const categoryInfo = getMajorCategoryInfo(slug);

    if (!categoryInfo) {
        notFound();
    }

    // Get dynamic articles (rankings) for this category
    const articles = getArticlesByCategory(slug);

    return (
        <div className="bg-[#FAFAF9] text-text-sub antialiased min-h-screen flex flex-col font-sans">
            <Header />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-stone-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs font-medium text-stone-500 flex items-center">
                    <Link href="/" className="hover:text-primary hover:underline transition-colors">ホーム</Link>
                    <span className="material-symbols-outlined text-[10px] mx-2 text-stone-300">chevron_right</span>
                    <Link href="/categories" className="hover:text-primary hover:underline transition-colors">カテゴリ一覧</Link>
                    <span className="material-symbols-outlined text-[10px] mx-2 text-stone-300">chevron_right</span>
                    <span className="text-text-main font-bold">{categoryInfo.label}</span>
                </div>
            </div>

            <div className="flex-grow">
                <Suspense fallback={<div className="p-8 text-center text-stone-400">Loading...</div>}>
                    <CategoryContent categoryInfo={{ ...categoryInfo, slug }} initialArticles={articles} />
                </Suspense>
            </div>

            <Footer />
        </div>
    );
}
