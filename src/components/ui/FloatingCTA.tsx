import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface FloatingCTAProps {
    productName: string;
    affiliateLink: string;
}

export function FloatingCTA({ productName, affiliateLink, asin }: FloatingCTAProps & { asin?: string }) {
    if (!affiliateLink && !asin) return null;

    const getUrl = () => {
        const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || 'demo-22';

        // Priority 1: Direct ASIN
        if (asin) {
            return `https://www.amazon.co.jp/dp/${asin}?tag=${tag}&linkCode=ogi&th=1&psc=1`;
        }

        // Priority 2: Search Fallback
        if (affiliateLink?.startsWith('SEARCH:')) {
            const term = affiliateLink.replace('SEARCH:', '');
            return `https://www.amazon.co.jp/s?k=${encodeURIComponent(term)}&tag=${tag}`;
        }

        return affiliateLink || '#';
    };

    const url = getUrl();

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-4 duration-500">
            <a
                href={url}
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
