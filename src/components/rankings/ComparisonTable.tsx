"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { getAmazonLink, getRakutenLink } from '@/lib/affiliate';

type ComparisonTableProps = {
    products: Product[];
    criteria?: {
        points: Array<{
            icon: string;
            title: string;
        }>;
    };
};

type ComparisonProduct = Product & {
    calculatedRating?: number;
    costPerformance?: number;
};

const ComparisonTable = ({ products = [], criteria }: ComparisonTableProps) => {
    // State for expanded view
    const [isExpanded, setIsExpanded] = useState(false);

    // Show all products in comparison table, sorted by rank
    const topProducts = products.sort((a, b) => a.rank - b.rank);

    // Determine visible products: Top 3 initially, all if expanded
    const INITIAL_COUNT = 3;
    const visibleProducts = isExpanded ? topProducts : topProducts.slice(0, INITIAL_COUNT);
    const hiddenCount = topProducts.length - INITIAL_COUNT;

    // === FULLY DYNAMIC HEADERS ===
    // Instead of relying on static criteria.points, extract headers from actual product specs
    // This ensures compatibility with ANY category (audio, appliances, furniture, etc.)
    let headers: string[] = [];

    if (topProducts.length > 0 && topProducts[0]?.specs?.length > 0) {
        // Use actual spec labels from first product - truly generic!
        headers = topProducts[0].specs.slice(0, 4).map(s => s.label);
    } else if (criteria?.points?.length) {
        // Fallback to criteria only if no specs available
        headers = criteria.points.map(p => p.title);
    }


    return (
        <section className="mb-20">
            <div className="w-full mx-auto max-w-full">
                <h2 className="text-2xl font-black text-primary mb-8 text-center md:text-left">TOP{topProducts.length} 徹底比較表 (最新版)</h2>

                <div className="md:hidden text-xs text-center text-text-sub mb-2">← 横にスクロールできます →</div>
                <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-border-color">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-sm text-left border-collapse comparison-table">
                            <thead className="bg-surface-subtle text-text-sub font-bold text-xs uppercase tracking-wider border-b border-border-color">
                                <tr>
                                    <th className="px-3 py-3 w-12 text-center sticky left-0 bg-surface-subtle z-10">順位</th>
                                    <th className="px-3 py-3 max-w-[200px] sticky left-12 bg-surface-subtle z-10">商品名</th>
                                    <th className="px-3 py-3 min-w-[140px] text-center">購入・詳細</th>
                                    <th className="px-3 py-3 text-center whitespace-nowrap">評価</th>
                                    <th className="px-3 py-3 text-center whitespace-nowrap">参考価格</th>
                                    <th className="px-3 py-3 text-center whitespace-nowrap">コスパ</th>
                                    {headers.map((header, idx) => (
                                        <th key={idx} className="px-3 py-3 text-center whitespace-nowrap text-xs">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {visibleProducts.map((product, index) => {
                                    const enhancedProduct = product as ComparisonProduct;
                                    // Extract specs with improved matching
                                    const specValues = headers.map((header, headerIdx) => {
                                        if (!product.specs || product.specs.length === 0) return '-';

                                        // === SIMPLIFIED LOGIC ===
                                        // Since headers are now derived from actual spec labels,
                                        // we can match by exact label or use same index position

                                        // 1. Try exact label match first
                                        const exactMatch = product.specs.find(s => s.label === header);
                                        if (exactMatch) return exactMatch.value;

                                        // 2. Try fuzzy label match (contains)
                                        const fuzzyMatch = product.specs.find(s =>
                                            s.label.includes(header) || header.includes(s.label)
                                        );
                                        if (fuzzyMatch) return fuzzyMatch.value;

                                        // 3. Fallback: same index position
                                        if (product.specs[headerIdx]) {
                                            return product.specs[headerIdx].value;
                                        }

                                        return '-';
                                    });

                                    // Generate Links
                                    const amzLink = getAmazonLink(product.asin, product.affiliateLinks?.amazon, product.id);
                                    const rakLink = getRakutenLink(product.name, product.affiliateLinks?.rakuten);

                                    // Determine rank from index (0-based) since product.rank might be undefined
                                    const displayRank = product.rank || (index + 1);

                                    // Determine colors based on rank
                                    let rankBgClass = 'bg-rank-bronze text-white';
                                    let rowBgClass = '';

                                    if (displayRank === 1) {
                                        rankBgClass = 'bg-rank-gold text-white shadow-md';
                                        rowBgClass = 'bg-amber-50/50';
                                    } else if (displayRank === 2) {
                                        rankBgClass = 'bg-rank-silver text-white';
                                        rowBgClass = 'bg-slate-50/50';
                                    } else if (displayRank === 3) {
                                        rankBgClass = 'bg-rank-bronze text-white';
                                        rowBgClass = 'bg-orange-50/30';
                                    }

                                    return (
                                        <tr key={product.id} className={`hover:bg-surface-subtle/30 transition-colors ${rowBgClass}`}>
                                            <td className="px-3 py-3 text-center sticky left-0 bg-white z-10">
                                                <span className={`inline-flex items-center justify-center size-8 rounded-full font-black text-sm ${rankBgClass}`}>
                                                    {displayRank}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 max-w-[200px] sticky left-12 bg-white z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-12 rounded-lg relative overflow-hidden border border-border-color bg-white shrink-0">
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            fill
                                                            sizes="48px"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <Link className="font-bold text-primary hover:text-accent hover:underline line-clamp-2 leading-tight" href={`/reviews/${product.id}`}>
                                                        {product.name}
                                                    </Link>
                                                </div>
                                            </td>

                                            {/* Action Column (Moved Here) */}
                                            <td className="px-3 py-3 text-center">
                                                <div className="flex flex-col gap-2 items-center w-full">
                                                    <div className="flex gap-1 w-full justify-center">
                                                        {amzLink && (
                                                            <a href={amzLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#FF9900] hover:bg-[#ffad33] text-white text-[11px] font-bold py-2 px-2 rounded-md transition-shadow hover:shadow-md flex items-center justify-center shadow-sm">
                                                                Amazon
                                                            </a>
                                                        )}
                                                        {rakLink && (
                                                            <a href={rakLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#BF0000] hover:bg-[#d90000] text-white text-[11px] font-bold py-2 px-2 rounded-md transition-shadow hover:shadow-md flex items-center justify-center shadow-sm">
                                                                楽天
                                                            </a>
                                                        )}
                                                    </div>
                                                    <Link className="block w-full text-center text-white text-[11px] font-bold py-1.5 rounded-md transition-colors hover:opacity-90 shadow-sm bg-accent hover:bg-accent-dark" href={`/reviews/${product.id}`}>
                                                        詳細レビュー
                                                    </Link>
                                                </div>
                                            </td>

                                            <td className="px-3 py-3 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-rank-gold font-black text-lg flex items-center gap-1">
                                                        <span className="material-symbols-outlined filled text-[18px]">star</span>
                                                        {(enhancedProduct.calculatedRating || product.rating).toFixed(1)}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-3 py-3 text-center font-bold text-primary whitespace-nowrap text-xs">
                                                {product.price}
                                            </td>

                                            {/* コスパ (Cost Performance) Column */}
                                            <td className="px-3 py-3 text-center">
                                                {(() => {
                                                    const cp = enhancedProduct.costPerformance || 5;
                                                    let grade = 'B';
                                                    let colorClass = 'text-slate-500 bg-slate-100';
                                                    if (cp >= 8.5) { grade = 'S'; colorClass = 'text-amber-600 bg-amber-100'; }
                                                    else if (cp >= 7) { grade = 'A'; colorClass = 'text-blue-600 bg-blue-100'; }
                                                    else if (cp >= 5) { grade = 'B'; colorClass = 'text-slate-600 bg-slate-100'; }
                                                    else { grade = 'C'; colorClass = 'text-slate-400 bg-slate-50'; }
                                                    return (
                                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm ${colorClass}`}>
                                                            {grade}
                                                        </span>
                                                    );
                                                })()}
                                            </td>

                                            {specValues.map((val, idx) => (
                                                <td key={idx} className="px-3 py-3 text-center font-bold text-text-main text-xs whitespace-nowrap">
                                                    {val}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Show More Button */}
                {!isExpanded && hiddenCount > 0 && (
                    <div className="p-4 bg-gradient-to-t from-white to-transparent -mt-8 relative pt-12 pointer-events-none">
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="w-full bg-surface-subtle hover:bg-surface-subtle/80 text-primary font-bold py-4 rounded-xl border border-border-color transition-all hover:shadow-md flex items-center justify-center gap-2 group pointer-events-auto"
                        >
                            <span>比較表をすべて見る（残り{hiddenCount}商品）</span>
                            <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">expand_more</span>
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ComparisonTable;
