import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#101622] pt-16 pb-10 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <a className="flex items-center gap-3 mb-6 group" href="#">
              <div className="size-9 bg-primary text-white rounded-lg flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[20px]">equalizer</span>
              </div>
              <span className="text-xl font-black text-gray-800 dark:text-white tracking-tight">ChoiceGuide</span>
            </a>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
              賢い買い物のための比較メディア。<br />専門家の検証データと独自の評価基準で、あなたに最適な製品選びをサポートします。
            </p>
            <div className="flex gap-4">
              <a className="size-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-colors duration-300" href="#"><span className="material-symbols-outlined text-[18px]">public</span></a>
              <a className="size-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white transition-colors duration-300" href="#"><span className="material-symbols-outlined text-[18px]">rss_feed</span></a>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-6 uppercase tracking-wider">注目カテゴリ</h3>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li><a className="hover:text-primary hover:underline transition-colors" href="#">PC・タブレット</a></li>
              <li><a className="hover:text-primary hover:underline transition-colors" href="#">スマートフォン・格安SIM</a></li>
              <li><a className="hover:text-primary hover:underline transition-colors" href="#">オーディオ機器</a></li>
              <li><a className="hover:text-primary hover:underline transition-colors" href="#">生活家電・キッチン</a></li>
              <li><a className="hover:text-primary hover:underline transition-colors" href="#">VPN・セキュリティ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-6 uppercase tracking-wider">ChoiceGuideについて</h3>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li><a className="hover:text-primary hover:underline transition-colors" href="#">運営者情報</a></li>
              <li><a className="hover:text-primary hover:underline transition-colors" href="#">評価・ランキング基準</a></li>
              <li><a className="hover:text-primary hover:underline transition-colors" href="#">お問い合わせ</a></li>
              <li><a className="hover:text-primary hover:underline transition-colors" href="#">広告掲載について</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-6 uppercase tracking-wider">免責事項</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              当サイトに掲載されている価格やスペック情報は記事執筆時点のものです。最新の情報は各販売店サイトにてご確認ください。当サイトのコンテンツは参考情報であり、購入の最終判断はご自身の責任で行ってください。
            </p>
          </div>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-400 font-medium">© 2024 ChoiceGuide. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-gray-500 font-medium">
            <a className="hover:text-gray-800 dark:hover:text-gray-300 transition-colors" href="#">プライバシーポリシー</a>
            <a className="hover:text-gray-800 dark:hover:text-gray-300 transition-colors" href="#">利用規約</a>
            <a className="hover:text-gray-800 dark:hover:text-gray-300 transition-colors" href="#">特定商取引法に基づく表記</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
