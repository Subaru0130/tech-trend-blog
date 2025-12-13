
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 w-full shadow-sm">
            <div className="max-w-[1100px] mx-auto px-4">
                <div className="flex items-center justify-between h-16 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="size-8 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-brand-blue">equalizer</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-text-main dark:text-white hidden sm:block font-display">
                            TechRankings
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
                        {['ランキング', 'レビュー', 'セール情報', '比較記事'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="hover:text-brand-blue transition-colors py-5 border-b-2 border-transparent hover:border-brand-blue"
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 flex-1 justify-end md:flex-none">
                        <div className="hidden sm:flex relative w-full max-w-xs group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-400 text-[20px] group-focus-within:text-brand-blue transition-colors">
                                    search
                                </span>
                            </div>
                            <input
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 dark:bg-gray-800 text-text-main dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue sm:text-sm transition-shadow"
                                placeholder="製品を検索..."
                                type="text"
                            />
                        </div>
                        <button className="text-text-muted hover:text-brand-blue text-sm font-medium whitespace-nowrap hidden sm:block">
                            ログイン
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
