import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Minus } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    image: string;
    isBestBuy?: boolean;
    ratings: {
        [key: string]: '◎' | '◯' | '△' | '×' | string;
    };
}

interface ComparisonTableProps {
    features: string[];
    products: Product[];
}

export function ComparisonTable({ features, products }: ComparisonTableProps) {
    return (
        <div className="w-full overflow-x-auto pb-4">
            <table className="min-w-[600px] w-full border-collapse text-sm md:text-base">
                <thead>
                    <tr>
                        <th className="p-3 bg-slate-50 border border-slate-200 min-w-[120px] sticky left-0 z-10">
                            <span className="font-bold text-slate-700">比較項目</span>
                        </th>
                        {products.map((product) => (
                            <th key={product.id} className={cn("p-3 border border-slate-200 min-w-[140px] relative", product.isBestBuy ? "bg-yellow-50 border-yellow-200" : "bg-white")}>
                                {product.isBestBuy && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                                        ベストバイ
                                    </div>
                                )}
                                <div className="flex flex-col items-center gap-2">
                                    <img src={product.image} alt={product.name} className="w-16 h-16 object-contain" />
                                    <span className="text-slate-800 font-bold leading-tight">{product.name}</span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {features.map((feature) => (
                        <tr key={feature}>
                            <td className="p-3 bg-slate-50 border border-slate-200 font-bold text-slate-700 sticky left-0 z-10">
                                {feature}
                            </td>
                            {products.map((product) => {
                                const rating = product.ratings[feature];
                                let colorClass = "text-slate-500";
                                if (rating === '◎') colorClass = "text-red-500 font-extrabold text-lg";
                                if (rating === '◯') colorClass = "text-orange-500 font-bold text-lg";
                                if (rating === '△') colorClass = "text-slate-500";
                                if (rating === '×') colorClass = "text-blue-500";

                                return (
                                    <td key={`${product.id}-${feature}`} className={cn("p-3 border border-slate-200 text-center align-middle", product.isBestBuy ? "bg-yellow-50/30" : "bg-white")}>
                                        <span className={colorClass}>{rating}</span>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
