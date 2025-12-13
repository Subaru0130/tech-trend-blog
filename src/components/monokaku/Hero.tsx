
import React from 'react';

const Hero: React.FC = () => {
    return (
        <>
            <nav className="flex flex-wrap gap-2 text-xs font-medium text-gray-500 mb-6 items-center">
                <a href="#" className="hover:text-primary transition-colors">ホーム</a>
                <span className="material-symbols-outlined text-[10px] text-gray-300">chevron_right</span>
                <a href="#" className="hover:text-primary transition-colors">オーディオ</a>
                <span className="material-symbols-outlined text-[10px] text-gray-300">chevron_right</span>
                <span className="text-gray-800">ノイズキャンセリングヘッドホン</span>
            </nav>

            <div className="bg-surface-light rounded-3xl p-8 md:p-12 shadow-soft border border-border-color mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-xs font-bold mb-6">
                        <span className="material-symbols-outlined text-[16px]">verified</span> 2024年10月 最新版
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-gray-900 mb-6 tracking-tight">
                        静寂を持ち歩く。<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">ノイズキャンセリングヘッドホン</span><br />
                        徹底比較ランキング
                    </h1>
                    <p className="text-text-sub text-base md:text-lg leading-relaxed max-w-3xl mb-8">
                        通勤・通学の騒音カットから、カフェでの集中作業まで。今や生活必需品となったノイズキャンセリングヘッドホン。音質、装着感、そして静寂性能を専門家が厳しくジャッジ。あなたに最適な一台が見つかります。
                    </p>
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                        <div
                            className="w-12 h-12 rounded-full bg-gray-200 bg-center bg-cover shadow-inner ring-2 ring-white"
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200')" }}
                        ></div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">記事監修</span>
                            <span className="font-bold text-gray-900">アレックス・モーガン <span className="text-xs font-normal text-gray-500 ml-1">| オーディオ評論家</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Hero;
