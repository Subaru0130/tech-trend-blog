import React from 'react';
import { Check, Minus } from 'lucide-react';

interface ProductSpec {
    id: string;
    name: string;
    specs: { [key: string]: string };
    bestBuy?: boolean;
    image?: string; // Added image for sticky column
    rank?: number; // Added rank for sticky column
}

interface ComparisonTableProps {
    products: ProductSpec[];
    specLabels: { [key: string]: string };
}

export function ComparisonTable({ products, specLabels }: ComparisonTableProps) {
    const specKeys = Object.keys(specLabels);

    return (
        <div className="my-16 overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0">
            <h3 className="text-2xl font-bold text-center mb-6 text-slate-800">スペック比較表</h3>
            <table className="w-full min-w-[900px] border-collapse text-base text-slate-700 shadow-sm rounded-xl overflow-hidden">
                <thead>
                    <tr className="bg-slate-100/80">
                        <th className="p-5 text-left font-bold text-slate-700 border-b border-slate-300 min-w-[200px] sticky left-0 z-20 bg-[#f1f5f9] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                            商品名
                        </th>
                        {specKeys.map((key) => (
                            <th key={key} className="p-4 text-center font-bold text-slate-600 border-b border-slate-300 min-w-[140px]">
                                {specLabels[key]}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={product.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            <td className="p-5 font-bold text-slate-900 border-b border-slate-200 sticky left-0 z-20 bg-inherit shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                                <div className={`absolute inset-0 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} -z-10`} />
                                <div className="relative flex items-center gap-4">
                                    {product.bestBuy && (
                                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] px-2 py-1 rounded-full font-bold whitespace-nowrap shadow-sm">
                                            1位
                                        </span>
                                    )}
                                    <span className="leading-snug">{product.name}</span>
                                </div>
                            </td>
                            {specKeys.map((key) => {
                                let value = product.specs[key];
                                if (typeof value === 'boolean') value = value ? '〇' : '-';
                                const strValue = String(value);
                                const isBest = strValue === '5.0' || strValue.includes('◎') || (key === 'price' && product.bestBuy);

                                return (
                                    <td key={key} className={`p-4 text-center border-b border-slate-200 ${isBest ? 'bg-orange-50/50 font-bold text-slate-900' : ''}`}>
                                        {value || <Minus className="w-4 h-4 mx-auto text-slate-300" />}
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
