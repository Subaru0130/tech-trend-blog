import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6">
      <div className="bg-surface-light rounded-xl p-6 shadow-soft border border-border-color sticky top-24">
        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
          <span className="material-symbols-outlined text-gray-400 text-[20px]">toc</span>
          目次
        </h4>
        <nav className="flex flex-col gap-1 text-sm">
          <a href="#rank-1" className="flex items-center justify-between text-primary font-bold bg-primary/5 py-2.5 px-3 rounded-lg border border-primary/10">
            <span className="truncate">1位 Sony WH-1000XM5</span>
            <span className="material-symbols-outlined text-[16px]">arrow_right</span>
          </a>
          <a href="#rank-2" className="flex items-center justify-between text-gray-600 hover:text-primary hover:bg-gray-50 py-2.5 px-3 rounded-lg transition-colors">
            <span className="truncate">2位 Bose QC Ultra</span>
          </a>
          <a href="#rank-3" className="flex items-center justify-between text-gray-600 hover:text-primary hover:bg-gray-50 py-2.5 px-3 rounded-lg transition-colors">
            <span className="truncate">3位 AirPods Max</span>
          </a>
          <div className="border-t border-gray-100 my-2"></div>
          <a href="#comparison-table" className="text-gray-600 hover:text-primary py-2 px-3 transition-colors text-xs">スペック比較表</a>
          <a href="#buying-guide" className="text-gray-600 hover:text-primary py-2 px-3 transition-colors text-xs">選び方のポイント</a>
        </nav>
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h5 className="font-bold text-xs text-gray-500 mb-4 uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_down</span>
            本日のお買い得
          </h5>
          <a href="#" className="group block relative overflow-hidden rounded-xl border border-gray-200">
            <div className="bg-white p-3 flex gap-3 items-center group-hover:bg-gray-50 transition-colors">
              <div
                className="w-16 h-16 bg-white rounded-lg border border-gray-100 bg-center bg-cover shrink-0"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBp4yOfcn3xS3bPjDyhYIY9G0f49CyZDrxTdI7Uzg3UHKrxqieemcH87FwT4mLXznnngaOSASTysDcmZsZxDZpB7c3__xrQalMMwz_tZXyvhFliJlyjX0d-aBHuNd8aMSmsS79aVFJdgs-_0xSN3w-ebzXKpZzPG41076sTT2PmM3nhdiVjHiKFBGfpJ4i26mH_jJnuO4L9IDKLBYCptkLG0GXfqdxkecRv7Ydr1mA7I5y4UOx2QM_UyDQ9wewS2NBsBwMUXareWa4')" }}
              ></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 mb-1 truncate">Sony XM5 ワイヤレス</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-base text-red-600 font-bold">¥48,000</span>
                </div>
                <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">18% OFF</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;