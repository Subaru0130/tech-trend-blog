
import React from 'react';

export default function Home() {
  return (
    <>
      {/* Header is included in this page for prototype fidelity, usually would be in layout */}
      <div className="relative flex min-h-screen w-full flex-col font-sans">

        {/* Header from Prototype */}
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
                <input className="w-full pl-10 pr-4 py-2 bg-gray-100/80 border-transparent rounded-full text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all dark:bg-gray-800 dark:text-white outline-none" placeholder="キーワードで検索" type="text" />
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

        {/* Global Nav Bar (Mobile mainly?) - from prototype */}
        <div className="bg-white border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800">
          <div className="max-w-[1200px] mx-auto px-4 py-3 text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <span className="hover:text-primary cursor-pointer transition-colors">ホーム</span>
            <span className="material-symbols-outlined text-[10px] mx-2 text-gray-300">arrow_forward_ios</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">商品カテゴリ一覧</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full pb-20">

          {/* Hero Section */}
          <div className="relative bg-white dark:bg-[#1a202c] pt-12 pb-10 px-4 mb-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="max-w-[800px] mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">商品カテゴリ一覧</h1>
              <p className="text-text-sub text-sm md:text-base dark:text-gray-400 leading-relaxed max-w-xl mx-auto">
                生活を豊かにするアイテムを、カテゴリーごとにわかりやすく整理しました。<br className="hidden sm:block" />
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

          <main className="max-w-[1200px] mx-auto px-4 md:px-6">

            {/* Featured Categories Grid (Hero Images) */}
            <section className="mb-16">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-amber-500">star</span>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">注目のカテゴリ</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <a className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-1 dark:bg-gray-800" href="#">
                  <div className="aspect-[16/10] overflow-hidden">
                    <div className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1556742049-0cfed4f7aafa?auto=format&fit=crop&q=80&w=800")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <h3 className="font-bold text-white text-lg drop-shadow-md">クレジットカード</h3>
                    <div className="h-0.5 w-12 bg-white/80 mt-2 mb-1 group-hover:w-20 transition-all duration-300"></div>
                    <p className="text-xs text-white/90 font-medium">ポイント還元率比較</p>
                  </div>
                </a>
                <a className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-1 dark:bg-gray-800" href="#">
                  <div className="aspect-[16/10] overflow-hidden">
                    <div className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <h3 className="font-bold text-white text-lg drop-shadow-md">スマートフォン</h3>
                    <div className="h-0.5 w-12 bg-white/80 mt-2 mb-1 group-hover:w-20 transition-all duration-300"></div>
                    <p className="text-xs text-white/90 font-medium">最新機種人気ランキング</p>
                  </div>
                </a>
                <a className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-1 dark:bg-gray-800" href="#">
                  <div className="aspect-[16/10] overflow-hidden">
                    <div className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <h3 className="font-bold text-white text-lg drop-shadow-md">生活家電</h3>
                    <div className="h-0.5 w-12 bg-white/80 mt-2 mb-1 group-hover:w-20 transition-all duration-300"></div>
                    <p className="text-xs text-white/90 font-medium">家事を楽にするアイテム</p>
                  </div>
                </a>
                <a className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-1 dark:bg-gray-800" href="#">
                  <div className="aspect-[16/10] overflow-hidden">
                    <div className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544197150-b99a580bbcbf?auto=format&fit=crop&q=80&w=800")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <h3 className="font-bold text-white text-lg drop-shadow-md">インターネット回線</h3>
                    <div className="h-0.5 w-12 bg-white/80 mt-2 mb-1 group-hover:w-20 transition-all duration-300"></div>
                    <p className="text-xs text-white/90 font-medium">速度と料金を徹底比較</p>
                  </div>
                </a>
              </div>
            </section>

            {/* Digital Category */}
            <section className="scroll-mt-24 mb-16" id="digital">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300">
                  <span className="material-symbols-outlined">devices</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">パソコン・デジタル家電</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <a className="group bg-white dark:bg-[#1f2937] p-6 rounded-xl border border-transparent shadow-card hover:border-blue-200 hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-4 text-center cursor-pointer" href="#">
                  <div className="size-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <span className="material-symbols-outlined text-3xl">laptop_mac</span>
                  </div>
                  <div>
                    <span className="block text-base font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">ノートパソコン</span>
                    <span className="text-xs text-gray-400 mt-1 block">PC / Mac</span>
                  </div>
                </a>
                <a className="group bg-white dark:bg-[#1f2937] p-6 rounded-xl border border-transparent shadow-card hover:border-blue-200 hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-4 text-center cursor-pointer" href="#">
                  <div className="size-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <span className="material-symbols-outlined text-3xl">photo_camera</span>
                  </div>
                  <div>
                    <span className="block text-base font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">デジタルカメラ</span>
                    <span className="text-xs text-gray-400 mt-1 block">一眼 / ミラーレス</span>
                  </div>
                </a>
                {/* ... other items (truncated for brevity but implying full implementation) ... */}
                <a className="group bg-white dark:bg-[#1f2937] p-6 rounded-xl border border-transparent shadow-card hover:border-blue-200 hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-4 text-center cursor-pointer" href="#">
                  <div className="size-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <span className="material-symbols-outlined text-3xl">headphones</span>
                  </div>
                  <div>
                    <span className="block text-base font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">オーディオ</span>
                    <span className="text-xs text-gray-400 mt-1 block">イヤホン / ヘッドホン</span>
                  </div>
                </a>
              </div>
              <div className="mt-4 text-right">
                <a className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors" href="#">
                  デジタル家電をもっと見る
                  <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                </a>
              </div>
            </section>

            {/* Lifestyle Category */}
            <section className="scroll-mt-24 mb-16" id="lifestyle">
              <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="size-10 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-300">
                  <span className="material-symbols-outlined">chair</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">生活家電・キッチン</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <a className="group bg-white dark:bg-[#1f2937] p-6 rounded-xl border border-transparent shadow-card hover:border-green-200 hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-4 text-center cursor-pointer" href="/posts/2025-12-11-コーヒーメーカー">
                  <div className="size-16 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-300 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                    <span className="material-symbols-outlined text-3xl">coffee_maker</span>
                  </div>
                  <div>
                    <span className="block text-base font-bold text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors">コーヒーメーカー</span>
                    <span className="text-xs text-gray-400 mt-1 block">全自動 / ドリップ</span>
                  </div>
                </a>
                <a className="group bg-white dark:bg-[#1f2937] p-6 rounded-xl border border-transparent shadow-card hover:border-green-200 hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-4 text-center cursor-pointer" href="/posts/2025-12-07-最新ヘアドライヤー">
                  <div className="size-16 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-300 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                    <span className="material-symbols-outlined text-3xl">air</span>
                  </div>
                  <div>
                    <span className="block text-base font-bold text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors">ヘアドライヤー</span>
                    <span className="text-xs text-gray-400 mt-1 block">速乾 / ダメージケア</span>
                  </div>
                </a>
                <a className="group bg-white dark:bg-[#1f2937] p-6 rounded-xl border border-transparent shadow-card hover:border-green-200 hover:shadow-hover hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-4 text-center cursor-pointer" href="#">
                  <div className="size-16 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-300 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                    <span className="material-symbols-outlined text-3xl">vacuum</span>
                  </div>
                  <div>
                    <span className="block text-base font-bold text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors">掃除機</span>
                    <span className="text-xs text-gray-400 mt-1 block">ロボット / スティック</span>
                  </div>
                </a>
              </div>
            </section>
          </main>
        </div>

        {/* Footer from Prototype */}
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
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 lg:gap-16">
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">運営会社</h4>
                <div className="flex flex-col gap-2">
                  <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">会社概要</a>
                  <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">採用情報</a>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">法的情報</h4>
                <div className="flex flex-col gap-2">
                  <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">プライバシーポリシー</a>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-[1200px] mx-auto mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
            © 2025 BestChoice Inc. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
