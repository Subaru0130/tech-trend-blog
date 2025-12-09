import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import { Search, ArrowRight, ChevronRight, Star } from 'lucide-react';

export default function Home() {
  const allPosts = getSortedPostsData();
  const featuredPost = allPosts[0];
  const recentPosts = allPosts.slice(1);

  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-900 bg-stone-50 selection:bg-stone-200">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-stone-50/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 max-w-6xl">
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-900 text-white rounded-none flex items-center justify-center font-serif font-bold text-xl pt-1">B</div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-stone-900 font-serif leading-none">
                ベストバイガイド
              </span>
              <span className="text-[10px] text-stone-500 tracking-widest uppercase mt-0.5">TRUSTED REVIEWS</span>
            </div>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-stone-500">
            <Link href="#" className="hover:text-stone-900 transition-colors">最新記事</Link>
            <Link href="#" className="hover:text-stone-900 transition-colors">ランキング</Link>
            <Link href="#" className="hover:text-stone-900 transition-colors">編集部について</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero Section (Editorial Style) */}
        {featuredPost && (
          <section className="py-20 md:py-28 px-6">
            <div className="container mx-auto max-w-6xl">
              <div className="grid md:grid-cols-12 gap-12 items-center">
                {/* Text Side */}
                <div className="md:col-span-5 order-2 md:order-1">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 border border-stone-900 text-stone-900 text-xs font-bold tracking-widest uppercase">New Issue</span>
                    <span className="text-stone-500 text-sm font-serif italic">{featuredPost.date}</span>
                  </div>
                  <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1] mb-8 text-stone-900">
                    <Link href={`/posts/${featuredPost.slug}`} className="hover:underline decoration-1 underline-offset-8 decoration-stone-300 transition-all">
                      {featuredPost.title}
                    </Link>
                  </h1>
                  <p className="text-stone-600 text-lg leading-loose mb-10 font-light line-clamp-3">
                    {featuredPost.description}
                  </p>
                  <Link href={`/posts/${featuredPost.slug}`} className="group inline-flex items-center gap-3 text-stone-900 font-bold border-b-2 border-stone-900 pb-1 hover:text-stone-600 hover:border-stone-600 transition-colors">
                    記事を読む <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                {/* Image Side - Simple & Clean */}
                <div className="md:col-span-7 order-1 md:order-2">
                  <Link href={`/posts/${featuredPost.slug}`} className="block relative aspect-[4/3] overflow-hidden rounded-sm bg-stone-200">
                    {featuredPost.image ? (
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 font-serif">No Image</div>
                    )}
                  </Link>
                  <p className="mt-3 text-xs text-stone-400 text-right font-serif italic">Feature Photography</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Latest Reviews (Bento Grid) */}
        <section className="py-20 bg-white border-t border-stone-100">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex items-baseline justify-between mb-16">
              <h2 className="font-serif text-3xl font-medium text-stone-900">最新の検証レビュー</h2>
              <span className="text-sm text-stone-400 font-serif italic">Curated for your daily life</span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {recentPosts.map((post) => (
                <article key={post.slug} className="group flex flex-col">
                  <Link href={`/posts/${post.slug}`} className="block overflow-hidden bg-stone-100 aspect-[16/10] mb-6 rounded-sm">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">No Image</div>
                    )}
                  </Link>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-bold text-stone-400 border border-stone-200 px-2 py-0.5 uppercase tracking-wider">Review</span>
                      <span className="text-xs text-stone-400 font-serif">{post.date}</span>
                    </div>
                    <h3 className="font-serif text-xl font-medium text-stone-900 leading-snug mb-3 pr-4">
                      <Link href={`/posts/${post.slug}`} className="hover:text-stone-600 transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-stone-500 leading-relaxed line-clamp-2 mb-4">
                      {post.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Statement */}
        <section className="py-24 bg-stone-100">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <Star className="w-8 h-8 text-stone-900 mx-auto mb-6" />
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-stone-900 mb-8">
              "生活を変える、本物だけを。"
            </h2>
            <p className="text-stone-600 leading-loose text-lg mb-12 font-light">
              私たちは、メーカーからの提供を受けず、すべて自社で購入して検証しています。<br className="hidden md:inline" />
              日用品選びにおける「失敗」をなくし、あなたの暮らしを少しだけ豊かにするために。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-stone-200 pt-12">
              <div>
                <span className="block font-serif text-2xl text-stone-900 mb-2">Independent</span>
                <span className="text-xs text-stone-500 uppercase tracking-widest">完全中立・公平</span>
              </div>
              <div>
                <span className="block font-serif text-2xl text-stone-900 mb-2">Data Driven</span>
                <span className="text-xs text-stone-500 uppercase tracking-widest">数値に基づく検証</span>
              </div>
              <div>
                <span className="block font-serif text-2xl text-stone-900 mb-2">Daily Life</span>
                <span className="text-xs text-stone-500 uppercase tracking-widest">生活者視点</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="bg-stone-50 border-t border-stone-200 py-12">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-serif font-bold text-stone-900 text-lg">ベストバイガイド</span>
          <p className="text-xs text-stone-400 font-sans">
            &copy; {new Date().getFullYear()} Best Buy Guide Editorial.
          </p>
        </div>
      </footer>
    </div>
  );
}
