import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-primary text-white pt-16 pb-10 border-t border-primary-hover">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    <div className="md:col-span-5 lg:col-span-4">
                        <a className="flex items-center gap-3 mb-6 group w-fit" href="#">
                            <div className="size-8 bg-white text-primary rounded flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">checklist</span>
                            </div>
                            <span className="text-xl font-black tracking-tight font-sans">ChoiceGuide</span>
                        </a>
                        <p className="text-stone-400 text-sm leading-relaxed mb-8 max-w-sm">
                            ChoiceGuideは、あなたの「失敗しない買い物」をサポートする製品比較メディアです。膨大なデータ分析と独自の評価基準を元に、公平なランキング情報をお届けします。
                        </p>
                        <div className="flex gap-4">
                            <a className="text-stone-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full" href="#"><span className="material-symbols-outlined">public</span></a>
                            <a className="text-stone-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full" href="#"><span className="material-symbols-outlined">rss_feed</span></a>
                        </div>
                    </div>
                    <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-center items-end h-full">
                        {/* Empty space or minimal links if absolutely needed, but user said DELETE ALL */}
                    </div>
                </div>
                <div className="border-t border-primary-hover pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-text-muted text-sm orders-2 md:order-1">
                            &copy; {new Date().getFullYear()} ChoiceGuide. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 order-1 md:order-2">
                            <a href="/about" className="text-sm font-bold text-text-sub hover:text-accent transition-colors">運営者情報</a>
                            <a href="/privacy" className="text-sm font-bold text-text-sub hover:text-accent transition-colors">プライバシーポリシー</a>
                            <a href="/contact" className="text-sm font-bold text-text-sub hover:text-accent transition-colors">お問い合わせ</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
