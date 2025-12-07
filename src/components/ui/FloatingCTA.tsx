import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface FloatingCTAProps {
    productName: string;
    affiliateLink: string;
}

export function FloatingCTA({ productName, affiliateLink }: FloatingCTAProps) {
    if (!affiliateLink) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-4 duration-500">
            <a
                href={affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-slate-900/95 backdrop-blur-sm text-white font-bold py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-between group hover:scale-[1.02] transition-transform"
            >
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">No.1 Best Buy</span>
                    <span className="text-sm truncate max-w-[200px]">{productName}</span>
                </div>
                <div className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-bold">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Amazon
                </div>
            </a>
        </div>
    );
}
