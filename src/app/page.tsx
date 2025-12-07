import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import { BentoGridItem } from '@/components/ui/bento-grid';
import { RankingCard } from '@/components/affiliate/RankingCard';
import { ComparisonTable } from '@/components/affiliate/ComparisonTable';
import { Search, CheckCircle2, Award, ArrowRight, HelpCircle } from 'lucide-react';

export default function Home() {
  const allPosts = getSortedPostsData();

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-700 bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-slate-900">ベストバイガイド</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-bold text-slate-600">
            <Link href="#" className="hover:text-primary transition-colors">ランキング</Link>
            <Link href="#" className="hover:text-primary transition-colors">新着レビュー</Link>
            <Link href="#" className="hover:text-primary transition-colors">カテゴリ一覧</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section (Split Layout with Collage) */}
        <section className="relative overflow-hidden bg-slate-50 pt-16 pb-20 lg:pt-24 lg:pb-28">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/soft-bg.png"
              alt="Soft Living Room Background"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 to-slate-50/90"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Copy */}
              <div className="text-center lg:text-left z-10">
                <div className="inline-flex items-center bg-blue-100 text-primary text-xs font-bold px-3 py-1 rounded-full mb-6">
                  <Award className="w-3 h-3 mr-1" /> 専門家と編集部が徹底検証
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                  後悔しない<br />
                  <span className="text-primary relative inline-block">
                    「正解」
                    <span className="absolute bottom-1 left-0 w-full h-3 bg-blue-200/50 -z-10"></span>
                  </span>
                  を選ぶ。
                </h1>
                <p className="text-slate-600 text-lg mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  情報過多の時代に、専門家と編集部が導く「ベストバイ」。<br />
                  あなたに最適な一台を、最短で見つけます。
                </p>

                {/* Search Bar */}
                <div className="max-w-md mx-auto lg:mx-0 relative">
                  <input
                    type="text"
                    placeholder="何をお探しですか？ (例: ロボット掃除機)"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 shadow-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-base"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                </div>
              </div>

              {/* Right: Visual (Collage) */}
              <div className="relative z-10 h-[300px] lg:h-[400px] w-full mt-12 lg:mt-0">
                {/* Main Image (Vacuum) */}
                <div className="absolute top-0 right-0 w-2/3 shadow-2xl rounded-2xl border border-slate-100 bg-white p-2 z-20 transform hover:scale-105 transition-transform duration-500">
                  <img src="/images/img-1764396885225.png" alt="Robot Vacuum" className="rounded-xl w-full h-auto" />
                </div>
                {/* Secondary Image (Frying Pan) */}
                <div className="absolute bottom-0 left-10 w-1/2 shadow-xl rounded-2xl border border-slate-100 bg-white p-2 z-30 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img src="/images/img-1764397586602.png" alt="Frying Pan" className="rounded-xl w-full h-auto" />
                </div>
                {/* Tertiary Image (Washing Machine) */}
                <div className="absolute top-10 left-0 w-1/3 shadow-lg rounded-2xl border border-slate-100 bg-white p-2 z-10 opacity-80 transform rotate-6">
                  <img src="/images/img-1764395815427.png" alt="Washing Machine" className="rounded-xl w-full h-auto" />
                </div>

                {/* Decorative Circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 lg:w-96 lg:h-96 bg-blue-200 rounded-full blur-3xl opacity-30 -z-10"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Empathy / Problem Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">モノ選びで、こんな経験ありませんか？</h2>
              <p className="text-slate-500">ネットの口コミやスペック表だけでは分からないことがたくさんあります。</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { icon: <HelpCircle className="w-10 h-10 text-blue-500" />, title: "どれが良いか分からない", desc: "ランキングサイトを見ても、広告ばかりで信用できない。" },
                { icon: <CheckCircle2 className="w-10 h-10 text-red-500" />, title: "買ってから後悔した", desc: "口コミは良かったのに、実際に使ってみたら自分には合わなかった。" },
                { icon: <Search className="w-10 h-10 text-green-500" />, title: "調べるのが面倒", desc: "比較検討に何時間もかけたくない。手っ取り早く正解が知りたい。" }
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center hover:shadow-md transition-shadow group">
                  <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution / Value Section (New) */}
        <section className="py-20 bg-slate-50 border-y border-slate-200">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  <span className="text-primary">ベストバイガイド</span>が<br />
                  選ばれる3つの理由
                </h2>
                <div className="space-y-8">
                  {[
                    { title: "徹底的な比較検証", desc: "人気商品を実際に集め、同じ条件でテスト。感覚ではなくデータで評価します。" },
                    { title: "専門家の視点", desc: "その道のプロフェッショナルが監修。素人では気づかないポイントまでチェックします。" },
                    { title: "忖度なしの評価", desc: "広告主の影響を受けず、良い点も悪い点も正直にレビューします。" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 mb-1">{item.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                {/* Abstract UI Mockup for "Comparison" */}
                <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                    <div className="font-bold text-slate-800">検証結果</div>
                    <div className="text-xs text-slate-400">2025.11 Update</div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((rank) => (
                      <div key={rank} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${rank === 1 ? 'bg-yellow-400' : 'bg-slate-300'}`}>{rank}</div>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full"></div>
                        <div className="w-12 h-2 bg-slate-100 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-8 h-8 text-yellow-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-400">No.1 Award</div>
                      <div className="font-bold text-slate-800">Best Buy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-8">人気の検証カテゴリ</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {["家電", "日用品", "キッチン", "美容", "ガジェット", "インテリア", "食品", "金融"].map((cat) => (
                <Link key={cat} href="#" className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-full font-bold text-slate-600 shadow-sm hover:border-primary hover:text-primary hover:bg-white hover:shadow-md transition-all text-sm">
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Reviews (Bento Grid) */}
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10 max-w-7xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                最新の検証記事
              </h2>
              <Link href="#" className="text-primary font-bold text-sm flex items-center hover:underline">
                すべて見る <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {allPosts.map((post, i) => (
                <BentoGridItem
                  key={post.slug}
                  title={post.title}
                  description={post.description}
                  header={
                    <div className="w-full h-56 bg-slate-100 rounded-t-xl overflow-hidden relative group">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                          <span className="text-slate-400 font-bold">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                        徹底検証
                      </div>
                    </div>
                  }
                  className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}
                  slug={post.slug}
                  date={post.date}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Future / Benefit Section */}
        <section className="py-24 bg-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">「いいモノ」は、毎日を変える。</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              本当に満足できる商品に出会えたとき、<br />
              家事が少し楽しくなったり、自分の時間が増えたりします。<br />
              そんな「正解」を、私たちと一緒に見つけませんか？
            </p>
            <div className="max-w-md mx-auto relative">
              <input
                type="text"
                placeholder="キーワードで検索 (例: ドラム式洗濯機)"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 shadow-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-base"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <span className="text-xl font-bold text-white block mb-4">ベストバイガイド</span>
              <p className="text-sm leading-relaxed max-w-xs">
                「失敗しない買い物」をサポートする比較検証メディア。
                広告主の影響を受けず、公平な視点で商品をテストしています。
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">カテゴリ</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">家電</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">日用品</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">キッチン</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">サイト情報</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">運営者情報</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">お問い合わせ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-xs">
            <p>&copy; {new Date().getFullYear()} Best Buy Guide. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


