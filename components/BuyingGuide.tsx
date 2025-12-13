import React from 'react';

const BuyingGuide: React.FC = () => {
  return (
    <div id="buying-guide" className="mt-20 border-t border-gray-200 pt-12 scroll-mt-24">
      <div className="bg-gray-50 rounded-2xl p-8 md:p-12 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="md:w-1/3 sticky top-24">
            <h3 className="text-2xl font-black text-gray-900 mb-4">
              失敗しない<br />ヘッドホンの選び方
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              数ある製品の中から、自分にぴったりの一台を見つけるための3つの重要ポイントをプロが解説します。
            </p>
            <span className="material-symbols-outlined text-8xl text-gray-200 select-none">lightbulb</span>
          </div>
          <div className="md:w-2/3 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-black text-sm">01</span>
                装着感（フィット感）
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                音質よりも先に確認すべきは「装着感」です。特にメガネユーザーは、イヤーパッドの柔らかさと側圧（締め付け）の強さを要チェック。店頭での試着をおすすめしますが、レビューの「側圧」に関する記述も参考になります。
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-black text-sm">02</span>
                バッテリーと急速充電
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                「最大30時間」などのスペックだけでなく、「急速充電」の性能も重要です。「3分充電で1時間再生」といった機能があれば、朝の身支度の間に1日分のバッテリーを確保できます。
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-black text-sm">03</span>
                マルチポイント接続
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                PCで作業中にスマホに着信があった場合、自動で切り替わる「マルチポイント」機能は、ビジネス用途では必須級の機能です。安価なモデルでは省略されがちなので注意しましょう。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyingGuide;