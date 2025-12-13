import Link from 'next/link';
import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-primary text-white pt-16 pb-10 border-t border-primary-hover">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    <div className="md:col-span-5 lg:col-span-4">
                        <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
                            <div className="size-8 bg-white text-primary rounded flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">checklist</span>
                            </div>
                            <span className="text-xl font-black tracking-tight font-sans">ChoiceGuide</span>
                        </Link>
                        <p className="text-stone-400 text-sm leading-relaxed mb-8 max-w-sm">
                            ChoiceGuideは、あなたの「失敗しない買い物」をサポートする製品比較メディアです。専門家の知見と検証データを元に、公平なランキング情報をお届けします。
                        </p>
                        <div className="flex gap-4">
                            <a className="text-stone-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full" href="#"><span className="material-symbols-outlined">public</span></a>
                            <a className="text-stone-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full" href="#"><span className="material-symbols-outlined">rss_feed</span></a>
                        </div>
                    </div>
                    <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div>
                            <h3 className="font-bold text-sm mb-6 text-stone-200 uppercase tracking-wide">人気ランキング</h3>
                            <ul className="space-y-3 text-sm text-stone-400">
                                <li><a className="hover:text-accent transition-colors inline-block hover:translate-x-1 duration-200" href="#">PC・周辺機器</a></li>
                                <li><a className="hover:text-accent transition-colors inline-block hover:translate-x-1 duration-200" href="#">スマートフォン・タブレット</a></li>
                                <li><a className="hover:text-accent transition-colors inline-block hover:translate-x-1 duration-200" href="#">キッチン・生活家電</a></li>
                                <li><a className="hover:text-accent transition-colors inline-block hover:translate-x-1 duration-200" href="#">美容・健康家電</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm mb-6 text-stone-200 uppercase tracking-wide">サイト情報</h3>
                            <ul className="space-y-3 text-sm text-stone-400">
                                <li><a className="hover:text-accent transition-colors inline-block hover:translate-x-1 duration-200" href="#">ChoiceGuideについて</a></li>
                                <li><a className="hover:text-accent transition-colors inline-block hover:translate-x-1 duration-200" href="#">ランキングの根拠・基準</a></li>
                                <li><a className="hover:text-accent transition-colors inline-block hover:translate-x-1 duration-200" href="#">運営会社情報</a></li>
                                <li><a className="hover:text-accent transition-colors inline-block hover:translate-x-1 duration-200" href="#">お問い合わせ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm mb-6 text-stone-200 uppercase tracking-wide">規約・ポリシー</h3>
                            <ul className="space-y-3 text-sm text-stone-400">
                                <li><a className="hover:text-accent transition-colors inline-block hover:translate-x-1 duration-200" href="#">プライバシーポリシー</a></li>
                                <li><a className="hover:text-accent transition-colors inline-block hover:translate-x-1 duration-200" href="#">利用規約</a></li>
                                <li><a className="hover:text-accent transition-colors inline-block hover:translate-x-1 duration-200" href="#">アフィリエイト・広告掲載</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="border-t border-primary-hover pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-stone-500 font-medium">© 2024 ChoiceGuide. All rights reserved.</p>
                    <div className="text-[10px] text-stone-600 font-bold uppercase tracking-wider">
                        Reliable Product Reviews & Comparisons
                    </div>
                </div>
            </div>
        </footer>
    );
}
