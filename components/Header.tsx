import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-border-color">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-18 flex items-center justify-between py-4">
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center gap-2 group">
            <span className="material-symbols-outlined text-3xl text-primary group-hover:scale-110 transition-transform">equalizer</span>
            <span className="text-xl font-black tracking-tighter text-gray-800">MonoKaku<span className="text-primary">.</span></span>
          </a>
          <nav className="hidden lg:flex items-center gap-8">
            {['ランキング', 'レビュー', '比較ガイド'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-bold text-gray-600 hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary py-1"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative w-72">
            <input
              type="text"
              placeholder="気になる製品を探す..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-800 placeholder-gray-400 outline-none"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[20px]">search</span>
          </div>
          <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;