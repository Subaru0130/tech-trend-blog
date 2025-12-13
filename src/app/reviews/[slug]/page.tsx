import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { getProductBySlug, getAllSlugs } from '@/lib/data';

import { getAmazonLink, getRakutenLink } from '@/lib/affiliate';

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

export default async function ReviewPage({ params }: Props) {
    const { slug } = await params;
    const product = getProductBySlug(slug);

    if (!product) {
        notFound();
    }

    // Attempt to read review content
    const filePath = path.join(REVIEW_DIR, `${slug}.md`);
    let content = null;
    try {
        if (fs.existsSync(filePath)) {
            content = fs.readFileSync(filePath, 'utf8');
        }
    } catch (e) {
        console.error("Error reading review file:", e);
    }

    const amazonLink = getAmazonLink(product.asin, product.affiliateLinks?.amazon);

    return (
        <div className="bg-background-light text-text-main antialiased selection:bg-accent/20 selection:text-primary min-h-screen font-sans">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="pt-24 pb-12 bg-white border-b border-border-color">
                    <div className="max-w-4xl mx-auto px-4">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-xs font-bold text-stone-500 mb-8 overflow-x-auto whitespace-nowrap">
                            <Link href="/" className="hover:text-accent transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">home</span>
                                ホーム
                            </Link>
                            <span className="material-symbols-outlined text-[12px] text-stone-300">chevron_right</span>
                            <Link href="/rankings/prototype" className="hover:text-accent transition-colors">
                                完全ワイヤレスイヤホン
                            </Link>
                            <span className="material-symbols-outlined text-[12px] text-stone-300">chevron_right</span>
                            <span className="text-text-main line-clamp-1">{product.name}</span>
                        </nav>

                        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                            {/* Product Image */}
                            <div className="w-full md:w-1/2">
                                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-surface-subtle border border-border-color relative shadow-sm">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {product.tags.bestBuy && (
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-rank-gold text-white px-4 py-2 rounded-lg text-sm font-black shadow-md border border-white/20">
                                                総合No.1
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Product Info Header */}
                            <div className="w-full md:w-1/2">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="bg-surface-subtle text-text-sub text-xs font-bold px-3 py-1 rounded border border-border-color">
                                        完全ワイヤレスイヤホン
                                    </span>
                                    <span className="flex items-center gap-1 text-rank-gold font-bold text-sm">
                                        <span className="material-symbols-outlined filled text-[16px]">star</span>
                                        {product.rating.toFixed(1)}
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-4xl font-black text-primary mb-4 leading-tight">
                                    {product.name}
                                </h1>
                                <p className="text-text-sub font-medium leading-relaxed mb-6">
                                    {product.description || 'この製品の詳細はまだ入力されていません。'}
                                </p>
                                <div className="flex items-end gap-3 mb-8">
                                    <div className="text-3xl font-black text-primary">{product.price}</div>
                                    <div className="text-sm text-text-sub font-bold mb-1.5">（税込）</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {product.affiliateLinks.amazon && (
                                        <a
                                            href={product.affiliateLinks.amazon}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-[#FF9900] hover:bg-[#FF9900]/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#FF9900]/20 transition-all text-center flex items-center justify-center gap-2"
                                        >
                                            Amazonで見る
                                            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                        </a>
                                    )}
                                    {product.affiliateLinks.rakuten && (
                                        <a
                                            href={product.affiliateLinks.rakuten}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-[#BF0000] hover:bg-[#BF0000]/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#BF0000]/20 transition-all text-center flex items-center justify-center gap-2"
                                        >
                                            楽天で見る
                                            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Review Content */}
                <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">

                    {/* Specs Table */}
                    <section className="mb-16">
                        <h2 className="text-xl font-black text-primary mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-accent rounded-full"></span>
                            製品スペック
                        </h2>
                        <div className="bg-white rounded-xl border border-border-color overflow-hidden">
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-border-color">
                                    {product.specs.map((spec, idx) => (
                                        <tr key={idx} className="flex flex-col sm:table-row">
                                            <th className="bg-surface-subtle text-text-sub font-bold py-3 px-4 text-left sm:w-1/3 border-b sm:border-b-0 border-border-color sm:border-r">
                                                {spec.label}
                                            </th>
                                            <td className="py-3 px-4 font-bold text-primary">
                                                {spec.value}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Pros & Cons */}
                    <section className="mb-16 grid md:grid-cols-2 gap-6">
                        <div className="bg-[#E8F5E9]/30 border border-[#E8F5E9] p-6 rounded-2xl">
                            <h3 className="flex items-center gap-2 text-[#2E7D32] font-black mb-4">
                                <span className="material-symbols-outlined">thumb_up</span>
                                メリット
                            </h3>
                            <ul className="space-y-3">
                                {product.pros.map((pro, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm font-bold text-primary">
                                        <span className="material-symbols-outlined text-[#2E7D32] text-[18px] shrink-0">check</span>
                                        {pro}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-[#FFEBEE]/30 border border-[#FFEBEE] p-6 rounded-2xl">
                            <h3 className="flex items-center gap-2 text-[#C62828] font-black mb-4">
                                <span className="material-symbols-outlined">thumb_down</span>
                                デメリット
                            </h3>
                            <ul className="space-y-3">
                                {product.cons.map((con, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm font-bold text-primary">
                                        <span className="material-symbols-outlined text-[#C62828] text-[18px] shrink-0">close</span>
                                        {con}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Detailed Review Content (MDX) */}
                    <section className="prose prose-stone max-w-none prose-headings:font-black prose-headings:text-primary prose-p:text-text-main prose-li:text-text-main prose-strong:text-primary">
                        {content ? (
                            <MDXRemote source={content} />
                        ) : (
                            <div className="bg-surface-subtle border border-border-color border-dashed rounded-2xl p-8 text-center">
                                <span className="material-symbols-outlined text-4xl text-stone-300 mb-4">auto_awesome</span>
                                <h3 className="text-lg font-bold text-primary mb-2">詳細レビュー準備中</h3>
                                <p className="text-sm text-text-sub">
                                    ここには、Gemini 3 Pro (High) によって生成された、実機レビューに基づく詳細な記事が入ります。<br />
                                    音質の深掘り、ノイズキャンセリングの実地テスト、装着感の微妙なニュアンスなど、<br />
                                    「買うべきかどうか」を判断するための濃厚な情報が追加される予定です。
                                </p>
                            </div>
                        )}
                    </section>

                </div>
            </main>

            <Footer />
        </div>
    );
}
