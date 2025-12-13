
import React from 'react';

const Sidebar: React.FC = () => {
    return (
        <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
                {/* Price & Stock */}
                <div className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-soft border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-3 py-1 font-bold rounded-bl-lg shadow-sm z-10">最安値</div>
                    <h3 className="font-bold text-base mb-5 text-text-main dark:text-white flex items-center gap-2 pb-3 border-b border-gray-50 dark:border-gray-700">
                        <span className="material-symbols-outlined text-gray-400">shopping_bag</span>
                        価格・在庫情報
                    </h3>
                    <div className="space-y-3">
                        <a href="#" className="block group">
                            <div className="flex items-center justify-between p-3 rounded-lg border-2 border-red-100 hover:border-red-300 bg-red-50/30 hover:bg-red-50 transition-all cursor-pointer relative shadow-sm hover:shadow-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded bg-white border border-gray-100 flex items-center justify-center p-1.5 shadow-sm">
                                        {/* Amazon Logo SVG Placeholder */}
                                        <svg className="w-full h-full text-black" viewBox="0 0 24 24"><path d="M15.93 17.09c-2.43 0-4.51-1.27-5.55-3.11l1.48-1.48c.67 1.15 1.94 1.93 3.38 1.93 2.16 0 3.92-1.76 3.92-3.92s-1.76-3.92-3.92-3.92c-2.16 0-3.92 1.76-3.92 3.92 0 .35.05.69.13 1.01l-2.06 1.03c-.2-.65-.32-1.34-.32-2.04 0-4.09 3.31-7.4 7.4-7.4s7.4 3.31 7.4 7.4-3.31 7.4-7.4 7.4z" fill="currentColor"></path></svg>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-text-main dark:text-white">Amazon.co.jp</span>
                                        <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded w-fit mt-0.5">在庫あり・送料無料</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-xl text-[#c41e3a]">¥46,800</div>
                                </div>
                            </div>
                        </a>
                        <a href="#" className="block group">
                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded bg-white border border-gray-100 flex items-center justify-center p-1 shadow-sm">
                                        <span className="font-black text-sm text-[#BF0000]">R</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-text-main dark:text-white">楽天市場</span>
                                        <span className="text-[10px] text-gray-500 mt-0.5">ポイント 1%還元</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg text-text-main dark:text-white">¥46,800</div>
                                </div>
                            </div>
                        </a>
                        <a href="#" className="block group">
                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded bg-white border border-gray-100 flex items-center justify-center p-1 shadow-sm">
                                        <span className="font-black text-xs text-red-600">Y!</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-text-main dark:text-white">Yahoo!</span>
                                        <span className="text-[10px] text-gray-500 mt-0.5">PayPayポイント付与</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg text-text-main dark:text-white">¥47,500</div>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-center">
                        <p className="text-[10px] text-gray-400 mb-2">価格情報の更新日: 2024年10月24日</p>
                        <a href="#" className="text-xs text-brand-blue hover:underline flex items-center justify-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[14px]">history</span> 価格推移グラフを見る
                        </a>
                    </div>
                </div>

                {/* Related Products */}
                <div className="bg-white dark:bg-surface-dark rounded-xl p-6 shadow-soft border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">この商品を見た人はこれもチェック</h3>
                    <div className="space-y-4">
                        <a href="#" className="flex gap-4 group items-center">
                            <div className="w-16 h-16 rounded-lg bg-gray-50 dark:bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-200">
                                <div className="w-full h-full bg-contain bg-no-repeat bg-center group-hover:scale-110 transition-transform duration-300" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=200')" }}></div>
                            </div>
                            <div>
                                <h4 className="font-medium text-xs text-text-main dark:text-white group-hover:text-brand-blue transition-colors line-clamp-2 leading-relaxed">Bose QuietComfort 45 ワイヤレスノイズキャンセリング</h4>
                                <p className="text-sm text-text-main font-bold mt-1">¥39,600</p>
                            </div>
                        </a>
                        <a href="#" className="flex gap-4 group items-center">
                            <div className="w-16 h-16 rounded-lg bg-gray-50 dark:bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-200">
                                <div className="w-full h-full bg-contain bg-no-repeat bg-center group-hover:scale-110 transition-transform duration-300" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1628202926206-c63a34b1618f?auto=format&fit=crop&q=80&w=200')" }}></div>
                            </div>
                            <div>
                                <h4 className="font-medium text-xs text-text-main dark:text-white group-hover:text-brand-blue transition-colors line-clamp-2 leading-relaxed">Apple AirPods Max ワイヤレスヘッドホン</h4>
                                <p className="text-sm text-text-main font-bold mt-1">¥84,800</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Newsletter */}
                <div className="bg-gradient-to-br from-brand-blue to-blue-700 rounded-xl p-6 text-center text-white shadow-soft relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="font-bold text-sm mb-2">ニュースレター登録</p>
                        <p className="text-xs text-blue-100 mb-4 leading-relaxed opacity-90">最新のガジェット情報や限定セール情報をお届けします。</p>
                        <button className="w-full bg-white text-brand-blue font-bold text-xs py-2.5 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">無料で登録する</button>
                    </div>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-300 opacity-20 rounded-full blur-2xl"></div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
