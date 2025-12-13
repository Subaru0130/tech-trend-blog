import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className="flex items-center gap-1 text-yellow-400">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="material-symbols-outlined text-[20px] fill-current">star</span>
      ))}
      {hasHalfStar && <span className="material-symbols-outlined text-[20px] fill-current">star_half</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="material-symbols-outlined text-[20px] fill-current">star_border</span>
      ))}
    </div>
  );
};

// Gradient classes for badges
const badgeStyles = {
  1: "background: linear-gradient(135deg, #c5a059 0%, #d4af37 100%); color: #fff; box-shadow: 0 4px 6px rgba(197, 160, 89, 0.3);",
  2: "background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%); color: #fff; box-shadow: 0 4px 6px rgba(156, 163, 175, 0.3);",
  3: "background: linear-gradient(135deg, #b45309 0%, #92400e 100%); color: #fff; box-shadow: 0 4px 6px rgba(180, 83, 9, 0.3);"
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isFirst = product.rank === 1;

  if (isFirst) {
    return (
      <article id={`rank-${product.rank}`} className="relative bg-surface-light rounded-2xl shadow-ranking ring-1 ring-black/5 overflow-hidden scroll-mt-24">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500"></div>
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-[40%] bg-white p-8 flex flex-col items-center justify-start border-b lg:border-b-0 lg:border-r border-gray-100 relative">
            <div className="absolute top-4 left-4 z-20 px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5 transform -rotate-2" style={{ background: 'linear-gradient(135deg, #c5a059 0%, #d4af37 100%)', color: '#fff', boxShadow: '0 4px 6px rgba(197, 160, 89, 0.3)' }}>
              <span className="material-symbols-outlined text-[18px]">trophy</span>
              <span className="text-sm font-bold tracking-wider">総合 1位</span>
            </div>
            <div className="w-full aspect-square relative group my-auto">
              <div
                className="absolute inset-0 bg-center bg-contain bg-no-repeat transition-transform duration-500 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url('${product.imageUrl}')` }}
              ></div>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <div className="w-3 h-3 rounded-full bg-black ring-1 ring-gray-200 cursor-pointer hover:ring-2 hover:ring-primary transition-all"></div>
              <div className="w-3 h-3 rounded-full bg-gray-200 cursor-pointer hover:ring-2 hover:ring-primary transition-all"></div>
            </div>
          </div>
          <div className="w-full lg:w-[60%] p-6 md:p-10 flex flex-col">
            <div className="border-b border-gray-100 pb-5 mb-6">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{product.manufacturer}</span>
                <div className="flex items-center gap-1">
                   <StarRating rating={product.starRating} />
                   <span className="text-gray-900 font-bold ml-1 text-lg">{product.starRating.toFixed(1)}</span>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.modelName}</h3>
              <p className="text-text-sub text-sm leading-relaxed">{product.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-8">
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600"><span className="material-symbols-outlined text-[14px]">check</span></span>
                  メリット
                </h4>
                <ul className="space-y-2">
                  {product.pros?.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0"></span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-500"><span className="material-symbols-outlined text-[14px]">close</span></span>
                  デメリット
                </h4>
                <ul className="space-y-2">
                  {product.cons?.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0"></span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-auto bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase">最安値目安</span>
                <span className="text-2xl font-black text-gray-900">{product.price}<span className="text-xs font-medium text-gray-500 ml-1">税込</span></span>
              </div>
              <div className="flex flex-col gap-3">
                <a href={product.amazonLink} className="group relative flex items-center justify-center w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-lg shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 overflow-hidden">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer"></div>
                  <span className="flex items-center gap-2">
                    Amazonで詳細を見る
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </span>
                </a>
                <div className="grid grid-cols-2 gap-3">
                  <a href="#" className="flex items-center justify-center py-2.5 rounded-lg border border-gray-300 text-sm font-bold text-gray-600 hover:bg-white hover:border-gray-400 transition-colors bg-white/50">楽天で探す</a>
                  <a href="#" className="flex items-center justify-center py-2.5 rounded-lg border border-gray-300 text-sm font-bold text-gray-600 hover:bg-white hover:border-gray-400 transition-colors bg-white/50">Yahoo!で探す</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Other ranks layout
  const badgeStyle = product.rank === 2 ? 
    "background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%); color: #fff; box-shadow: 0 4px 6px rgba(156, 163, 175, 0.3);" : 
    "background: linear-gradient(135deg, #b45309 0%, #92400e 100%); color: #fff; box-shadow: 0 4px 6px rgba(180, 83, 9, 0.3);";

  return (
    <article id={`rank-${product.rank}`} className="relative bg-surface-light rounded-2xl shadow-soft border border-gray-200 overflow-hidden scroll-mt-24">
      <div className="flex flex-col md:flex-row h-full">
        <div className="w-full md:w-[35%] bg-gray-50 p-6 flex flex-col justify-between items-start relative border-b md:border-b-0 md:border-r border-gray-100">
          <div className="px-3 py-1 rounded-md shadow-sm text-xs font-bold flex items-center gap-1 mb-4 z-10" style={product.rank === 2 ? {background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)', color:'#fff'} : {background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)', color:'#fff'} }>
            <span className="material-symbols-outlined text-[14px]">award_star</span> 第{product.rank}位
          </div>
          <div className="w-full aspect-square relative my-auto">
            <div className="absolute inset-0 bg-center bg-contain bg-no-repeat" style={{ backgroundImage: `url('${product.imageUrl}')` }}></div>
          </div>
        </div>
        <div className="w-full md:w-[65%] p-6 md:p-8 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{product.manufacturer}</span>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{product.modelName}</h3>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-gray-900">{product.score}</span>
              <div className="flex text-xs">
                <StarRating rating={product.starRating} />
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>
          
          {product.features && (
            <div className="flex flex-wrap gap-2 mb-6">
              {product.features.map((feat, i) => (
                <span key={i} className="px-2.5 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded border border-gray-200">{feat}</span>
              ))}
            </div>
          )}

          <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="#" className="flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm">
              Amazonで見る
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
            <a href="#" className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              詳細レビュー
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;