/**
 * Cleanup Orphaned Reviews
 * 記事で使われていないレビューページと製品データを削除
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_PATH = path.resolve(__dirname, '../src/data/articles.json');
const PRODUCTS_PATH = path.resolve(__dirname, '../src/data/products.json');
const REVIEWS_DIR = path.resolve(__dirname, '../src/content/reviews');

console.log('🧹 Orphaned Reviews Cleanup Script\n');

// 1. 記事で使用されている製品IDを取得
const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf8'));
const usedProductIds = new Set();

articles.forEach(article => {
    if (article.products && Array.isArray(article.products)) {
        article.products.forEach(pid => usedProductIds.add(pid));
    }
});

console.log(`📄 記事で使用中の製品: ${usedProductIds.size}件`);
console.log(`   例: ${[...usedProductIds].slice(0, 3).join(', ')}...\n`);

// 2. レビューファイルを取得
const reviewFiles = fs.readdirSync(REVIEWS_DIR).filter(f => f.endsWith('.md'));
console.log(`📁 現在のレビューページ: ${reviewFiles.length}件`);

// 3. 孤児レビューを特定
const orphanedReviews = reviewFiles.filter(f => {
    const productId = f.replace('.md', '');
    return !usedProductIds.has(productId);
});

console.log(`🗑️  削除対象（孤児レビュー）: ${orphanedReviews.length}件\n`);

// 4. 孤児レビューを削除
let deletedCount = 0;
orphanedReviews.forEach(f => {
    const filepath = path.join(REVIEWS_DIR, f);
    try {
        fs.unlinkSync(filepath);
        deletedCount++;
        console.log(`   ❌ 削除: ${f}`);
    } catch (e) {
        console.log(`   ⚠️ 削除失敗: ${f} - ${e.message}`);
    }
});

console.log(`\n✅ レビューページ削除完了: ${deletedCount}件`);

// 5. products.json から未使用の製品を削除
const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
const originalCount = products.length;
const filteredProducts = products.filter(p => usedProductIds.has(p.id));

fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(filteredProducts, null, 4), 'utf8');
console.log(`\n📦 products.json クリーンアップ:`);
console.log(`   変更前: ${originalCount}件`);
console.log(`   変更後: ${filteredProducts.length}件`);
console.log(`   削除: ${originalCount - filteredProducts.length}件`);

console.log('\n🎉 クリーンアップ完了！');
