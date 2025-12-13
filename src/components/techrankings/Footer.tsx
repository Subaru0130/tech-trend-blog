
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 mt-12 py-12">
            <div className="max-w-[1100px] mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="size-6 text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-brand-blue">equalizer</span>
                            </div>
                            <h2 className="text-text-main dark:text-white text-lg font-bold font-display">TechRankings</h2>
                        </div>
                        <p className="text-gray-500 text-xs leading-relaxed">
                            最新のテクノロジー製品を公平かつ徹底的にレビュー。あなたに最適な一台を見つけるお手伝いをします。
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-text-main dark:text-white mb-4 text-sm">カテゴリー</h3>
                        <ul className="space-y-3 text-xs text-gray-500">
                            {['ヘッドホン・イヤホン', 'パソコン・タブレット', 'スマートフォン', 'カメラ・撮影機材'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="hover:text-brand-blue hover:underline transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-text-main dark:text-white mb-4 text-sm">サイト情報</h3>
                        <ul className="space-y-3 text-xs text-gray-500">
                            {['運営者情報', '編集ポリシー', '採用情報', 'お問い合わせ'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="hover:text-brand-blue hover:underline transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-text-main dark:text-white mb-4 text-sm">SNSをフォロー</h3>
                        <div className="flex gap-3">
                            {['Tw', 'Fb', 'Ig'].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    className="size-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 hover:bg-brand-blue hover:text-white transition-all duration-300"
                                >
                                    <span className="font-bold text-xs">{social}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400">
                    <p>© 2024 TechRankings. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-text-main transition-colors">プライバシーポリシー</a>
                        <a href="#" className="hover:text-text-main transition-colors">利用規約</a>
                        <a href="#" className="hover:text-text-main transition-colors">アフィリエイト・免責事項</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
