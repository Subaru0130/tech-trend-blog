import React from 'react';
import Link from 'next/link';

const CATEGORY_ITEMS = [
    {
        href: '/categories/kitchen-appliances',
        icon: 'kitchen',
        title: 'キッチン家電',
        subtitle: '炊飯器・電子レンジ',
    },
    {
        href: '/categories/home-appliances',
        icon: 'local_laundry_service',
        title: '生活家電',
        subtitle: '掃除・洗濯・空調',
    },
    {
        href: '/categories/pc-smartphones',
        icon: 'devices',
        title: 'PC・スマホ',
        subtitle: '周辺機器・作業効率化',
    },
    {
        href: '/categories/audio',
        icon: 'headphones',
        title: 'オーディオ',
        subtitle: 'イヤホン・スピーカー',
    },
    {
        href: '/categories/interior',
        icon: 'chair',
        title: 'インテリア',
        subtitle: 'チェア・デスク',
    },
    {
        href: '/categories/beauty-health',
        icon: 'health_and_beauty',
        title: '美容・健康',
        subtitle: 'ドライヤー・ケア',
    },
];

export default function CategoryList() {
    return (
        <section className="py-20 md:py-24 bg-white border-t border-border-color" id="categories">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-primary flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-accent rounded-full"></span>
                            気になるジャンルから選ぶ
                        </h2>
                        <p className="mt-3 text-text-sub text-sm font-medium">
                            生活に合うアイテムをカテゴリごとに比較して、後悔しにくい選び方をまとめています。
                        </p>
                    </div>
                    <Link className="hidden md:flex items-center gap-1 text-sm font-bold text-accent hover:text-accent-dark transition-colors group" href="/categories">
                        全カテゴリを見る <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {CATEGORY_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            className="group bg-surface-subtle hover:bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 border border-transparent hover:border-accent/20 hover:shadow-card-hover"
                            href={item.href}
                        >
                            <div className="mb-4 size-14 rounded-full bg-white group-hover:bg-accent-light flex items-center justify-center shadow-sm text-primary group-hover:text-accent transition-colors duration-300 ring-1 ring-border-color/50 group-hover:ring-accent/20">
                                <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
                            </div>
                            <h3 className="font-bold text-sm text-primary mb-1">{item.title}</h3>
                            <span className="text-[10px] text-text-sub">{item.subtitle}</span>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg bg-surface-subtle text-sm font-bold text-text-main border border-border-color" href="/categories">
                        全カテゴリ一覧 <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
