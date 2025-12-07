import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import { BentoGridItem } from '@/components/ui/bento-grid';
import { RankingCard } from '@/components/affiliate/RankingCard';
import { ComparisonTable } from '@/components/affiliate/ComparisonTable';
import { Search, CheckCircle2, Award, ArrowRight, HelpCircle } from 'lucide-react';

export default function Home() {
  const allPosts = getSortedPostsData();

  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-700 bg-[#FFFBF7]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-orange-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-stone-800 flex items-center gap-2">
              <span className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white text-lg">★</span>
              暮らしのベストバイ
            </span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-bold text-stone-500">
            <Link href="#" className="hover:text-amber-500 transition-colors">ランキング</Link>
            <Link href="#" className="hover:text-amber-500 transition-colors">新着レビュー</Link>
            <Link href="#" className="hover:text-amber-500 transition-colors bg-amber-100 px-4 py-2 rounded-full text-amber-600">お気に入りを見つける</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-24">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Copyl */}
              <div className="text-center lg:text-left z-10">
                <div className="inline-flex items-center bg-orange-100 text-orange-600 text-sm font-bold px-4 py-2 rounded-full mb-6">
                  <span className="bg-white px-2 py-0.5 rounded-full text-xs mr-2 shadow-sm">NEW</span>
                  2025年の最新家電、テスト済みです
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-6 leading-tight tracking-tight">
                  家族の笑顔が増える、<br />
                  <span className="text-amber-500 relative inline-block mx-2">
                    「正解」
                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-amber-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                    </svg>
                  </span>
                  を選ぼう。
                </h1>
                <p className="text-stone-500 text-lg mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  忙しい毎日、買い物で失敗したくないあなたへ。<br />
                  専門家とママパパ編集部が、本当に使いやすいモノを厳選しました。
                </p>

                {/* Search Bar */}
                <div className="max-w-md mx-auto lg:mx-0 relative group">
                  <div className="absolute -inset-1 bg-amber-200 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                  <input
                    type="text"
                    placeholder="例: 時短になるドライヤー、子供にも安心な浄水器"
                    className="relative w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-orange-50 bg-white shadow-xl shadow-orange-100/50 focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none transition-all text-base placeholder:text-stone-300"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400 w-6 h-6 z-10" />
                </div>
              </div>

              {/* Visual */}
              <div className="relative z-10 lg:h-[450px] w-full mt-10 lg:mt-0 flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-square bg-orange-50 rounded-[3rem] rotate-3 overflow-hidden border-8 border-white shadow-2xl">
                  <img src="/images/hero-dryer.png" alt="Happy Family Life" className="w-full h-full object-cover" />
                </div>
                {/* Floating Badges */}
                <div className="absolute -bottom-6 left-10 bg-white p-4 rounded-2xl shadow-lg border-2 border-orange-50 animate-bounce delay-700">
                  <div className="flex items-center gap-2">
                    <div className="bg-red-100 p-2 rounded-full text-red-500"><Award className="w-5 h-5" /></div>
                    <span className="text-sm font-bold text-stone-600">ベストバイ受賞</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories (Soft & Round) */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: "✨ 美容", color: "bg-pink-50 text-pink-600 border-pink-100" },
                { label: "🍳 キッチン", color: "bg-orange-50 text-orange-600 border-orange-100" },
                { label: "🏠 生活家電", color: "bg-blue-50 text-blue-600 border-blue-100" },
                { label: "👶 キッズ", color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
              ].map((cat) => (
                <Link key={cat.label} href="#" className={`px-8 py-4 rounded-3xl border-2 font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-sm ${cat.color}`}>
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Reviews (Card Style) */}
        <section className="py-20 bg-white rounded-t-[3rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-amber-500 font-bold tracking-widest text-xs uppercase mb-2 block">New Arrivals</span>
              <h2 className="text-2xl lg:text-3xl font-bold text-stone-800">
                最新の徹底検証
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {allPosts.map((post, i) => (
                <Link href={`/posts/${post.slug}`} key={post.slug} className="group cursor-pointer">
                  <div className="bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden hover:shadow-2xl hover:shadow-amber-100/50 transition-all duration-300 h-full flex flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 font-bold">No Image</div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-stone-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {post.date}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="mb-2">
                        <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                          徹底検証
                        </span>
                      </div>
                      <h3 className="font-bold text-stone-800 text-lg mb-3 leading-snug group-hover:text-amber-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed mb-4">
                        {post.description}
                      </p>
                      <div className="mt-auto flex items-center text-amber-500 font-bold text-sm">
                        詳しく見る <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-24 bg-[#FFFBF7]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-stone-800 mb-12">私が「暮らしのベストバイ」を作る理由</h2>
            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
              {[
                { title: "自腹で検証", desc: "メーカーからの提供品は使いません。皆さんと同じ条件で購入してテストします。", icon: "🛍️" },
                { title: "生活目線", desc: "スペック上の数値だけでなく、「毎日の生活で使いやすいか」を重視します。", icon: "🏡" },
                { title: "ホンネのみ", desc: "良いところも悪いところも、包み隠さず正直にお伝えすることを約束します。", icon: "🤥" }
              ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-bold text-stone-800 mb-3">{item.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <span className="text-xl font-bold tracking-tight text-stone-800 flex items-center justify-center gap-2 mb-6">
            <span className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white text-lg">★</span>
            暮らしのベストバイ
          </span>
          <p className="text-stone-400 text-sm">
            &copy; {new Date().getFullYear()} Best Buy Guide. <br className="md:hidden" />Made with ❤️ for your happy life.
          </p>
        </div>
      </footer>
    </div>
  );
}


