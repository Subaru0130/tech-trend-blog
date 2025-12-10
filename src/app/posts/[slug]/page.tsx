import { Metadata } from 'next';
import { getSortedPostsData, PostData } from '@/lib/posts';

// ... (existing imports)

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const markdownWithMeta = fs.readFileSync(
        path.join(process.cwd(), 'content/posts', `${decodedSlug}.mdx`),
        'utf-8'
    );
    const { data: frontmatter } = matter(markdownWithMeta);

    return {
        title: frontmatter.title,
        description: frontmatter.description,
        openGraph: {
            title: frontmatter.title,
            description: frontmatter.description,
            type: 'article',
            url: `https://tech-trend-blog-27mo.vercel.app/posts/${decodedSlug}`,
            images: frontmatter.image ? [{ url: frontmatter.image }] : [],
            publishedTime: frontmatter.date instanceof Date ? frontmatter.date.toISOString() : frontmatter.date,
            authors: ['Best Buy Guide Editorial'],
        },
        twitter: {
            card: 'summary_large_image',
            title: frontmatter.title,
            description: frontmatter.description,
            images: frontmatter.image ? [frontmatter.image] : [],
        },
        alternates: {
            canonical: `https://tech-trend-blog-27mo.vercel.app/posts/${decodedSlug}`,
        }
    };
}

// ... (existing generateStaticParams)

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const markdownWithMeta = fs.readFileSync(
        path.join(process.cwd(), 'content/posts', `${decodedSlug}.mdx`),
        'utf-8'
    );

    const { data: frontmatter, content } = matter(markdownWithMeta);

    // Fetch related posts (simple logic: recent posts excluding current)
    const allPosts = getSortedPostsData();
    const relatedPosts = allPosts.filter(p => p.slug !== decodedSlug).slice(0, 3);

    // Schema Markup
    const productsRegex = /name:\s*"([^"]+)"[\s\S]*?image/g;
    const productsMatch = [...content.matchAll(productsRegex)];
    const itemListElement = productsMatch.map((match, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: match[1],
    }));

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BlogPosting',
                headline: frontmatter.title,
                description: frontmatter.description,
                image: frontmatter.image ? [`https://tech-trend-blog-27mo.vercel.app${frontmatter.image}`] : [],
                datePublished: frontmatter.date,
                author: { '@type': 'Organization', name: 'Best Buy Guide Editorial' },
                mainEntityOfPage: { '@type': 'WebPage', '@id': `https://tech-trend-blog-27mo.vercel.app/posts/${decodedSlug}` }
            },
            { '@type': 'ItemList', itemListElement: itemListElement },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://tech-trend-blog-27mo.vercel.app' },
                    { '@type': 'ListItem', position: 2, name: frontmatter.title, item: `https://tech-trend-blog-27mo.vercel.app/posts/${decodedSlug}` }
                ]
            }
        ]
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* ... (Header) ... */}
            <header className="fixed top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100">
                <div className="container mx-auto flex h-16 items-center px-4 max-w-7xl justify-between">
                    <Link href="/" className="font-bold text-lg tracking-tight text-slate-900 hover:opacity-70 transition-opacity">
                        Best Buy Guide
                    </Link>
                    {/* Could add Share buttons here */}
                </div>
            </header>

            <main className="pt-24 pb-20">
                <article className="container mx-auto px-4 max-w-7xl">

                    {/* Breadcrumbs */}
                    <div className="max-w-4xl mx-auto">
                        <Breadcrumbs title={frontmatter.title} />
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">

                        {/* MAIN CONTENT COLUMN */}
                        <div className="flex-1 max-w-4xl lg:min-w-[700px]">
                            {/* Article Header */}
                            <div className="mb-10 text-left">
                                <div className="flex items-center gap-3 text-slate-500 text-sm font-semibold mb-6">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">レビュー</span>
                                    <span>{frontmatter.date instanceof Date ? frontmatter.date.toISOString().split('T')[0] : frontmatter.date}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 5分</span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.2] mb-8 text-slate-900 tracking-tight">
                                    {frontmatter.title}
                                </h1>
                                <p className="text-xl text-slate-500 leading-relaxed">
                                    {frontmatter.description}
                                </p>
                            </div>

                            {/* Main Hero Image */}
                            {frontmatter.image && (
                                <div className="mb-12 rounded-2xl overflow-hidden aspect-video shadow-lg bg-slate-100">
                                    <img
                                        src={frontmatter.image}
                                        alt={frontmatter.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Mobile ToC could go here (optional, skipping for now to keep clean) */}

                            {/* MDX Content */}
                            <div className="prose prose-slate prose-lg max-w-none 
                                prose-headings:font-bold prose-headings:text-slate-900 
                                prose-p:text-slate-600 prose-p:leading-8 
                                prose-li:text-slate-600
                                prose-img:rounded-xl prose-img:shadow-md
                            ">
                                <MDXRemote source={content} components={components} />
                            </div>
                        </div>

                        {/* SIDEBAR COLUMN (PC Only) */}
                        <aside className="hidden lg:block w-80 min-w-[320px] flex-col gap-8 order-2">
                            <AuthorProfile />
                            <TableOfContents />
                            {/* Keep the floating CTA for mobile, but maybe add sidebar sticky ad here later */}
                        </aside>

                    </div>

                    {/* Mobile Author Profile (Bottom) */}
                    <div className="lg:hidden mt-16 max-w-4xl mx-auto">
                        <AuthorProfile />
                    </div>


                    {/* Related Posts Section */}
                    {relatedPosts.length > 0 && (
                        <div className="max-w-4xl mx-auto mt-20 pt-12 border-t border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-8">こちらの記事もおすすめ</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                {relatedPosts.map((post) => (
                                    <Link key={post.slug} href={`/posts/${post.slug}`} className="group block">
                                        <div className="aspect-[16/10] overflow-hidden rounded-lg bg-slate-100 mb-3 shadow-sm">
                                            {post.image ? (
                                                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {post.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{post.description}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-12 mt-12 border-t border-slate-900">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <p className="text-xs">
                        &copy; {new Date().getFullYear()} Best Buy Guide. Quality First.
                    </p>
                </div>
            </footer>
        </div>
    );
}
