# コマンドリファレンス

## 記事生成

```bash
# 単体記事生成
node scripts/produce_from_blueprint.js <BLUEPRINT.json> "<キーワード>"

# レビュー強制再生成つき
node scripts/produce_from_blueprint.js <BLUEPRINT.json> "<キーワード>" --force-reviews

# 503失敗後のリトライ（スクレイピングスキップ）
node scripts/produce_from_blueprint.js <BLUEPRINT.json> "<キーワード>" --use-cache

# 503失敗後、レビューも再生成
node scripts/produce_from_blueprint.js <BLUEPRINT.json> "<キーワード>" --use-cache --force-reviews
```

## バッチ生成

```bash
# 全ブループリントの未生成記事を一斉生成
node scripts/batch_produce.js

# 特定ブループリントのみ
node scripts/batch_produce.js SITUATION_BLUEPRINTS_オフィスチェア.json

# レビュー強制再生成つき
node scripts/batch_produce.js --force-reviews
```

## ブループリント作成

```bash
# シチュエーション型ブループリント
node scripts/universal_miner_situation_v1.js
```

## 品質チェック

```bash
# 記事品質チェック
node scripts/check-quality.mjs
```

## 開発サーバー

```bash
npm run dev          # ローカル開発サーバー起動
npm run build        # 本番ビルド
```

## デプロイ

```bash
# Xserverデプロイ（ワークフロー /deploy 参照）
```

## Git操作

```bash
git log -5                            # 直近5コミット
git checkout main                     # mainに戻す（安全復元）
git push origin feat/ui-migration:main  # 現在のブランチをmainにプッシュ
```
