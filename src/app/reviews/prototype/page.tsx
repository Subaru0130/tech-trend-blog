
import React from 'react';
import Link from 'next/link';
import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';
import ProductSpec, { SpecItem } from '@/components/reviews/ProductSpec';

export default function ReviewPage() {
    const specs: SpecItem[] = [
        { label: '稼働時間', value: '最大100分（標準モード）', icon: 'battery_full' },
        { label: '充電時間', value: '約3時間', icon: 'schedule' },
        { label: 'サイズ', value: '350 x 350 x 96 mm', icon: 'straighten' },
        { label: '重量', value: '3.5 kg', icon: 'weight' },
        { label: 'ダストボックス', value: '450 ml', icon: 'delete_outline' },
        { label: '乗り越え段差', value: '最大2cm', icon: 'vertical_align_top' },
        { label: 'マッピング', value: 'LiDARセンサー搭載', icon: 'map' },
        { label: 'アプリ対応', value: 'iOS / Android', icon: 'smartphone' }
    ];

    return (
        <div className="bg-background-light text-text-main antialiased selection:bg-accent/20 selection:text-primary min-h-screen">
            <Header />

            <main>
                {/* Page Header */}
                <div className="bg-primary text-white pt-24 pb-8 md:pt-32 md:pb-12 px-4 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 opacity-10">
                        <span className="material-symbols-outlined text-[300px]">rate_review</span>
                    </div>
                    <div className="max-w-4xl mx-auto relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm font-bold text-stone-300 mb-4">
                            <span className="bg-accent/20 text-accent border border-accent/30 px-3 py-0.5 rounded-full backdrop-blur-md">ロボット掃除機</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> 2024.03.15 更新</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">person</span> 編集部レビュー</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black mb-4 tracking-tight leading-tight">
                            SmartClean X1 Pro 実機レビュー: <br className="hidden md:inline" />
                            「静音」と「吸引力」を両立した新定番モデル
                        </h1>
                    </div>
                </div>

                {/* Breadcrumb */}
                <div className="bg-white border-b border-border-color">
                    <div className="max-w-4xl mx-auto px-4 py-3">
                        <nav className="flex items-center gap-2 text-xs font-bold text-stone-500 overflow-x-auto whitespace-nowrap">
                            <Link href="/" className="hover:text-accent transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">home</span>
                                ホーム
                            </Link>
                            <span className="material-symbols-outlined text-[12px] text-stone-300">chevron_right</span>
                            <Link href="#" className="hover:text-accent transition-colors">生活家電</Link>
                            <span className="material-symbols-outlined text-[12px] text-stone-300">chevron_right</span>
                            <span className="text-text-main">SmartClean X1 Pro</span>
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="max-w-4xl mx-auto px-4 py-12">

                    {/* Intro Section */}
                    <div className="flex flex-col md:flex-row gap-8 mb-12">
                        <div className="md:w-1/2">
                            <div className="aspect-square rounded-2xl overflow-hidden border border-border-color bg-white relative">
                                <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800" alt="SmartClean X1 Pro main" className="w-full h-full object-cover" />
                                <div className="absolute top-4 left-4 bg-rank-gold text-white font-black px-4 py-1 rounded-full shadow-lg text-sm border border-white/20">
                                    Total 4.8
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 mt-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="aspect-square rounded-lg overflow-hidden border border-border-color bg-surface-subtle cursor-pointer hover:ring-2 hover:ring-accent transition-all">
                                        <img src={`https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=200`} alt="gallery" className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="md:w-1/2 flex flex-col justify-center">
                            <h2 className="text-2xl font-bold text-primary mb-4">
                                忙しい共働き家庭に。<br />
                                夜でも使える「静かさ」が武器。
                            </h2>
                            <p className="text-text-sub text-sm leading-relaxed mb-6 font-medium">
                                SmartClean X1 Proは、従来のロボット掃除機の悩みだった「騒音」を劇的に改善。
                                吸引力を維持しながら、図書館レベルの静けさを実現しました。
                                帰宅後のリラックスタイムでも邪魔をしません。
                            </p>

                            <div className="bg-surface-subtle rounded-xl p-4 border border-border-color mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">参考価格</div>
                                    <div className="flex items-center gap-1 text-rank-gold">
                                        <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="text-lg font-black text-primary">4.8</span>
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-primary mb-1">¥54,800<span className="text-xs font-normal text-stone-500 ml-1">（税込）</span></div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <a href="#" className="w-full bg-accent hover:bg-accent-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-accent/20 transition-all text-center flex items-center justify-center gap-2 group">
                                    Amazonで詳細を見る
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">open_in_new</span>
                                </a>
                                <a href="#" className="w-full bg-white border border-border-color text-primary font-bold py-3 rounded-xl hover:bg-surface-subtle transition-all text-center text-sm">
                                    楽天で最安値をチェック
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Review Points */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <div>
                            <h3 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-accent">check_circle</span>
                                ここが良かった（メリット）
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 bg-[#E8F5E9]/50 p-3 rounded-lg border border-[#E8F5E9]">
                                    <span className="material-symbols-outlined text-[#2E7D32] mt-0.5">sentiment_satisfied</span>
                                    <span className="text-sm font-medium text-primary">
                                        <span className="block font-bold mb-1 text-[#2E7D32]">驚くほど静か</span>
                                        標準モードならテレビの音を邪魔しないレベル。夜間でも気兼ねなく使えます。
                                    </span>
                                </li>
                                <li className="flex items-start gap-3 bg-[#E8F5E9]/50 p-3 rounded-lg border border-[#E8F5E9]">
                                    <span className="material-symbols-outlined text-[#2E7D32] mt-0.5">sentiment_satisfied</span>
                                    <span className="text-sm font-medium text-primary">
                                        <span className="block font-bold mb-1 text-[#2E7D32]">賢いマッピング</span>
                                        部屋の間取りを正確に把握。無駄な動きがなく、掃除時間が短縮されました。
                                    </span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#C62828]">cancel</span>
                                ここが気になった（デメリット）
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 bg-[#FFEBEE]/50 p-3 rounded-lg border border-[#FFEBEE]">
                                    <span className="material-symbols-outlined text-[#C62828] mt-0.5">sentiment_dissatisfied</span>
                                    <span className="text-sm font-medium text-primary">
                                        <span className="block font-bold mb-1 text-[#C62828]">ダストボックスが小さめ</span>
                                        週に2回はゴミ捨てが必要。ペットがいる家庭だともっと頻繁かも。
                                    </span>
                                </li>
                                <li className="flex items-start gap-3 bg-[#FFEBEE]/50 p-3 rounded-lg border border-[#FFEBEE]">
                                    <span className="material-symbols-outlined text-[#C62828] mt-0.5">sentiment_dissatisfied</span>
                                    <span className="text-sm font-medium text-primary">
                                        <span className="block font-bold mb-1 text-[#C62828]">カーペットでの吸引力</span>
                                        フローリングは完璧ですが、厚手のカーペットでは少し吸い残しがありました。
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-border-color my-12"></div>

                    {/* Specs */}
                    <div className="mb-16">
                        <h3 className="text-xl font-black text-primary mb-6">製品仕様・スペック</h3>
                        <ProductSpec specs={specs} />
                    </div>

                    {/* Content Body (Dummy Text) */}
                    <div className="prose prose-stone max-w-none prose-headings:font-black prose-headings:text-primary prose-p:text-text-main prose-p:font-medium prose-img:rounded-2xl prose-img:shadow-soft">
                        <h3>開封・デザインチェック</h3>
                        <p>
                            パッケージは非常にシンプル。白を基調とした清潔感のあるデザインです。
                            本体を取り出してみると、マットな質感が高級感を演出しています。指紋がつきにくいのも嬉しいポイント。
                        </p>
                        <p>
                            厚さは9.6cmと、最近の薄型モデルに比べると少し厚みを感じますが、一般的な家具の下なら問題なく入り込めそうです。
                        </p>

                        <h3>実際の掃除能力を検証</h3>
                        <p>
                            フローリングに疑似ゴミ（コーヒー粉、ペットの毛、紙くず）を撒いて検証しました。
                            結果は...<strong>98%以上の除去率</strong>を記録！
                            特に壁際のゴミをrotatingブラシがしっかりとかき出してくれる動きが優秀でした。
                        </p>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
