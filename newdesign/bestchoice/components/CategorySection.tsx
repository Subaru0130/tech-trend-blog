import React from 'react';
import { SectionData } from '../types';
import CategoryCard from './CategoryCard';

interface CategorySectionProps {
  data: SectionData;
}

const CategorySection: React.FC<CategorySectionProps> = ({ data }) => {
  const getThemeStyles = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          iconBox: 'bg-blue-100 dark:bg-blue-900/50',
          iconColor: 'text-blue-600 dark:text-blue-300',
          link: 'text-blue-600 hover:text-blue-800'
        };
      case 'green':
        return {
          iconBox: 'bg-green-100 dark:bg-green-900/50',
          iconColor: 'text-green-600 dark:text-green-300',
          link: 'text-green-600 hover:text-green-800'
        };
      case 'purple':
        return {
          iconBox: 'bg-purple-100 dark:bg-purple-900/50',
          iconColor: 'text-purple-600 dark:text-purple-300',
          link: 'text-purple-600 hover:text-purple-800'
        };
      default:
         return {
          iconBox: 'bg-gray-100',
          iconColor: 'text-gray-600',
          link: 'text-gray-600'
        };
    }
  };

  const styles = getThemeStyles(data.color);

  return (
    <section className="scroll-mt-24 mb-16" id={data.id}>
      <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className={`size-10 rounded-xl ${styles.iconBox} flex items-center justify-center ${styles.iconColor}`}>
          <span className="material-symbols-outlined">{data.icon}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{data.title}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {data.items.map((item, index) => (
          <CategoryCard key={index} item={item} theme={data.color} />
        ))}
      </div>
      <div className="mt-4 text-right">
        <a className={`inline-flex items-center text-sm font-bold ${styles.link} hover:underline transition-colors`} href="#">
          {data.linkText}
          <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
        </a>
      </div>
    </section>
  );
};

export default CategorySection;