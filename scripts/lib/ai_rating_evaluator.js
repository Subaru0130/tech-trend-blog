/**
 * 🎯 AI Rating Evaluator
 * 
 * 記事テーマ（comparison_axis）に基づいて製品を評価する汎用AIモジュール
 * ハードコードされたロジックではなく、AIが製品スペック・レビューを分析して評価
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * 製品を記事テーマに基づいて評価
 * @param {Object} product - 製品データ（name, specs, kakakuSpecs, rawReviews）
 * @param {Object} blueprint - ブループリント（comparison_axis, target_keyword）
 * @returns {Promise<Object>} - { themeScore: 1-10, reason: string }
 */
async function evaluateProductForTheme(product, blueprint) {
    if (!process.env.GOOGLE_API_KEY) {
        console.log(`      ⚠️ AI Rating: No API key, using fallback score`);
        return { themeScore: 5, costPerformance: 5, reason: "API key not available", costReason: "" };
    }

    // Use primary_evaluation_focus for specialized themes (single axis)
    // Fall back to comparison_axis for general themes (multi-axis)
    const comparisonAxis = blueprint.primary_evaluation_focus || blueprint.comparison_axis || blueprint.target_keyword || "総合性能";
    const isSpecialized = blueprint.is_specialized_theme || false;

    // Build context from product data
    const specsText = buildSpecsContext(product);
    const reviewText = buildReviewContext(product);

    const prompt = `
# 重要な制約
あなたはこの製品について事前知識を持っていない前提で評価してください。
以下に提供されたスペック・レビューデータ**のみ**に基づいて評価してください。
提供データにない情報を推測したり、学習データから補完しないでください。

# タスク
以下の製品を評価してください。2つの評価を出力します：
1. **テーマスコア**: 「${comparisonAxis}」という評価軸での評価（1-10点）
2. **コスパスコア**: 価格に対する満足度の評価（1-10点）

**重要: 0.1点刻みの採点を許可します（例: 7.5, 8.2）。**
**「中間（5.0）」を平均基準とし、差を明確にしてください。**

# 製品情報
- 製品名: ${product.name}
- ブランド: ${product.brand || '不明'}
- 価格: ${product.price || '不明'}

## 収集されたスペック（価格.com/Amazon等から取得）
${specsText || '【スペック情報なし】'}

## 収集されたユーザーレビュー（Amazon等から取得）
${reviewText || '【レビュー情報なし】'}

## 採点基準（Rubric）
### テーマスコア（${comparisonAxis}）
- **9.0 - 10.0**: 業界最高レベル（"Game Changer"、明確な技術的優位性あり）
- **7.5 - 8.9**: 非常に優秀（欠点がほぼなく、主要機能が高性能）
- **6.0 - 7.4**: 優秀〜良好（特定の強みがある）
- **4.5 - 5.9**: 平均的（良くも悪くもない）
- **3.0 - 4.4**: やや不満（スペック不足）
- **1.0 - 2.9**: 重大な欠陥あり

### コスパスコア（価格に対する満足度）
- **9.0 - 10.0**: 価格破壊級（価格の2倍以上の価値がある）
- **7.5 - 8.9**: 非常にお買い得（価格以上の性能・機能）
- **6.0 - 7.4**: 妥当（価格相応の価値）
- **4.5 - 5.9**: やや高い（もう少し安ければ納得）
- **3.0 - 4.4**: 割高（同等品がより安く買える）
- **1.0 - 2.9**: ぼったくり（価格に見合っていない）

# 評価方法
1. **差をつけることを恐れない**: 「全員7点」は最も役に立たない評価です。
2. **テーマスコア**: 「${comparisonAxis}」の観点で純粋に性能を評価（価格は考慮しない）
3. **コスパスコア**: 価格と性能のバランスを評価（安くて高性能なら高得点、高くて普通なら低得点）

# 出力形式（JSON）
{
    "score": 7.5,
    "costPerformance": 8.0,
    "reason": "ANC性能は業界最高クラス評価(9.0)だが、装着感に関する否定意見があり-0.5減点。",
    "costReason": "1万円以下でLDAC対応・マルチポイント搭載は価格破壊級。",
    "dataQuality": "high/medium/low/none"
}
`;

    const fs = require('fs');
    try {
        fs.writeFileSync('debug_prompt.txt', prompt);
    } catch (e) {
        console.error("Failed to write debug_prompt.txt", e);
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const text = result.response.text();
        // Clean up AI response: remove markdown code fences and extra whitespace
        let cleanText = text
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();

        // Robust JSON extraction (find first '{' and last '}')
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonString = cleanText.substring(firstBrace, lastBrace + 1);
            const parsed = JSON.parse(jsonString);
            return {
                themeScore: Math.min(10, Math.max(1, parsed.score || 5)),
                costPerformance: Math.min(10, Math.max(1, parsed.costPerformance || 5)),
                reason: parsed.reason || "",
                costReason: parsed.costReason || ""
            };
        } else {
            throw new Error("No JSON object found in response");
        }
    } catch (e) {
        console.log(`      ⚠️ AI Rating failed: ${e.message?.slice(0, 30)}`);
        // Log the raw text for debugging if available
        if (e instanceof SyntaxError) {
            console.log(`      📝 Raw AI Output (First 100 chars): ${e.text?.slice(0, 100) || "N/A"}`);
        }
    }

    return { themeScore: 5, costPerformance: 5, reason: "Evaluation failed, defaulting to neutral", costReason: "" };
}

