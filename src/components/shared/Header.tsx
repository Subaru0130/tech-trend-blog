import Link from 'next/link';
import React from 'react';

export default function Header() {
    return (
        <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border-color/60 transition-all duration-300">
            <div className="px-4 md:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-8 lg:gap-12">
                    <Link href="/" aria-label="ChoiceGuide Home" className="flex items-center gap-2.5 group">
                        <div className="size-9 bg-primary text-white rounded-lg flex items-center justify-center shadow-sm group-hover:bg-accent transition-colors duration-300">
                            <span className="material-symbols-outlined text-[20px]">checklist</span>
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-lg font-extrabold tracking-tight text-primary leading-none group-hover:text-accent transition-colors font-sans">ChoiceGuide</span>
                        </div>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-8">
                        <Link href="/rankings/prototype" className="text-sm font-bold text-text-sub hover:text-accent transition-colors py-2 relative group">
                            おすすめランキング
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                        </Link>
                        <Link href="/categories/prototype" className="text-sm font-bold text-text-sub hover:text-accent transition-colors py-2 relative group">
                            カテゴリ一覧
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                        </Link>
                        <Link href="/reviews/prototype" className="text-sm font-bold text-text-sub hover:text-accent transition-colors py-2 relative group">
                            新着レビュー
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
