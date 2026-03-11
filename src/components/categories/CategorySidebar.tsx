
import React from 'react';
import Link from 'next/link';

type TagCount = { tag: string; count: number };

type CategorySidebarProps = {
    popularTags?: TagCount[];
    categorySlug?: string;
};

export default function CategorySidebar({ popularTags = [], categorySlug }: CategorySidebarProps) {
    return (
        <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-soft">
                <h3 className="font-bold text-text-heading mb-4 flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-stone-400">label</span>
                    人気のキーワード
                </h3>
                <div className="flex flex-wrap gap-2">
                    {popularTags.length > 0 ? (
                        popularTags.map(({ tag, count }) => (
                            <Link
                                key={tag}
                                href={categorySlug ? `/categories/${categorySlug}?q=${encodeURIComponent(tag)}` : `?q=${encodeURIComponent(tag)}`}
                                className="px-2.5 py-1 text-xs font-medium bg-stone-50 text-stone-600 rounded-md border border-stone-100 hover:border-primary hover:text-primary transition-colors"
                            >
                                #{tag}
                                <span className="ml-1 text-stone-300 text-[10px]">({count})</span>
                            </Link>
                        ))
                    ) : (
                        <p className="text-xs text-stone-400">記事が蓄積され次第表示されます</p>
                    )}
                </div>
            </div>
        </aside>
    );
}
