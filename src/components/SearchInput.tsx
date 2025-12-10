'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchInput() {
    const [term, setTerm] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (term.trim()) {
            router.push(`/search?q=${encodeURIComponent(term)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative group">
            <div className="flex items-center bg-stone-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-slate-200 transition-all border border-transparent focus-within:border-slate-300 focus-within:bg-white w-full md:w-64">
                <Search className="w-4 h-4 text-stone-400 group-focus-within:text-slate-600 mr-2" />
                <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="記事を検索..."
                    className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-stone-400 w-full"
                />
            </div>
        </form>
    );
}
