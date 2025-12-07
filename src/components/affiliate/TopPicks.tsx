import React from 'react';
import { Crown, Zap, Home } from 'lucide-react';

interface TopPickItem {
    rank: number;
    id: string;
    label: string;
    labelColor: string;
    title: string;
    icon?: React.ReactNode;
}

interface TopPicksProps {
    items: TopPickItem[];
}

export function TopPicks({ items }: TopPicksProps) {
    return (
        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6 mb-12 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900">
                <span className="text-2xl">⚡</span> 忙しい人のための3行まとめ
            </h3>
            <ul className="space-y-4">
                {items.map((item) => (
                    <li key={item.id}>
                        <a href={`#${item.id}`} className="flex items-center gap-3 group p-2 -mx-2 rounded-lg hover:bg-white hover:shadow-sm transition-all">
                            <span className={`${item.labelColor} text-white text-xs font-bold px-2 py-1 rounded shadow-sm whitespace-nowrap min-w-[60px] text-center`}>
                                {item.label}
                            </span>
                            <span className="font-bold text-slate-800 text-sm md:text-base group-hover:text-primary transition-colors flex-1">
                                {item.title}
                            </span>
                            <span className="text-slate-400 text-xs group-hover:text-primary transition-colors">
                                ➜
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
