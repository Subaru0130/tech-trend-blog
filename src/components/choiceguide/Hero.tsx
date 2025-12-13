
import React from 'react';

const Hero: React.FC = () => {
    return (
        <section className="relative overflow-hidden hero-pattern pt-16 pb-20 md:pt-28 md:pb-32">
            <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
            </div>
            <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/50 shadow-sm mb-8 animate-fade-in-up">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 tracking-wide">2024年最新家電ガイド公開中</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.15] tracking-tight mb-8">
                            毎日の暮らしを<br className="hidden lg:block" />
                            <span className="text-primary relative inline-block mx-2 lg:mx-0">
                                アップデート
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-300 -z-10 opacity-70" preserveAspectRatio="none" viewBox="0 0 100 10">
                                    <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="8"></path>
                                </svg>
                            </span>
                            する一台。
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                            後悔しない家電選びのために。<br className="md:hidden" />
                            専門家の徹底比較とユーザーの本音レビューで、<br className="hidden md:inline" />あなたにぴったりの製品が見つかります。
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                            <a className="group bg-primary hover:bg-primary-hover text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3" href="#ranking">
                                <span>ランキングを見る</span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                            <a className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold py-4 px-10 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:shadow-md" href="#categories">
                                カテゴリを探す
                            </a>
                        </div>
                        <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 border-t border-gray-100 dark:border-gray-800 pt-8">
                            <div className="text-center lg:text-left">
                                <p className="text-2xl font-black text-gray-900 dark:text-white">500<span className="text-sm font-bold text-primary ml-1">+</span></p>
                                <p className="text-xs text-gray-500 font-bold mt-1">レビュー記事数</p>
                            </div>
                            <div className="w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
                            <div className="text-center lg:text-left">
                                <p className="text-2xl font-black text-gray-900 dark:text-white">50<span className="text-sm font-bold text-primary ml-1">万</span></p>
                                <p className="text-xs text-gray-500 font-bold mt-1">月間利用者数</p>
                            </div>
                            <div className="w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
                            <div className="text-center lg:text-left">
                                <p className="text-2xl font-black text-gray-900 dark:text-white">No.1</p>
                                <p className="text-xs text-gray-500 font-bold mt-1">信頼度評価</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full max-w-[540px] lg:max-w-none relative perspective-1000">
                        <div className="relative bg-white dark:bg-gray-800 rounded-[2rem] p-4 shadow-2xl border border-gray-100 dark:border-gray-700 rotate-y-3 transform transition-transform duration-500 hover:rotate-y-0">
                            <div className="aspect-[4/3] rounded-2xl overflow-hidden relative shadow-inner">
                                <img alt="Modern interior with gadgets" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                <div className="absolute bottom-6 right-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl rounded-2xl p-4 flex items-center gap-4 border border-white/20 dark:border-gray-700 max-w-[320px] animate-float">
                                    <div className="size-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 shadow-sm">
                                        <img alt="Product thumbnail" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800" />
                                    </div>
                                    <div>
                                        <div className="flex text-yellow-400 text-[14px] mb-1 gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className="material-symbols-outlined filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                            ))}
                                        </div>
                                        <p className="text-sm font-bold text-gray-800 dark:text-white">高評価アイテム続々追加中</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -z-10 -top-12 -right-12 w-64 h-64 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                        <div className="absolute -z-10 -bottom-12 -left-12 w-64 h-64 bg-purple-100 dark:bg-purple-900/30 rounded-full blur-3xl opacity-60"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
