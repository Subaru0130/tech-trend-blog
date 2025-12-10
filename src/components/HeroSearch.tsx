'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function HeroSearch() {
    const [term, setTerm] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (term.trim()) {
            router.push(`/search?q=${encodeURIComponent(term)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto mt-16">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-stone-400 group-focus-within:text-slate-900 transition-colors" />
                </div>
                <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="気になるキーワードを入力（例：ドライヤー、加湿器）..."
                    className="block w-full pl-16 pr-6 py-5 bg-white border-2 border-slate-100 rounded-full text-lg shadow-lg placeholder:text-stone-400 focus:ring-4 focus:ring-slate-100 focus:border-slate-800 transition-all outline-none text-slate-900 font-medium"
                />
                <button
                    type="submit"
                    className="absolute right-3 top-2.5 bottom-2.5 bg-slate-900 text-white px-6 rounded-full font-bold hover:bg-black transition-colors"
                >
                    検索
                </button>
            </div>
            <p className="text-center text-sm text-stone-500 mt-4">
                人気の検索ワード：
                <span className="ml-2 font-medium text-slate-700">空気清浄機</span>、
                <span className="ml-2 font-medium text-slate-700">加湿器</span>、
                <span className="ml-2 font-medium text-slate-700">ドライヤー</span>
            </p>
        </form>
    );
}
