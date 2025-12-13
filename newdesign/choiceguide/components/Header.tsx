import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#1a202c]/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
      <div className="px-4 md:px-6 lg:px-8 h-20 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <a className="flex items-center gap-3 group" href="#">
            <div className="size-10 bg-gradient-to-br from-primary to-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <span className="material-symbols-outlined text-[24px]">equalizer</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-gray-800 dark:text-white leading-none group-hover:text-primary transition-colors">ChoiceGuide</h1>
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 tracking-wider mt-0.5">賢い家電選びをサポート</span>
            </div>
          </a>
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            <a className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-all rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20" href="#ranking">ランキング</a>
            <a className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-all rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20" href="#reviews">新着記事</a>
            <a className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-all rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20" href="#categories">カテゴリ</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative group">
            <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-full px-5 py-2.5 w-72 border border-gray-200 dark:border-gray-700 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 focus-within:bg-white dark:focus-within:bg-gray-900 transition-all duration-300">
              <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
              <input className="bg-transparent border-none text-sm w-full focus:ring-0 outline-none text-gray-800 dark:text-white placeholder-gray-400 ml-2" placeholder="気になる家電を検索..." type="text" />
            </div>
          </div>
          <button className="lg:hidden p-2 text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
