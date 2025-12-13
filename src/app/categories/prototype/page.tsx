
import React from 'react';
import Link from 'next/link';
import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';

export default function CategoryPage() {
    return (
        <div className="bg-background-light text-text-main antialiased selection:bg-accent/20 selection:text-primary min-h-screen">
            <Header />

            <main className="pt-20 md:pt-24 min-h-screen">
                <div className="bg-white border-b border-border-color">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
                        <nav aria-label="Breadcrumb" className="flex items-center text-xs font-medium text-text-sub">
                            <Link className="hover:text-accent transition-colors" href="/">ホーム</Link>
                            <span className="material-symbols-outlined text-[14px] mx-2 text-stone-300">chevron_right</span>
                            <span className="text-text-main font-bold">商品カテゴリ一覧</span>
                        </nav>
                    </div>
                </div>
                <section className="bg-white py-12 md:py-16 border-b border-border-color hero-pattern relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-rank-gold/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
                    <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary mb-6 tracking-tight">
                            商品カテゴリから探す
                        </h1>
                        <p className="text-text-sub text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                            生活を豊かにする家電や日用品をカテゴリ別に分類しました。<br className="hidden md:inline" />
                            目的のアイテムを見つけやすく、比較・検討しやすい構成でご紹介します。
                        </p>
                    </div>
                </section>
                <section className="py-16 md:py-24 bg-background-light">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <article className="bg-white rounded-2xl p-6 md:p-8 shadow-card hover:shadow-card-hover border border-border-color transition-all duration-300 group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="size-14 rounded-2xl bg-accent-light flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-[32px]">kitchen</span>
                                    </div>
                                    <span className="text-xs font-bold text-stone-400 bg-surface-subtle px-2.5 py-1 rounded-full">128 Products</span>
                                </div>
                                <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">キッチン家電</h2>
                                <p className="text-xs text-text-sub mb-6 leading-relaxed">
                                    毎日の料理を楽しく、快適に。機能性とデザイン性を兼ね備えた最新キッチン家電。
                                </p>
                                <ul className="space-y-1 mb-6 flex-grow">
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">冷蔵庫・冷凍庫</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">電子レンジ・オーブン</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">炊飯器</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">コーヒーメーカー</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">電気ケトル・ポット</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                </ul>
                                <a className="inline-flex items-center justify-center w-full py-3 rounded-xl border border-border-color bg-white text-sm font-bold text-text-main hover:border-accent hover:text-accent transition-all shadow-sm" href="#">
                                    すべて見る
                                </a>
                            </article>
                            <article className="bg-white rounded-2xl p-6 md:p-8 shadow-card hover:shadow-card-hover border border-border-color transition-all duration-300 group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="size-14 rounded-2xl bg-accent-light flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-[32px]">local_laundry_service</span>
                                    </div>
                                    <span className="text-xs font-bold text-stone-400 bg-surface-subtle px-2.5 py-1 rounded-full">94 Products</span>
                                </div>
                                <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">生活・掃除家電</h2>
                                <p className="text-xs text-text-sub mb-6 leading-relaxed">
                                    家事の負担を減らし、清潔で快適な空間作りをサポートする頼れるパートナー。
                                </p>
                                <ul className="space-y-1 mb-6 flex-grow">
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">洗濯機・乾燥機</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">掃除機・ロボット掃除機</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">アイロン・衣類ケア</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">ミシン</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                </ul>
                                <a className="inline-flex items-center justify-center w-full py-3 rounded-xl border border-border-color bg-white text-sm font-bold text-text-main hover:border-accent hover:text-accent transition-all shadow-sm" href="#">
                                    すべて見る
                                </a>
                            </article>
                            <article className="bg-white rounded-2xl p-6 md:p-8 shadow-card hover:shadow-card-hover border border-border-color transition-all duration-300 group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="size-14 rounded-2xl bg-accent-light flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-[32px]">air</span>
                                    </div>
                                    <span className="text-xs font-bold text-stone-400 bg-surface-subtle px-2.5 py-1 rounded-full">65 Products</span>
                                </div>
                                <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">空調・季節家電</h2>
                                <p className="text-xs text-text-sub mb-6 leading-relaxed">
                                    一年中、心地よい室温と空気環境を。健康管理にも欠かせない空調機器。
                                </p>
                                <ul className="space-y-1 mb-6 flex-grow">
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">エアコン</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">空気清浄機</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">加湿器・除湿機</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">扇風機・サーキュレーター</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                </ul>
                                <a className="inline-flex items-center justify-center w-full py-3 rounded-xl border border-border-color bg-white text-sm font-bold text-text-main hover:border-accent hover:text-accent transition-all shadow-sm" href="#">
                                    すべて見る
                                </a>
                            </article>
                            <article className="bg-white rounded-2xl p-6 md:p-8 shadow-card hover:shadow-card-hover border border-border-color transition-all duration-300 group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="size-14 rounded-2xl bg-accent-light flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-[32px]">devices</span>
                                    </div>
                                    <span className="text-xs font-bold text-stone-400 bg-surface-subtle px-2.5 py-1 rounded-full">210 Products</span>
                                </div>
                                <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">PC・スマホ・周辺機器</h2>
                                <p className="text-xs text-text-sub mb-6 leading-relaxed">
                                    仕事も遊びも、もっと効率的に。最新スペックのデジタルデバイス。
                                </p>
                                <ul className="space-y-1 mb-6 flex-grow">
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">ノートPC・タブレット</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">スマートフォン</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">モニター・ディスプレイ</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">キーボード・マウス</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                </ul>
                                <a className="inline-flex items-center justify-center w-full py-3 rounded-xl border border-border-color bg-white text-sm font-bold text-text-main hover:border-accent hover:text-accent transition-all shadow-sm" href="#">
                                    すべて見る
                                </a>
                            </article>
                            <article className="bg-white rounded-2xl p-6 md:p-8 shadow-card hover:shadow-card-hover border border-border-color transition-all duration-300 group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="size-14 rounded-2xl bg-accent-light flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-[32px]">headphones</span>
                                    </div>
                                    <span className="text-xs font-bold text-stone-400 bg-surface-subtle px-2.5 py-1 rounded-full">154 Products</span>
                                </div>
                                <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">オーディオ・映像</h2>
                                <p className="text-xs text-text-sub mb-6 leading-relaxed">
                                    没入感のあるサウンドと映像美を。エンターテインメントを極めるアイテム。
                                </p>
                                <ul className="space-y-1 mb-6 flex-grow">
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">イヤホン・ヘッドホン</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">スピーカー</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">テレビ・プロジェクター</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">カメラ</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                </ul>
                                <a className="inline-flex items-center justify-center w-full py-3 rounded-xl border border-border-color bg-white text-sm font-bold text-text-main hover:border-accent hover:text-accent transition-all shadow-sm" href="#">
                                    すべて見る
                                </a>
                            </article>
                            <article className="bg-white rounded-2xl p-6 md:p-8 shadow-card hover:shadow-card-hover border border-border-color transition-all duration-300 group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="size-14 rounded-2xl bg-accent-light flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-[32px]">health_and_beauty</span>
                                    </div>
                                    <span className="text-xs font-bold text-stone-400 bg-surface-subtle px-2.5 py-1 rounded-full">82 Products</span>
                                </div>
                                <h2 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">美容・健康家電</h2>
                                <p className="text-xs text-text-sub mb-6 leading-relaxed">
                                    毎日のセルフケアをアップグレード。自分磨きのための高機能アイテム。
                                </p>
                                <ul className="space-y-1 mb-6 flex-grow">
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">ドライヤー・ヘアアイロン</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">シェーバー・ボディケア</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">電動歯ブラシ</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-surface-subtle group/link transition-colors" href="#">
                                            <span className="text-sm font-medium text-text-main group-hover/link:text-primary">マッサージ機</span>
                                            <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all">chevron_right</span>
                                        </a>
                                    </li>
                                </ul>
                                <a className="inline-flex items-center justify-center w-full py-3 rounded-xl border border-border-color bg-white text-sm font-bold text-text-main hover:border-accent hover:text-accent transition-all shadow-sm" href="#">
                                    すべて見る
                                </a>
                            </article>
                        </div>
                    </div>
                </section>
                <section className="py-20 border-t border-border-color bg-white">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-primary flex items-center gap-3">
                                    <span className="w-1.5 h-8 bg-brand-brown rounded-full"></span>
                                    ライフスタイル・シーンから探す
                                </h2>
                                <p className="mt-3 text-text-sub text-sm">あなたの生活スタイルに合わせた最適な製品をご提案します。</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            <a className="group relative rounded-xl overflow-hidden aspect-[4/3] shadow-card hover:shadow-card-hover transition-all cursor-pointer" href="#">
                                <img alt="Living Alone" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1581579438769-cfad61e3d36b?auto=format&fit=crop&q=80&w=600" />
                                <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/30 transition-colors"></div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                    <span className="material-symbols-outlined text-white text-[32px] mb-2 drop-shadow-md">person</span>
                                    <h3 className="text-white font-bold text-lg drop-shadow-md">一人暮らし</h3>
                                    <span className="text-white/80 text-xs mt-1">コスパとコンパクトさを重視</span>
                                </div>
                            </a>
                            <a className="group relative rounded-xl overflow-hidden aspect-[4/3] shadow-card hover:shadow-card-hover transition-all cursor-pointer" href="#">
                                <img alt="Family Life" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=600" />
                                <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/30 transition-colors"></div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                    <span className="material-symbols-outlined text-white text-[32px] mb-2 drop-shadow-md">family_restroom</span>
                                    <h3 className="text-white font-bold text-lg drop-shadow-md">ファミリー</h3>
                                    <span className="text-white/80 text-xs mt-1">時短・大容量・安全機能</span>
                                </div>
                            </a>
                            <a className="group relative rounded-xl overflow-hidden aspect-[4/3] shadow-card hover:shadow-card-hover transition-all cursor-pointer" href="#">
                                <img alt="Remote Work" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&q=80&w=600" />
                                <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/30 transition-colors"></div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                    <span className="material-symbols-outlined text-white text-[32px] mb-2 drop-shadow-md">work</span>
                                    <h3 className="text-white font-bold text-lg drop-shadow-md">テレワーク</h3>
                                    <span className="text-white/80 text-xs mt-1">生産性を上げるデスク環境</span>
                                </div>
                            </a>
                            <a className="group relative rounded-xl overflow-hidden aspect-[4/3] shadow-card hover:shadow-card-hover transition-all cursor-pointer" href="#">
                                <img alt="Pet Life" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600" />
                                <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/30 transition-colors"></div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                    <span className="material-symbols-outlined text-white text-[32px] mb-2 drop-shadow-md">pets</span>
                                    <h3 className="text-white font-bold text-lg drop-shadow-md">ペットとの暮らし</h3>
                                    <span className="text-white/80 text-xs mt-1">ニオイ対策・見守り</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>
                <section className="py-16 bg-surface-subtle border-t border-border-color">
                    <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
                        <span className="material-symbols-outlined text-accent text-[40px] mb-4">verified</span>
                        <h2 className="text-2xl font-bold text-primary mb-4">ChoiceGuideのカテゴリ分類について</h2>
                        <p className="text-sm text-text-sub leading-loose mb-8">
                            当サイトでは、一般的な製品分類だけでなく、実際のユーザーの使用シーンや目的（「静音性重視」「プロ仕様」など）に基づいた独自のタグ付けを行っています。<br />
                            専門家の検証データとユーザーレビューを横断的に分析し、スペック表だけでは見えてこない「本当の使いやすさ」で製品を探せるよう整理しています。
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a className="bg-white border border-border-color px-6 py-3 rounded-full text-sm font-bold text-text-main hover:border-accent hover:text-accent transition-colors shadow-sm" href="#">
                                ランキングの選定基準
                            </a>
                            <a className="bg-white border border-border-color px-6 py-3 rounded-full text-sm font-bold text-text-main hover:border-accent hover:text-accent transition-colors shadow-sm" href="#">
                                編集部・専門家紹介
                            </a>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
