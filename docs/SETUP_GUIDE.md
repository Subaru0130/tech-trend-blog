# TechTrend.AI (Lifestyle Pivot) - Setup & Migration Guide

このガイドでは、このプロジェクトを別のPCに移行し、セットアップから記事生成、デプロイまでを行う手順を説明します。

## 1. 前提条件 (Prerequisites)

新しいPCに以下のソフトウェアがインストールされていることを確認してください。

*   **Node.js**: v18以上推奨 (LTS版)
    *   確認コマンド: `node -v`
*   **Git**: ソースコード管理用
    *   確認コマンド: `git --version`
*   **Vercel CLI** (デプロイ用、任意ですが推奨)
    *   インストール: `npm i -g vercel`

## 2. プロジェクトの移行 (Migration)

### 方法A: Git/GitHub経由 (推奨)
1.  このPCでGitHubリポジトリにプッシュ済みであることを確認します。
2.  新しいPCでクローンします:
    ```bash
    git clone <repository-url>
    cd tech-trend-blog
    ```

### 方法B: フォルダコピー
1.  `tech-trend-blog` フォルダを丸ごと新しいPCにコピーします。
2.  `node_modules` フォルダと `.next` フォルダは削除しても構いません（次のステップで再生成されます）。

## 3. セットアップ (Installation)

プロジェクトフォルダ内で以下のコマンドを実行し、依存ライブラリをインストールします。

```bash
npm install
```

## 4. 環境変数の設定 (Environment Variables)

Gemini APIキーを設定する必要があります。
プロジェクトルートに `.env.local` というファイルを作成し、以下の内容を記述してください。

```env
GEMINI_API_KEY=your_gemini_api_key_here
```
※ `your_gemini_api_key_here` は実際のAPIキー（AI Studioで取得）に置き換えてください。

## 5. 動作確認 (Running Locally)

### 開発サーバーの起動
サイトのデザインや動作を確認するには：

```bash
npm run dev
```
ブラウザで `http://localhost:3000` にアクセスします。

### 記事の自動生成
新しい記事（テキスト＋画像）を生成するには：

```bash
npm run generate
```
*   `content/posts/` に記事ファイル(.mdx)が生成されます。
*   `public/images/` に画像ファイル(.png)が生成されます。

**※ Windows PowerShellでの注意点:**
スクリプト実行時に「セキュリティエラー」が出る場合は、一時的に実行ポリシーを変更してください：
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; npm run generate
```

## 6. デプロイ (Deployment)

Vercelに公開するには、以下のコマンドを実行します。

```bash
npx vercel
```
*   初回はログインやプロジェクト設定を聞かれますが、基本すべて `Enter` (デフォルト設定) でOKです。
*   本番デプロイ（Production）の場合は: `npx vercel --prod`

## 7. カスタマイズ (Customization)

*   **生成テーマの変更**: `scripts/generate-post.mjs` の `fetchTrends` 関数内のキーワードリストを変更してください。
*   **デザインの微調整**: `src/app/globals.css` (色など) や `src/app/page.tsx` (構成) を編集してください。

---
**トラブルシューティング:**
*   **画像が生成されない**: APIキーが正しいか、`gemini-3-pro-image-preview` モデルへのアクセス権があるか確認してください。
*   **ビルドエラー**: `npm run build` を実行してエラー内容を確認してください。
