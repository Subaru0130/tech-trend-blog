import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#111318] border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 px-6">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row justify-between gap-12">
        <div className="flex flex-col gap-6 max-w-sm">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-2xl">verified_user</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">BestChoice</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            公平な比較とレビューを通じて、あなたの最適な商品選びをサポートします。賢い買い物のための情報ポータルサイトです。
          </p>
          <div className="flex gap-4">
            <div className="size-8 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"></div>
            <div className="size-8 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"></div>
            <div className="size-8 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 lg:gap-16">
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">運営会社</h4>
            <div className="flex flex-col gap-2">
              <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">会社概要</a>
              <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">採用情報</a>
              <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">お問い合わせ</a>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">コンテンツ</h4>
            <div className="flex flex-col gap-2">
              <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">新着記事</a>
              <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">人気ランキング</a>
              <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">レビュー一覧</a>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">法的情報</h4>
            <div className="flex flex-col gap-2">
              <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">プライバシーポリシー</a>
              <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">利用規約</a>
              <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">免責事項</a>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
        © 2024 BestChoice Inc. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;