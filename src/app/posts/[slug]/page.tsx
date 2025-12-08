import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { RankingCard } from '@/components/affiliate/RankingCard';
import { ComparisonTable } from '@/components/affiliate/ComparisonTable';
import { QuickSummary } from '@/components/affiliate/QuickSummary';
import { FloatingCTA } from '@/components/ui/FloatingCTA';

// Components map for MDX
const components = {
    RankingCard,
    ComparisonTable,
    QuickSummary,
    FloatingCTA,
    h2: (props: any) => <h2 className="text-2xl md:text-3xl font-serif font-bold mt-12 mb-6 text-stone-900 border-b border-stone-200 pb-4" {...props} />,
    h3: (props: any) => <h3 className="text-xl md:text-2xl font-bold mt-10 mb-4 text-stone-800" {...props} />,
    p: (props: any) => <p className="text-stone-600 leading-loose mb-6 text-lg" {...props} />,
    ul: (props: any) => <ul className="list-disc list-inside space-y-2 mb-8 text-stone-600 ml-4" {...props} />,
    li: (props: any) => <li className="pl-2" {...props} />,
    strong: (props: any) => <strong className="font-bold text-stone-900" {...props} />,
};

export async function generateStaticParams() {
    const files = fs.readdirSync(path.join(process.cwd(), 'content/posts'));
    return files.map((filename) => ({
        slug: filename.replace('.mdx', ''),
    }));
}

export default function Post({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const decodedSlug = decodeURIComponent(slug);
    const markdownWithMeta = fs.readFileSync(
        path.join(process.cwd(), 'content/posts', `${decodedSlug}.mdx`),
        'utf-8'
    );

    const { data: frontmatter, content } = matter(markdownWithMeta);

    // JSON-LD for BlogPosting
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: frontmatter.title,
        description: frontmatter.description,
        image: frontmatter.image ? [`https://tech-trend-blog.vercel.app${frontmatter.image}`] : [],
        datePublished: frontmatter.date,
        author: {
            '@type': 'Organization',
            name: 'Best Buy Guide Editorial',
        },
    };

    return (
        <div className="min-h-screen bg-white font-sans text-stone-900 selection:bg-stone-200">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header */}
            <header className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-stone-100 transition-all">
                <div className="container mx-auto flex h-16 items-center px-4 max-w-4xl">
                    <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-bold text-sm">Back to Home</span>
                    </Link>
                </div>
            </header>

            <main className="pt-24 pb-20">
                <article className="container mx-auto px-4 max-w-4xl">
                    {/* Article Header */}
                    <div className="mb-12 text-center">
                        <div className="flex items-center justify-center gap-2 text-stone-400 text-sm font-medium mb-6 uppercase tracking-widest">
                            <span>Review</span>
                            <span>•</span>
                            <span>{frontmatter.date}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 5 min read</span>
                        </div>
                        <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-8 text-stone-900">
                            {frontmatter.title}
                        </h1>
                        <p className="text-xl text-stone-500 leading-relaxed max-w-2xl mx-auto">
                            {frontmatter.description}
                        </p>
                    </div>

                    {/* Hero Image */}
                    {frontmatter.image && (
                        <div className="mb-16 rounded-sm overflow-hidden aspect-video shadow-sm">
                            <img
                                src={frontmatter.image}
                                alt={frontmatter.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* MDX Content */}
                    <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-a:text-stone-900 prose-a:underline prose-a:decoration-stone-300 prose-img:rounded-sm">
                        <MDXRemote source={content} components={components} />
                    </div>
                </article>
            </main>

            {/* Footer */}
            <footer className="bg-stone-50 border-t border-stone-100 py-12 mt-12">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <p className="text-xs text-stone-400">
                        &copy; {new Date().getFullYear()} Best Buy Guide. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
