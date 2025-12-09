import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import { Search, ArrowRight, ChevronRight } from 'lucide-react';

export default function Home() {
  const allPosts = getSortedPostsData();
  const featuredPost = allPosts[0]; // The latest post is the featured one
  const recentPosts = allPosts.slice(1);

  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-900 bg-white selection:bg-stone-200">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-stone-100 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 max-w-6xl">
          <Link href="/" className="group flex items-center gap-2">
            <div className="w-8 h-8 bg-stone-900 text-white rounded-lg flex items-center justify-center font-bold text-xl leading-none pt-1">B</div>
            <span className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-stone-600 transition-colors font-sans">
              ベストバイガイド
            </span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-stone-500">
            <Link href="#" className="hover:text-stone-900 transition-colors">レビュー</Link>
            <Link href="#" className="hover:text-stone-900 transition-colors">ランキング</Link>
            <Link href="#" className="hover:text-stone-900 transition-colors">当サイトについて</Link>
          </nav>
          <button className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <Search className="w-5 h-5 text-stone-600" />
          </button>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero Section (Featured Article) */}
        {featuredPost && (
          <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50/30 text-slate-800">
            <div className="absolute inset-0 z-0 opacity-40">
              {/* Subtle Pattern */}
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#fca5a5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
            </div>

            <div className="container mx-auto px-6 max-w-6xl relative z-10">
              <div className="grid md:grid-cols-12 gap-12 items-center">
                {/* Text Side */}
                <div className="md:col-span-6 order-2 md:order-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold tracking-widest uppercase rounded-full">New Arrival</span>
                    <span className="text-slate-500 text-sm font-medium">{featuredPost.date}</span>
                  </div>
                  <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-slate-900 tracking-tight">
                    <Link href={`/posts/${featuredPost.slug}`} className="hover:text-amber-600 transition-colors">
                      {featuredPost.title}
                    </Link>
                  </h1>
                  <p className="text-slate-600 text-lg leading-relaxed mb-8 line-clamp-3 font-normal">
                    {featuredPost.description}
                  </p>
                  <Link href={`/posts/${featuredPost.slug}`} className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-white font-bold rounded-full hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 hover:shadow-xl hover:-translate-y-1">
                    レビューを読む <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Image Side */}
                <div className="md:col-span-6 order-1 md:order-2">
                  <Link href={`/posts/${featuredPost.slug}`} className="block relative group rounded-3xl overflow-hidden shadow-2xl shadow-orange-100 border border-slate-100 aspect-[4/3] transform transition-all duration-500 hover:shadow-orange-200 hover:-translate-y-1">
                    {featuredPost.image ? (
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-medium">No Image</div>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Recent Articles Grid */}
        <section className="py-20">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex items-end justify-between mb-12 border-b border-stone-200 pb-4">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900">新着レビュー</h2>
              <Link href="#" className="flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
                記事一覧へ <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {recentPosts.map((post) => (
                <article key={post.slug} className="group flex flex-col h-full">
                  <Link href={`/posts/${post.slug}`} className="block overflow-hidden bg-stone-100 aspect-[3/2] mb-6">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">No Image</div>
                    )}
                  </Link>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Review</span>
                      <span className="text-xs text-stone-300">•</span>
                      <span className="text-xs text-stone-400">{post.date}</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-stone-900 leading-snug mb-3 group-hover:underline decoration-stone-300 underline-offset-4">
                      <Link href={`/posts/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-stone-500 leading-relaxed line-clamp-2 mb-4 flex-1">
                      {post.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Statement (Minimal) */}
        <section className="py-20 bg-stone-50 border-t border-stone-100">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-6">
              "徹底検証で、ベストな選択を。"
            </h2>
            <p className="text-stone-500 leading-loose text-lg mb-8">
              広告や宣伝文句に惑わされたくないあなたへ。<br className="hidden md:inline" />
              私たちは実際に製品を手に取り、公平な視点で検証します。<br className="hidden md:inline" />
              あなたの生活を変える「本物」が、きっと見つかります。
            </p>
            <div className="flex justify-center gap-8">
              <div className="flex flex-col items-center">
                <span className="font-bold text-stone-900 text-xl">100%</span>
                <span className="text-xs text-stone-400 uppercase tracking-widest mt-1">中立・公平</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-stone-900 text-xl">No</span>
                <span className="text-xs text-stone-400 uppercase tracking-widest mt-1">ステルスマーケティング</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-stone-900 text-xl">Real</span>
                <span className="text-xs text-stone-400 uppercase tracking-widest mt-1">本音レビュー</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 py-12">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-stone-900 text-white rounded-lg flex items-center justify-center font-bold text-sm leading-none pt-0.5">B</div>
            <span className="font-bold text-stone-900">ベストバイガイド</span>
          </div>
          <p className="text-xs text-stone-400">
            &copy; {new Date().getFullYear()} Best Buy Guide. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
