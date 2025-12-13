import React from 'react';
import { CategoryItem, ColorTheme } from '../types';

interface CategoryCardProps {
  item: CategoryItem;
  theme: ColorTheme;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ item, theme }) => {
  const getThemeClasses = (color: ColorTheme) => {
    switch (color) {
      case 'blue':
        return {
          iconBg: 'bg-blue-50 dark:bg-blue-900/30',
          iconText: 'text-blue-600 dark:text-blue-300',
          hoverBg: 'group-hover:bg-blue-600',
          hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-300',
          border: 'hover:border-blue-200'
        };
      case 'green':
        return {
          iconBg: 'bg-green-50 dark:bg-green-900/30',
          iconText: 'text-green-600 dark:text-green-300',
          hoverBg: 'group-hover:bg-green-600',
          hoverText: 'group-hover:text-green-600 dark:group-hover:text-green-300',
          border: 'hover:border-green-200'
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-50 dark:bg-purple-900/30',
          iconText: 'text-purple-600 dark:text-purple-300',
          hoverBg: 'group-hover:bg-purple-600',
          hoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-300',
          border: 'hover:border-purple-200'
        };
      default:
        return {
           iconBg: 'bg-gray-50',
           iconText: 'text-gray-600',
           hoverBg: 'group-hover:bg-gray-600',
           hoverText: 'group-hover:text-gray-600',
           border: 'hover:border-gray-200'
        }
    }
  };

  const colors = getThemeClasses(theme);

  return (
    <a className={`group bg-white dark:bg-[#1f2937] p-6 rounded-xl border border-transparent shadow-card ${colors.border} hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-4 text-center cursor-pointer`} href="#">
      <div className={`size-16 rounded-full ${colors.iconBg} flex items-center justify-center ${colors.iconText} ${colors.hoverBg} group-hover:text-white transition-colors duration-300`}>
        <span className="material-symbols-outlined text-3xl">{item.icon}</span>
      </div>
      <div>
        <span className={`block text-base font-bold text-gray-800 dark:text-gray-200 ${colors.hoverText} transition-colors`}>{item.name}</span>
        <span className="text-xs text-gray-400 mt-1 block">{item.subtitle}</span>
      </div>
    </a>
  );
};

export default CategoryCard;