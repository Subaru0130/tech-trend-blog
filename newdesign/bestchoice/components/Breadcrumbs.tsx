import React from 'react';

const Breadcrumbs: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-[1200px] mx-auto px-4 py-3 text-xs text-gray-500 dark:text-gray-400 flex items-center">
        <span className="hover:text-primary cursor-pointer transition-colors">ホーム</span>
        <span className="material-symbols-outlined text-[10px] mx-2 text-gray-300">arrow_forward_ios</span>
        <span className="font-bold text-gray-800 dark:text-gray-200">商品カテゴリ一覧</span>
      </div>
    </div>
  );
};

export default Breadcrumbs;