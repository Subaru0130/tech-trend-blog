import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductContent from './components/ProductContent';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  return (
    <>
      <Header />
      <main class="flex-grow w-full max-w-[1100px] mx-auto px-4 py-8">
        <nav class="flex mb-6 text-xs text-text-muted overflow-x-auto whitespace-nowrap pb-2 items-center">
          <a href="#" class="hover:text-brand-blue transition-colors">ホーム</a>
          <span class="material-symbols-outlined text-gray-300 text-[14px] mx-1">chevron_right</span>
          <a href="#" class="hover:text-brand-blue transition-colors">家電・カメラ</a>
          <span class="material-symbols-outlined text-gray-300 text-[14px] mx-1">chevron_right</span>
          <a href="#" class="hover:text-brand-blue transition-colors">オーディオ</a>
          <span class="material-symbols-outlined text-gray-300 text-[14px] mx-1">chevron_right</span>
          <span class="text-text-main dark:text-gray-200 font-medium">Sony WH-1000XM5</span>
        </nav>
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <ProductContent />
          <Sidebar />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default App;