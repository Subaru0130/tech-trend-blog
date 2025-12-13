
import React from 'react';
import { CATEGORIES } from './constants';

const CategorySection: React.FC = () => {
    return (
        <section className="py-20 bg-background-light dark:bg-background-dark" id="categories">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="text-center mb-16">
                    <span className="text-primary font-bold tracking-widest uppercase text-xs mb-3 block">Categories</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">人気のカテゴリから探す</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">生活をより豊かに、より便利にするアイテムを厳選比較。<br />まずは気になるカテゴリを選んでみてください。</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {CATEGORIES.map((cat) => (
                        <a key={cat.id} className="group flex flex-col items-center p-8 bg-white dark:bg-[#1f2937] rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-soft hover:-translate-y-1.5 transition-all duration-300" href="#">
                            <div className="size-16 mb-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-all duration-300 shadow-sm">
                                <span className="material-symbols-outlined text-[32px]">{cat.icon}</span>
                            </div>
                            <span className="font-bold text-sm text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors">{cat.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
