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
        <div className="w-full max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-slate-800 tracking-tight">
                何をお探しですか？
            </h2>
            <form onSubmit={handleSearch} className="relative group mb-6">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-stone-400 group-focus-within:text-slate-900 transition-colors" />
                </div>
                <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="キーワードで検索（例：ドライヤー、加湿器）"
                    className="block w-full pl-14 pr-6 py-4 bg-white border border-stone-200 rounded-xl text-lg shadow-sm placeholder:text-stone-400 focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none text-slate-900 font-medium"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-6 rounded-lg font-bold hover:bg-black transition-colors shadow-md"
                >
                    検索
                </button>
            </form>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-stone-500">
                <span>注目ワード:</span>
                <button onClick={() => router.push('/search?q=空気清浄機')} className="px-3 py-1 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors text-stone-700">空気清浄機</button>
                <button onClick={() => router.push('/search?q=ドライヤー')} className="px-3 py-1 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors text-stone-700">ドライヤー</button>
                <button onClick={() => router.push('/search?q=加湿器')} className="px-3 py-1 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors text-stone-700">加湿器</button>
            </div>
        </div>
    );
}
