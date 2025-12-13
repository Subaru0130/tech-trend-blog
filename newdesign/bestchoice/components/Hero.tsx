import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-white dark:bg-[#1a202c] pt-12 pb-10 px-4 mb-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
      <div className="max-w-[800px] mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">商品カテゴリ一覧</h1>
        <p className="text-text-sub text-sm md:text-base dark:text-gray-400 leading-relaxed max-w-xl mx-auto">
          生活を豊かにするアイテムを、カテゴリーごとにわかりやすく整理しました。<br className="hidden sm:block"/>
          気になるジャンルから、あなたにぴったりの商品を見つけてください。
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <a className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold hover:bg-blue-100 hover:shadow-sm transition-all dark:bg-blue-900/30 dark:text-blue-200" href="#digital">
          <span className="material-symbols-outlined text-lg">devices</span>
          パソコン・デジタル
        </a>
        <a className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-50 text-green-700 text-sm font-bold hover:bg-green-100 hover:shadow-sm transition-all dark:bg-green-900/30 dark:text-green-200" href="#lifestyle">
          <span className="material-symbols-outlined text-lg">chair</span>
          生活家電・キッチン
        </a>
        <a className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-50 text-purple-700 text-sm font-bold hover:bg-purple-100 hover:shadow-sm transition-all dark:bg-purple-900/30 dark:text-purple-200" href="#finance">
          <span className="material-symbols-outlined text-lg">payments</span>
          金融・サービス
        </a>
      </div>
    </div>
  );
};

export default Hero;