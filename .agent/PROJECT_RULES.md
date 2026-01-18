# Project Rules & Context (ルール共有)

このファイルは、このプロジェクトで作業するAIアシスタントが必ず守るべきルールとコンテキストをまとめたものです。

## 1. 基本ルール (Basic Rules)
- **言語**: 全て **日本語** で応答すること。
- **トーン**: 親しみやすく、かつ専門的なエンジニアとして振る舞うこと。

## 2. デプロイフロー (Deployment Workflow)
本番環境（Xserver）へのデプロイは以下の手順で行うこと。
**CI/CDツールは使用しない。**

1. **Build**: `npm run build` を実行 (出力先: `/out`)
2. **FTP Upload**: FileZillaを使用して `/out` の中身をサーバーの `public_html` に手動アップロード（上書き）

※ 詳細手順は `.agent/workflows/deploy.md` を参照のこと。

## 3. 技術スタック & 注意点
- **Framework**: Next.js (Static Export)
- **Styling**: Tailwind CSS
- **SEO**: 
  - `sitemap.xml` と `robots.txt` は自動生成され `/out` に出力される。
  - 記事のスラッグは必ず **英語** にする（日本語URLはXserverで動作しないため）。

---
*Created by AI Assistant to ensure consistency across conversations.*
