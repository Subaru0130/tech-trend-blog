---
description: 記事追加後のXserverへのデプロイ手順
---

# デプロイ手順（Xserver）

## 前提
- FileZillaがインストール済み
- Xserver FTP情報がわかっている

## 手順

### 1. ビルド
```powershell
npm run build
```
→ `out/` フォルダにHTMLが生成される

### 2. FileZillaで接続
- ホスト: `sv16572.xserver.jp`
- ユーザー: `subarunet`
- パスワード: サーバーパスワード
- ポート: 21

### 3. アップロード
1. 左側: `C:\Users\Kokik\OneDrive\gemini\tech-trend-blog\out` を開く
2. 右側: `choiceguide.jp/public_html/` を開く
3. 左側の全ファイルを選択（Ctrl+A）
4. 右側にドラッグ＆ドロップ
5. 「上書き」＋「常にこのアクションを使用」→ OK

### 4. 確認
https://choiceguide.jp にアクセスして確認

## 注意事項
- 記事スラッグは**英語**にすること（日本語URLはXserverで動かない）
- 例: `wireless-earphones-under-10000yen`
