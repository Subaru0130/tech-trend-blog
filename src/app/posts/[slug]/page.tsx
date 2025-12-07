import { getPostData, getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ArrowLeft, Calendar, Tag, Share2, MessageSquareQuote } from 'lucide-react';
import { RankingCard } from '@/components/affiliate/RankingCard';
import { ComparisonTable } from '@/components/affiliate/ComparisonTable';
import { QuickSummary } from '@/components/affiliate/QuickSummary';
import { TopPicks } from '@/components/affiliate/TopPicks';
import { SearchBar } from '@/components/ui/SearchBar';
import { FloatingCTA } from '@/components/ui/FloatingCTA';

const components = {
    RankingCard,
    ComparisonTable,
    QuickSummary,
    TopPicks,
    FloatingCTA,
};

export async function generateStaticParams() {
    const posts = getSortedPostsData();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const postData = getPostData(slug);

    return (
        <div className="min-h-screen bg-white text-slate-700 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
                    <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors flex-shrink-0">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-bold hidden sm:inline">トップへ戻る</span>
                    </Link>

                    <div className="flex-1 max-w-md mx-auto">
                        <SearchBar />
                    </div>

                    <div className="text-sm font-bold text-slate-900 hidden sm:block flex-shrink-0">
                        ベストバイガイド
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-4 gap-12">
                    {/* Sidebar (TOC) - Desktop & Mobile Accordion */}
                    <aside className="col-span-1">
                        <div className="sticky top-24">
                            <details className="group bg-slate-50 rounded-xl border border-slate-200 overflow-hidden lg:bg-transparent lg:border-none lg:p-0" open>
                                <summary className="font-bold text-slate-900 p-4 cursor-pointer list-none flex items-center justify-between lg:mb-4 lg:p-0 lg:cursor-default">
                                    <span className="flex items-center gap-2">
                                        <span className="w-1 h-6 bg-primary rounded-full"></span>
                                        目次
                                    </span>
                                    <span className="lg:hidden text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <ul className="space-y-3 text-sm text-slate-600 border-t border-slate-200 p-4 lg:border-t-0 lg:border-l lg:border-slate-200 lg:pl-4 lg:p-0">
                                    <li><a href="#" className="hover:text-primary block py-1 border-l-2 border-transparent hover:border-primary lg:-ml-[17px] lg:pl-4 transition-all">検証のポイント</a></li>
                                    <li><a href="#" className="hover:text-primary block py-1 border-l-2 border-transparent hover:border-primary lg:-ml-[17px] lg:pl-4 transition-all">おすすめランキング</a></li>
                                    <li><a href="#" className="hover:text-primary block py-1 border-l-2 border-transparent hover:border-primary lg:-ml-[17px] lg:pl-4 transition-all">選び方の注意点</a></li>
                                    <li><a href="#" className="hover:text-primary block py-1 border-l-2 border-transparent hover:border-primary lg:-ml-[17px] lg:pl-4 transition-all">まとめ</a></li>
                                </ul>
                            </details>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <article className="col-span-1 lg:col-span-3 max-w-3xl">
                        {/* Article Header */}
                        <header className="mb-12">
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
                                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                                    <Calendar className="w-4 h-4" />
                                    <time dateTime={postData.date}>{postData.date}</time>
                                </div>
                                {postData.tags?.map(tag => (
                                    <div key={tag} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-primary font-medium">
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                    </div>
                                ))}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
                                {postData.title}
                            </h1>

                            {/* Editor's Comment Box */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                                        <MessageSquareQuote className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-2 text-sm">編集部コメント</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {postData.description}
                                    </p>
                                </div>
                            </div>

                            {/* Hero Image (if exists) */}
                            {/* Hero Image Removed for Quick Start */}
                            {/* {postData.image && (
                                <div className="rounded-2xl overflow-hidden shadow-lg mb-12 border border-slate-100">
                                    <img src={postData.image} alt={postData.title} className="w-full h-auto" />
                                </div>
                            )} */}
                        </header>

                        {/* Article Content */}
                        <div className="prose prose-lg max-w-none 
                            prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight
                            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-slate-200
                            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:flex prose-h3:items-center prose-h3:gap-2 prose-h3:before:content-[''] prose-h3:before:w-1.5 prose-h3:before:h-6 prose-h3:before:bg-primary prose-h3:before:rounded-full
                            prose-p:text-slate-600 prose-p:leading-loose
                            prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-slate-900 prose-strong:font-bold prose-strong:bg-yellow-100 prose-strong:px-1
                            prose-li:marker:text-primary
                            prose-img:rounded-xl prose-img:shadow-md
                            ">
                            <MDXRemote source={postData.content} components={components} />
                        </div>

                        {/* Footer / CTA */}
                        <div className="mt-20 pt-10 border-t border-slate-200">
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center shadow-sm">
                                <h3 className="text-2xl font-bold mb-4 text-slate-900">あなたにぴったりの一台は見つかりましたか？</h3>
                                <p className="mb-8 text-slate-700 font-medium">ベストバイガイドでは、他にも様々なジャンルの商品を徹底検証しています。</p>
                                <Link href="/" className="inline-block bg-blue-600 text-white font-bold px-10 py-4 rounded-full hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                    他の記事も見る
                                </Link>
                            </div>
                        </div>
                    </article>
                </div>
            </main>
        </div>
    );
}
