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
    h2: (props: any) => <h2 className="text-2xl md:text-3xl font-bold mt-16 mb-8 text-[#333333] border-b border-[#EEEEEE] pb-4" {...props} />,
    h3: (props: any) => <h3 className="text-xl md:text-2xl font-bold mt-12 mb-6 text-[#333333]" {...props} />,
    p: (props: any) => <p className="text-[#666666] leading-[2.0] mb-8 text-base md:text-lg tracking-wide" {...props} />,
    ul: (props: any) => <ul className="list-disc list-inside space-y-3 mb-10 text-[#666666] ml-4 bg-white p-6 rounded-[4px]" {...props} />,
    li: (props: any) => <li className="pl-2 leading-[1.9]" {...props} />,
    strong: (props: any) => <strong className="font-bold text-[#333333] border-b border-[#CCCCCC]" {...props} />,
};

export async function generateStaticParams() {
    const files = fs.readdirSync(path.join(process.cwd(), 'content/posts'));
    return files.map((filename) => ({
        slug: filename.replace('.mdx', ''),
    }));
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
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
        image: frontmatter.image ? [`https://tech-trend-blog-27mo.vercel.app${frontmatter.image}`] : [],
        datePublished: frontmatter.date,
        author: {
            '@type': 'Organization',
            name: 'Best Buy Guide Editorial',
        },
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#333333] selection:bg-[#EEEEEE]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header */}
            <header className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-[#EEEEEE] transition-all">
                <div className="container mx-auto flex h-16 items-center px-4 max-w-4xl">
                    <Link href="/" className="flex items-center gap-2 text-[#666666] hover:text-[#333333] transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium text-sm">ホームに戻る</span>
                    </Link>
                </div>
            </header>

            <main className="pt-24 pb-20">
                <article className="container mx-auto px-4 max-w-4xl">
                    {/* Article Header (Clean & Airy) */}
                    <div className="mb-16 text-center">
                        <div className="flex items-center justify-center gap-3 text-[#999999] text-xs font-medium mb-8">
                            <span className="bg-white px-3 py-1 rounded-[4px] border border-[#EEEEEE] text-[#666666]">検証</span>
                            <span>{frontmatter.date instanceof Date ? frontmatter.date.toISOString().split('T')[0] : frontmatter.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 5分で読めます</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold leading-[1.5] mb-8 text-[#333333]">
                            {frontmatter.title}
                        </h1>
                        <p className="text-lg text-[#666666] leading-[2.0] max-w-2xl mx-auto font-normal">
                            {frontmatter.description}
                        </p>
                    </div>

                    {/* Hero Image - Soft Shadows */}
                    {frontmatter.image && (
                        <div className="mb-20 rounded-[8px] overflow-hidden aspect-video shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-white">
                            <img
                                src={frontmatter.image}
                                alt={frontmatter.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* MDX Content */}
                    <div className="prose prose-stone prose-lg max-w-none 
                        prose-headings:text-[#333333] prose-headings:font-bold prose-headings:font-sans
                        prose-p:text-[#666666] prose-p:leading-[2.0]
                        prose-li:text-[#666666]
                        prose-strong:text-[#333333] prose-strong:font-bold
                        prose-img:rounded-[4px] prose-img:shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
                        <MDXRemote source={content} components={components} />
                    </div>
                </article>
            </main>

            {/* Footer */}
            <footer className="bg-[#FAFAFA] border-t border-[#EEEEEE] py-12 mt-12">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <p className="text-xs text-[#999999]">
                        &copy; {new Date().getFullYear()} Best Buy Guide. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
