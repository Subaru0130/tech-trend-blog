import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import { BentoGridItem } from '@/components/ui/bento-grid';
import { RankingCard } from '@/components/affiliate/RankingCard';
import { ComparisonTable } from '@/components/affiliate/ComparisonTable';
import { Search, CheckCircle2, Award, ArrowRight, HelpCircle } from 'lucide-react';

export default function Home() {
  const allPosts = getSortedPostsData();

  // Mock Data for Ranking
  const rankingProducts = [
    {
      rank: 1,
      title: "Apple Watch SE (第2世代)",
      image: "/images/apple-watch-se.png", // Placeholder or use generated image if available
      rating: 4.8,
      description: "iPhoneユーザーならこれ一択！通知の確認から電子マネー決済、睡眠記録まで、忙しいママの毎日を強力にサポート。手頃な価格で高機能な「コスパ最強」モデルです。",
      pros: ["iPhoneとの連携が完璧", "Suica/PASMOが使える", "バンドの種類が豊富でオシャレ"],
      cons: ["毎日充電が必要", "Androidでは使えない"],
      price: "34,800円~",
      affiliateLinks: { amazon: "#", rakuten: "#", yahoo: "#" }
    },
    {
      rank: 2,
      title: "Fitbit Charge 6",
      image: "/images/fitbit.png",
      rating: 4.5,
      description: "健康管理を重視するならこれ。バッテリーが最大7日間持つので、充電のストレスから解放されます。Suica対応で買い物もスムーズ。",
      pros: ["バッテリーが1週間持つ", "睡眠分析が非常に詳しい", "軽くてつけ心地が良い"],
      cons: ["画面が少し小さい", "アプリの機能が一部有料"],
      price: "23,800円",
      affiliateLinks: { amazon: "#", rakuten: "#", yahoo: "#" }
    },
    {
      rank: 3,
      title: "Xiaomi Smart Band 8",
      image: "/images/xiaomi.png",
      rating: 4.2,
      description: "とにかく安く始めたい人に。5,000円台で買えるのに、歩数・心拍数・睡眠計測など基本機能は全部入り。初めてのスマートウォッチに最適。",
      pros: ["圧倒的に安い", "バッテリーが2週間持つ", "アクセサリー感覚で使える"],
      cons: ["電子マネー非対応", "画面の常時表示ができない"],
      price: "5,990円",
      affiliateLinks: { amazon: "#", rakuten: "#", yahoo: "#" }
    }
  ];

  // Mock Data for Comparison
  const comparisonProducts = [
    {
      id: "p1", name: "Apple Watch SE", image: "/images/apple-watch-se.png", isBestBuy: true,
      ratings: { "価格": "◯", "バッテリー": "△", "機能性": "◎", "デザイン": "◎", "iPhone相性": "◎" }
    },
    {
      id: "p2", name: "Fitbit Charge 6", image: "/images/fitbit.png",
      ratings: { "価格": "◯", "バッテリー": "◎", "機能性": "◯", "デザイン": "◯", "iPhone相性": "◯" }
    },
    {
      id: "p3", name: "Xiaomi Band 8", image: "/images/xiaomi.png",
      ratings: { "価格": "◎", "バッテリー": "◎", "機能性": "△", "デザイン": "△", "iPhone相性": "△" }
    }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-700 bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-primary">TechTrend.AI</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-bold text-slate-600">
            <Link href="#" className="hover:text-primary transition-colors">ランキング</Link>
            <Link href="#comparison" className="hover:text-primary transition-colors">徹底比較</Link>
            <Link href="#guide" className="hover:text-primary transition-colors">選び方</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pb-20">
        {/* Hero Section */}
        <section className="bg-white pt-10 pb-12 border-b border-slate-200">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center bg-yellow-400 text-white text-sm font-bold px-4 py-1 rounded-full mb-4 shadow-md">
              <Award className="w-4 h-4 mr-1" /> 編集部が徹底検証！
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-4 leading-snug">
              【2025年最新】<br className="md:hidden" />
              忙しいママを助ける！<br />
              <span className="text-primary border-b-4 border-primary/30">時短・健康ガジェット</span> おすすめランキング
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
              「自分の時間が取れない」「運動不足が気になる」...そんな悩みを持つ主婦の方へ。<br />
              編集部が人気のスマートウォッチや便利家電を実際に使い比べ、<br className="hidden md:block" />
              本当に生活が楽になるアイテムを厳選しました。
            </p>
          </div>
        </section>

        {/* Intro / Empathy */}
        <section className="py-12 bg-blue-50/50">
          <div className="container mx-auto px-4">
            <div className="bg-white p-6 md:p-8 rounded-xl border border-blue-100 shadow-sm max-w-3xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 flex items-center">
                <HelpCircle className="w-6 h-6 text-primary mr-2" />
                こんなお悩みありませんか？
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">🤔</div>
                  <p className="text-slate-600 text-sm md:text-base pt-1">「機能が多すぎて、どれを選べばいいか分からない...」</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">😫</div>
                  <p className="text-slate-600 text-sm md:text-base pt-1">「買っても使いこなせるか不安。無駄遣いしたくない。」</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="font-bold text-slate-800 text-center">
                  大丈夫です！<br />
                  <span className="text-primary text-lg">「コスパ」と「使いやすさ」</span>で厳選しました。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section id="comparison" className="py-16 container mx-auto px-4 max-w-5xl">
          <h2 className="section-title text-2xl text-slate-800">
            ひと目でわかる！徹底比較表
          </h2>
          <p className="text-slate-600 mb-6 text-sm">
            横にスクロールして詳細をチェックできます &rarr;
          </p>
          <ComparisonTable
            features={["価格", "バッテリー", "機能性", "デザイン", "iPhone相性"]}
            products={comparisonProducts}
          />
        </section>

        {/* Ranking Section */}
        <section id="ranking" className="py-16 container mx-auto px-4 max-w-4xl">
          <h2 className="section-title text-2xl text-slate-800 mb-8">
            おすすめ人気ランキング BEST 3
          </h2>

          {rankingProducts.map((product) => (
            <RankingCard key={product.rank} {...product} />
          ))}
        </section>

        {/* Buying Guide */}
        <section id="guide" className="py-16 bg-white border-t border-slate-200">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="section-title text-2xl text-slate-800 mb-8">
              失敗しない選び方 3つのポイント
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "1. バッテリー持ち", desc: "毎日充電するのは意外とストレス。最低でも2日以上持つものがおすすめ。" },
                { title: "2. 防水機能", desc: "家事中の水濡れや、子供との水遊びでも安心な「5ATM」以上の防水を選ぼう。" },
                { title: "3. 通知の見やすさ", desc: "スマホを出さずにLINEや着信を確認できると、家事の手が止まらず便利。" }
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <div className="text-primary font-bold text-xl mb-2">Point {i + 1}</div>
                  <h3 className="font-bold text-slate-800 mb-3">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Reviews (Bento Grid) */}
        <section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">
              その他の新着レビュー
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {allPosts.map((post, i) => (
                <BentoGridItem
                  key={post.slug}
                  title={post.title}
                  description={post.description}
                  header={
                    <div className="w-full h-48 bg-slate-100 rounded-t-xl overflow-hidden relative group">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                          <span className="text-slate-400 text-sm">No Image</span>
                        </div>
                      )}
                    </div>
                  }
                  className={i === 0 || i === 3 ? "md:col-span-2" : ""}
                  slug={post.slug}
                  date={post.date}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} TechTrend.AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
