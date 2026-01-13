
import React from 'react';
import Link from 'next/link';

export default function CategorySidebar() {
    return (
        <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-soft">
                <h3 className="font-bold text-text-heading mb-4 flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-accent filled" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                    人気の記事ランキング
                </h3>
                <div className="space-y-4">
                    {/* 人気記事ランキングデータが蓄積され次第表示されます */}
                    <p className="text-xs text-stone-400">集計中...</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-soft">
                <h3 className="font-bold text-text-heading mb-4 flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-stone-400">label</span>
                    人気のキーワード
                </h3>
                <div className="flex flex-wrap gap-2">
                    <a className="px-2.5 py-1 text-xs font-medium bg-stone-50 text-stone-600 rounded-md border border-stone-100 hover:border-primary hover:text-primary transition-colors" href="#">#省エネ</a>
                    <a className="px-2.5 py-1 text-xs font-medium bg-stone-50 text-stone-600 rounded-md border border-stone-100 hover:border-primary hover:text-primary transition-colors" href="#">#ファミリー</a>
                    <a className="px-2.5 py-1 text-xs font-medium bg-stone-50 text-stone-600 rounded-md border border-stone-100 hover:border-primary hover:text-primary transition-colors" href="#">#一人暮らし</a>
                    <a className="px-2.5 py-1 text-xs font-medium bg-stone-50 text-stone-600 rounded-md border border-stone-100 hover:border-primary hover:text-primary transition-colors" href="#">#時短</a>
                    <a className="px-2.5 py-1 text-xs font-medium bg-stone-50 text-stone-600 rounded-md border border-stone-100 hover:border-primary hover:text-primary transition-colors" href="#">#デザイン家電</a>
                    <a className="px-2.5 py-1 text-xs font-medium bg-stone-50 text-stone-600 rounded-md border border-stone-100 hover:border-primary hover:text-primary transition-colors" href="#">#コスパ</a>
                </div>
            </div>
        </aside>
    );
}
