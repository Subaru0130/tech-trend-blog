import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';
import RankingCard from '@/components/rankings/RankingCard';
import ComparisonTable from '@/components/rankings/ComparisonTable';
import { getProductsBySubCategory, CATEGORY_MAP } from '@/lib/data';
import { Metadata } from 'next';

// Generate static params for all known subcategories
export async function generateStaticParams() {
    const params: { slug: string }[] = [];
    Object.values(CATEGORY_MAP).forEach(major => {
        major.subCategories.forEach(sub => {
            params.push({ slug: sub.slug });
        });
    });
    return params;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    // Find the subcategory info
    let subCategoryInfo = null;
    for (const major of Object.values(CATEGORY_MAP)) {
        const found = major.subCategories.find(s => s.slug === params.slug);
        if (found) {
            subCategoryInfo = found;
            break;
        }
    }

    if (!subCategoryInfo) return { title: 'ランキングが見つかりません' };

    return {
        title: `${subCategoryInfo.label} おすすめランキング | ChoiceGuide`,
        description: `プロが厳選した${subCategoryInfo.label}のおすすめランキング決定版。徹底比較で失敗しない選び方をサポートします。`,
    };
}

export default function DynamicRankingPage({ params }: { params: { slug: string } }) {
    const slug = params.slug;
    const rankingProducts = getProductsBySubCategory(slug);

    if (!rankingProducts || rankingProducts.length === 0) {
        notFound();
    }

    // Resolve Category Info (Label, etc.)
    let subCategoryInfo = null;
    for (const major of Object.values(CATEGORY_MAP)) {
        const found = major.subCategories.find(s => s.slug === slug);
        if (found) {
            subCategoryInfo = found;
            break;
        }
    }

    const title = subCategoryInfo ? subCategoryInfo.label : 'おすすめランキング';

    return (
        <div className="bg-background-light text-text-main antialiased selection:bg-accent/20 selection:text-primary min-h-screen">
            <Header />

            <main>
                {/* Page Header */}
                <section className="pt-24 pb-12 md:pt-32 md:pb-16 px-4 relative overflow-hidden bg-gradient-to-b from-accent/5 via-white to-white border-b border-border-color">
                    <div className="max-w-4xl mx-auto relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 bg-white border border-accent/20 px-4 py-1.5 rounded-full shadow-sm mb-6">
                            <span className="relative flex size-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full size-2 bg-accent"></span>
                            </span>
                            <span className="text-xs font-bold text-accent tracking-wide">2024.03 更新</span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-primary mb-6 tracking-tight leading-tight">
                            <span className="block text-xl md:text-3xl text-text-sub font-bold mb-3">失敗しない「正解」を選ぶ</span>
                            {title}<br className="hidden md:block" />
                            <span className="text-accent">おすすめランキング</span>
                        </h1>

                        <p className="text-text-main text-sm md:text-base font-medium max-w-2xl mx-auto leading-loose mb-10">
                            「種類が多すぎて選べない...」そんな悩み、プロが解決します。<br className="hidden sm:block" />
                            価格・性能・使い勝手など、<span className="font-bold underline decoration-accent/30 decoration-4 underline-offset-4">徹底比較</span>してわかった、<br className="hidden sm:block" />
                            今、本当に買うべき「間違いのない製品」をご紹介します。
                        </p>
                    </div>
                </section>

                {/* Breadcrumb (Simple) */}
                <div className="bg-white border-b border-border-color">
                    <div className="max-w-4xl mx-auto px-4 py-3">
                        <nav className="flex items-center gap-2 text-xs font-bold text-stone-500 overflow-x-auto whitespace-nowrap">
                            <Link href="/" className="hover:text-accent transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">home</span>
                                ホーム
                            </Link>
                            <span className="material-symbols-outlined text-[12px] text-stone-300">chevron_right</span>
                            <span className="text-text-main">{title}</span>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-4 py-12">

                    {/* Ranking Criteria */}
                    <div className="bg-white rounded-2xl border border-border-color p-6 md:p-8 mb-12 shadow-sm">
                        <h2 className="text-lg font-black text-primary mb-6 flex items-center gap-2">
                            <span className="bg-accent text-white size-8 rounded flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-[20px]">fact_check</span>
                            </span>
                            ランキングの選定基準
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: '性能検証', desc: '数値スペックだけでなく、実際の使用環境でのパフォーマンスを重視。' },
                                { title: '使い勝手', desc: '操作性、メンテナンス性、アプリの完成度などを徹底チェック。' },
                                { title: 'コスパ', desc: '価格以上の価値があるか？長く使える耐久性はあるか？を厳しく審査。' }
                            ].map((c, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 font-bold text-primary text-sm">
                                        <span className="material-symbols-outlined text-accent text-[20px]">check_circle</span>
                                        {c.title}
                                    </div>
                                    <p className="text-xs text-text-sub font-medium leading-relaxed pl-7">{c.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <ComparisonTable products={rankingProducts} />

                    <div className="mb-8 flex items-center justify-between mt-12">
                        <h2 className="text-xl font-black text-primary flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-accent rounded-full"></span>
                            おすすめランキング TOP{rankingProducts.length}
                        </h2>
                        <div className="text-xs text-stone-500 font-bold bg-white px-3 py-1.5 rounded-lg border border-border-color flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">sort</span>
                            並び替え: <span className="text-primary">おすすめ順</span>
                        </div>
                    </div>

                    <div className="space-y-8 md:space-y-12">
                        {/* Ranking Cards */}
                        {rankingProducts.map((product) => (
                            <RankingCard key={product.id} product={product} />
                        ))}
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
