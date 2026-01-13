
import React from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export const metadata = {
    title: 'SmartClean X1 Pro レビュー - ChoiceGuide',
    description: '最新ロボット掃除機「SmartClean X1 Pro」の徹底レビュー。障害物回避性能、静音性、実際の吸引力を専門家が検証。メリット・デメリット、最安値情報まで詳しく解説します。',
};

export default function ReviewPrototype() {
    return (
        <>
            <div className="bg-background-light text-text-main antialiased selection:bg-accent/20 selection:text-primary">
                <Header />

                <main className="pt-24 pb-20 md:pt-32">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
                        <nav aria-label="Breadcrumb" className="flex items-center text-xs md:text-sm text-text-sub overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
                            <a className="hover:text-accent transition-colors" href="#">ホーム</a>
                            <span className="mx-2 text-stone-300">/</span>
                            <a className="hover:text-accent transition-colors" href="#">生活家電</a>
                            <span className="mx-2 text-stone-300">/</span>
                            <a className="hover:text-accent transition-colors" href="#">ロボット掃除機</a>
                            <span className="mx-2 text-stone-300">/</span>
                            <span className="font-bold text-primary truncate">SmartClean X1 Pro</span>
                        </nav>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                            <div className="lg:col-span-7 animate-fade-in-up">
                                <div className="bg-white rounded-3xl p-2 md:p-4 shadow-soft border border-white ring-1 ring-border-color mb-4">
                                    <div className="aspect-[4/3] rounded-2xl overflow-hidden relative group bg-surface-subtle">
                                        <img alt="SmartClean X1 Pro Living Room" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdwmDoUNhQFugaYfmqJacphz2RHCVbKLnpSE6HxVDqnoihGjnZCbMrXArUDPFdOrFuLz6mcUzJpxF2t2YvtHu5TjNA0M28YioydCJJDxKc26L7_ZG8R8wDKASscHQ_TPGrgu_JPYVsQfFEBJY-V3kJgSO1gU3ekqn_WmeA_qqT_R36baNC4Gb6xYov1CimjzWISfhJWVt0-FJd6YE1jVbZzIj1Z6JoWsImSE246f4wFLEfYxDjBG_xcYbwepLU5bbQlcoAGr-tcBo" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <button className="aspect-square rounded-xl overflow-hidden border-2 border-accent ring-2 ring-accent/20 cursor-pointer">
                                        <img alt="Thumbnail 1" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdwmDoUNhQFugaYfmqJacphz2RHCVbKLnpSE6HxVDqnoihGjnZCbMrXArUDPFdOrFuLz6mcUzJpxF2t2YvtHu5TjNA0M28YioydCJJDxKc26L7_ZG8R8wDKASscHQ_TPGrgu_JPYVsQfFEBJY-V3kJgSO1gU3ekqn_WmeA_qqT_R36baNC4Gb6xYov1CimjzWISfhJWVt0-FJd6YE1jVbZzIj1Z6JoWsImSE246f4wFLEfYxDjBG_xcYbwepLU5bbQlcoAGr-tcBo" />
                                    </button>
                                    <button className="aspect-square rounded-xl overflow-hidden border border-border-color hover:border-accent cursor-pointer opacity-70 hover:opacity-100 transition-all">
                                        <div className="w-full h-full bg-surface-subtle flex items-center justify-center text-stone-400">
                                            <span className="material-symbols-outlined">360</span>
                                        </div>
                                    </button>
                                    <button className="aspect-square rounded-xl overflow-hidden border border-border-color hover:border-accent cursor-pointer opacity-70 hover:opacity-100 transition-all">
                                        <div className="w-full h-full bg-surface-subtle flex items-center justify-center text-stone-400">
                                            <span className="material-symbols-outlined">sensors</span>
                                        </div>
                                    </button>
                                    <button className="aspect-square rounded-xl overflow-hidden border border-border-color hover:border-accent cursor-pointer opacity-70 hover:opacity-100 transition-all">
                                        <div className="w-full h-full bg-surface-subtle flex items-center justify-center text-stone-400">
                                            <span className="material-symbols-outlined">video_library</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            <div className="lg:col-span-5 lg:sticky lg:top-28 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-border-color">
                                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                                        <span className="bg-accent text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">2024年ベストバイ</span>
                                        <span className="bg-surface-subtle text-text-sub text-[11px] font-bold px-3 py-1 rounded-full border border-border-color">ロボット掃除機部門 1位</span>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-black text-primary leading-tight mb-3">SmartClean X1 Pro</h1>
                                    <p className="text-sm text-text-sub font-medium mb-4">障害物回避性能が大幅向上。静音設計で夜間も安心のフラッグシップモデル。</p>
                                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-color">
                                        <div className="flex items-center gap-1">
                                            <span className="text-2xl font-black text-primary">4.8</span>
                                            <div className="flex text-rank-gold">
                                                <span className="material-symbols-outlined text-[20px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-[20px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-[20px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-[20px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-[20px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                                            </div>
                                        </div>
                                        <a className="text-xs font-bold text-accent hover:underline flex items-center gap-0.5" href="#reviews">
                                            128件のレビュー <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                                        </a>
                                    </div>
                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <span className="text-xs font-bold text-stone-500">参考価格</span>
                                            <span className="text-4xl font-black text-primary tracking-tight">¥54,800<span className="text-base font-bold text-text-sub ml-1">~</span></span>
                                        </div>
                                        <p className="text-[10px] text-stone-400 mb-4">*価格は販売店により異なります。最新価格は以下よりご確認ください。</p>
                                        <div className="flex flex-col gap-3">
                                            <a className="relative group flex items-center justify-between w-full p-4 bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white rounded-xl shadow-md transition-all hover:-translate-y-0.5" href="#">
                                                <span className="flex items-center gap-3 font-bold">
                                                    <span className="material-symbols-outlined">shopping_cart</span> Amazonで見る
                                                </span>
                                                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">最安値</span>
                                                <span className="material-symbols-outlined absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                                            </a>
                                            <div className="grid grid-cols-2 gap-3">
                                                <a className="flex items-center justify-center gap-2 w-full py-3 bg-[#BF0000] hover:bg-[#A00000] text-white rounded-lg text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5" href="#">
                                                    楽天市場
                                                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                                </a>
                                                <a className="flex items-center justify-center gap-2 w-full py-3 bg-[#560099] hover:bg-[#45007A] text-white rounded-lg text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5" href="#">
                                                    Yahoo!
                                                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-surface-subtle rounded-xl p-4 border border-border-color">
                                        <h3 className="text-xs font-bold text-stone-500 uppercase mb-3 tracking-wider">主な仕様</h3>
                                        <ul className="space-y-2 text-sm text-primary">
                                            <li className="flex items-center justify-between">
                                                <span className="text-text-sub flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-stone-400">battery_full</span>稼働時間</span>
                                                <span className="font-bold">最大180分</span>
                                            </li>
                                            <li className="flex items-center justify-between">
                                                <span className="text-text-sub flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-stone-400">volume_off</span>静音性</span>
                                                <span className="font-bold">58dB (静音モード)</span>
                                            </li>
                                            <li className="flex items-center justify-between">
                                                <span className="text-text-sub flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-stone-400">inbox</span>ダストボックス</span>
                                                <span className="font-bold">420ml (水洗い可)</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="sticky top-16 md:top-20 z-40 bg-white/95 backdrop-blur shadow-sm border-b border-border-color mt-16 mb-12 hidden lg:block">
                        <div className="max-w-7xl mx-auto px-8 flex items-center gap-8 h-14">
                            <a className="text-sm font-bold text-accent border-b-2 border-accent h-full flex items-center px-1" href="#overview">特徴・検証</a>
                            <a className="text-sm font-bold text-text-sub hover:text-primary transition-colors h-full flex items-center px-1" href="#specs">詳細スペック</a>
                            <a className="text-sm font-bold text-text-sub hover:text-primary transition-colors h-full flex items-center px-1" href="#reviews">ユーザーレビュー</a>
                            <a className="text-sm font-bold text-text-sub hover:text-primary transition-colors h-full flex items-center px-1" href="#faq">よくある質問</a>
                            <div className="ml-auto flex items-center gap-4">
                                <span className="text-sm font-bold text-primary">¥54,800</span>
                                <a className="bg-accent hover:bg-accent-dark text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-sm" href="#">Amazonで見る</a>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8 space-y-16">
                            <section className="prose max-w-none" id="overview">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="size-10 rounded-full bg-accent-light flex items-center justify-center text-accent">
                                        <span className="material-symbols-outlined">rate_review</span>
                                    </div>
                                    <h2 className="!mt-0 !mb-0 !border-b-0 !text-2xl">専門家レビュー：賢さと静かさを両立した「正解」</h2>
                                </div>
                                <p className="lead text-lg font-medium text-text-main">
                                    数あるロボット掃除機の中でも、SmartClean X1 Proは「障害物回避」において頭一つ抜けています。実際に部屋にケーブルや靴下を散乱させてテストしましたが、一度も絡まることなく掃除を完了しました。
                                </p>
                                <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-surface-subtle p-6 rounded-2xl border border-border-color">
                                        <h3 className="!mt-0 flex items-center gap-2 text-accent">
                                            <span className="material-symbols-outlined">check_circle</span> 良い点 (Pros)
                                        </h3>
                                        <ul className="!mb-0 text-sm font-medium">
                                            <li>LiDARセンサーによる正確なマッピング</li>
                                            <li>夜間でも使える圧倒的な静音性</li>
                                            <li>アプリのUIが直感的で使いやすい</li>
                                            <li>カーペットの自動検知と吸引力アップ</li>
                                        </ul>
                                    </div>
                                    <div className="bg-surface-subtle p-6 rounded-2xl border border-border-color">
                                        <h3 className="!mt-0 flex items-center gap-2 text-rank-bronze">
                                            <span className="material-symbols-outlined">cancel</span> 気になる点 (Cons)
                                        </h3>
                                        <ul className="!mb-0 text-sm font-medium">
                                            <li>ダストステーションは別売り</li>
                                            <li>水拭き機能は簡易的なものに限られる</li>
                                            <li>本体の高さがややあり、低い家具下は苦手</li>
                                        </ul>
                                    </div>
                                </div>
                                <h3>脅威の認識精度「AI Vision」</h3>
                                <p>
                                    本機最大の特徴は、フロントカメラとAIチップによる物体認識機能です。従来のレーザーセンサーだけでは検知しにくかった「電源コード」や「ペットの排泄物（模擬）」もしっかり認識し、迂回ルートを作成します。これにより、掃除前の片付けという手間が劇的に減ります。
                                </p>
                                <h3>吸引力と静音性のバランス</h3>
                                <p>
                                    吸引力は4000Paとハイエンド機並みですが、特筆すべきは静音モード時の動作音です。58dBという数値以上に、耳障りな高音がカットされており、在宅ワーク中や夜間でも気になりにくい音質にチューニングされています。
                                </p>
                                <div className="mt-8 p-4 bg-accent-light/50 border border-accent/20 rounded-xl flex gap-4 items-start">
                                    <span className="material-symbols-outlined text-accent text-3xl shrink-0">verified</span>
                                    <div>
                                        <h4 className="font-bold text-primary mb-1">編集部の結論</h4>
                                        <p className="text-sm text-text-sub !mb-0">
                                            「とにかく手間を減らしたい」「ペットや子供がいる家庭」にはベストバイと言えます。水拭き性能を重視しないのであれば、これ以上の選択肢は現状見当たりません。
                                        </p>
                                    </div>
                                </div>
                            </section>
                            <section id="specs">
                                <div className="flex items-center gap-3 mb-6 border-b border-border-color pb-4">
                                    <span className="material-symbols-outlined text-accent text-2xl">wysiwyg</span>
                                    <h2 className="text-2xl font-black text-primary">詳細スペック</h2>
                                </div>
                                <div className="overflow-hidden rounded-xl border border-border-color">
                                    <table className="w-full text-sm text-left">
                                        <tbody className="divide-y divide-border-color">
                                            <tr className="bg-surface-subtle">
                                                <th className="py-4 px-6 font-bold text-primary w-1/3">サイズ / 重量</th>
                                                <td className="py-4 px-6 text-text-main">350 x 350 x 96 mm / 3.4kg</td>
                                            </tr>
                                            <tr className="bg-white">
                                                <th className="py-4 px-6 font-bold text-primary">吸引力</th>
                                                <td className="py-4 px-6 text-text-main">最大4000Pa (4段階調整)</td>
                                            </tr>
                                            <tr className="bg-surface-subtle">
                                                <th className="py-4 px-6 font-bold text-primary">ナビゲーション</th>
                                                <td className="py-4 px-6 text-text-main">LDSレーザー + AIカメラ (AI Vision 2.0)</td>
                                            </tr>
                                            <tr className="bg-white">
                                                <th className="py-4 px-6 font-bold text-primary">バッテリー容量</th>
                                                <td className="py-4 px-6 text-text-main">5200mAh (最大180分稼働)</td>
                                            </tr>
                                            <tr className="bg-surface-subtle">
                                                <th className="py-4 px-6 font-bold text-primary">乗り越え段差</th>
                                                <td className="py-4 px-6 text-text-main">最大20mm</td>
                                            </tr>
                                            <tr className="bg-white">
                                                <th className="py-4 px-6 font-bold text-primary">アプリ対応</th>
                                                <td className="py-4 px-6 text-text-main">iOS / Android (Wi-Fi 2.4GHz)</td>
                                            </tr>
                                            <tr className="bg-surface-subtle">
                                                <th className="py-4 px-6 font-bold text-primary">付属品</th>
                                                <td className="py-4 px-6 text-text-main">充電ドック、電源アダプタ、サイドブラシx2、HEPAフィルター、説明書</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                            <section id="reviews">
                                <div className="flex items-center justify-between mb-8 border-b border-border-color pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-accent text-2xl">forum</span>
                                        <h2 className="text-2xl font-black text-primary">ユーザーレビュー</h2>
                                    </div>
                                    <button className="text-sm font-bold text-accent hover:bg-accent-light px-4 py-2 rounded-full transition-colors">
                                        レビューを書く
                                    </button>
                                </div>
                                <div className="grid gap-6">
                                    <article className="bg-white p-6 rounded-2xl shadow-sm border border-border-color">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold">KT</div>
                                                <div>
                                                    <div className="font-bold text-primary text-sm">K. Tanaka</div>
                                                    <div className="text-[10px] text-stone-400">2024.03.10 購入</div>
                                                </div>
                                            </div>
                                            <div className="flex text-rank-gold">
                                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-primary mb-2">ペットがいる家庭には必須レベル</h3>
                                        <p className="text-sm text-text-sub leading-relaxed">
                                            猫を2匹飼っていますが、毛の掃除が劇的に楽になりました。以前使っていた機種はよく猫のおもちゃを吸い込んで止まっていましたが、これはしっかり避けてくれます。音も静かなので猫も怖がりません。
                                        </p>
                                    </article>
                                    <article className="bg-white p-6 rounded-2xl shadow-sm border border-border-color">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold">YS</div>
                                                <div>
                                                    <div className="font-bold text-primary text-sm">Y. Sato</div>
                                                    <div className="text-[10px] text-stone-400">2024.02.28 購入</div>
                                                </div>
                                            </div>
                                            <div className="flex text-rank-gold">
                                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-stone-300 text-[18px]">star</span>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-primary mb-2">性能は満足だが、アプリの接続に手間取った</h3>
                                        <p className="text-sm text-text-sub leading-relaxed">
                                            掃除能力自体は文句なし。マップの生成も早いです。ただ、初期設定のWi-Fi接続で何度かエラーが出ました。5GHz帯に対応していない点は注意が必要です。一度繋がれば安定しています。
                                        </p>
                                    </article>
                                    <article className="bg-white p-6 rounded-2xl shadow-sm border border-border-color">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold">MM</div>
                                                <div>
                                                    <div className="font-bold text-primary text-sm">M. Murakami</div>
                                                    <div className="text-[10px] text-stone-400">2024.03.14 購入</div>
                                                </div>
                                            </div>
                                            <div className="flex text-rank-gold">
                                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-primary mb-2">コスパ最強のハイエンド機</h3>
                                        <p className="text-sm text-text-sub leading-relaxed">
                                            10万円クラスの有名メーカー品と比較検討しましたが、機能差を感じません。むしろカメラ性能はこちらの方が上かも。水拭きはそこそこですが、吸引メインならこれで十分です。
                                        </p>
                                    </article>
                                </div>
                                <div className="mt-8 text-center">
                                    <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-border-color text-text-main font-bold hover:bg-surface-subtle hover:shadow-sm transition-all text-sm">
                                        もっと見る <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                    </button>
                                </div>
                            </section>
                        </div>
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white p-6 rounded-2xl shadow-card border border-border-color">
                                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-rank-gold">trophy</span>
                                    同ジャンルの人気ランキング
                                </h3>
                                <div className="space-y-4">
                                    <a className="flex items-start gap-3 group" href="#">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface-subtle border border-border-color shrink-0">
                                            <img alt="Rank 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdwmDoUNhQFugaYfmqJacphz2RHCVbKLnpSE6HxVDqnoihGjnZCbMrXArUDPFdOrFuLz6mcUzJpxF2t2YvtHu5TjNA0M28YioydCJJDxKc26L7_ZG8R8wDKASscHQ_TPGrgu_JPYVsQfFEBJY-V3kJgSO1gU3ekqn_WmeA_qqT_R36baNC4Gb6xYov1CimjzWISfhJWVt0-FJd6YE1jVbZzIj1Z6JoWsImSE246f4wFLEfYxDjBG_xcYbwepLU5bbQlcoAGr-tcBo" />
                                            <div className="absolute top-0 left-0 bg-rank-gold text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br">1</div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-primary line-clamp-2 group-hover:text-accent transition-colors">SmartClean X1 Pro</h4>
                                            <div className="text-xs text-stone-400 mt-1">¥54,800</div>
                                        </div>
                                    </a>
                                    <a className="flex items-start gap-3 group" href="#">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface-subtle border border-border-color shrink-0">
                                            <img alt="Rank 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnXzX6vUEI3r6p526T4n85nwePCZvyPrbKLEBW8ojeixblKP7eO1yzXplkrAT7dBHMf041uyvVoyuQjnL5LUlkayPyzPtvMbk06FKQiSlqmsv1BdX5eVM311-2HoJcblqyFLyJa35ZuFPGru8_CAIZPWmtbjGdiW5lTTKrBUiyLlIpw9TubgT1tOFTCs7OqM1VmkeJf4yDn5jW0zIn-RovSUFT-aKRm1FO-l4RS49cprBC7dcOwV3-d0ZgYmgH9aDBJRJMYyVMttw" />
                                            <div className="absolute top-0 left-0 bg-rank-silver text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br">2</div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-primary line-clamp-2 group-hover:text-accent transition-colors">RoboVac Elite 5</h4>
                                            <div className="text-xs text-stone-400 mt-1">¥42,000</div>
                                        </div>
                                    </a>
                                    <a className="flex items-start gap-3 group" href="#">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface-subtle border border-border-color shrink-0">
                                            <img alt="Rank 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQ7AyJb2SKNXosVqhnY9aXJk2v3ixbHKNXdAQUc16YZYMBWuIOs1-cqcuj5Abay0Y6pWPKVIDKbi4USGhZlal0004BryifY8tnTHe_CMEHdzDOZveWkzSvm5O2sayIdXCnqiCKAGNRvFIjt35FsGKUQVoRquOWW1QN4vclzAEuG0fsmdPe0V1vTew-CYpMf7RMKOYD5ukFUjxI7xsmg24ws9d6NZJI45QK8uuRxATGDQIUhmRLmIhZz5H7xMJr3MZ4aXaWeWN5Yc0" />
                                            <div className="absolute top-0 left-0 bg-rank-bronze text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br">3</div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-primary line-clamp-2 group-hover:text-accent transition-colors">CleanMaster Mini</h4>
                                            <div className="text-xs text-stone-400 mt-1">¥28,900</div>
                                        </div>
                                    </a>
                                </div>
                                <div className="mt-4 pt-4 border-t border-border-color text-center">
                                    <a className="text-xs font-bold text-accent hover:underline" href="#">すべてのランキングを見る</a>
                                </div>
                            </div>
                            <div className="bg-surface-subtle p-6 rounded-2xl border border-border-color">
                                <h3 className="font-bold text-primary mb-4 text-sm">関連記事</h3>
                                <ul className="space-y-4">
                                    <li>
                                        <a className="group block" href="#">
                                            <span className="text-xs text-stone-400 mb-1 block">2024.03.10</span>
                                            <h4 className="text-sm font-bold text-primary leading-snug group-hover:text-accent transition-colors">
                                                ロボット掃除機の選び方決定版！センサーの違いで何が変わる？
                                            </h4>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="group block" href="#">
                                            <span className="text-xs text-stone-400 mb-1 block">2024.02.15</span>
                                            <h4 className="text-sm font-bold text-primary leading-snug group-hover:text-accent transition-colors">
                                                【5万円以下】コスパ最強のロボット掃除機おすすめ5選
                                            </h4>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="group block" href="#">
                                            <span className="text-xs text-stone-400 mb-1 block">2024.01.20</span>
                                            <h4 className="text-sm font-bold text-primary leading-snug group-hover:text-accent transition-colors">
                                                ルンバだけじゃない！注目の中華メーカー実力比較
                                            </h4>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
