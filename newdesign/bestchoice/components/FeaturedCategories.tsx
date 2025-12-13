import React from 'react';
import { featuredCategories } from '../data';

const FeaturedCategories: React.FC = () => {
  return (
    <section className="mb-16">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-amber-500">star</span>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">注目のカテゴリ</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {featuredCategories.map((cat, index) => (
          <a key={index} className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-1 dark:bg-gray-800" href="#">
            <div className="aspect-[16/10] overflow-hidden">
              <div className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url("${cat.imageUrl}")` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-4">
              <h3 className="font-bold text-white text-lg drop-shadow-md">{cat.title}</h3>
              <div className="h-0.5 w-12 bg-white/80 mt-2 mb-1 group-hover:w-20 transition-all duration-300"></div>
              <p className="text-xs text-white/90 font-medium">{cat.subtitle}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;