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
                        <h2 className="text-xl font-bold mb-4 text-accent">ランキング・評価基準について</h2>
                        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                            <ul className="list-disc ml-5 space-y-2 text-stone-600">
                                <li><strong>機能性:</strong> スペックだけでなく、実生活での使い勝手を重視</li>
                                <li><strong>コストパフォーマンス:</strong> 価格に見合った価値があるか</li>
                                <li><strong>信頼性:</strong> メーカーのサポート体制や耐久性</li>
                                <li><strong>ユーザー評価:</strong> ECサイトやSNSでの実際の声を分析</li>
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
                                    <td className="p-4 text-stone-600">ChoiceGuide 編集部 (運営統括: 山田太郎 ※見本)</td>
                                </tr>
                                <tr className="border-b border-stone-100">
                                    <th className="p-4 bg-stone-50 font-bold text-stone-700">お問い合わせ</th>
                                    <td className="p-4 text-stone-600">info@choiceguide.jp（平日10:00-18:00）</td>
                                </tr>
                                <tr>
                                    <th className="p-4 bg-stone-50 font-bold text-stone-700">設立</th>
                                    <td className="p-4 text-stone-600">2024年4月</td>
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