/**
 * スペック情報をテキストに変換
 */
function buildSpecsContext(product) {
    const parts = [];

    // specs array
    if (product.specs && product.specs.length > 0) {
        parts.push(product.specs.map(s => `- ${s.label}: ${s.value}`).join('\n'));
    }

    // kakakuSpecs object
    if (product.kakakuSpecs && Object.keys(product.kakakuSpecs).length > 0) {
        const kakakuLines = Object.entries(product.kakakuSpecs)
            .filter(([k, v]) => !k.includes('お届け') && !k.includes('新製品ニュース'))
            .slice(0, 10)
            .map(([k, v]) => `- ${k}: ${v}`);
        parts.push(kakakuLines.join('\n'));
    }

    return parts.join('\n') || null;
}

/**
 * レビュー情報をテキストに変換
 */
function buildReviewContext(product) {
    if (!product.rawReviews) return null;

    const parts = [];

    // Amazon positive reviews
    if (product.rawReviews.positive && product.rawReviews.positive.length > 0) {
        parts.push("【Amazon高評価レビュー】");
        product.rawReviews.positive.slice(0, 3).forEach(r => {
            const text = r.text || r.body || r.title || '';
            parts.push(`[${r.rating || '?'}★] ${text.slice(0, 150)}`);
        });
    }

    // Amazon negative reviews
    if (product.rawReviews.negative && product.rawReviews.negative.length > 0) {
        parts.push("【Amazon低評価レビュー】");
        product.rawReviews.negative.slice(0, 2).forEach(r => {
            const text = r.text || r.body || r.title || '';
            parts.push(`[${r.rating || '?'}★] ${text.slice(0, 150)}`);
        });
    }

    // 価格.com reviews (kakaku)
    if (product.rawReviews.kakaku) {
        if (product.rawReviews.kakaku.positive && product.rawReviews.kakaku.positive.length > 0) {
            parts.push("【価格.com高評価】");
            product.rawReviews.kakaku.positive.slice(0, 2).forEach(r => {
                const text = r.text || r.title || '';
                parts.push(text.slice(0, 150));
            });
        }
        if (product.rawReviews.kakaku.negative && product.rawReviews.kakaku.negative.length > 0) {
            parts.push("【価格.com低評価】");
            product.rawReviews.kakaku.negative.slice(0, 2).forEach(r => {
                const text = r.text || r.title || '';
                parts.push(text.slice(0, 150));
            });
        }
    }

    // Situational reviews (Amazon)
    if (product.rawReviews.situational && product.rawReviews.situational.length > 0) {
        parts.push("【シチュエーション別】");
        product.rawReviews.situational.slice(0, 2).forEach(r => {
            const text = r.text || r.body || r.title || '';
            parts.push(`[${r.rating || '?'}★] ${text.slice(0, 150)}`);
        });
    }

    return parts.join('\n') || null;
}

/**
 * 製品リストを一括評価してソート
 * @param {Array} products - 製品リスト
 * @param {Object} blueprint - ブループリント
 * @returns {Promise<Array>} - themeScore降順でソートされた製品リスト
 */
async function evaluateAndRankProducts(products, blueprint) {
    console.log(`\n🎯 AI Theme Evaluation: Scoring ${products.length} products for "${blueprint.comparison_axis || 'general'}"...`);

    // Evaluate each product
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        console.log(`   [${i + 1}/${products.length}] Evaluating: ${product.name.slice(0, 30)}...`);

        const evaluation = await evaluateProductForTheme(product, blueprint);
        product.themeScore = evaluation.themeScore;
        product.themeReason = evaluation.reason;
        product.costPerformance = evaluation.costPerformance;
        product.costReason = evaluation.costReason;

        // Also set calculatedRating for backwards compatibility (scale 1-10 to 3.0-5.0)
        // Wider range: score 1→3.0, score 5→4.0, score 10→5.0 for meaningful differentiation
        product.calculatedRating = Math.round((3.0 + (evaluation.themeScore / 10) * 2.0) * 100) / 100;

        console.log(`      → Theme: ${evaluation.themeScore}/10, Cost Performance: ${evaluation.costPerformance}/10`);

        // Small delay to avoid rate limiting
        if (i < products.length - 1) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    // Sort by themeScore descending
    products.sort((a, b) => (b.themeScore || 0) - (a.themeScore || 0));

    console.log(`   ✅ Ranking complete. Top 3:`);
    products.slice(0, 3).forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.name.slice(0, 30)} (Score: ${p.themeScore})`);
    });

    return products;
}

module.exports = {
    evaluateProductForTheme,
    evaluateAndRankProducts
};
