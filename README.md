# TechTrend.AI

# TechTrend.AI (Lifestyle Edition)

忙しい主婦・ママのための「時短・健康・生活向上」ガジェット＆日用品比較メディア。
Gemini 3 Proを活用して、記事と画像を完全自動生成します。

## 特徴
*   **ターゲット**: 30-50代の主婦、ワーキングマザー
*   **デザイン**: 「LDK」「mybest」風の信頼感あるランキング・比較スタイル
*   **自動化**: `npm run generate` コマンド一つで、トレンド選定・記事執筆・画像生成まで完結

## クイックスタート

### 1. セットアップ
詳細な手順は [docs/SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) を参照してください。

```bash
npm install
# .env.local に GEMINI_API_KEY を設定
```

### 2. 記事生成
```bash
npm run generate
```

### 3. ローカルプレビュー
```bash
npm run dev
```

## 技術スタック
*   Next.js 15 (App Router)
*   Tailwind CSS (Pastel/Lifestyle Theme)
*   Google Gemini API (`gemini-3-pro-preview`, `gemini-3-pro-image-preview`)
*   Node.js Scripts (Automation)
s
