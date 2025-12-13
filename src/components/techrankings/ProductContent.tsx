
import React, { useState } from 'react';

const ProductContent: React.FC = () => {
    const [activeImage, setActiveImage] = useState(0);
    const images = [
        'https://images.unsplash.com/photo-1610438235354-a6ae5528385c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1628202926206-c63a34b1618f?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'
    ];

    return (
        <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Product Hero */}
            <div className="bg-white dark:bg-surface-dark rounded-xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800">
                <div className="border-b border-gray-100 dark:border-gray-700 pb-6 mb-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] fill-current">emoji_events</span>
                            売れ筋ランキング 1位
                        </span>
                        <span className="bg-blue-50 text-brand-blue border border-blue-100 text-[10px] font-bold px-2 py-1 rounded-full">
                            編集部おすすめ
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-main dark:text-white leading-snug mb-3">
                        ソニー ワイヤレスノイズキャンセリングヘッドホン WH-1000XM5
                    </h1>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-md">
                            <span className="font-bold text-yellow-700 text-base">4.8</span>
                            <div className="flex text-accent-yellow">
                                {[1, 2, 3, 4].map(i => <span key={i} className="material-symbols-outlined text-[16px] fill-current">star</span>)}
                                <span className="material-symbols-outlined text-[16px] fill-current">star_half</span>
                            </div>
                        </div>
                        <a href="#reviews" className="text-text-muted hover:text-brand-blue underline decoration-gray-300 hover:decoration-brand-blue transition-all">
                            口コミ・レビュー (12,450件)
                        </a>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-5/12 flex flex-col gap-4">
                        <div className="aspect-square w-full rounded-xl bg-white border border-gray-100 dark:border-gray-700 overflow-hidden relative group shadow-sm flex items-center justify-center p-6">
                            <div
                                className="w-full h-full bg-contain bg-no-repeat bg-center transition-transform duration-500 group-hover:scale-105"
                                style={{ backgroundImage: `url('${images[activeImage]}')` }}
                            ></div>
                        </div>
                        <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
                            {images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`size-16 flex-shrink-0 rounded-lg bg-white cursor-pointer border overflow-hidden p-1 shadow-sm transition-all ${activeImage === idx ? 'border-2 border-brand-blue ring-2 ring-brand-blue/10' : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="w-full h-full bg-contain bg-no-repeat bg-center" style={{ backgroundImage: `url('${img}')` }}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full md:w-7/12 flex flex-col">
                        <div className="mb-6">
                            <p className="text-text-main dark:text-gray-300 text-sm leading-7 mb-5 font-normal">
                                業界最高クラスのノイズキャンセリング性能。AI技術を活用した高音質通話機能も搭載し、ビジネスシーンでも活躍。軽量設計で長時間の使用も快適です。
                            </p>
                            <ul className="space-y-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700/50">
                                {['業界最高クラスのノイキャン性能', '専用設計30mmドライバーユニット搭載', 'AI技術による高精度な通話品質'].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm">
                                        <span className="flex items-center justify-center size-5 rounded-full bg-green-100 text-green-600 mt-0.5">
                                            <span className="material-symbols-outlined text-[14px]">check</span>
                                        </span>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-auto bg-gradient-to-br from-[#fffdfd] to-[#fff5f5] dark:from-surface-dark dark:to-surface-dark p-5 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm">
                            <div className="flex flex-wrap items-baseline gap-2 mb-4">
                                <span className="text-xs text-gray-500 font-medium">最安値参考:</span>
                                <span className="text-4xl font-bold text-[#c41e3a] leading-none tracking-tight">¥46,800</span>
                                <span className="text-sm text-gray-400 line-through">¥53,900</span>
                                <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded ml-2">13% OFF</span>
                            </div>
                            <div className="flex flex-col gap-3">
                                <a href="#" className="w-full bg-[#ff9900] hover:bg-[#e68a00] text-white font-bold text-lg py-3.5 px-4 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] group">
                                    Amazonで詳細を見る
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">open_in_new</span>
                                </a>
                                <div className="grid grid-cols-2 gap-3">
                                    <a href="#" className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 hover:border-gray-300 text-text-main dark:text-white text-sm font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm">
                                        <span className="text-red-600 font-black">R</span> 楽天市場
                                    </a>
                                    <a href="#" className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 hover:border-gray-300 text-text-main dark:text-white text-sm font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm">
                                        <span className="text-red-600 font-black">Y!</span> Yahoo!
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Affiliate Notice */}
            <div className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[11px] px-4 py-3 rounded-lg flex items-start gap-2 border border-gray-100 dark:border-gray-700">
                <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">info</span>
                <p>当サイトはアフィリエイト広告プログラムに参加しています。記事内で紹介している商品を購入すると、売上の一部が当サイトに還元されることがあります。</p>
            </div>

            {/* Expert Review */}
            <div id="verdict" className="bg-white dark:bg-surface-dark rounded-xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800 scroll-mt-24">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-brand-blue rounded-full"></span>
                    専門家の評価・レビュー
                </h2>
                <div className="prose dark:prose-invert max-w-none text-text-main dark:text-gray-300 text-sm leading-8 mb-8">
                    <p className="mb-4">Sony WH-1000XM5は、人気の1000Xラインの大幅な刷新モデルです。前モデルほどコンパクトに折りたたむことはできませんが、装着感が向上し、特に中高音域でのノイズキャンセリング性能がわずかに改善されています。</p>
                    <p>多くのユーザーにとって、今購入できる最高のワイヤレスヘッドホンの一つです。音質、アプリの機能性、ANC性能のバランスは、他社製品と比較しても頭一つ抜けています。</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <h3 className="font-bold text-blue-800 dark:text-blue-400 mb-4 flex items-center gap-2 text-sm border-b border-blue-200 dark:border-blue-800/30 pb-2">
                            <span className="material-symbols-outlined text-blue-600">thumb_up</span>
                            良い点 (メリット)
                        </h3>
                        <ul className="space-y-3">
                            {['クラス最高レベルのノイズ除去', '解像度が高く繊細な音質', '通話品質が非常にクリア', '軽量で疲れにくい装着感'].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 text-sm border-b border-gray-200 dark:border-gray-700 pb-2">
                            <span className="material-symbols-outlined text-gray-500">thumb_down</span>
                            気になった点 (デメリット)
                        </h3>
                        <ul className="space-y-3">
                            {['コンパクトに折りたためない', '前モデルより価格が上昇', '防水性能の表記なし'].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0"></span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white dark:bg-surface-dark rounded-xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-brand-blue rounded-full"></span>
                    他製品との比較
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800">
                                <th className="p-4 border border-gray-200 dark:border-gray-700 w-1/4 font-medium text-gray-600 dark:text-gray-400 rounded-tl-lg">機能・スペック</th>
                                <th className="p-4 border border-blue-200 dark:border-blue-900 w-1/4 bg-blue-50/50 dark:bg-blue-900/20 border-t-4 border-t-brand-blue relative">
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-[10px] px-3 py-0.5 rounded-full shadow-sm font-bold tracking-wide">イチオシ</div>
                                    <div className="font-bold text-brand-blue dark:text-blue-300 mt-1 text-center">Sony WH-1000XM5</div>
                                </th>
                                <th className="p-4 border border-gray-200 dark:border-gray-700 w-1/4">
                                    <div className="font-bold text-text-main dark:text-white text-center">Bose QC45</div>
                                </th>
                                <th className="p-4 border border-gray-200 dark:border-gray-700 w-1/4 rounded-tr-lg">
                                    <div className="font-bold text-text-main dark:text-white text-center">Apple AirPods Max</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'バッテリー', v1: '30時間', v2: '24時間', v3: '20時間' },
                                { label: '重量', v1: '250g', v2: '240g', v3: '384g' },
                                { label: 'ドライバー', v1: '30mm カーボン', v2: 'TriPort', v3: '40mm ダイナミック' },
                            ].map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                                    <td className="p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-gray-600">{row.label}</td>
                                    <td className="p-4 border border-blue-200 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-900/10 font-bold text-text-main dark:text-white text-center">{row.v1}</td>
                                    <td className="p-4 border border-gray-200 dark:border-gray-700 text-center">{row.v2}</td>
                                    <td className="p-4 border border-gray-200 dark:border-gray-700 text-center">{row.v3}</td>
                                </tr>
                            ))}
                            <tr>
                                <td className="p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-gray-600 rounded-bl-lg">参考価格</td>
                                <td className="p-4 border border-blue-200 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-900/10 font-bold text-red-600 text-center text-base">¥46,800</td>
                                <td className="p-4 border border-gray-200 dark:border-gray-700 text-center">¥39,600</td>
                                <td className="p-4 border border-gray-200 dark:border-gray-700 text-center rounded-br-lg">¥84,800</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Specs */}
            <div className="bg-white dark:bg-surface-dark rounded-xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-brand-blue rounded-full"></span>
                    製品仕様（スペック）
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 text-sm">
                    {[
                        { label: 'ブランド', value: 'Sony (ソニー)' },
                        { label: 'モデル名', value: 'WH-1000XM5' },
                        { label: 'カラー', value: 'ブラック, シルバー, ブルー' },
                        { label: '装着方式', value: 'オーバーイヤー' },
                        { label: '接続方式', value: 'Bluetooth 5.2' },
                        { label: '充電端子', value: 'USB Type-C' }
                    ].map((spec, i) => (
                        <div key={i} className="flex justify-between border-b border-gray-100 dark:border-gray-800 py-4 group hover:bg-gray-50 transition-colors px-2 rounded-sm">
                            <span className="text-gray-500">{spec.label}</span>
                            <span className="font-medium text-text-main dark:text-white">{spec.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Reviews */}
            <div id="reviews" className="bg-white dark:bg-surface-dark rounded-xl p-6 sm:p-8 shadow-soft border border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-brand-blue rounded-full"></span>
                    ユーザーレビュー
                </h2>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        <div className="flex flex-col gap-1 items-center justify-center min-w-[150px]">
                            <p className="text-text-main dark:text-white text-5xl font-bold">4.8</p>
                            <div className="flex text-accent-yellow mb-1">
                                {[1, 2, 3, 4].map(i => <span key={i} className="material-symbols-outlined fill-current">star</span>)}
                                <span className="material-symbols-outlined fill-current">star_half</span>
                            </div>
                            <p className="text-gray-500 text-xs font-medium">12,450件の評価</p>
                        </div>
                        <div className="flex-1 w-full grid grid-cols-[20px_1fr_40px] items-center gap-y-2 gap-x-4 text-sm">
                            {[
                                { star: 5, pct: '80%', w: '80%' },
                                { star: 4, pct: '12%', w: '12%' },
                                { star: 3, pct: '5%', w: '5%' },
                                { star: 2, pct: '2%', w: '2%' },
                                { star: 1, pct: '1%', w: '1%' },
                            ].map(row => (
                                <React.Fragment key={row.star}>
                                    <p className="text-gray-500 text-xs text-right font-medium">{row.star}</p>
                                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-accent-yellow rounded-full" style={{ width: row.w }}></div>
                                    </div>
                                    <p className="text-gray-500 text-xs font-medium">{row.pct}</p>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-xs font-bold text-brand-blue">JD</div>
                                <div>
                                    <p className="font-bold text-sm text-text-main dark:text-white">購入者さん</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex text-accent-yellow text-xs">
                                            {[1, 2, 3, 4, 5].map(i => <span key={i} className="material-symbols-outlined text-[14px] fill-current">star</span>)}
                                        </div>
                                        <span className="text-xs text-gray-400">• 2日前</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h4 className="font-bold text-sm mb-2 text-text-main dark:text-white">価格だけの価値はある</h4>
                        <p className="text-text-main dark:text-gray-300 text-sm leading-relaxed">
                            XM3からの買い替えですが、違いは明らかです。通勤中のノイズキャンセリングの自動最適化機能が素晴らしい働きをします。新しいデザインは洗練されていますが、折りたたみ機能がないのは少し残念です。
                        </p>
                    </div>
                    <div className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">TK</div>
                                <div>
                                    <p className="font-bold text-sm text-text-main dark:text-white">Tanaka K.</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex text-accent-yellow text-xs">
                                            {[1, 2, 3, 4].map(i => <span key={i} className="material-symbols-outlined text-[14px] fill-current">star</span>)}
                                            <span className="material-symbols-outlined text-[14px] fill-current">star_border</span>
                                        </div>
                                        <span className="text-xs text-gray-400">• 1週間前</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h4 className="font-bold text-sm mb-2 text-text-main dark:text-white">音質は最高だが...</h4>
                        <p className="text-text-main dark:text-gray-300 text-sm leading-relaxed">
                            音質と着け心地は文句なしの最高傑作。ただ、夏場はイヤーパッドが少し蒸れやすいかもしれません。室内での使用がメインなら問題なし。
                        </p>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <button className="text-brand-blue font-bold text-sm hover:underline border border-brand-blue rounded-full px-8 py-2.5 hover:bg-blue-50 transition-colors bg-white">
                        すべてのレビューを見る
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductContent;
