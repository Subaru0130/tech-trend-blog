import React from 'react';
import { products } from '../data';

const ComparisonTable: React.FC = () => {
  return (
    <section id="comparison-table" className="mb-16 scroll-mt-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full"></span>
          スペック比較一覧
        </h2>
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">横にスクロールできます</span>
      </div>
      <div className="bg-surface-light rounded-xl shadow-soft border border-border-color overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th className="p-5 w-[30%] sticky left-0 bg-gray-50/95 backdrop-blur z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">モデル名</th>
                <th className="p-5 text-center w-[15%]">総合評価</th>
                <th className="p-5 text-center w-[20%]">ノイキャン強度</th>
                <th className="p-5 text-center w-[15%]">バッテリー</th>
                <th className="p-5 text-center w-[20%]">重量</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 font-medium">
              {products.map((product) => (
                <tr key={product.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="p-5 sticky left-0 bg-white group-hover:bg-gray-50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-sm ${
                        product.rank === 1 ? 'bg-yellow-400' : 
                        product.rank === 2 ? 'bg-gray-400' : 'bg-orange-700'
                      }`}>
                        {product.rank}
                      </div>
                      <div className="w-10 h-10 rounded bg-gray-100 bg-center bg-cover border border-gray-200 shrink-0" style={{ backgroundImage: `url('${product.imageUrl}')` }}></div>
                      <span className="text-gray-900 font-bold">{product.modelName}</span>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className="text-primary font-bold text-lg">{product.score}</span>
                  </td>
                  <td className="p-5 text-center">
                    <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
                      product.noiseCancelingRank === 'S' ? 'text-green-700 bg-green-50' : 'text-blue-700 bg-blue-50'
                    }`}>
                      {product.noiseCancelingRank === 'S' && <span className="material-symbols-outlined text-[14px]">star</span>}
                      {product.noiseCancelingRank}ランク
                    </div>
                  </td>
                  <td className="p-5 text-center text-gray-600">{product.batteryLife}</td>
                  <td className="p-5 text-center text-gray-600">{product.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;