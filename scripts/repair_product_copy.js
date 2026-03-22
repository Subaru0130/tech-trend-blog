const fs = require('fs');
const path = require('path');
const {
    normalizeEditorComment,
    normalizeInsightList,
    normalizeInsightText,
    pickInsightList,
} = require('./lib/review_copy_guardrails');

const productsPath = path.resolve(__dirname, '../src/data/products.json');
const articlesPath = path.resolve(__dirname, '../src/data/articles.json');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
}

function normalizeProductCopy(product = {}) {
    const normalizedPros = pickInsightList([], product.pros || [], 'pro', 3);
    const normalizedCons = pickInsightList([], product.cons || [], 'con', 2);
    const normalizedSpecVerification = normalizeInsightText(product.specVerification || '', 'spec');
    const normalizedUserScenario = normalizeInsightText(product.userScenario || '', 'scenario');
    const normalizedEditorComment = normalizeEditorComment(
        product.editorComment || '',
        product.name || '製品',
        {
            pros: normalizedPros,
            cons: normalizedCons,
            userScenario: normalizedUserScenario,
            specVerification: normalizedSpecVerification,
            description: product.description,
        }
    );

    return {
        ...product,
        pros: normalizedPros,
        cons: normalizedCons,
        specVerification: normalizedSpecVerification,
        userScenario: normalizedUserScenario,
        editorComment: normalizedEditorComment,
    };
}

function main() {
    const products = readJson(productsPath);
    const articles = readJson(articlesPath);

    let changedProducts = 0;
    let filledEditors = 0;
    let changedPros = 0;
    let changedCons = 0;

    const nextProducts = products.map((product) => {
        const normalized = normalizeProductCopy(product);

        if (JSON.stringify(normalized.pros) !== JSON.stringify(product.pros || [])) {
            changedPros += 1;
        }

        if (JSON.stringify(normalized.cons) !== JSON.stringify(product.cons || [])) {
            changedCons += 1;
        }

        if (!normalizeInsightText(product.editorComment || '', 'editor') && normalized.editorComment) {
            filledEditors += 1;
        }

        if (JSON.stringify(normalized) !== JSON.stringify(product)) {
            changedProducts += 1;
        }

        return normalized;
    });

    const productMap = new Map(nextProducts.map((product) => [product.id, product]));
    let changedArticles = 0;

    const nextArticles = articles.map((article) => {
        if (!Array.isArray(article.rankingItems) || article.rankingItems.length === 0) {
            return article;
        }

        const nextRankingItems = article.rankingItems.map((item) => {
            const product = productMap.get(item.productId);
            if (!product) {
                return item;
            }

            return {
                ...item,
                pros: normalizeInsightList(product.pros || [], 'pro', 3),
                cons: normalizeInsightList(product.cons || [], 'con', 2),
                editorComment: product.editorComment || item.editorComment || '',
            };
        });

        if (JSON.stringify(nextRankingItems) !== JSON.stringify(article.rankingItems)) {
            changedArticles += 1;
            return {
                ...article,
                rankingItems: nextRankingItems,
            };
        }

        return article;
    });

    writeJson(productsPath, nextProducts);
    writeJson(articlesPath, nextArticles);

    console.log(`✅ Repaired product copy: ${changedProducts} products updated`);
    console.log(`   - pros normalized: ${changedPros}`);
    console.log(`   - cons normalized: ${changedCons}`);
    console.log(`   - editor comments backfilled: ${filledEditors}`);
    console.log(`✅ Synced ranking items: ${changedArticles} articles updated`);
}

main();
