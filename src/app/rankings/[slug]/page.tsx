import React from 'react';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
// @ts-ignore
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { getArticleBySlug, getProductById } from '@/lib/data';
import { getAmazonLink, getRakutenLink } from '@/lib/affiliate';
import { Metadata } from 'next';
import { RankingItem, Product } from '@/types';
import ComparisonTable from '@/components/rankings/ComparisonTable';
import { RankingCard } from '@/components/affiliate/RankingCard';
import rehypeSlug from 'rehype-slug';
import TableOfContents from '@/components/shared/TableOfContents';
import GlossarySection from '@/components/shared/GlossarySection';

// Utility to slugs
const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

// Utility to strip markdown (links, bold, etc) for TOC display
const stripMarkdown = (text: string) => {
    return text
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links [text](url) -> text
        .replace(/[*_~`]/g, '')                   // Remove bold/italic/code markers
        .replace(/👉/g, '')                        // Remove specific emojis if widely used
        .trim();
};

type Props = {
    params: Promise<{ slug: string }>;
};

// Required for static export - pre-generate all ranking pages
export async function generateStaticParams() {
    const articlesPath = path.join(process.cwd(), 'src/data/articles.json');
    try {
        const articlesData = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));
        return articlesData.map((article: any) => ({
            slug: encodeURIComponent(article.slug || article.id),
        }));
    } catch (e) {
        console.error('Failed to read articles for static params:', e);
        return [];
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article) {
        return {
            title: 'ページが見つかりません | BestChoice',
        };
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "image": [
            article.thumbnail
        ],
        "datePublished": article.publishDate || article.publishedAt,
        "dateModified": article.updatedDate || article.publishDate,
        "author": [{
            "@type": "Person",
            "name": article.author,
            "url": "https://choiceguide.jp/about"
        }]
    };

    return {
        title: `${article.title} | BestChoice`,
        description: article.description,
        alternates: {
            canonical: `https://choiceguide.jp/rankings/${slug}`,
        },
        openGraph: {
            title: article.title,
            description: article.description,
            images: [article.thumbnail],
        },
        other: {
            'script:ld+json': JSON.stringify(jsonLd)
        }
    };
}

