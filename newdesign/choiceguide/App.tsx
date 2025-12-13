import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategorySection from './components/CategorySection';
import RankingSection from './components/RankingSection';
import ReviewSection from './components/ReviewSection';
import Footer from './components/Footer';

function App() {
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

export default App;
