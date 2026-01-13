import React from 'react';
import { getProductById } from '@/lib/data';
import Link from 'next/link';

export default function RankingPreview() {
    // Fetch specific products for the ranking slots to maintain design intent
    // Rank 1: Sony (SonicFlow equivalent)
    const rank1 = getProductById('sony-wf-1000xm5');
    // Rank 2: Apple (AirSound equivalent)
    const rank2 = getProductById('apple-airpods-pro-2');
    // Rank 3: Anker (BudgetBass equivalent)
    const rank3 = getProductById('soundcore-liberty-4');

    if (!rank1 || !rank2 || !rank3) return null;

    return (
        <section className="py-24 bg-background-light relative overflow-hidden" id="ranking">
            <div className="absolute inset-0 bg-[radial-gradient(#E7E5E4_1px,transparent_1px)] bg-[length:32px_32px] opacity-50 pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-white shadow-sm text-accent font-bold text-xs mb-5 uppercase tracking-wider border border-accent/20">
                        Monthly Feature
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-primary mb-4 tracking-tight">
                        今、最も「買い」な完全ワイヤレスイヤホン
                    </h2>
                    <p className="text-text-sub max-w-2xl mx-auto text-sm leading-relaxed font-medium">
                        2025年最新モデルの価格、性能、使い勝手を徹底比較。<br className="hidden md:inline" />
                        数ある製品の中から、自信を持っておすすめできるTOP3を選出しました。
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative max-w-6xl mx-auto">
                    {/* Rank 2 Card (Left) */}
                    <article className="bg-white rounded-3xl p-6 shadow-soft border border-white hover:border-border-color transition-all duration-300 lg:mt-12 order-2 lg:order-1 h-full flex flex-col relative z-0 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center size-10 bg-surface-subtle rounded-full text-rank-silver font-black text-xl font-sans shadow-inner">2</div>
                                <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Excellent</span>
                            </div>
                            <span className="text-[10px] font-bold text-text-sub bg-surface-subtle px-2.5 py-1 rounded-full border border-border-color">iPhoneに最適</span>
                        </div>
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-surface-subtle border border-border-color relative">
                            <img alt={rank2.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={rank2.image} />
                        </div>
                        <h3 className="text-lg font-bold text-primary mb-2 line-clamp-1">{rank2.name}</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex text-rank-gold text-sm gap-0.5">
                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                            </div>
                            <span className="text-sm font-bold text-primary">{rank2.rating}</span>
                        </div>
                        <div className="space-y-2 mb-6 text-xs text-text-sub flex-grow">
                            <p className="leading-relaxed font-medium line-clamp-3">{rank2.description}</p>
                        </div>
                        <Link className="block w-full py-3 rounded-xl border border-border-color bg-white text-center font-bold text-sm text-text-main hover:bg-surface-subtle transition-colors" href={`/reviews/${rank2.id}`}>詳細レビュー</Link>
                    </article>

                    {/* Rank 1 Card (Center, Featured) */}
                    <article className="relative bg-white rounded-3xl p-8 shadow-card-hover border border-accent/20 flex flex-col h-full order-1 lg:order-2 z-10 ring-4 ring-accent/5 group">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-accent text-white px-6 py-1.5 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 ring-4 ring-background-light">
                            <span className="material-symbols-outlined text-[18px]">trophy</span>
                            総合 No.1
                        </div>
                        <div className="mt-4 flex items-center justify-between mb-6">
                            <span className="bg-brand-brown/10 text-brand-brown text-[11px] font-bold px-2.5 py-1 rounded-full border border-brand-brown/20">編集部イチオシ</span>
                            <span className="text-xs text-stone-400 font-medium">更新: 2025.01.20</span>
                        </div>
                        <div className="aspect-video rounded-2xl overflow-hidden mb-6 bg-surface-subtle border border-border-color relative">
                            <img alt={rank1.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={rank1.image} />
                        </div>
                        <h3 className="text-2xl font-black text-primary mb-2 leading-tight">{rank1.name}</h3>
                        <p className="text-sm text-text-sub mb-6 leading-relaxed font-medium line-clamp-3">
                            {rank1.description}
                        </p>
                        <div className="bg-surface-subtle rounded-2xl p-5 mb-6 border border-border-color/60">
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Score</span>
                                <span className="text-3xl font-black text-primary leading-none">{rank1.rating}</span>
                            </div>
                            <div className="flex text-rank-gold gap-0.5 mb-4">
                                <span className="material-symbols-outlined filled text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined filled text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined filled text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined filled text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined filled text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            </div>
                            <ul className="text-xs space-y-2 text-text-main font-bold">
                                {rank1.pros?.slice(0, 2).map((pro, i) => (
                                    <li key={i} className="flex items-center gap-2"><span className="size-1.5 bg-accent rounded-full"></span> {pro}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-auto grid gap-3">
                            <Link className="w-full py-4 rounded-xl bg-primary hover:bg-accent text-white text-center font-bold shadow-lg shadow-primary/20 hover:shadow-accent/30 transition-all flex items-center justify-center gap-2" href={`/reviews/${rank1.id}`}>
                                ガチ検証レビューを見る <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </Link>
                        </div>
                    </article>

                    {/* Rank 3 Card (Right) */}
                    <article className="bg-white rounded-3xl p-6 shadow-soft border border-white hover:border-border-color transition-all duration-300 lg:mt-12 order-3 lg:order-3 h-full flex flex-col relative z-0 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center size-10 bg-surface-subtle rounded-full text-rank-bronze font-black text-xl font-sans shadow-inner">3</div>
                                <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Good Value</span>
                            </div>
                            <span className="text-[10px] font-bold text-text-sub bg-surface-subtle px-2.5 py-1 rounded-full border border-border-color">コスパ最強</span>
                        </div>
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-surface-subtle border border-border-color relative">
                            <img alt={rank3.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={rank3.image} />
                        </div>
                        <h3 className="text-lg font-bold text-primary mb-2 line-clamp-1">{rank3.name}</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex text-rank-gold text-sm gap-0.5">
                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-stone-300 text-[18px]">star_half</span>
                            </div>
                            <span className="text-sm font-bold text-primary">{rank3.rating}</span>
                        </div>
                        <div className="space-y-2 mb-6 text-xs text-text-sub flex-grow">
                            <p className="leading-relaxed font-medium line-clamp-3">{rank3.description}</p>
                        </div>
                        <Link className="block w-full py-3 rounded-xl border border-border-color bg-white text-center font-bold text-sm text-text-main hover:bg-surface-subtle transition-colors" href={`/reviews/${rank3.id}`}>詳細レビュー</Link>
                    </article>
                </div>
                <div className="mt-16 text-center">
                    <Link className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white border border-border-color text-text-main font-bold hover:bg-surface-subtle hover:shadow-md transition-all text-sm" href="/categories/audio">
                        他のランキングも見る <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
