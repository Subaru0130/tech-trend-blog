import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import { ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react';
import HeroSearch from '@/components/HeroSearch';

export default function Home() {
  const allPosts = getSortedPostsData();
  const featuredPost = allPosts[0];
  const recentPosts = allPosts.slice(1);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
      {/* Header */}
      <header className="fixed top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto flex h-16 items-center px-4 max-w-7xl justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-slate-900 hover:opacity-70 transition-opacity">
            ベストバイガイド
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <Link href="#latest" className="hover:text-slate-900 transition-colors">新着レビュー</Link>
            <Link href="#philosophy" className="hover:text-slate-900 transition-colors">検証ポリシー</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION: Search First */}
        <section className="relative overflow-hidden bg-white border-b border-slate-100">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.2]"></div>
          <div className="container mx-auto px-4 py-20 md:py-32 relative max-w-5xl text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-6 tracking-wide border border-blue-100">
              専門家による徹底検証メディア
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
              買い物の「正解」を、<br />
              ここから見つける。
            </h1>
            <p className="text-lg text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              広告費ゼロ、忖度なし。編集部が実際に購入してテストした<br className="hidden md:inline" />
              「本当に良いもの」だけを紹介します。
            </p>

            <HeroSearch />
          </div>
        </section>

        {/* Featured Post: Magazine Style */}
        {featuredPost && (
          <section id="latest" className="py-20 bg-[#FAFAFA]">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex items-center gap-2 mb-8">
                <Star className="w-5 h-5 text-amber-400 fill-current" />
                <h2 className="text-xl font-bold text-slate-900">今月のベストバイ</h2>
              </div>

              <div className="group relative rounded-2xl overflow-hidden bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 border border-slate-100">
                <div className="grid md:grid-cols-2 gap-0">
                  <Link href={`/posts/${featuredPost.slug}`} className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-slate-100">
                    {featuredPost.image ? (
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">No Image</div>
                    )}
                    <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider">
                      Featured
                    </div>
                  </Link>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <span className="text-sm font-semibold text-blue-600 mb-4">{featuredPost.date}</span>
                    <h3 className="text-2xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                      <Link href={`/posts/${featuredPost.slug}`} className="hover:text-blue-600 transition-colors">
                        {featuredPost.title}
                      </Link>
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-8 line-clamp-3">
                      {featuredPost.description}
                    </p>
                    <Link href={`/posts/${featuredPost.slug}`} className="inline-flex items-center text-slate-900 font-bold border-b-2 border-slate-200 pb-1 hover:border-slate-900 transition-colors w-fit">
                      徹底レビューを読む <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Category/Recent Grid */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-10 border-l-4 border-slate-900 pl-4">
              新着記事一覧
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {recentPosts.map((post) => (
                <article key={post.slug} className="group flex flex-col h-full">
                  <Link href={`/posts/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100 mb-4 shadow-sm border border-slate-100">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                    )}
                  </Link>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-500 uppercase">
                      <span>Evaluation</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{post.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                      <Link href={`/posts/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
                      {post.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy Section (Moved to Bottom) */}
        <section id="philosophy" className="py-24 bg-slate-900 text-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-12">私たちのポリシー</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold mb-3">自腹検証</h3>
                <p className="text-slate-400 text-sm leading-relaxed">メーカーからの提供は受けません。<br />全て自社予算で購入します。</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold mb-3">データ主義</h3>
                <p className="text-slate-400 text-sm leading-relaxed">感覚値で語りません。<br />計測機器を用いた数値を重視します。</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6">
                  <Star className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold mb-3">生活者目線</h3>
                <p className="text-slate-400 text-sm leading-relaxed">スペック上の高性能より<br />実際の使いやすさを評価します。</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-400">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Best Buy Guide Editorial. All verifiable contents.
          </p>
        </div>
      </footer>
    </div>
  );
}
