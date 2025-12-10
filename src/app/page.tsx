import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import { Search, ArrowRight, ChevronRight } from 'lucide-react';

import HeroSearch from '@/components/HeroSearch';
import SearchInput from '@/components/SearchInput';

export default function Home() {
  const allPosts = getSortedPostsData();
  const featuredPost = allPosts[0];
  const recentPosts = allPosts.slice(1);

  return (
    <div className="min-h-screen flex flex-col font-sans text-[#333333] bg-[#FAFAFA] selection:bg-stone-100">
      {/* Header: Clean & White */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-[#EEEEEE]">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 max-w-6xl">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#333333] leading-none">
                ベストバイガイド
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-8">
            <nav className="hidden md:flex gap-8 text-sm text-[#666666]">
              <Link href="#latest" className="hover:text-[#333333] transition-colors">最新記事</Link>
              <Link href="#about" className="hover:text-[#333333] transition-colors">編集部について</Link>
            </nav>
            {/* Header Search - kept minimal */}
            <div className="hidden md:block w-64">
              <SearchInput />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* Concept Hero: First Impression */}
        <section id="about" className="py-32 md:py-40 bg-white scroll-mt-20">
          <div className="container mx-auto px-6 max-w-3xl text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-stone-100 text-[#666666] text-xs font-medium mb-6 tracking-wider">
              ベストバイガイド編集部
            </span>
            <h2 className="text-3xl md:text-4xl font-medium text-[#333333] mb-10 leading-relaxed tracking-tight">
              生活を変える、<br className="md:hidden" />本物だけを。
            </h2>
            <p className="text-[#666666] leading-[2.2] text-base md:text-lg mb-16 font-normal">
              毎日使うものだからこそ、後悔したくない。<br className="hidden md:inline" />
              私たちは、日用品選びの「正解」を探求する検証メディアです。<br />
              メーカーへの忖度を一切排除し、全て自社で購入してテストすることで、<br className="hidden md:inline" />
              あなたにとっての「本物」を見つけ出します。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-[#FAFAFA] pt-12">
              <div>
                <span className="block text-base font-medium text-[#333333] mb-3">公平な検証</span>
                <p className="text-sm text-[#999999] leading-[1.8]">
                  広告費や提供品に依存せず<br />
                  消費者目線で評価します
                </p>
              </div>
              <div>
                <span className="block text-base font-medium text-[#333333] mb-3">数値に基づく</span>
                <p className="text-sm text-[#999999] leading-[1.8]">
                  感覚だけでなく<br />
                  データで性能を証明します
                </p>
              </div>
              <div>
                <span className="block text-base font-medium text-[#333333] mb-3">生活者視点</span>
                <p className="text-sm text-[#999999] leading-[1.8]">
                  スペックよりも<br />
                  「使いやすさ」を重視します
                </p>
              </div>
            </div>

            {/* Main Search Bar Area */}
            <div className="mt-16 pt-8 border-t border-dashed border-stone-200">
              <HeroSearch />
            </div>

          </div>
        </section>

        {/* Hero Section: Featured Post */}
        {featuredPost && (
          <section id="latest" className="py-20 md:py-24 px-6 bg-[#FAFAFA] border-t border-[#EEEEEE] scroll-mt-20">
            <div className="container mx-auto max-w-6xl">
              <div className="grid md:grid-cols-12 gap-12 items-center">
                {/* Text Side */}
                <div className="md:col-span-5 order-2 md:order-1">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-[#333333] text-white text-xs font-medium rounded-[4px]">最新記事</span>
                    <span className="text-[#666666] text-sm">{featuredPost.date}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-medium leading-[1.6] mb-8 text-[#333333]">
                    <Link href={`/posts/${featuredPost.slug}`} className="hover:text-[#666666] transition-colors">
                      {featuredPost.title}
                    </Link>
                  </h1>
                  <p className="text-[#666666] text-base leading-[1.9] mb-10 font-normal line-clamp-3">
                    {featuredPost.description}
                  </p>
                  <Link href={`/posts/${featuredPost.slug}`} className="group inline-flex items-center gap-2 text-[#333333] font-medium border-b border-[#333333] pb-0.5 hover:opacity-70 transition-opacity">
                    記事を読む <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                {/* Image Side */}
                <div className="md:col-span-7 order-1 md:order-2">
                  <Link href={`/posts/${featuredPost.slug}`} className="block relative aspect-[4/3] overflow-hidden rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-white">
                    {featuredPost.image ? (
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#999999] bg-[#F5F5F5]">No Image</div>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Recent Loop: Clean Cards */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex items-baseline justify-between mb-12">
              <h2 className="text-2xl font-medium text-[#333333]">最新の検証レビュー</h2>
              <span className="text-sm text-[#666666]">毎日の暮らしを整える</span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <article key={post.slug} className="group flex flex-col bg-white rounded-[4px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-500 border border-[#FAFAFA]">
                  <Link href={`/posts/${post.slug}`} className="block overflow-hidden aspect-[16/10] bg-[#F5F5F5]">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#CCCCCC]">No Image</div>
                    )}
                  </Link>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[11px] font-medium text-[#666666] bg-[#F5F5F5] px-2 py-1 rounded-[2px]">検証</span>
                      <span className="text-xs text-[#999999]">{post.date}</span>
                    </div>
                    <h3 className="text-lg font-medium text-[#333333] leading-[1.6] mb-3">
                      <Link href={`/posts/${post.slug}`} className="hover:text-[#666666] transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-[#666666] leading-[1.8] line-clamp-2 mt-auto">
                      {post.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#FAFAFA] border-t border-[#EEEEEE] py-12">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-bold text-[#333333] text-sm">ベストバイガイド</span>
          <p className="text-xs text-[#999999]">
            &copy; {new Date().getFullYear()} Best Buy Guide Editorial.
          </p>
        </div>
      </footer>
    </div>
  );
}
