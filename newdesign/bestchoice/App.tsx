import React from 'react';
import Header from './components/Header';
import Breadcrumbs from './components/Breadcrumbs';
import Hero from './components/Hero';
import FeaturedCategories from './components/FeaturedCategories';
import CategorySection from './components/CategorySection';
import Footer from './components/Footer';
import { sections } from './data';

const App: React.FC = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <Breadcrumbs />
      <div className="w-full pb-20">
        <Hero />
        <main className="max-w-[1200px] mx-auto px-4 md:px-6">
          <FeaturedCategories />
          {sections.map((section) => (
            <CategorySection key={section.id} data={section} />
          ))}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default App;