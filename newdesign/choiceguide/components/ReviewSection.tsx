import React from 'react';
import { REVIEWS } from '../constants';

const ReviewSection: React.FC = () => {
  return (
    <section className="py-20 bg-background-light dark:bg-background-dark border-t border-gray-100 dark:border-gray-800" id="reviews">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">最新のレビュー記事</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">専門家が実際に使って検証した最新レポート</p>
          </div>
          <a className="group text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1" href="#">記事一覧へ <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">chevron_right</span></a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {REVIEWS.map((review) => (
            <article key={review.id} className="flex flex-col group cursor-pointer h-full">
              <div className="rounded-2xl overflow-hidden mb-4 relative aspect-[16/10] shadow-sm group-hover:shadow-lg transition-all duration-300">
                <img alt="Review thumbnail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={review.image} />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 px-2.5 py-1 text-[10px] font-bold rounded-md shadow-sm">{review.tag}</div>
              </div>
              <div className="flex flex-col flex-grow">
                <h3 className="font-bold text-lg leading-snug mb-3 group-hover:text-primary transition-colors dark:text-gray-100 line-clamp-2">{review.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                  {review.description}
                </p>
                <div className="mt-auto flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {review.date}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
