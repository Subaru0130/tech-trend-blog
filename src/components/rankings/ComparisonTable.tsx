import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';

type ComparisonTableProps = {
    products: Product[];
};

const ComparisonTable = ({ products }: ComparisonTableProps) => {
    // Only show top 5 products in comparison table
    const topProducts = products.slice(0, 5);

    return (
        <section className="mb-20">
            <h2 className="text-2xl font-black text-primary mb-8 text-center md:text-left">TOP5 比較表</h2>
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-border-color">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse comparison-table min-w-[800px]">
                        <thead className="bg-surface-subtle text-text-sub font-bold text-xs uppercase tracking-wider border-b border-border-color">
                            <tr>
                                <th className="px-6 py-4 w-16 text-center">順位</th>
                                <th className="px-6 py-4 w-64">商品名</th>
                                <th className="px-6 py-4 text-center">総合評価</th>
                                <th className="px-6 py-4 text-center">ノイキャン</th>
                                <th className="px-6 py-4 text-center">バッテリー</th>
                                <th className="px-6 py-4 text-center w-32">参考価格</th>
                                <th className="px-6 py-4 w-32"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {topProducts.map((product) => {
                                // Extract specific specs for the table
                                const ncSpec = product.specs.find(s => s.label.includes('ノイズ'))?.value || '-';
                                const batterySpec = product.specs.find(s => s.label.includes('時間'))?.value || '-';

                                // Determine rank style
                                let rankBgClass = 'bg-surface-subtle text-text-sub border border-border-color';
                                if (product.rank === 1) rankBgClass = 'bg-rank-gold text-white shadow-sm border-transparent';
                                if (product.rank === 2) rankBgClass = 'bg-rank-silver text-white shadow-sm border-transparent';
                                if (product.rank === 3) rankBgClass = 'bg-rank-bronze text-white shadow-sm border-transparent';

                                return (
                                    <tr key={product.id} className={`hover:bg-surface-subtle/30 transition-colors ${product.rank === 1 ? 'bg-accent/5' : ''}`}>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center size-8 rounded-full font-black ${rankBgClass}`}>
                                                {product.rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-lg relative overflow-hidden border border-border-color bg-white shrink-0">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                {/* Updated Link */}
                                                <Link className="font-bold text-primary hover:text-accent hover:underline line-clamp-2" href={`/reviews/${product.id}`}>
                                                    {product.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1 text-rank-gold font-bold">
                                                <span className="material-symbols-outlined filled text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span>{product.rating.toFixed(1)}</span>
                                            </div>
                                        </td>
                                        {/* TODO: Add grade logic (S+, A...) to data if needed. Using specs for now. */}
                                        <td className="px-6 py-4 text-center font-bold text-primary">{ncSpec}</td>
                                        <td className="px-6 py-4 text-center text-text-sub">{batterySpec}</td>
                                        <td className="px-6 py-4 text-center font-bold text-primary">{product.price}</td>
                                        <td className="px-6 py-4 text-center">
                                            {/* Updated Link */}
                                            <Link className={`inline-flex items-center justify-center text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm w-full ${product.rank <= 3 ? 'text-white bg-accent hover:bg-accent-dark' : 'text-text-main border border-border-color bg-white hover:bg-surface-subtle'}`} href={`/reviews/${product.id}`}>
                                                詳細へ
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default ComparisonTable;
