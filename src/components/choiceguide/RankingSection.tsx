
import React from 'react';
import { RANKING_ITEMS } from './constants';

const RankingSection: React.FC = () => {
    const getItemByRank = (rank: number) => RANKING_ITEMS.find(item => item.rank === rank);

    const rank1 = getItemByRank(1);
    const rank2 = getItemByRank(2);
    const rank3 = getItemByRank(3);

    if (!rank1 || !rank2 || !rank3) return null;

    return (
        <section className="py-20 md:py-28 bg-white dark:bg-[#1a202c]" id="ranking">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <span className="inline-block py-1 px-3 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold tracking-wider text-xs mb-4 border border-red-100 dark:border-red-800">Monthly Recommendation</span>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                            今月の<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">ベストバイ</span><br className="md:hidden" />
                            決定版ランキング
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-4 text-base max-w-2xl">
                            今月のテーマは「完全ワイヤレスイヤホン」。<br className="hidden md:inline" />
                            音質・ノイズキャンセリング・装着感の3点で徹底比較し、<br className="hidden md:inline" />今買うべき「間違いない」3機種を厳選しました。
                        </p>
                    </div>
                    <a className="hidden md:inline-flex items-center gap-2 text-primary font-bold hover:text-primary-hover transition-colors group px-6 py-3 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20" href="#">
                        全てのランキングを見る <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </a>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Rank 1 */}
                    <div className="relative bg-white dark:bg-[#1f2937] rounded-3xl border border-yellow-200 dark:border-yellow-900/50 shadow-soft overflow-hidden flex flex-col transform lg:-translate-y-6 z-10 lg:order-2 ring-4 ring-yellow-50 dark:ring-yellow-900/20">
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-yellow-300 to-yellow-500"></div>
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-lg shadow-md flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px] filled">crown</span>
                                <span className="font-black text-sm">1位</span>
                            </div>
                            <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur text-yellow-700 dark:text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-yellow-100 dark:border-yellow-900/30">{rank1.label}</span>
                        </div>
                        <div className="p-8 pb-0 flex-grow">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pt-8 leading-snug">{rank1.name}</h3>
                            <div className="aspect-square w-full bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden mb-8 relative group">
                                <img alt="Rank 1 Product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={rank1.image} />
                            </div>
                            <div className="bg-yellow-50/50 dark:bg-yellow-900/10 rounded-xl p-4 mb-6 flex items-center justify-between border border-yellow-100 dark:border-yellow-900/30">
                                <div className="text-xs font-bold text-yellow-700 dark:text-yellow-400">専門家スコア</div>
                                <div className="flex items-end gap-2 text-yellow-500">
                                    <span className="text-3xl font-black leading-none tracking-tighter">{rank1.score.toFixed(1)}</span>
                                    <div className="flex pb-1.5 gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="material-symbols-outlined text-[18px] filled">star</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-8 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                {rank1.features?.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-0.5 size-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 shrink-0">
                                            <span className="material-symbols-outlined text-[14px]">check</span>
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-8 pt-0 mt-auto">
                            <a className="group block w-full text-center bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-1 mb-4" href={rank1.priceLink}>
                                最安値をチェック
                                <span className="material-symbols-outlined align-bottom text-sm ml-1 opacity-70 group-hover:opacity-100">open_in_new</span>
                            </a>
                            <a className="block w-full text-center text-xs text-gray-400 hover:text-primary transition-colors underline decoration-gray-300 underline-offset-4" href={rank1.reviewLink}>詳細レビューを読む</a>
                        </div>
                    </div>

                    {/* Rank 2 */}
                    <div className="relative bg-white dark:bg-[#1f2937] rounded-3xl border border-gray-100 dark:border-gray-700 shadow-card flex flex-col lg:order-1">
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                            <div className="bg-gray-400 text-white px-3 py-1 rounded-lg shadow-sm flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] filled">crown</span>
                                <span className="font-bold text-xs">2位</span>
                            </div>
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">{rank2.label}</span>
                        </div>
                        <div className="p-6 pb-0 flex-grow">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5 pt-8">{rank2.name}</h3>
                            <div className="aspect-square w-full bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden mb-6 relative group">
                                <img alt="Rank 2 Product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={rank2.image} />
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-5 flex items-center justify-between">
                                <div className="text-xs font-bold text-gray-500">専門家スコア</div>
                                <div className="flex items-end gap-1.5 text-yellow-500">
                                    <span className="text-2xl font-bold leading-none">{rank2.score.toFixed(1)}</span>
                                    <div className="flex pb-1 gap-0.5">
                                        {[...Array(4)].map((_, i) => (
                                            <span key={i} className="material-symbols-outlined text-[16px] filled">star</span>
                                        ))}
                                        <span className="material-symbols-outlined text-[16px] filled">star_half</span>
                                    </div>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                {rank2.features?.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <span className="material-symbols-outlined text-gray-400 text-[18px] shrink-0">check_circle</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-6 pt-0 mt-auto">
                            <a className="block w-full text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white hover:border-primary hover:text-primary dark:hover:border-primary font-bold py-3.5 rounded-xl transition-all mb-3 shadow-sm hover:shadow" href={rank2.priceLink}>
                                価格をチェック
                            </a>
                            <a className="block w-full text-center text-xs text-gray-400 hover:text-primary transition-colors underline decoration-gray-300 underline-offset-4" href={rank2.reviewLink}>詳細レビューを読む</a>
                        </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="relative bg-white dark:bg-[#1f2937] rounded-3xl border border-gray-100 dark:border-gray-700 shadow-card flex flex-col lg:order-3">
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                            <div className="bg-[#b46d49] text-white px-3 py-1 rounded-lg shadow-sm flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] filled">crown</span>
                                <span className="font-bold text-xs">3位</span>
                            </div>
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">{rank3.label}</span>
                        </div>
                        <div className="p-6 pb-0 flex-grow">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5 pt-8">{rank3.name}</h3>
                            <div className="aspect-square w-full bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden mb-6 relative group">
                                <img alt="Rank 3 Product" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={rank3.image} />
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-5 flex items-center justify-between">
                                <div className="text-xs font-bold text-gray-500">専門家スコア</div>
                                <div className="flex items-end gap-1.5 text-yellow-500">
                                    <span className="text-2xl font-bold leading-none">{rank3.score.toFixed(1)}</span>
                                    <div className="flex pb-1 gap-0.5">
                                        {[...Array(4)].map((_, i) => (
                                            <span key={i} className="material-symbols-outlined text-[16px] filled">star</span>
                                        ))}
                                        <span className="material-symbols-outlined text-[16px] text-gray-300">star</span>
                                    </div>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                {rank3.features?.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <span className="material-symbols-outlined text-gray-400 text-[18px] shrink-0">check_circle</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-6 pt-0 mt-auto">
                            <a className="block w-full text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white hover:border-primary hover:text-primary dark:hover:border-primary font-bold py-3.5 rounded-xl transition-all mb-3 shadow-sm hover:shadow" href={rank3.priceLink}>
                                価格をチェック
                            </a>
                            <a className="block w-full text-center text-xs text-gray-400 hover:text-primary transition-colors underline decoration-gray-300 underline-offset-4" href={rank3.reviewLink}>詳細レビューを読む</a>
                        </div>
                    </div>
                </div>
                <div className="mt-12 text-center md:hidden">
                    <a className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-50 text-primary font-bold hover:bg-blue-100 transition-colors" href="#">
                        全てのランキングを見る <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default RankingSection;
