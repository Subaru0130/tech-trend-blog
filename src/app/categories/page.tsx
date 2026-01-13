import React from 'react';
import Link from 'next/link';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { CATEGORY_MAP } from '@/lib/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'カテゴリ一覧 | BestChoice',
    description: 'BestChoiceのカテゴリ一覧ページ。オーディオ、家電、ガジェットなど、興味のあるジャンルから記事を探せます。',
};

export default function CategoriesPage() {
    const categories = Object.entries(CATEGORY_MAP).map(([slug, info]) => ({
        slug,
        ...info
    }));

    return (
        <div className="bg-background-light text-text-main antialiased min-h-screen flex flex-col font-sans">
            <Header />

            <main className="flex-grow pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-primary flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-accent text-[36px] md:text-[42px]">category</span>
                        カテゴリ一覧
                    </h1>
                    <p className="text-text-sub text-sm md:text-base">
                        興味のあるジャンルから、最新のレビューやランキングを探してみましょう。
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <Link key={category.slug} href={`/categories/${category.slug}`} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-accent/20 flex items-start gap-4">
                            <div className="size-14 rounded-xl bg-surface-subtle group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-3xl text-stone-400 group-hover:text-accent transition-colors">
                                    {category.slug === 'audio' ? 'headphones' :
                                        category.slug === 'home-appliances' ? 'vacuum' :
                                            category.slug === 'gadgets' ? 'devices' :
                                                category.slug === 'beauty-health' ? 'face' : 'category'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                                    {category.label}
                                </h2>
                                <p className="text-xs text-text-sub mb-3 line-clamp-2">
                                    {`${category.label}に関する最新記事、レビュー、ランキングをご覧いただけます。`}
                                </p>
                                <div className="text-xs font-bold text-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    記事を見る <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
