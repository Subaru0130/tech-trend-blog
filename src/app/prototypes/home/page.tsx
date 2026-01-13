
"use client";

import React from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import Hero from '@/components/home/Hero';
import CategoryList from '@/components/home/CategoryList';
import RankingPreview from '@/components/home/RankingPreview';
import ReviewList from '@/components/home/ReviewList';

export default function HomePrototype() {
    return (
        <div className="bg-background-light text-text-main antialiased selection:bg-accent/20 selection:text-primary min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow">
                <Hero />
                <CategoryList />
                <RankingPreview />
                <ReviewList />
            </main>

            <Footer />
        </div>
    );
}
