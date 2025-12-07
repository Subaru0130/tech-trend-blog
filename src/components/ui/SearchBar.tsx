'use client';

import { Search } from 'lucide-react';

export function SearchBar() {
    return (
        <div className="relative w-full max-w-md">
            <div className="relative">
                <input
                    type="text"
                    placeholder="キーワードで検索"
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
        </div>
    );
}
