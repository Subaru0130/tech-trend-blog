import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm dark:border-gray-800 dark:bg-[#1a202c]/90 transition-all duration-300">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity group" href="#">
            <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-2xl text-primary">verified_user</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white">BestChoice</h1>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full" href="#">ホーム</a>
            <a className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full" href="#">ランキング</a>
            <a className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full" href="#">新着レビュー</a>
            <a className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full" href="#">特集</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex relative w-64 group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg group-focus-within:text-primary transition-colors">search</span>
            <input className="w-full pl-10 pr-4 py-2 bg-gray-100/80 border-transparent rounded-full text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all dark:bg-gray-800 dark:text-white outline-none" placeholder="キーワードで検索" type="text"/>
          </div>
          <button className="hidden sm:flex items-center justify-center px-5 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-blue-800 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            ログイン
          </button>
          <button className="sm:hidden p-2 text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;