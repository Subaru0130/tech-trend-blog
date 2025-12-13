import React from 'react';
import Link from 'next/link';
import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';
import RankingCard from '@/components/rankings/RankingCard';
import ComparisonTable from '@/components/rankings/ComparisonTable';
import { getRankingProducts } from '@/lib/data';

export default function RankingPage() {
    const rankingProducts = getRankingProducts();

    return (
        <div className="bg-background-light text-text-main antialiased selection:bg-accent/20 selection:text-primary min-h-screen">
            <Header />

            <main>
                {/* Page Header (Redesigned for CRO & SEO) */}
                <section className="pt-24 pb-12 md:pt-32 md:pb-16 px-4 relative overflow-hidden bg-gradient-to-b from-accent/5 via-white to-white border-b border-border-color">
                    {/* Background Decoration */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>
                    <div className="absolute -top-40 -right-40 size-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute top-20 -left-20 size-72 bg-rank-gold/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="max-w-4xl mx-auto relative z-10 text-center">
                        {/* Trust Signal / Update Date */}
                        <div className="inline-flex items-center gap-2 bg-white border border-accent/20 px-4 py-1.5 rounded-full shadow-sm mb-6">
                            <span className="relative flex size-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full size-2 bg-accent"></span>
                            </span>
                            <span className="text-xs font-bold text-accent tracking-wide">2024.03.15 更新</span>
                        </div>

                        {/* H1: Consumer-Focused Copy */}
                        <h1 className="text-3xl md:text-5xl font-black text-primary mb-6 tracking-tight leading-tight">
                            <span className="block text-xl md:text-3xl text-text-sub font-bold mb-3">失敗しない「正解」を選ぶ</span>
                            完全ワイヤレスイヤホン<br className="hidden md:block" />
                            <span className="text-accent">おすすめランキング</span>
                        </h1>

                        {/* Lead Text: Empathy & Authority */}
                        <p className="text-text-main text-sm md:text-base font-medium max-w-2xl mx-auto leading-loose mb-10">
                            「種類が多すぎて選べない...」そんな悩み、プロが解決します。<br className="hidden sm:block" />
                            音質・ノイキャン・装着感など、<span className="font-bold underline decoration-accent/30 decoration-4 underline-offset-4">30製品以上を徹底比較</span>してわかった、<br className="hidden sm:block" />
                            今、本当に買うべき「間違いのない一台」をご紹介します。
                        </p>

                        {/* Search Bar: Action-Oriented */}
                        <div className="max-w-xl mx-auto relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-rank-gold/20 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <input
                                type="text"
                                placeholder="気になるキーワードを入力（例: ノイズキャンセリング）"
                                className="w-full relative bg-white border border-border-color rounded-full py-4 pl-14 pr-4 text-text-main placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-bold text-sm shadow-sm"
                            />
                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-accent">search</span>
                        </div>
                    </div>
                </section>

                {/* Breadcrumb */}
                <div className="bg-white border-b border-border-color">
                    <div className="max-w-4xl mx-auto px-4 py-3">
                        <nav className="flex items-center gap-2 text-xs font-bold text-stone-500 overflow-x-auto whitespace-nowrap">
                            <a href="/" className="hover:text-accent transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">home</span>
                                ホーム
                            </a>
                            <span className="material-symbols-outlined text-[12px] text-stone-300">chevron_right</span>
                            <a href="#" className="hover:text-accent transition-colors">オーディオ</a>
                            <span className="material-symbols-outlined text-[12px] text-stone-300">chevron_right</span>
                            <span className="text-text-main">完全ワイヤレスイヤホン</span>
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
                                { title: '音質の良さ', desc: '原音の再現性、解像度、バランスを専門家が聴き比べ評価。' },
                                { title: '機能性', desc: 'NC性能、外音取り込み、アプリの使い勝手を徹底検証。' },
                                { title: 'コスパ', desc: '価格に対する性能の高さ、満足度を厳しくジャッジ。' }
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
                        <div className="mt-6 pt-6 border-t border-border-color">
                            <div className="flex items-start gap-3 bg-surface-subtle p-4 rounded-xl border border-border-color">
                                <span className="material-symbols-outlined text-stone-400 mt-0.5">info</span>
                                <div className="text-xs text-text-sub leading-relaxed">
                                    <span className="font-bold text-primary block mb-1">検証環境について</span>
                                    ランキング作成にあたり、防音室での測定機器によるテストに加え、5名の編集部員による実生活での使用テスト（通勤、カフェ、自宅）を実施しています。
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <ComparisonTable products={rankingProducts} />

                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-xl font-black text-primary flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-accent rounded-full"></span>
                            おすすめランキング TOP10
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

                    <div className="mt-12 text-center">
                        <button className="bg-white border border-border-color text-primary font-bold py-3 px-8 rounded-full hover:bg-surface-subtle transition-all shadow-sm hover:shadow-md flex items-center gap-2 mx-auto text-sm">
                            <span>ランキングの続きを見る（4位〜15位）</span>
                            <span className="material-symbols-outlined text-[18px]">expand_more</span>
                        </button>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
