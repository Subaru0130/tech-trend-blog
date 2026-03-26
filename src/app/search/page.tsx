import React, { Suspense } from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import CategoryContent from '@/components/categories/CategoryContent'; // Reusing for list layout
import { getAllArticles } from '@/lib/data';
import { Metadata } from 'next';

export function generateMetadata(): Metadata {
    return {
        title: '検索結果',
        description: 'ChoiceGuideの記事検索結果ページです。',
        alternates: {
            canonical: 'https://choiceguide.jp/search/',
        },
        robots: {
            index: false,
            follow: true,
        },
    };
}

// Wrapper for Suspense
function SearchPageContent() {
    const allArticles = getAllArticles();

    // We reuse CategoryContent but pass a dummy category info for "Search Results"
    // The filtering logic inside CategoryContent handles the 'q' param.
    // However, CategoryContent expects initialArticles. We pass ALL articles, 
    // and let it filter. 
    // Wait, CategoryContent *does* filter by 'q' in basic implementation I made?
    // Yes, lines 24-28 of CategoryContent.tsx filters `initialArticles`.
    // So passing `getAllArticles()` works.

    const searchCategoryInfo = {
        label: "検索結果",
        icon: "search",
        subCategories: []
    };

    return (
        <CategoryContent categoryInfo={searchCategoryInfo} initialArticles={allArticles} />
    );
}

export default function SearchPage() {
    return (
        <div className="bg-[#FAFAF9] text-text-sub antialiased min-h-screen flex flex-col font-sans">
            <Header />
            <Suspense fallback={<div className="pt-32 text-center">Loading...</div>}>
                <SearchPageContent />
            </Suspense>
            <Footer />
        </div>
    );
}
