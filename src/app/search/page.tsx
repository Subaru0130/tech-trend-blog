import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import { ArrowRight, Search as SearchIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q: string }>;
}) {
    const { q: query } = await searchParams;
    const decodedQuery = query ? decodeURIComponent(query) : '';
    const allPosts = getSortedPostsData();

    // Simple case-insensitive search on title and description
    const results = allPosts.filter((post) => {
        if (!decodedQuery) return false;
        const q = decodedQuery.toLowerCase();
        return (
            post.title.toLowerCase().includes(q) ||
            post.description.toLowerCase().includes(q) ||
            (post.category && post.category.toLowerCase().includes(q))
        );
    });

    return (
        <div className="min-h-screen flex flex-col font-sans text-[#333333] bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-[#EEEEEE]">
                <div className="container mx-auto flex h-20 items-center justify-between px-6 max-w-6xl">
                    <Link href="/" className="group flex items-center gap-3">
                        <span className="text-xl font-bold tracking-tight text-[#333333] leading-none">
                            ベストバイガイド
                        </span>
                    </Link>
                    <Link href="/" className="text-sm font-bold text-slate-600 hover:text-black transition-colors">
                        トップに戻る
                    </Link>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-6 max-w-4xl py-12 md:py-20">
                <div className="mb-12 border-b border-stone-200 pb-8">
                    <Link href="/" className="inline-flex items-center text-sm text-stone-500 hover:text-stone-900 mb-6 font-medium">
                        ← トップページへ戻る
                    </Link>
                    <h1 className="text-3xl font-bold mb-4">
                        {decodedQuery ? `「${decodedQuery}」の検索結果` : '検索キーワードを入力してください'}
                    </h1>
                    <p className="text-stone-500 font-medium">
                        {decodedQuery ? `${results.length} 件の記事が見つかりました` : ''}
                    </p>
                </div>

                {results.length > 0 ? (
                    <div className="space-y-12">
                        {results.map((post) => (
                            <article key={post.slug} className="group grid md:grid-cols-12 gap-8 items-start border-b border-stone-100 pb-12 last:border-0">
                                <div className="md:col-span-4 aspect-[4/3] relative overflow-hidden rounded-xl bg-white shadow-sm">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-contain mx-auto mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="md:col-span-8 flex flex-col h-full justify-center">
                                    <div className="flex items-center gap-3 mb-3 text-xs text-stone-500">
                                        <span className="px-2 py-0.5 border border-stone-200 rounded">{post.category || 'Review'}</span>
                                        <span>{post.date}</span>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 leading-relaxed group-hover:text-slate-600 transition-colors">
                                        <Link href={`/posts/${post.slug}`}>
                                            {post.title}
                                        </Link>
                                    </h2>
                                    <p className="text-stone-600 line-clamp-2 mb-6 leading-relaxed">
                                        {post.description}
                                    </p>
                                    <Link href={`/posts/${post.slug}`} className="inline-flex items-center text-sm font-bold text-stone-900 border-b border-stone-900 pb-0.5 hover:opacity-70">
                                        記事を読む <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-stone-100">
                        <SearchIcon className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-stone-700 mb-2">記事が見つかりませんでした</h3>
                        <p className="text-stone-500 mb-8">別のキーワードで検索してみてください。</p>
                        <Link href="/" className="inline-block bg-stone-900 text-white px-6 py-3 rounded-full font-bold hover:bg-black transition-colors">
                            トップページに戻る
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
