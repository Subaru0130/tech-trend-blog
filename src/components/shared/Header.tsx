"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border-color/60 transition-all duration-300">
            <div className="px-4 md:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-8 lg:gap-12">
                    <Link aria-label="ChoiceGuide Home" className="flex items-center gap-2.5 group" href="/">
                        <div className="size-9 bg-accent text-white rounded-lg flex items-center justify-center shadow-sm group-hover:bg-primary transition-colors duration-300">
                            <span className="material-symbols-outlined text-[20px]">checklist</span>
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-lg font-extrabold tracking-tight text-accent leading-none group-hover:text-primary transition-colors font-sans">ChoiceGuide</span>
                        </div>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-8">
                        <Link className="text-sm font-bold text-text-sub hover:text-accent transition-colors py-2 relative group" href="/">
                            おすすめランキング
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                        </Link>
                        <Link className="text-sm font-bold text-text-sub hover:text-accent transition-colors py-2 relative group" href="/categories">
                            カテゴリ一覧
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex relative group w-64 lg:w-72 transition-all focus-within:w-80 duration-300">
                        <form onSubmit={handleSearch} className="w-full relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">search</span>
                            <input
                                aria-label="サイト内検索"
                                className="w-full bg-surface-subtle border-transparent focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/10 rounded-full py-2.5 pl-10 pr-4 text-sm transition-all placeholder-stone-400 text-text-main font-medium shadow-inner"
                                placeholder="商品名、キーワード..."
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                    </div>
                </div>
            </div>
        </header>
    );
}
