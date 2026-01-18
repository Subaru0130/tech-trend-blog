import React from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function AboutPage() {
    return (
        <div className="bg-background-light text-text-main antialiased font-sans min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow pt-24 pb-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold mb-8 text-primary border-b pb-4 border-stone-200">運営者情報・編集ポリシー</h1>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4 text-accent">ChoiceGuideについて</h2>
                        <p className="leading-relaxed text-stone-600 mb-4">
                            ChoiceGuide（チョイスガイド）は、デジタル家電から生活用品まで、
                            「失敗しない選び方」を提案するレビュー・比較メディアです。
                        </p>
                        <p className="leading-relaxed text-stone-600">
                            情報が溢れる現代において、本当に価値のある製品を見つけることは容易ではありません。
                            私たちは客観的なデータと実際の使用感に基づき、ユーザーの皆様が納得して購入できる情報を提供することを使命としています。
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4 text-accent">記事の作成・評価基準について</h2>
                        <p className="leading-relaxed text-stone-600 mb-6">
                            当サイトでは、個人の主観による評価の偏りを防ぐため、
                            <strong>「定量的データ」</strong>と<strong>「集合知」</strong>に基づいた客観的な分析を行っています。
                        </p>

                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                                <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-accent">analytics</span>
                                    スペックの徹底比較
                                </h3>
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    公式サイトおよび技術仕様書に基づき、ドライバーサイズ、再生周波数帯域、
                                    コーデックなどの数値を横断的に比較。同価格帯の製品を公平な基準で評価しています。
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                                <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-accent">groups</span>
                                    ユーザー感情分析
                                </h3>
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    国内外のレビューサイト（Amazon、価格.com等）から数百件のデータを収集。
                                    実際の購入者が感じた「音質の傾向」「装着感」を統計的に分析し、スコア化しています。
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                                <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-accent">star</span>
                                    評価ランク（S/A/B/C）の意味
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-stone-200">
                                                <th className="text-left py-2 px-3 font-bold text-stone-700">評価</th>
                                                <th className="text-left py-2 px-3 font-bold text-stone-700">意味</th>
                                                <th className="text-left py-2 px-3 font-bold text-stone-700">判定基準</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-stone-600">
                                            <tr className="border-b border-stone-100">
                                                <td className="py-2 px-3 font-bold text-amber-600">S</td>
                                                <td className="py-2 px-3">非常に優れている</td>
                                                <td className="py-2 px-3">その機能において最高レベル</td>
                                            </tr>
                                            <tr className="border-b border-stone-100">
                                                <td className="py-2 px-3 font-bold text-blue-600">A</td>
                                                <td className="py-2 px-3">優れている</td>
                                                <td className="py-2 px-3">十分な性能、満足度が高い</td>
                                            </tr>
                                            <tr className="border-b border-stone-100">
                                                <td className="py-2 px-3 font-bold text-stone-500">B</td>
                                                <td className="py-2 px-3">標準的</td>
                                                <td className="py-2 px-3">可もなく不可もなし</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 px-3 font-bold text-stone-400">C</td>
                                                <td className="py-2 px-3">やや劣る</td>
                                                <td className="py-2 px-3">改善の余地がある</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 p-3 bg-accent-light rounded-lg">
                                    <p className="text-xs text-stone-600">
                                        <strong>ポイント：</strong>ノイキャン・音質などの評価は<strong>機能の絶対的な性能</strong>を表します。
                                        価格に対する満足度は別途<strong>「コスパ」</strong>として独立評価しているため、高価格帯の製品と低価格帯の製品を公平に比較できます。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4 text-accent">情報の更新について</h2>
                        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                            <ul className="space-y-3 text-stone-600 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-accent text-lg mt-0.5">update</span>
                                    <span><strong>価格情報:</strong> 記事執筆時点のものです。最新価格は各販売サイトでご確認ください</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-accent text-lg mt-0.5">inventory_2</span>
                                    <span><strong>製品情報:</strong> 新製品の発売や廃盤に応じて随時更新しています</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-accent text-lg mt-0.5">leaderboard</span>
                                    <span><strong>ランキング:</strong> ユーザー評価の変化や新製品の登場に応じて定期的に見直しを行っています</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4 text-accent">運営体制</h2>
                        <table className="w-full text-sm text-left border-collapse bg-white rounded-lg overflow-hidden border border-stone-200 shadow-sm">
                            <tbody>
                                <tr className="border-b border-stone-100">
                                    <th className="p-4 bg-stone-50 font-bold text-stone-700 w-1/3">サイト名</th>
                                    <td className="p-4 text-stone-600">ChoiceGuide (チョイスガイド)</td>
                                </tr>
                                <tr className="border-b border-stone-100">
                                    <th className="p-4 bg-stone-50 font-bold text-stone-700">運営責任者</th>
                                    <td className="p-4 text-stone-600">ChoiceGuide 編集部</td>
                                </tr>
                                <tr className="border-b border-stone-100">
                                    <th className="p-4 bg-stone-50 font-bold text-stone-700">お問い合わせ</th>
                                    <td className="p-4 text-stone-600">subaruu0130@gmail.com</td>
                                </tr>
                                <tr>
                                    <th className="p-4 bg-stone-50 font-bold text-stone-700">設立</th>
                                    <td className="p-4 text-stone-600">2025年1月</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
