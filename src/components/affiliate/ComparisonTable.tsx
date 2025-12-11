import React from 'react';
import { Check, Minus, ExternalLink } from 'lucide-react';

interface ProductSpec {
    id: string;
    name: string;
    specs: { [key: string]: string };
    bestBuy?: boolean;
    image?: string;
    rank?: number;
    asin?: string; // Added ASIN support
}

interface ComparisonTableProps {
    products: ProductSpec[];
    specLabels: { [key: string]: string };
}

export function ComparisonTable({ products, specLabels }: ComparisonTableProps) {
    const specKeys = Object.keys(specLabels);

    const getAmazonUrl = (asin?: string) => {
        if (!asin) return '#';
        const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || 'demo-22';
        return `https://www.amazon.co.jp/dp/${asin}?tag=${tag}&linkCode=ogi&th=1&psc=1`;
    };

    return (
        <div className="my-16 overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="text-xl font-bold text-center mb-6 text-slate-800 flex items-center justify-center gap-2">
                <span className="bg-amber-100 text-amber-600 p-1 rounded-full"><Check className="w-5 h-5" /></span>
                スペック比較表
            </div>
            <table className="w-full min-w-[900px] border-collapse text-base text-slate-700 shadow-sm rounded-2xl overflow-hidden border border-slate-200">
                <thead>
                    <tr className="bg-slate-50/80">
                        <th className="p-5 text-left font-bold text-slate-700 border-b border-slate-200 min-w-[200px] sticky left-0 z-20 bg-[#f8fafc] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] text-base">
                            商品名
                        </th>
                        {specKeys.map((key) => (
                            <th key={key} className="p-4 text-center font-bold text-slate-600 border-b border-slate-200 min-w-[140px] text-base">
                                {specLabels[key]}
                            </th>
                        ))}
                        <th className="p-4 text-center font-bold text-amber-600 border-b border-slate-200 min-w-[140px] text-base">
                            詳細
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={product.id || product.asin || `product-${index}`} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                            <td className="p-5 font-bold text-slate-900 border-b border-slate-100 sticky left-0 z-20 bg-inherit shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                                <div className={`absolute inset-0 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} -z-10`} />
                                <div className="relative flex items-center gap-3">
                                    {product.bestBuy && (
                                        <span className="bg-amber-500 text-white text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap shadow-sm">
                                            1位
                                        </span>
                                    )}
                                    <span className="leading-snug text-base">{product.name}</span>
                                </div>
                            </td>
                            {specKeys.map((key) => {
                                let value = product.specs[key];
                                if (typeof value === 'boolean') value = value ? '〇' : '-';
                                const strValue = String(value);
                                const isBest = strValue === '5.0' || strValue.includes('◎') || (key === 'price' && product.bestBuy);

                                return (
                                    <td key={key} className={`p-4 text-center border-b border-slate-100 text-base ${isBest ? 'bg-amber-50/50 font-bold text-slate-900' : ''}`}>
                                        {value || <Minus className="w-4 h-4 mx-auto text-slate-300" />}
                                    </td>
                                );
                            })}
                            <td className="p-4 text-center border-b border-slate-100">
                                {product.asin ? (
                                    <a
                                        href={getAmazonUrl(product.asin)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
                                        className="inline-flex items-center justify-center w-full px-4 py-3 text-base font-bold transition-all rounded-lg hover:bg-black shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        Amazonで見る <ExternalLink className="w-4 h-4 ml-1" />
                                    </a>
                                ) : (
                                    <span className="text-slate-300">-</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
