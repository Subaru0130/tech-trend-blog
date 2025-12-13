import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import ComparisonTable from './components/ComparisonTable';
import ProductCard from './components/ProductCard';
import Sidebar from './components/Sidebar';
import BuyingGuide from './components/BuyingGuide';
import { products } from './data';

const App: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <Header />
      
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 lg:py-12 flex flex-col lg:flex-row gap-10">
        <main className="flex-1 min-w-0">
          <Hero />
          
          <ComparisonTable />
          
          <div className="flex flex-col gap-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <BuyingGuide />
        </main>

        <Sidebar />
      </div>

      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <button 
          onClick={scrollToTop}
          className="bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-primary-dark transition-colors"
        >
          <span className="material-symbols-outlined">expand_less</span>
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default App;