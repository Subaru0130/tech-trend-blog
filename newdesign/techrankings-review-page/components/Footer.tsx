import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer class="bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 mt-12 py-12">
      <div class="max-w-[1100px] mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div class="col-span-1 md:col-span-1">
            <div class="flex items-center gap-2 mb-4">
              <div class="size-6 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl text-brand-blue">equalizer</span>
              </div>
              <h2 class="text-text-main dark:text-white text-lg font-bold font-display">TechRankings</h2>
            </div>
            <p class="text-gray-500 text-xs leading-relaxed">
              最新のテクノロジー製品を公平かつ徹底的にレビュー。あなたに最適な一台を見つけるお手伝いをします。
            </p>
          </div>
          <div>
            <h3 class="font-bold text-text-main dark:text-white mb-4 text-sm">カテゴリー</h3>
            <ul class="space-y-3 text-xs text-gray-500">
              {['ヘッドホン・イヤホン', 'パソコン・タブレット', 'スマートフォン', 'カメラ・撮影機材'].map((item) => (
                <li key={item}>
                  <a href="#" class="hover:text-brand-blue hover:underline transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 class="font-bold text-text-main dark:text-white mb-4 text-sm">サイト情報</h3>
            <ul class="space-y-3 text-xs text-gray-500">
              {['運営者情報', '編集ポリシー', '採用情報', 'お問い合わせ'].map((item) => (
                <li key={item}>
                  <a href="#" class="hover:text-brand-blue hover:underline transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 class="font-bold text-text-main dark:text-white mb-4 text-sm">SNSをフォロー</h3>
            <div class="flex gap-3">
              {['Tw', 'Fb', 'Ig'].map((social) => (
                <a
                  key={social}
                  href="#"
                  class="size-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 hover:bg-brand-blue hover:text-white transition-all duration-300"
                >
                  <span class="font-bold text-xs">{social}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div class="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400">
          <p>© 2024 TechRankings. All rights reserved.</p>
          <div class="flex gap-6">
            <a href="#" class="hover:text-text-main transition-colors">プライバシーポリシー</a>
            <a href="#" class="hover:text-text-main transition-colors">利用規約</a>
            <a href="#" class="hover:text-text-main transition-colors">アフィリエイト・免責事項</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;