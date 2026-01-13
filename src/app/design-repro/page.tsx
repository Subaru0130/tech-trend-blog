"use client";

import React from 'react';

// Isolated design reproduction page
export default function DesignReproPage() {
    return (
        <>
            <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-border-color shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300">
                <div className="px-4 md:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-8 lg:gap-12">
                        <a aria-label="ChoiceGuide Home" className="flex items-center gap-3 group" href="#">
                            <div className="size-10 bg-accent text-white rounded-lg flex items-center justify-center shadow-sm group-hover:bg-accent-dark transition-colors duration-300">
                                <span className="material-symbols-outlined text-[24px]">checklist</span>
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-xl font-black tracking-tight text-primary leading-none group-hover:text-accent transition-colors">ChoiceGuide</span>
                                <span className="text-[10px] font-bold text-text-sub tracking-widest uppercase leading-none mt-1">家電選びの最適解</span>
                            </div>
                        </a>
                        <nav className="hidden lg:flex items-center gap-8">
                            <a className="text-sm font-bold text-text-main hover:text-accent transition-colors py-2 border-b-2 border-transparent hover:border-accent" href="#">おすすめランキング</a>
                            <a className="text-sm font-bold text-text-main hover:text-accent transition-colors py-2 border-b-2 border-transparent hover:border-accent" href="#">カテゴリ一覧</a>
                            <a className="text-sm font-bold text-text-main hover:text-accent transition-colors py-2 border-b-2 border-transparent hover:border-accent" href="#">新着レビュー</a>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex relative group w-64 lg:w-80">
                            <form action="#" className="w-full relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">search</span>
                                <input aria-label="サイト内検索" className="w-full bg-surface-subtle border-transparent focus:border-accent focus:bg-white focus:ring-1 focus:ring-accent/50 rounded-full py-2.5 pl-10 pr-4 text-sm transition-all placeholder-stone-400 text-text-main font-medium" placeholder="商品名、キーワードで検索..." type="search" />
                            </form>
                        </div>
                        <a className="hidden sm:flex items-center gap-2 text-text-main font-bold text-sm hover:text-accent transition-colors" href="#">
                            <span className="material-symbols-outlined">account_circle</span>
                            <span>ログイン</span>
                        </a>
                    </div>
                </div>
            </header>
            <main className="pt-24 pb-20 md:pt-32">
                <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
                    <nav aria-label="Breadcrumb" className="flex items-center text-xs md:text-sm text-text-sub overflow-x-auto whitespace-nowrap pb-2 md:pb-0 mb-6">
                        <a className="hover:text-accent transition-colors" href="#">ホーム</a>
                        <span className="mx-2 text-stone-300">/</span>
                        <a className="hover:text-accent transition-colors" href="#">生活家電</a>
                        <span className="mx-2 text-stone-300">/</span>
                        <a className="hover:text-accent transition-colors" href="#">ロボット掃除機</a>
                        <span className="mx-2 text-stone-300">/</span>
                        <span className="font-bold text-primary truncate">SmartClean X1 Pro</span>
                    </nav>
                    <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-float border border-border-color mb-16">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            <div className="relative">
                                <div className="aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-surface-subtle shadow-inner">
                                    <img alt="SmartClean X1 Pro" className="w-full h-full object-cover mix-blend-multiply" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdwmDoUNhQFugaYfmqJacphz2RHCVbKLnpSE6HxVDqnoihGjnZCbMrXArUDPFdOrFuLz6mcUzJpxF2t2YvtHu5TjNA0M28YioydCJJDxKc26L7_ZG8R8wDKASscHQ_TPGrgu_JPYVsQfFEBJY-V3kJgSO1gU3ekqn_WmeA_qqT_R36baNC4Gb6xYov1CimjzWISfhJWVt0-FJd6YE1jVbZzIj1Z6JoWsImSE246f4wFLEfYxDjBG_xcYbwepLU5bbQlcoAGr-tcBo" />
                                </div>
                            </div>
                            <div className="flex flex-col justify-center h-full">
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                    <span className="bg-accent text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">2024年ベストバイ</span>
                                    <span className="bg-surface-subtle text-text-sub text-[11px] font-bold px-3 py-1 rounded-full border border-border-color">ロボット掃除機部門 1位</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight mb-6">SmartClean X1 Pro</h1>
                                <p className="text-lg text-text-sub font-medium mb-8 leading-relaxed text-balance">
                                    障害物回避性能が大幅向上。静音設計で夜間も安心。暮らしに溶け込む洗練されたフラッグシップモデル。
                                </p>
                                <div className="space-y-8">
                                    <div className="flex items-baseline gap-3 pb-6 border-b border-border-color">
                                        <span className="text-sm font-bold text-stone-500">参考価格</span>
                                        <span className="text-5xl font-black text-primary tracking-tight">¥54,800<span className="text-lg font-bold text-text-sub ml-1">~</span></span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <a className="relative group flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#FF9900] hover:bg-[#E68A00] text-white rounded-xl shadow-lg transition-all hover:-translate-y-1" href="#">
                                            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                                            <span className="font-bold text-lg">Amazonで見る</span>
                                        </a>
                                        <a className="relative group flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#BF0000] hover:bg-[#A00000] text-white rounded-xl shadow-lg transition-all hover:-translate-y-1" href="#">
                                            <span className="material-symbols-outlined text-2xl">local_mall</span>
                                            <span className="font-bold text-lg">楽天市場で見る</span>
                                        </a>
                                    </div>
                                    <p className="text-[11px] text-stone-400 text-center leading-relaxed">*最新の価格・在庫状況は各ストアにてご確認ください。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sticky top-16 md:top-20 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-border-color mb-16">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-10 h-14">
                        <a className="text-sm font-bold text-accent border-b-2 border-accent h-full flex items-center px-1" href="#overview">専門家による検証</a>
                        <a className="text-sm font-bold text-text-sub hover:text-primary transition-colors h-full flex items-center px-1" href="#specs">詳細スペック</a>
                        <div className="ml-auto hidden sm:flex items-center gap-4">
                            <span className="text-sm font-bold text-primary">¥54,800</span>
                            <a className="bg-accent hover:bg-accent-dark text-white text-xs font-bold px-5 py-2 rounded-full transition-colors shadow-sm" href="#">Amazonで購入</a>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-8">
                        <article className="prose max-w-none" id="overview">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="size-12 rounded-2xl bg-accent-light flex items-center justify-center text-accent">
                                    <span className="material-symbols-outlined text-3xl">verified</span>
                                </div>
                                <h2 className="!m-0 !border-0 text-3xl">賢さと静かさを追求した、<br className="hidden md:block" />「掃除を忘れる」ための正解。</h2>
                            </div>
                            <p className="text-xl font-medium text-primary mb-10 leading-relaxed border-l-4 border-accent-light pl-6">
                                数あるロボット掃除機の中でも、SmartClean X1 Proは「障害物回避」において頭一つ抜けています。実際に生活感のある部屋でテストしましたが、一度も絡まることなく完遂しました。
                            </p>
                            <div className="my-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-[#E0EFE6] p-8 rounded-[1.5rem] border border-accent/25">
                                    <h3 className="!mt-0 flex items-center gap-2 text-accent-dark">
                                        <span className="material-symbols-outlined">check_circle</span> 良い点 (Pros)
                                    </h3>
                                    <ul className="!mb-0 text-sm font-bold leading-relaxed text-primary">
                                        <li>LiDARセンサーによる正確なマッピング</li>
                                        <li>夜間でも使える圧倒的な静音性</li>
                                        <li>アプリのUIが直感的で使い勝手が良い</li>
                                        <li>カーペットの自動検知と吸引力調整</li>
                                    </ul>
                                </div>
                                <div className="bg-[#F0EBE6] p-8 rounded-[1.5rem] border border-rank-bronze/25">
                                    <h3 className="!mt-0 flex items-center gap-2 text-rank-bronze">
                                        <span className="material-symbols-outlined">info</span> 気になる点 (Cons)
                                    </h3>
                                    <ul className="!mb-0 text-sm font-bold leading-relaxed text-primary">
                                        <li>自動ゴミ収集機は別売り</li>
                                        <li>水拭き機能は簡易的な仕様</li>
                                        <li>本体の厚みがわずかに気になる</li>
                                    </ul>
                                </div>
                            </div>
                            <h3>革新的な物体認識「AI Vision 2.0」</h3>
                            <p>
                                本機最大の特徴は、フロントカメラと専用AIチップによる高度な物体認識機能です。従来のセンサーでは検知が難しかった「電源コード」や「スリッパ」もしっかりと認識。掃除前の片付けというストレスを大幅に軽減します。
                            </p>
                            <h3>計算された吸引力と静音性のバランス</h3>
                            <p>
                                4000Paというハイエンド級の吸引力を備えながら、特筆すべきは静音モード時の動作音です。58dBという数値以上に、耳障りな高音ノイズが抑えられており、在宅ワーク中や夜間の稼働も全く気になりません。
                            </p>
                        </article>
                        <section className="mt-20" id="specs">
                            <div className="flex items-center gap-3 mb-8 border-b border-border-color pb-4">
                                <span className="material-symbols-outlined text-accent text-2xl">list_alt</span>
                                <h2 className="text-2xl font-black text-primary">詳細スペック</h2>
                            </div>
                            <div className="overflow-hidden rounded-2xl border border-border-color bg-white">
                                <table className="w-full text-sm text-left">
                                    <tbody className="divide-y divide-border-color">
                                        <tr className="bg-surface-subtle/30">
                                            <th className="py-5 px-8 font-bold text-primary w-1/3">サイズ / 重量</th>
                                            <td className="py-5 px-8 text-text-main">350 x 350 x 96 mm / 3.4kg</td>
                                        </tr>
                                        <tr>
                                            <th className="py-5 px-8 font-bold text-primary">吸引力</th>
                                            <td className="py-5 px-8 text-text-main">最大4000Pa (4段階調整)</td>
                                        </tr>
                                        <tr className="bg-surface-subtle/30">
                                            <th className="py-5 px-8 font-bold text-primary">ナビゲーション</th>
                                            <td className="py-5 px-8 text-text-main">LDSレーザー + AIカメラ</td>
                                        </tr>
                                        <tr>
                                            <th className="py-5 px-8 font-bold text-primary">バッテリー</th>
                                            <td className="py-5 px-8 text-text-main">5200mAh (最大180分)</td>
                                        </tr>
                                        <tr className="bg-surface-subtle/30">
                                            <th className="py-5 px-8 font-bold text-primary">アプリ対応</th>
                                            <td className="py-5 px-8 text-text-main">iOS / Android (Wi-Fi 2.4GHz)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                    <div className="lg:col-span-4 space-y-10">
                        <div className="bg-white p-8 rounded-3xl shadow-card border border-border-color">
                            <h3 className="font-bold text-primary mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-rank-gold">auto_awesome</span>
                                同ジャンルの人気商品
                            </h3>
                            <div className="space-y-6">
                                <a className="flex items-center gap-4 group" href="#">
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-subtle border border-border-color shrink-0">
                                        <img alt="Rank 1" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdwmDoUNhQFugaYfmqJacphz2RHCVbKLnpSE6HxVDqnoihGjnZCbMrXArUDPFdOrFuLz6mcUzJpxF2t2YvtHu5TjNA0M28YioydCJJDxKc26L7_ZG8R8wDKASscHQ_TPGrgu_JPYVsQfFEBJY-V3kJgSO1gU3ekqn_WmeA_qqT_R36baNC4Gb6xYov1CimjzWISfhJWVt0-FJd6YE1jVbZzIj1Z6JoWsImSE246f4wFLEfYxDjBG_xcYbwepLU5bbQlcoAGr-tcBo" />
                                        <div className="absolute top-0 left-0 bg-rank-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-br">1位</div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-primary line-clamp-2 group-hover:text-accent transition-colors">SmartClean X1 Pro</h4>
                                        <div className="text-xs text-stone-400 mt-1 font-bold">¥54,800</div>
                                    </div>
                                </a>
                                <a className="flex items-center gap-4 group" href="#">
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-subtle border border-border-color shrink-0">
                                        <img alt="Rank 2" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnXzX6vUEI3r6p526T4n85nwePCZvyPrbKLEBW8ojeixblKP7eO1yzXplkrAT7dBHMf041uyvVoyuQjnL5LUlkayPyzPtvMbk06FKQiSlqmsv1BdX5eVM311-2HoJcblqyFLyJa35ZuFPGru8_CAIZPWmtbjGdiW5lTTKrBUiyLlIpw9TubgT1tOFTCs7OqM1VmkeJf4yDn5jW0zIn-RovSUFT-aKRm1FO-l4RS49cprBC7dcOwV3-d0ZgYmgH9aDBJRJMYyVMttw" />
                                        <div className="absolute top-0 left-0 bg-rank-silver text-white text-[10px] font-bold px-2 py-0.5 rounded-br">2位</div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-primary line-clamp-2 group-hover:text-accent transition-colors">RoboVac Elite 5</h4>
                                        <div className="text-xs text-stone-400 mt-1 font-bold">¥42,000</div>
                                    </div>
                                </a>
                            </div>
                            <div className="mt-8 pt-6 border-t border-border-color text-center">
                                <a className="text-xs font-bold text-accent hover:underline flex items-center justify-center gap-1" href="#">
                                    ランキングをもっと見る <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                </a>
                            </div>
                        </div>
                        <div className="bg-[#F2F4F2] p-8 rounded-3xl border border-border-color">
                            <h3 className="font-bold text-primary mb-6 text-sm tracking-widest uppercase">あわせて読みたい</h3>
                            <ul className="space-y-6">
                                <li>
                                    <a className="group block" href="#">
                                        <span className="text-[10px] font-bold text-accent mb-1 block">BUYING GUIDE</span>
                                        <h4 className="text-sm font-bold text-primary leading-snug group-hover:text-accent transition-colors">
                                            ロボット掃除機の選び方。後悔しないための3つのチェックポイント
                                        </h4>
                                    </a>
                                </li>
                                <li>
                                    <a className="group block" href="#">
                                        <span className="text-[10px] font-bold text-accent mb-1 block">RANKING</span>
                                        <h4 className="text-sm font-bold text-primary leading-snug group-hover:text-accent transition-colors">
                                            【2024年】5万円以下で選ぶコスパ最強ロボット掃除機5選
                                        </h4>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="bg-primary text-white pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
                        <div className="md:col-span-5 lg:col-span-4">
                            <a className="flex items-center gap-3 mb-8 group" href="#">
                                <div className="size-10 bg-white text-primary rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[24px]">checklist</span>
                                </div>
                                <span className="text-2xl font-black tracking-tight">ChoiceGuide</span>
                            </a>
                            <p className="text-stone-400 text-sm leading-relaxed mb-10 max-w-sm">
                                ChoiceGuideは、信頼できる検証データと専門家の視点から、あなたの「失敗しない買い物」をサポートする製品比較メディアです。
                            </p>
                            <div className="flex gap-5">
                                <a className="size-10 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 hover:text-white hover:border-stone-500 transition-all" href="#"><span className="material-symbols-outlined text-[20px]">public</span></a>
                                <a className="size-10 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 hover:text-white hover:border-stone-500 transition-all" href="#"><span className="material-symbols-outlined text-[20px]">rss_feed</span></a>
                            </div>
                        </div>
                        <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-10">
                            <div>
                                <h3 className="font-bold text-sm mb-6 text-stone-200 uppercase tracking-widest">人気カテゴリ</h3>
                                <ul className="space-y-4 text-sm text-stone-400">
                                    <li><a className="hover:text-accent transition-colors" href="#">PC・周辺機器</a></li>
                                    <li><a className="hover:text-accent transition-colors" href="#">スマートフォン</a></li>
                                    <li><a className="hover:text-accent transition-colors" href="#">キッチン家電</a></li>
                                    <li><a className="hover:text-accent transition-colors" href="#">美容・健康家電</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm mb-6 text-stone-200 uppercase tracking-widest">サイト情報</h3>
                                <ul className="space-y-4 text-sm text-stone-400">
                                    <li><a className="hover:text-accent transition-colors" href="#">運営者情報</a></li>
                                    <li><a className="hover:text-accent transition-colors" href="#">お問い合わせ</a></li>
                                    <li><a className="hover:text-accent transition-colors" href="#">利用規約</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-stone-800 pt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <p className="text-xs text-stone-500 font-medium">© 2024 ChoiceGuide. All rights reserved.</p>
                        <div className="text-[10px] text-stone-600 font-bold uppercase tracking-widest">
                            Trusted reviews for better living
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
