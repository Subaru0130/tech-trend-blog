
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-gray-200 pt-16 pb-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <a href="#" className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-2xl text-primary">equalizer</span>
                            <span className="text-xl font-black tracking-tighter text-gray-900">MonoKaku.</span>
                        </a>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                            「モノ」を「確」かに比較する。ガジェット選びの失敗をなくすための、公正で詳細な比較レビューサイトです。
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 text-sm">カテゴリ</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            {['PC・周辺機器', 'オーディオ', 'スマート家電', 'カメラ'].map((item) => (
                                <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 text-sm">インフォメーション</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            {['運営会社', 'プライバシーポリシー', 'アフィリエイトについて', 'お問い合わせ'].map((item) => (
                                <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-400">© 2024 MonoKaku. All rights reserved.</p>
                    <div className="flex gap-4">
                        <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors"><span className="material-symbols-outlined text-[20px]">share</span></a>
                        <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors"><span className="material-symbols-outlined text-[20px]">rss_feed</span></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
