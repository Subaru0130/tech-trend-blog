import { getPostData, getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ArrowLeft, Calendar, Tag, Share2 } from 'lucide-react';

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
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white">
            {/* Background Gradients or Image */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {postData.image ? (
                    <>
                        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${postData.image})` }} />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />
                    </>
                ) : (
                    <>
                        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
                    </>
                )}
            </div>

            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                    <div className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        TechTrend.AI
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-32 pb-20 px-6">
                <article className="max-w-3xl mx-auto">
                    {/* Article Header */}
                    <header className="mb-16 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-400 mb-8">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <time dateTime={postData.date}>{postData.date}</time>
                            </div>
                            {postData.tags?.map(tag => (
                                <div key={tag} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-400">
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                </div>
                            ))}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
                            {postData.title}
                        </h1>
                        <p className="text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
                            {postData.description}
                        </p>
                    </header>

                    {/* Article Content */}
                    <div className="prose prose-invert prose-lg max-w-none 
                        prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                        prose-p:text-neutral-300 prose-p:leading-relaxed
                        prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-white prose-strong:font-semibold
                        prose-code:text-blue-300 prose-code:bg-blue-950/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                        prose-ul:text-neutral-300 prose-li:marker:text-blue-500
                        prose-table:border-collapse prose-th:text-white prose-th:bg-white/5 prose-th:p-4 prose-td:p-4 prose-td:border-b prose-td:border-white/10
                        ">
                        <MDXRemote source={postData.content} />
                    </div>

                    {/* Footer / CTA */}
                    <div className="mt-20 pt-10 border-t border-white/10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <p className="text-neutral-500">
                                Found this helpful? Share it with your network.
                            </p>
                            <div className="flex gap-4">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white text-sm font-medium transition-colors">
                                    <Share2 className="w-4 h-4" />
                                    Share Article
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
