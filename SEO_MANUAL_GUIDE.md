# 🚀 Google SEO 実践ガイド (Search Console編)

技術的なSEO実装（Canonicals, Structured Data, Sitemap）は完了しました！
最後に、Googleに「これらの変更を認識してもらう」手動アクションが必要です。

## 手順1: デプロイする

まず、ローカルの変更を本番環境（Xserver）に反映してください。

1. Gitにコミット & プッシュ
2. `/deploy` コマンドの手順に従ってデプロイ（または自動デプロイを待機）

---

## 手順2: Google Search Consoleでの操作

デプロイ完了後、以下の手順を実行してください。

### 1. サイトマップの送信
Googleに「サイトの地図」を渡します。

1. [Google Search Console](https://search.google.com/search-console) を開く
2. 左メニュー「**サイトマップ**」をクリック
3. 「新しいサイトマップの追加」欄に `sitemap.xml` と入力
4. [送信] をクリック
   - ✅ 「成功しました」と表示されればOK！
   - **補足**: これは**最初の1回だけ**でOKです。以降はGoogleが自動で定期チェックしてくれます。

### 2. インデックス登録リクエスト（重要記事のみ）
特に早く検索結果に出したい記事（ランキング記事など）に対して行います。

1. 画面上部の検索バーに、登録したいページのURLを入力（例: `https://choiceguide.jp/rankings/wireless-earphones-noise-cancelling/`）
2. [Enter] を押す
3. データの取得が終わったら、「**インデックス登録をリクエスト**」をクリック
4. 1〜2分待つとリクエスト完了

**推奨URL:**
- `https://choiceguide.jp/` (トップページ)
- `https://choiceguide.jp/rankings/wireless-earphones-noise-cancelling/` (最新ランキング)

---

## 確認方法

数日後、Google検索で `site:choiceguide.jp` と検索してみてください。
登録されたページが表示されれば成功です！

### 🌟 期待されるリッチリザルト
技術実装により、検索結果に以下が表示される可能性があります：
- **レビューの星評価** (⭐⭐⭐⭐⭐)
- **価格情報**
- **パンくずリスト**
- **サムネイル画像**
