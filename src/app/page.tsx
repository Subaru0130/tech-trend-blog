
import React from 'react';
import Link from 'next/link';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function Home() {
  return (
    <div className="bg-background-light text-text-main antialiased selection:bg-accent/20 selection:text-primary min-h-screen">
      <Header />

      <main>
        <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden hero-pattern">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-background-light pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
              <div className="flex-1 text-center lg:text-left max-w-3xl mx-auto lg:mx-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-accent/20 text-accent mb-8 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                  <span className="text-xs font-bold tracking-wide uppercase">Updated: 2024.03</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary leading-[1.15] tracking-tight mb-6 text-balance">
                  後悔しない<br className="md:hidden" />
                  <span className="relative inline-block text-accent px-1">
                    「最高の選択」
                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent/20" preserveAspectRatio="none" viewBox="0 0 100 10">
                      <path d="M0 5 Q 50 12 100 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="8"></path>
                    </svg>
                  </span>
                  を、<br />あなたの暮らしに。
                </h1>
                <p className="text-base md:text-lg text-text-sub mb-10 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">
                  情報過多な時代だからこそ、心地よく、信頼できる情報を。<br className="hidden lg:inline" />
                  専門家の検証データと実際のユーザーレビューに基づき、<br className="hidden lg:inline" />
                  長く愛用できる「本物」だけを厳選してご紹介します。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link className="group bg-primary hover:bg-accent text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 min-w-[220px]" href="/rankings/wireless-earphones">
                    <span>今月のベストバイ</span>
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                  <a className="bg-white border border-border-color text-text-main font-bold py-4 px-8 rounded-full hover:bg-surface-subtle transition-all min-w-[220px] shadow-sm hover:shadow-md flex items-center justify-center gap-2" href="#categories">
                    <span className="material-symbols-outlined text-[20px] text-stone-400">category</span>
                    <span>カテゴリから探す</span>
                  </a>
                </div>
                <div className="mt-12 pt-8 border-t border-border-color flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-accent">check_circle</span>
                    <span className="text-sm font-bold text-text-sub">徹底した実機検証</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-accent">check_circle</span>
                    <span className="text-sm font-bold text-text-sub">専門家による執筆</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-accent">check_circle</span>
                    <span className="text-sm font-bold text-text-sub">情報は毎日更新</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full max-w-[500px] lg:max-w-none relative">
                <div className="relative z-10 perspective-1000">
                  <div className="bg-white rounded-[2rem] p-3 md:p-4 shadow-float border border-white ring-1 ring-stone-100 transform transition-transform duration-500 hover:rotate-1">
                    <div className="aspect-[5/4] rounded-[1.5rem] overflow-hidden relative group bg-surface-subtle">
                      <img alt="Modern Living Room with Appliances" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=2000" />
                      <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6">
                        <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-2xl p-5 border border-white/50 ring-1 ring-black/5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Pickup</span>
                                <span className="text-xs font-bold text-stone-500">ロボット掃除機</span>
                              </div>
                              <h3 className="text-lg font-bold text-primary line-clamp-1">SmartClean X1 Pro</h3>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex text-rank-gold gap-0.5">
                                <span className="material-symbols-outlined text-[16px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-[16px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-[16px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-[16px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                <span className="material-symbols-outlined text-[16px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              </div>
                              <span className="text-[10px] text-stone-400 font-medium">4.8 / 5.0</span>
                            </div>
                          </div>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-xs text-text-sub">
                              <span className="material-symbols-outlined text-[14px] text-accent">check</span>
                              <span>障害物回避性能が大幅向上</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-sub">
                              <span className="material-symbols-outlined text-[14px] text-accent">check</span>
                              <span>静音設計で夜間も安心</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-dashed border-stone-200">
                            <div>
                              <span className="text-xs font-bold text-stone-400">参考価格</span>
                              <div className="text-lg font-black text-primary">¥54,800<span className="text-xs font-normal text-stone-500 ml-1">~</span></div>
                            </div>
                            <button className="bg-primary hover:bg-accent text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                              詳細を見る <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 opacity-40 -z-10 animate-pulse" style={{ backgroundImage: "radial-gradient(#5E8C6A 1.5px, transparent 1.5px)", backgroundSize: "12px 12px" }}></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl -z-10"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-white border-t border-border-color" id="categories">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-primary flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-accent rounded-full"></span>
                  探したいモノから選ぶ
                </h2>
                <p className="mt-3 text-text-sub text-sm font-medium">生活を便利にするアイテムをカテゴリごとに比較・紹介しています。</p>
              </div>
              <a className="hidden md:flex items-center gap-1 text-sm font-bold text-accent hover:text-accent-dark transition-colors group" href="#">
                全カテゴリを見る <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: 'headphones', label: 'オーディオ', sub: 'イヤホン・スピーカー', link: '/categories/audio' },
                { icon: 'health_and_beauty', label: '美容・健康', sub: 'ドライヤー・ケア', link: '/categories/beauty-health' },
                { icon: 'kitchen', label: 'キッチン家電', sub: '冷蔵庫・レンジ', link: '#' },
                { icon: 'local_laundry_service', label: '生活家電', sub: '洗濯機・掃除機', link: '#' },
                { icon: 'devices', label: 'PC・スマホ', sub: 'パソコン・周辺機器', link: '#' },
                { icon: 'chair', label: 'インテリア', sub: '家具・収納', link: '#' }
              ].map((cat, idx) => (
                <Link key={idx} className="group bg-surface-subtle hover:bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 border border-transparent hover:border-accent/20 hover:shadow-card-hover" href={cat.link}>
                  <div className="mb-4 size-14 rounded-full bg-white group-hover:bg-accent-light flex items-center justify-center shadow-sm text-primary group-hover:text-accent transition-colors duration-300 ring-1 ring-border-color/50 group-hover:ring-accent/20">
                    <span className="material-symbols-outlined text-[28px]">{cat.icon}</span>
                  </div>
                  <h3 className="font-bold text-sm text-primary mb-1">{cat.label}</h3>
                  <span className="text-[10px] text-text-sub">{cat.sub}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-background-light relative overflow-hidden" id="ranking">
          <div className="absolute inset-0 opacity-50 pointer-events-none" style={{ backgroundImage: "radial-gradient(#E7E5E4 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block py-1.5 px-4 rounded-full bg-white shadow-sm text-accent font-bold text-xs mb-5 uppercase tracking-wider border border-accent/20">
                Monthly Feature
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-primary mb-4 tracking-tight">
                今、最も「買い」な完全ワイヤレスイヤホン
              </h2>
              <p className="text-text-sub max-w-2xl mx-auto text-sm leading-relaxed font-medium">
                2024年3月時点での価格、性能、使い勝手を徹底比較。<br className="hidden md:inline" />
                数ある製品の中から、自信を持っておすすめできるTOP3を選出しました。
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative max-w-6xl mx-auto">
              {/* Example Static Cards - These will link to specific reviews */}
              <article className="bg-white rounded-3xl p-6 shadow-soft border border-white hover:border-border-color transition-all duration-300 lg:mt-12 order-2 lg:order-1 h-full flex flex-col relative z-0 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 bg-surface-subtle rounded-full text-rank-silver font-black text-xl font-sans shadow-inner">2</div>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Excellent</span>
                  </div>
                  <span className="text-[10px] font-bold text-text-sub bg-surface-subtle px-2.5 py-1 rounded-full border border-border-color">バランス型</span>
                </div>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-surface-subtle border border-border-color relative">
                  <img alt="Apple AirPods Pro 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/products/prod-B0CHXVBQHR.jpg" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2 line-clamp-1">Apple AirPods Pro (第2世代)</h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-rank-gold text-sm gap-0.5">
                    {[1, 2, 3, 4].map(i => <span key={i} className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>)}
                    <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                  </div>
                  <span className="text-sm font-bold text-primary">4.7</span>
                </div>
                <div className="space-y-2 mb-6 text-xs text-text-sub flex-grow">
                  <p className="leading-relaxed font-medium">iPhoneとの連携は最強。ノイズキャンセリングもトップクラス。</p>
                </div>
                <Link className="block w-full py-3 rounded-xl border border-border-color bg-white text-center font-bold text-sm text-text-main hover:bg-surface-subtle transition-colors" href="/reviews/apple-airpods-pro-2">詳細レビュー</Link>
              </article>

              <article className="relative bg-white rounded-3xl p-8 shadow-card-hover border border-accent/20 flex flex-col h-full order-1 lg:order-2 z-10 ring-4 ring-accent/5 group">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-accent text-white px-6 py-1.5 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 ring-4 ring-background-light">
                  <span className="material-symbols-outlined text-[18px]">trophy</span>
                  総合 No.1
                </div>
                <div className="mt-4 flex items-center justify-between mb-6">
                  <span className="bg-brand-brown/10 text-brand-brown text-[11px] font-bold px-2.5 py-1 rounded-full border border-brand-brown/20">編集部イチオシ</span>
                  <span className="text-xs text-stone-400 font-medium">更新: 2024.03.15</span>
                </div>
                <div className="aspect-video rounded-2xl overflow-hidden mb-6 bg-surface-subtle border border-border-color relative">
                  <img alt="Sony WF-1000XM5" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="/images/products/prod-B0CBKQZXT7.jpg" />
                </div>
                <h3 className="text-2xl font-black text-primary mb-2">Sony WF-1000XM5</h3>
                <p className="text-sm text-text-sub mb-6 leading-relaxed font-medium">
                  「静寂」を手に入れるならこれ一択。業界最高クラスのノイズキャンセリング。
                </p>
                <div className="bg-surface-subtle rounded-2xl p-5 mb-6 border border-border-color/60">
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Score</span>
                    <span className="text-3xl font-black text-primary leading-none">4.8</span>
                  </div>
                  <div className="flex text-rank-gold gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map(i => <span key={i} className="material-symbols-outlined filled text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>)}
                  </div>
                  <ul className="text-xs space-y-2 text-text-main font-bold">
                    <li className="flex items-center gap-2"><span className="size-1.5 bg-accent rounded-full"></span> 圧倒的なノイズ除去性能</li>
                    <li className="flex items-center gap-2"><span className="size-1.5 bg-accent rounded-full"></span> 小型化による装着感向上</li>
                  </ul>
                </div>
                <div className="mt-auto grid gap-3">
                  <Link className="w-full py-4 rounded-xl bg-primary hover:bg-accent text-white text-center font-bold shadow-lg shadow-primary/20 hover:shadow-accent/30 transition-all flex items-center justify-center gap-2" href="/reviews/sony-wf-1000xm5">
                    レビューを見る <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              </article>

              <article className="bg-white rounded-3xl p-6 shadow-soft border border-white hover:border-border-color transition-all duration-300 lg:mt-12 order-3 lg:order-3 h-full flex flex-col relative z-0 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 bg-surface-subtle rounded-full text-rank-bronze font-black text-xl font-sans shadow-inner">3</div>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Good Value</span>
                  </div>
                  <span className="text-[10px] font-bold text-text-sub bg-surface-subtle px-2.5 py-1 rounded-full border border-border-color">コスパ最強</span>
                </div>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-surface-subtle border border-border-color relative">
                  <img alt="Anker Soundcore Liberty 4" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/images/products/prod-B0BB1PFCS3.jpg" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2 line-clamp-1">Anker Soundcore Liberty 4</h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-rank-gold text-sm gap-0.5">
                    {[1, 2, 3, 4].map(i => <span key={i} className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>)}
                    <span className="material-symbols-outlined text-[18px] filled" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                  </div>
                  <span className="text-sm font-bold text-primary">4.5</span>
                </div>
                <div className="space-y-2 mb-6 text-xs text-text-sub flex-grow">
                  <p className="leading-relaxed font-medium">1万円台で全部入り。機能性と価格のバランスが最高。</p>
                </div>
                <Link className="block w-full py-3 rounded-xl border border-border-color bg-white text-center font-bold text-sm text-text-main hover:bg-surface-subtle transition-colors" href="/reviews/soundcore-liberty-4">詳細レビュー</Link>
              </article>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div >
  );
}
