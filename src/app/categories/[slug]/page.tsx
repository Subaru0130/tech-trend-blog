import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';
import { getMajorCategoryInfo, CATEGORY_MAP } from '@/lib/data';
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
        title: `${categoryInfo.label} カテゴリ一覧 | ChoiceGuide`,
        description: `ChoiceGuideの${categoryInfo.label}カテゴリ一覧ページ。`,
    };
}

export default function CategoryHubPage({ params }: { params: { slug: string } }) {
    const slug = params.slug;
    const categoryInfo = getMajorCategoryInfo(slug);

    if (!categoryInfo) {
        notFound();
    }

    return (
        <div className="bg-background-light text-text-main antialiased selection:bg-accent/20 selection:text-primary min-h-screen">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="pt-24 pb-12 md:pt-32 md:pb-20 px-4 bg-white border-b border-border-color">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center size-16 bg-surface-subtle rounded-3xl mb-6 text-accent shadow-sm">
                            <span className="material-symbols-outlined text-[32px]">{categoryInfo.icon}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-primary mb-4 tracking-tight">
                            {categoryInfo.label}
                        </h1>
                        <p className="text-text-main font-medium max-w-xl mx-auto">
                            失敗しない「モノ選び」をサポート。<br />
                            ジャンルを選択して、プロが厳選したおすすめランキングをご覧ください。
                        </p>
                    </div>
                </section>

                {/* Sub-Category Grid */}
                <section className="py-16 md:py-24 px-4">
                    <div className="max-w-5xl mx-auto px-4 md:px-8">
                        <h2 className="text-xl font-bold text-primary mb-8 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-accent rounded-full"></span>
                            ジャンルから探す
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoryInfo.subCategories.map((sub, idx) => (
                                <Link
                                    key={idx}
                                    href={`/rankings/${sub.slug}`}
                                    className="group bg-white rounded-3xl p-6 shadow-soft border border-border-color hover:border-accent/30 hover:shadow-card-hover transition-all duration-300 flex items-center gap-5"
                                >
                                    <div className="size-16 rounded-2xl bg-surface-subtle group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                                        <span className="material-symbols-outlined text-[32px] text-stone-400 group-hover:text-accent transition-colors">
                                            {sub.icon}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-primary mb-1 group-hover:text-accent transition-colors">
                                            {sub.label}
                                        </h3>
                                        <div className="flex items-center gap-1 text-xs font-bold text-stone-400 group-hover:text-accent/80">
                                            <span>ランキングを見る</span>
                                            <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