// Helper to strip the AI-generated ranking section text to avoid duplication with the template's ranking list
function stripRankingSection(content: string): string {
    // Matches "## ...Ranking..." header and everything following it, 
    // up until the next "## ...Summary/Matome..." header or End of String.
    return content.replace(/##\s+.*ランキング.*[\r\n]+([\s\S]*?)(?=##\s+.*(?:まとめ|Summary)|$)/i, '');
}

const NullComponent = () => null;

export default async function RankingPage({ params }: Props) {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article) {
        notFound();
    }

    // Attempt to read extended ranking content
    // (Buying Guide, etc.)


    // Normalize Ranking Items
    // If article has explicit `rankingItems`, use them.
    // If not, use `products` array and hydrate from `getProductById`.
    let rankingItems: RankingItem[] = [];

    if (article.rankingItems) {
        rankingItems = article.rankingItems;
    } else if (article.products && article.products.length > 0) {
        const potentialItems = article.products.map((productId, index) => {
            const product = getProductById(productId);
            if (!product) return null;

            const item: RankingItem = {
                rank: index + 1,
                productId: product.id,
                badge: index === 0 ? "総合No.1" : (product.tags?.highCospa ? "コスパ最強" : "おすすめ"),
                rankBadge: index === 0 ? "gold" : (index === 1 ? "silver" : (index === 2 ? "bronze" : undefined)),
                rating: product.rating,
                reviewCount: product.reviewCount,
                editorComment: product.description,
                pros: product.pros || [],
                cons: product.cons || [],
                specs: product.specs.slice(0, 4),
                bestFor: product.tags?.bestBuy ? "ベストバイ" : undefined
            };
            return item;
        });

        rankingItems = potentialItems.filter((item): item is RankingItem => item !== null);
    }

    // Hydrate Product Data into Items (to get Name, Image, Price for the table)
    const enrichedItems = rankingItems.map(item => {
        const product = getProductById(item.productId);
        return { ...item, product };
    }).filter((item): item is RankingItem & { product: Product } => item.product !== undefined);

    // 2. Build TOC Headings (Comparison → Article → Ranking)
    // -------------------------------------------------------------------------
    let tocHeadings: { level: number; text: string; id: string }[] = [];

    // A) Comparison Table FIRST
    tocHeadings.push({ level: 2, text: `TOP${enrichedItems.length} 徹底比較表`, id: 'comparison-table' });

    // B) Extract Headings from MDX Content (Buying Guide etc.)
    const ARTICLE_DIR = path.join(process.cwd(), 'src/content/articles');
    let content = null;

    try {
        // Decode URL-encoded slug for file path matching
        const decodedSlug = decodeURIComponent(slug);
        const filePath = path.join(ARTICLE_DIR, `${decodedSlug}.md`);
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const { content: cleanContent } = matter(fileContent);
            content = cleanContent;

            // Extract TOC Headings from Markdown
            const regex = /^(#{2,3})\s+(.*)$/gm;
            let match;
            while ((match = regex.exec(cleanContent)) !== null) {
                const rawText = match[2].trim();
                const cleanText = stripMarkdown(rawText);
                // Skip the comparison table heading from MDX (we add it separately)
                if (cleanText.includes('比較表')) continue;
                tocHeadings.push({
                    level: match[1].length,
                    text: cleanText,
                    id: slugify(cleanText)
                });
            }
        }
    } catch (e) {
        console.error("Error reading ranking article:", e);
    }

    // C) Ranking Items LAST
    tocHeadings.push({
        level: 2,
        text: `おすすめランキングTOP${enrichedItems.length}`,
        id: 'ranking-list'
    });

    enrichedItems.forEach(item => {
        tocHeadings.push({
            level: 3,
            text: `第${item.rank}位　${item.product.name}`,
            id: `rank-${item.rank}`
        });
    });

    return (
        <>
            <div className="bg-background-light text-text-main antialiased selection:bg-accent/20 selection:text-primary">
                <Header />

                <main className="pt-24 md:pt-32 pb-20">
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "ItemList",
                                "itemListElement": rankingItems.map((item, index) => ({
                                    "@type": "ListItem",
                                    "position": index + 1,
                                    "url": `https://choiceguide.jp/reviews/${item.productId}`,
                                    "name": getProductById(item.productId)?.name || item.productId
                                }))
                            })
                        }}
                    />
                    <div className="max-w-4xl mx-auto px-4 md:px-6 mb-6">
                        <nav aria-label="Breadcrumb" className="flex items-center text-xs text-text-sub overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                            <a className="hover:text-accent transition-colors" href="/">ホーム</a>
                            <span className="mx-2 text-stone-300">/</span>
                            <a className="hover:text-accent transition-colors" href="/categories">カテゴリ</a>
                            <span className="mx-2 text-stone-300">/</span>
                            <a className="hover:text-accent transition-colors" href={`/categories/${article.categoryId}`}>{article.categoryId === 'audio' ? 'オーディオ' : (article.categoryId === 'gadget' ? 'ガジェット' : (article.categoryId === 'home-appliances' ? '生活家電' : 'その他'))}</a>
                            <span className="mx-2 text-stone-300">/</span>
                            <span className="font-bold text-primary">{article.title}</span>
                        </nav>
                    </div>
                    <div className="max-w-4xl mx-auto px-4 md:px-6 mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{article.subCategoryId}</span>
                            <div className="flex items-center text-xs text-text-sub">
                                <span className="material-symbols-outlined text-[16px] mr-1">update</span>
                                <span>{article.updatedDate || article.publishedAt} 更新</span>
                            </div>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-primary leading-tight mb-6">
                            {article.title}
                        </h1>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-y border-border-color bg-white/50 rounded-xl px-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-surface-subtle overflow-hidden border border-border-color relative">
                                    <img
                                        src="/images/author_misaki.png"
                                        alt="編集部"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="text-xs text-text-sub font-bold mb-0.5">この記事の監修・執筆</div>
                                    <div className="text-sm font-bold text-primary">{article.author}</div>
                                    <p className="text-xs text-text-sub mt-1 max-w-xl">
                                        スペック・価格・ユーザーの声など多角的な情報をもとに、最適な製品選びをサポートします。
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {/* Share buttons removed as per user request */}
                            </div>
                        </div>
                    </div>

                    {article.thumbnail && (
                        <div className="max-w-4xl mx-auto px-4 md:px-6 mb-10">
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-border-color">
                                <img
                                    src={`${article.thumbnail}?v=${new Date().getTime()}`}
                                    alt={article.title}
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                    width={1200}
                                    height={675}
                                />
                            </div>
                        </div>
                    )}

                    {/* TOC */}
                    <div className="max-w-4xl mx-auto px-4 md:px-6 mb-12">
                        <TableOfContents headings={tocHeadings} />
                    </div>

                    {/* 1. Comparison Table FIRST */}
                    <div id="comparison-table" className="scroll-mt-32 mb-16 max-w-4xl mx-auto px-4 md:px-6">
                        <ComparisonTable
                            products={enrichedItems.map(item => ({
                                ...item.product,
                                rank: item.rank,
                                specs: item.specs || item.product.specs || []
                            }))}
                            criteria={article.rankingCriteria ? {
                                points: article.rankingCriteria.points.map((p: any) => ({
                                    icon: p.icon || 'star',
                                    title: p.title || p.label || ''
                                }))
                            } : undefined}
                        />
                    </div>

                    {/* Glossary Section - Collapsible */}
                    <details className="max-w-4xl mx-auto px-4 md:px-6 mb-8">
                        <summary className="cursor-pointer flex items-center gap-2 text-sm font-bold text-primary hover:text-accent transition-colors py-3 border-b border-border-color">
                            <span className="material-symbols-outlined text-lg">menu_book</span>
                            この記事で使われている用語を確認する
                            <span className="material-symbols-outlined ml-auto">expand_more</span>
                        </summary>
                        <div className="pt-4">
                            <GlossarySection content={content || ''} />
                        </div>
                    </details>

                    {/* 2. Article Content (Introduction, Selection Guide, Summary) SECOND */}
                    {content && (
                        <div className="max-w-4xl mx-auto px-4 md:px-6 mb-16">
                            <div className="prose prose-stone max-w-none prose-headings:scroll-mt-32 prose-headings:font-bold prose-headings:text-primary prose-a:text-accent prose-a:underline prose-a:decoration-accent/50 prose-a:underline-offset-2 prose-p:text-text-main prose-li:text-text-main">
                                <MDXRemote
                                    source={stripRankingSection(content)}
                                    components={{
                                        ComparisonTable: NullComponent,
                                        RankingCard: NullComponent,
                                        // Add other components if needed (e.g., QuickSummary, FloatingCTA)
                                    }}
                                    options={{
                                        mdxOptions: {
                                            remarkPlugins: [remarkGfm],
                                            rehypePlugins: [rehypeSlug],
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* 3. Ranking Details LAST */}
                    <div className="scroll-mt-32">
                        <div id="ranking-list" className="scroll-mt-32 max-w-4xl mx-auto px-4 md:px-6 mb-8 mt-16">
                            <h2 className="text-2xl md:text-3xl font-black text-primary leading-tight">おすすめランキングTOP{enrichedItems.length}</h2>
                        </div>
                        <section className="max-w-4xl mx-auto px-4 md:px-6 space-y-16 mb-24">
                            {enrichedItems.map((item, i) => (
                                <article key={i} className="scroll-mt-32" id={`rank-${item.rank}`}>
                                    <div className="flex items-center gap-4 mb-4">
                                        {item.rank <= 3 ? (
                                            <div className={`flex items-center justify-center size-12 ${item.rank === 1 ? 'bg-rank-gold shadow-rank-gold/30' : item.rank === 2 ? 'bg-rank-silver' : 'bg-rank-bronze'} text-white rounded-xl shadow-lg`}>
                                                {item.rank === 1 ? <span className="material-symbols-outlined text-[28px]">trophy</span> : <span className="text-xl font-black">{item.rank}</span>}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center size-12 bg-surface-subtle border border-border-color sm:text-stone-400 rounded-xl font-black text-xl">
                                                {item.rank}
                                            </div>
                                        )}
                                        <h2 className="text-2xl md:text-3xl font-black text-primary">第{item.rank}位</h2>
                                        {item.badge && <span className="bg-accent/10 text-accent px-3 py-1 rounded text-xs font-bold border border-accent/20">{item.badge}</span>}
                                    </div>
                                    <div className={`bg-white rounded-3xl shadow-soft border border-border-color overflow-hidden ${item.rank === 1 ? 'ring-1 ring-rank-gold/20' : ''}`}>
                                        <div className="p-6 md:p-8">
                                            <div className="flex flex-col md:flex-row gap-8 mb-8">
                                                <div className="md:w-1/2">
                                                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-border-color relative group flex items-center justify-center p-4">
                                                        <img alt={item.product.name} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" src={item.product.image || "https://placehold.co/600x400"} loading="lazy" width={600} height={450} />
                                                        {item.rank === 1 && (
                                                            <div className="absolute top-3 left-3">
                                                                <span className="bg-white/90 backdrop-blur text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                                                    Best Choice
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="md:w-1/2 flex flex-col">
                                                    <h3 className="text-2xl font-bold text-primary mb-2 leading-tight">{item.product.name}</h3>
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="flex text-rank-gold">
                                                            {[...Array(5)].map((_, starI) => (
                                                                <span key={starI} className="material-symbols-outlined filled text-[20px]" style={{ fontVariationSettings: "'FILL' " + (starI + 1 <= Math.round(item.rating) ? "1" : "0") }}>star</span>
                                                            ))}
                                                        </div>
                                                        <span className="text-xl font-black text-primary">{item.rating}</span>

                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                                        {item.specs?.slice(0, 4).map((spec: any, sI: number) => (
                                                            <div key={sI} className="bg-surface-subtle p-3 rounded-lg border border-border-color">
                                                                <div className="text-[10px] text-text-sub font-bold mb-1">{spec.label || spec.name}</div>
                                                                <div className="text-sm font-bold text-primary">{spec.value}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-auto">
                                                        <div className="flex items-end gap-2 mb-4">
                                                            <span className="text-xs text-text-sub font-bold mb-1">参考価格</span>
                                                            <span className="text-3xl font-black text-primary">{item.product.price}</span>
                                                            <span className="text-xs text-text-sub mb-1">（税込）</span>
                                                        </div>
                                                        <a className="group w-full py-4 rounded-xl bg-accent hover:bg-accent-dark text-white text-center font-bold shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 mb-3" href={`/reviews/${item.productId}`}>
                                                            詳細レビューを見る
                                                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                                        </a>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {getAmazonLink(item.product.asin, item.product.affiliateLinks?.amazon) && (
                                                                <a href={getAmazonLink(item.product.asin, item.product.affiliateLinks?.amazon) as string} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 py-3 rounded-lg bg-[#FF9900] hover:bg-[#FF9900]/90 text-white text-sm font-bold shadow-sm transition-colors">
                                                                    Amazon
                                                                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                                                </a>
                                                            )}
                                                            {getRakutenLink(item.product.name, item.product.affiliateLinks?.rakuten) && (
                                                                <a href={getRakutenLink(item.product.name, item.product.affiliateLinks?.rakuten) as string} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 py-3 rounded-lg bg-[#BF0000] hover:bg-[#BF0000]/90 text-white text-sm font-bold shadow-sm transition-colors">
                                                                    楽天
                                                                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                                <div className="bg-pros-bg/50 border border-pros-bg p-4 rounded-xl">
                                                    <div className="flex items-center gap-2 mb-2 text-pros-text font-bold text-sm">
                                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                        ここがおすすめ（メリット）
                                                    </div>
                                                    <ul className="space-y-2 text-sm text-primary">
                                                        {item.pros?.map((pro: string, pI: number) => (
                                                            <li key={pI} className="flex items-start gap-2"><span className="text-pros-text mt-1">•</span>{pro}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="bg-cons-bg/50 border border-cons-bg p-4 rounded-xl">
                                                    <div className="flex items-center gap-2 mb-2 text-cons-text font-bold text-sm">
                                                        <span className="material-symbols-outlined text-[18px]">warning</span>
                                                        ここは注意（デメリット）
                                                    </div>
                                                    <ul className="space-y-2 text-sm text-primary">
                                                        {item.cons?.map((con: string, cI: number) => (
                                                            <li key={cI} className="flex items-start gap-2"><span className="text-cons-text mt-1">•</span>{con}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </section>
                    </div>



                    {/* Dynamic Markdown Content (Buying Guide etc.) */}
                    {/* Dynamic Markdown Content (Buying Guide etc.) - FALLBACK ONLY */}
                    {!content && article.buyingGuide && (
                        <section className="max-w-4xl mx-auto px-4 md:px-6 mt-24 mb-20">
                            <div className="border-t-4 border-accent pt-12">
                                <h2 className="text-2xl md:text-3xl font-black text-primary mb-8 text-center">{article.buyingGuide.title}</h2>
                                <div className="grid md:grid-cols-3 gap-8">
                                    {article.buyingGuide.steps.map((step: any, i: number) => (
                                        <div key={i} className="space-y-3">
                                            <div className="size-12 bg-surface-subtle rounded-full flex items-center justify-center text-accent mb-2">
                                                <span className="material-symbols-outlined text-[24px]">{step.icon}</span>
                                            </div>
                                            <h3 className="font-bold text-primary">{step.title}</h3>
                                            <p className="text-sm text-text-sub leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                <Footer />
            </div>
        </>
    );
}
