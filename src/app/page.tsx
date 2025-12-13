
import React from 'react';
import Header from '@/components/choiceguide/Header';
import Hero from '@/components/choiceguide/Hero';
import CategorySection from '@/components/choiceguide/CategorySection';
import RankingSection from '@/components/choiceguide/RankingSection';
import ReviewSection from '@/components/choiceguide/ReviewSection';
import Footer from '@/components/choiceguide/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-body">
      <Header />
      <main>
        <Hero />
        <CategorySection />
        <RankingSection />
        <ReviewSection />
      </main>
      <Footer />
    </div>
  );
}
