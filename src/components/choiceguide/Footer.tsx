
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white dark:bg-[#101622] pt-16 pb-10 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                    <div className="col-span-1">
                        <a className="flex items-center gap-3 mb-6 group" href="/">
                            <div className="size-9 bg-primary text-white rounded-lg flex items-center justify-center shadow-md">
                                <span className="material-symbols-outlined text-[20px]">equalizer</span>
                            </div>
                            <span className="text-xl font-black text-gray-800 dark:text-white tracking-tight">ChoiceGuide</span>
                        </a>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                            賢い買い物のための比較メディア。<br />客観的な分析データと独自の評価基準で、あなたに最適な製品選びをサポートします。
                        </p>
                    </div>
                    {/* Removed dead links sections */}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-6 uppercase tracking-wider">免責事項</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                            当サイトに掲載されている価格やスペック情報は記事執筆時点のものです。最新の情報は各販売店サイトにてご確認ください。当サイトのコンテンツは参考情報であり、購入の最終判断はご自身の責任で行ってください。
                        </p>
                    </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            ※当サイトはアフィリエイト広告を利用しています
                        </p>
                        <p className="text-xs text-gray-400 font-medium">© 2024 ChoiceGuide. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
