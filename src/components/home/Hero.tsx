import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden hero-pattern">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-background-light pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                    <div className="flex-1 text-center lg:text-left max-w-3xl mx-auto lg:mx-0">
                        <h1
                            className="text-4xl md:text-5xl lg:text-6xl font-black text-primary leading-[1.15] tracking-tight mb-6 text-balance animate-fade-in-up"
                            style={{ animationDelay: '0.1s' }}
                        >
                            迷わない
                            <br className="md:hidden" />
                            <span className="relative inline-block text-accent px-1">
                                家電・ガジェット選び
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent/20" preserveAspectRatio="none" viewBox="0 0 100 10">
                                    <path d="M0 5 Q 50 12 100 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="8"></path>
                                </svg>
                            </span>
                            を、
                            <br />
                            あなたの暮らしに。
                        </h1>

                        <p
                            className="text-base md:text-lg text-text-sub mb-10 leading-relaxed font-medium animate-fade-in-up max-w-xl mx-auto lg:mx-0"
                            style={{ animationDelay: '0.2s' }}
                        >
                            比較しやすいスペック整理と、生活シーンに合わせたレビューをもとに、
                            <br className="hidden lg:inline" />
                            毎日使いやすい一台を選びやすくまとめています。
                        </p>

                        <div
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up"
                            style={{ animationDelay: '0.3s' }}
                        >
                            <Link
                                className="group bg-primary hover:bg-accent text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 min-w-[220px]"
                                href="/categories/audio"
                            >
                                <span>人気のランキングを見る</span>
                                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>
                            <Link
                                className="bg-white border border-border-color text-text-main font-bold py-4 px-8 rounded-full hover:bg-surface-subtle transition-all min-w-[220px] shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                href="/categories"
                            >
                                <span className="material-symbols-outlined text-[20px] text-stone-400">category</span>
                                <span>カテゴリから探す</span>
                            </Link>
                        </div>

                        <div
                            className="mt-12 pt-8 border-t border-border-color flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 animate-fade-in-up"
                            style={{ animationDelay: '0.4s' }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px] text-accent">check_circle</span>
                                <span className="text-sm font-bold text-text-sub">比較しやすいスペック整理</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px] text-accent">check_circle</span>
                                <span className="text-sm font-bold text-text-sub">生活シーン別のレビュー</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-[500px] lg:max-w-none relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <div className="relative z-10 perspective-1000">
                            <div className="bg-white rounded-[2rem] p-3 md:p-4 shadow-float border border-white ring-1 ring-stone-100 transform transition-transform duration-500 hover:rotate-1">
                                <Link href="/rankings/wireless-earphones" className="block aspect-[5/4] rounded-[1.5rem] overflow-hidden relative group bg-surface-subtle">
                                    <Image
                                        alt="人気のワイヤレスイヤホン比較"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        fill
                                        loading="eager"
                                        sizes="(max-width: 1024px) 100vw, 40vw"
                                        src="/images/articles/wireless-earphones.jpg"
                                    />
                                    <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
                                        <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-2xl p-5 border border-white/50 ring-1 ring-black/5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Best Buy</span>
                                                        <span className="text-xs font-bold text-stone-500">イヤホン</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-primary line-clamp-1">人気ワイヤレスイヤホン比較</h3>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="flex text-rank-gold gap-0.5">
                                                        <span className="material-symbols-outlined text-[16px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                        <span className="material-symbols-outlined text-[16px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                        <span className="material-symbols-outlined text-[16px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                        <span className="material-symbols-outlined text-[16px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                        <span className="material-symbols-outlined text-[16px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                    </div>
                                                    <span className="text-[10px] text-stone-400 font-medium">4.9 / 5.0</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-xs text-text-sub">
                                                    <span className="material-symbols-outlined text-[14px] text-accent">check</span>
                                                    <span>予算に合わせたモデルを比較しやすい</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-text-sub">
                                                    <span className="material-symbols-outlined text-[14px] text-accent">check</span>
                                                    <span>通勤や運動などの使い方別に選びやすい</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-dashed border-stone-200">
                                                <div>
                                                    <span className="text-xs font-bold text-stone-400">価格帯</span>
                                                    <div className="text-lg font-black text-primary">¥5,000<span className="text-xs font-normal text-stone-500 ml-1">〜</span></div>
                                                </div>
                                                <div className="bg-primary hover:bg-accent text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                                                    記事を読む <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 opacity-40 -z-10 animate-pulse" style={{ backgroundImage: 'radial-gradient(#5E8C6A 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl -z-10"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
