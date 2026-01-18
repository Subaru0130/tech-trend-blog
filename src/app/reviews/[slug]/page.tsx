import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
// @ts-ignore
import remarkGfm from 'remark-gfm';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { getProductBySlug, getAllSlugs, CATEGORY_MAP, getArticleByProductId, getArticlesByCategory } from '@/lib/data';
import { getAmazonLink } from '@/lib/affiliate';
import ProductContent from '@/components/techrankings/ProductContent';
import { Metadata } from 'next';

const REVIEW_DIR = path.join(process.cwd(), 'src/content/reviews');

export async function generateStaticParams() {
    const slugs = getAllSlugs();
    return slugs.map((slug) => ({
        slug: slug,
    }));
}

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const product = getProductBySlug(slug);

    if (!product) {
        return { title: '製品が見つかりません | ChoiceGuide' };
    }

    return {
        title: `${product.name} 徹底レビュー | ChoiceGuide`,
        description: product.description || `${product.name}の詳細レビュー。スペック・価格・ユーザー評価を徹底分析。`,
        alternates: {
            canonical: `https://choiceguide.jp/reviews/${slug}`,
        },
        openGraph: {
            title: `${product.name} 徹底レビュー`,
            description: product.description,
            images: product.image ? [product.image] : [],
        },
    };
}

export default async function ReviewPage({ params }: Props) {
    const { slug } = await params;
    const product = getProductBySlug(slug);

    if (!product) {
        notFound();
    }
    const filePath = path.join(REVIEW_DIR, `${slug}.md`);
    let content = null;
    try {
        if (fs.existsSync(filePath)) {
            const rawContent = fs.readFileSync(filePath, 'utf8');
            const { content: mdxContent } = matter(rawContent);
            content = mdxContent;
        }
    } catch (e) {
        console.error("Error reading review file:", e);
    }

    // Determine category info
    const subCat = (product as any).subCategory || product.category;
    // Enhanced Category Mapping using shared data or fallback
    let catLabel = '生活家電';
    let catSlug = '/';

    // Check known mappings
    if (subCat === 'wireless-earphones') {
        catLabel = '完全ワイヤレスイヤホン';
        catSlug = '/rankings/best-wireless-earphones-under-10000'; // Or generic audio
    } else if (subCat === 'refrigerators') {
        catLabel = '冷蔵庫';
        catSlug = '/rankings/best-refrigerators-single-2025';
    } else if (CATEGORY_MAP[subCat]) {
        catLabel = CATEGORY_MAP[subCat].label;
        catSlug = CATEGORY_MAP[subCat].subCategories?.[0]?.slug ? `/categories/${subCat}` : '/';
    }

    const catInfo = { label: catLabel, slug: catSlug };

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.image,
        "description": product.description,
        "brand": {
            "@type": "Brand",
            "name": (product as any).brand || "Brand"
        },
        "review": {
            "@type": "Review",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": product.rating,
                "bestRating": "5"
            },
            "author": {
                "@type": "Organization",
                "name": "ChoiceGuide"
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": 1 // Fallback since we removed reviewCount
        },
        "offers": {
            "@type": "Offer",
            "url": product.affiliateLinks?.amazon || "",
            "priceCurrency": "JPY",
            "price": product.price ? product.price.replace(/[^0-9]/g, '') : "0",
            "availability": "https://schema.org/InStock"
        }
    };



    const parentArticle = getArticleByProductId(product.id);
    const relatedProducts = parentArticle?.rankingItems
        ? (parentArticle.rankingItems
            .sort((a, b) => a.rank - b.rank) // Ensure correct order
            .map(item => {
                const p = getProductBySlug(item.productId);
                if (p) {
                    return {
                        ...p,
                        rank: item.rank // Ensure rank matches the article's context
                    };
                }
                return null;
            })
            .filter((p): p is NonNullable<typeof p> => p !== null) as any[])
        : [];
    const relatedArticles = parentArticle?.category ?
        getArticlesByCategory(parentArticle.category)
        : [];

    // Filter top 3 related products
    const topRelatedProducts = relatedProducts.slice(0, 3);


    return (
        <div className="bg-background-light text-text-main antialiased selection:bg-accent/20 selection:text-primary min-h-screen font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Header />

            <main>
                {/* Hero Section & Product Details */}
                <section className="pt-24 pb-12 bg-white border-b border-border-color">
                    <div className="max-w-4xl mx-auto px-4">

                        {/* Use the new dynamic component with review content injected */}
                        <ProductContent
                            product={product}
                            parentArticle={parentArticle}
                            relatedProducts={topRelatedProducts}
                            relatedArticles={relatedArticles}
                        >
                            {content && (
                                <MDXRemote
                                    source={content}
                                    options={{
                                        mdxOptions: {
                                            remarkPlugins: [remarkGfm],
                                        }
                                    }}
                                />
                            )}
                        </ProductContent>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
