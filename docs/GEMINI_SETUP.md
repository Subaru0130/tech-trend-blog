# Gemini 3 API Setup & Migration Guide

このプロジェクトは、最新の **Gemini 3 Pro** モデル（テキストおよび画像生成）を使用するために、新しい `@google/genai` SDK に移行しました。
他のPCで作業を再開するための手順を以下にまとめます。

## 1. 前提条件 (Prerequisites)

*   **Node.js:** v20以上推奨 (新しいSDKの要件)
*   **npm:** Node.jsに付属

## 2. インストール (Installation)

プロジェクトのルートディレクトリで以下のコマンドを実行し、依存関係をインストールします。
特に `@google/genai` がインストールされることが重要です。

```bash
npm install
```

## 3. 環境変数の設定 (Environment Variables)

プロジェクトルートに `.env.local` ファイルを作成（またはコピー）し、Gemini APIキーを設定してください。
**注意:** Gemini 3 Proを使用するには、対応した有効なAPIキーが必要です。

```env
GEMINI_API_KEY=AIzaSyA2e-t5G81bkMFrmmqdcXrAX69iJvNwMps
```
*(※上記は設定済みのキーです。必要に応じて自身のキーに置き換えてください)*

## 4. 記事生成の実行 (Running Generation)

以下のコマンドで、Gemini 3 Pro を使用して記事と画像を生成します。

```bash
npm run generate
```

### 動作の仕組み:
1.  **トレンド取得:** Google Trends (RSS) から話題のトピックを取得。
2.  **画像生成:** `gemini-3-pro-image-preview` を使用して、8K品質のアイキャッチ画像を生成。
    *   *Note:* APIが不安定な場合やタイムアウトした場合は、自動的に「グラデーション背景」にフォールバックします（エラーで止まりません）。
3.  **記事執筆:** `gemini-3-pro-preview` を使用して、日本語の比較レビュー記事を執筆。
4.  **保存:** `content/posts/` にMDXファイルとして保存。

## 5. トラブルシューティング

### PowerShellでスクリプトが実行できない場合
「このシステムではスクリプトの実行が無効になっているため...」というエラーが出た場合は、一時的に実行ポリシーを許可してください。

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run generate
```

### 画像が生成されない場合
現在はプレビュー版のモデルを使用しているため、APIの応答が遅い、または不安定な場合があります。その場合は自動的にフォールバック（グラデーション表示）が機能しますので、そのまま開発を続けて問題ありません。
