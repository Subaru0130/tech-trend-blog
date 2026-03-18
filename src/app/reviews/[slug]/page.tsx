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
import { getProductBySlug, getAllSlugs, CATEGORY_MAP, getArticlesByProductId, getArticlesByCategory } from '@/lib/data';
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
    let frontmatterData: Record<string, any> = {};
    try {
        if (fs.existsSync(filePath)) {
            const rawContent = fs.readFileSync(filePath, 'utf8');
            const { content: mdxContent, data } = matter(rawContent);
            content = mdxContent;
            frontmatterData = data;
        }
    } catch (e) {
        console.error("Error reading review file:", e);
    }

    // Extract a clean text snippet for reviewBody (first 300 chars of markdown, stripped)
    const reviewBodyText = content
        ? content.replace(/[#*\[\]()\-_>`]/g, '').replace(/\n+/g, ' ').trim().slice(0, 300) + '...'
        : product.description || '';
    const publishDate = frontmatterData.date || new Date().toISOString().split('T')[0];

    // Determine category info dynamically
    const subCat = (product as any).subCategory || (product as any).subCategoryId || product.category;
    const CATEGORY_LABELS: Record<string, string> = {
        'wireless-headphones': 'ワイヤレスイヤホン',
        'audio': 'オーディオ',
        'speakers': 'スピーカー',
        'refrigerators': '冷蔵庫',
        'washing-machines': '洗濯機',
        'air-conditioners': 'エアコン',
        'vacuum-cleaners': '掃除機',
        'cameras': 'カメラ',
        'tvs': 'テレビ・モニター',
        'input-devices': 'PC周辺機器',
        'tablets': 'タブレット',
        'smartwatches': 'スマートウォッチ',
        'kitchen-appliances': 'キッチン家電',
        'hair-dryers': 'ドライヤー',
        'air-quality': '空気清浄・加湿',
        'projectors': 'プロジェクター',
    };
    let catLabel = CATEGORY_LABELS[subCat] || (CATEGORY_MAP[subCat]?.label) || '製品レビュー';
    let catSlug = CATEGORY_MAP[subCat]?.subCategories?.[0]?.slug ? `/categories/${subCat}` : '/';

    const catInfo = { label: catLabel, slug: catSlug };

    // --- Structured Data: Product + Review + BreadcrumbList ---
    const priceValue = product.price ? product.price.replace(/[^0-9]/g, '') : "0";
    const actualReviewCount = (product as any).reviewCount || 1;

    const productJsonLd = {
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
                "name": "ChoiceGuide編集部",
                "url": "https://choiceguide.jp"
            },
            "datePublished": publishDate,
            "reviewBody": reviewBodyText
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": actualReviewCount
        },
        "offers": {
            "@type": "Offer",
            "url": product.affiliateLinks?.amazon || "",
            "priceCurrency": "JPY",
            "price": priceValue,
            "availability": "https://schema.org/InStock",
            "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "applicableCountry": "JP",
                "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                "merchantReturnDays": 30,
                "returnMethod": "https://schema.org/ReturnByMail",
                "returnFees": "https://schema.org/FreeReturn"
            },
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "JP"
                },
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "0",
                    "currency": "JPY"
                },
                "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "handlingTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 0,
                        "maxValue": 1,
                        "unitCode": "DAY"
                    },
                    "transitTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 1,
                        "maxValue": 3,
                        "unitCode": "DAY"
                    }
                }
            }
        }
    };

    // BreadcrumbList schema for breadcrumb rich results
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "ホーム",
                "item": "https://choiceguide.jp"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": catLabel,
                "item": `https://choiceguide.jp${catSlug}`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": `${product.name} レビュー`,
                "item": `https://choiceguide.jp/reviews/${slug}`
            }
        ]
    };



    const allParentArticles = getArticlesByProductId(product.id);
    // parentArticle selection is handled client-side in ProductContent via #from-{slug} hash
    const parentArticle = allParentArticles[0] || undefined;

    // Create a display product with the correct rank from the parent article context
    const displayProduct = { ...product };
    if (parentArticle?.rankingItems) {
        const rankingItem = parentArticle.rankingItems.find(item => item.productId === product.id);
        if (rankingItem) {
            displayProduct.rank = rankingItem.rank;
        }
    }

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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <Header />

            <main>
                {/* Hero Section & Product Details */}
                <section className="pt-24 pb-12 bg-white border-b border-border-color">
                    <div className="max-w-4xl mx-auto px-4">

                        {/* Use the new dynamic component with review content injected */}
                        <ProductContent
                            product={displayProduct}
                            parentArticle={parentArticle}
                            parentArticles={allParentArticles}
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
