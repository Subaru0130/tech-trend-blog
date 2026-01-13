import React from 'react';

export default function CategoryList() {
    return (
        <section className="py-20 md:py-24 bg-white border-t border-border-color" id="categories">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-primary flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-accent rounded-full"></span>
                            探したいモノから選ぶ
                        </h2>
                        <p className="mt-3 text-text-sub text-sm font-medium">生活を便利にするアイテムをカテゴリごとに比較・紹介しています。</p>
                    </div>
                    <a className="hidden md:flex items-center gap-1 text-sm font-bold text-accent hover:text-accent-dark transition-colors group" href="/categories">
                        全カテゴリを見る <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                    </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <a className="group bg-surface-subtle hover:bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 border border-transparent hover:border-accent/20 hover:shadow-card-hover" href="/categories/kitchen-appliances">
                        <div className="mb-4 size-14 rounded-full bg-white group-hover:bg-accent-light flex items-center justify-center shadow-sm text-primary group-hover:text-accent transition-colors duration-300 ring-1 ring-border-color/50 group-hover:ring-accent/20">
                            <span className="material-symbols-outlined text-[28px]">kitchen</span>
                        </div>
                        <h3 className="font-bold text-sm text-primary mb-1">キッチン家電</h3>
                        <span className="text-[10px] text-text-sub">冷蔵庫・レンジ</span>
                    </a>
                    <a className="group bg-surface-subtle hover:bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 border border-transparent hover:border-accent/20 hover:shadow-card-hover" href="/categories/home-appliances">
                        <div className="mb-4 size-14 rounded-full bg-white group-hover:bg-accent-light flex items-center justify-center shadow-sm text-primary group-hover:text-accent transition-colors duration-300 ring-1 ring-border-color/50 group-hover:ring-accent/20">
                            <span className="material-symbols-outlined text-[28px]">local_laundry_service</span>
                        </div>
                        <h3 className="font-bold text-sm text-primary mb-1">生活家電</h3>
                        <span className="text-[10px] text-text-sub">洗濯機・掃除機</span>
                    </a>
                    <a className="group bg-surface-subtle hover:bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 border border-transparent hover:border-accent/20 hover:shadow-card-hover" href="/categories/pc-smartphones">
                        <div className="mb-4 size-14 rounded-full bg-white group-hover:bg-accent-light flex items-center justify-center shadow-sm text-primary group-hover:text-accent transition-colors duration-300 ring-1 ring-border-color/50 group-hover:ring-accent/20">
                            <span className="material-symbols-outlined text-[28px]">devices</span>
                        </div>
                        <h3 className="font-bold text-sm text-primary mb-1">PC・スマホ</h3>
                        <span className="text-[10px] text-text-sub">パソコン・周辺機器</span>
                    </a>
                    <a className="group bg-surface-subtle hover:bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 border border-transparent hover:border-accent/20 hover:shadow-card-hover" href="/categories/audio">
                        <div className="mb-4 size-14 rounded-full bg-white group-hover:bg-accent-light flex items-center justify-center shadow-sm text-primary group-hover:text-accent transition-colors duration-300 ring-1 ring-border-color/50 group-hover:ring-accent/20">
                            <span className="material-symbols-outlined text-[28px]">headphones</span>
                        </div>
                        <h3 className="font-bold text-sm text-primary mb-1">オーディオ</h3>
                        <span className="text-[10px] text-text-sub">イヤホン・スピーカー</span>
                    </a>
                    <a className="group bg-surface-subtle hover:bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 border border-transparent hover:border-accent/20 hover:shadow-card-hover" href="/categories/interior">
                        <div className="mb-4 size-14 rounded-full bg-white group-hover:bg-accent-light flex items-center justify-center shadow-sm text-primary group-hover:text-accent transition-colors duration-300 ring-1 ring-border-color/50 group-hover:ring-accent/20">
                            <span className="material-symbols-outlined text-[28px]">chair</span>
                        </div>
                        <h3 className="font-bold text-sm text-primary mb-1">インテリア</h3>
                        <span className="text-[10px] text-text-sub">家具・収納</span>
                    </a>
                    <a className="group bg-surface-subtle hover:bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 border border-transparent hover:border-accent/20 hover:shadow-card-hover" href="/categories/beauty-health">
                        <div className="mb-4 size-14 rounded-full bg-white group-hover:bg-accent-light flex items-center justify-center shadow-sm text-primary group-hover:text-accent transition-colors duration-300 ring-1 ring-border-color/50 group-hover:ring-accent/20">
                            <span className="material-symbols-outlined text-[28px]">health_and_beauty</span>
                        </div>
                        <h3 className="font-bold text-sm text-primary mb-1">美容・健康</h3>
                        <span className="text-[10px] text-text-sub">ドライヤー・ケア</span>
                    </a>
                </div>
                <div className="mt-8 text-center md:hidden">
                    <a className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg bg-surface-subtle text-sm font-bold text-text-main border border-border-color" href="/categories">
                        全カテゴリ一覧 <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
