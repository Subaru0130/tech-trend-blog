const { GoogleGenAI } = require('@google/genai');
const Anthropic = require('@anthropic-ai/sdk').default;
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) {
    console.error("❌ Error: GEMINI_API_KEY or GOOGLE_API_KEY not found in .env.local");
}

const client = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Article AI Provider: 'claude' for Claude Opus 4.5, 'gemini' for Gemini
// Change ARTICLE_AI_PROVIDER in .env.local to switch (default: 'claude')
const articleAiProvider = process.env.ARTICLE_AI_PROVIDER || 'claude';

// Claude client for article generation (Opus 4.5)
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const claudeClient = anthropicApiKey ? new Anthropic({ apiKey: anthropicApiKey }) : null;

if (articleAiProvider === 'claude' && !claudeClient) {
    console.warn("⚠️ Warning: ARTICLE_AI_PROVIDER is 'claude' but ANTHROPIC_API_KEY not found. Falling back to Gemini.");
}

console.log(`📝 Article AI Provider: ${articleAiProvider === 'claude' && claudeClient ? 'Claude Opus 4.5' : 'Gemini'}`);

// Helper function to check if Claude should be used
const useClaudeForArticles = () => articleAiProvider === 'claude' && claudeClient;

/**
 * Generate SEO Metadata (Title, Description)
 */
async function generateSeoMetadata(keyword, productName = null) {
    if (!client) throw new Error("Gemini Client not initialized");

    const context = productName
        ? `Focus on the specific product verification: "${productName}".`
        : `Focus on the "Best for Commuting" ranking/comparison for keyword: "${keyword}". Emphasize "Silence", "Subway", and "Stress-free".`;

    const prompt = `
# Role
**Pro Tech Blogger & Copywriter**
Generate a "High CTR" Title and Meta Description for a Japanese Tech Blog.
${context}

# Rules for TITLE
1. **Benefit-First**: Don't just say "Ranking". Say *what experience* the reader gets (e.g., "Silence on the Subway", "No More Noise").
2. **Format**: Use brackets for emphasis, e.g., 【2025年最新】 or 【通勤革命】.
3. **Keywords**: MUST include "通勤 (Commuting)" and "ワイヤレスヘッドホン (Wireless Headphones)" or similar variants.
4. **Length**: Max 32 Japanese characters (Critical).
5. **Bad Example**: "2025年版:最強無線イヤホン" (Too boring).
6. **Good Example**: "【2025】満員電車が書斎に！通勤用ノイキャンヘッドホン最強決定戦"

# Rules for DESCRIPTION
1. **Hook**: Ask a question about the pain point (Noise, Stress).
2. **Solution**: "Professional comparison of the best models for subway silence."
3. **Length**: Max 120 characters.

# Output JSON
{
  "title": "...",
  "description": "..."
}
`;

    console.log(`  🤖 generating SEO Metadata for "${keyword}"...`);
    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        if (!response.candidates || response.candidates.length === 0) return { title: keyword, description: "..." };

        let jsonText = response.candidates[0].content.parts[0].text;
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonText);
    } catch (e) {
        console.error("  ❌ SEO Gen Failed:", e);
        return { title: `【2025】${keyword} 通勤用ランキング`, description: "通勤が快適になるヘッドホンを厳選紹介。" };
    }
}

/**
 * Generate Main Buying Guide Body (Markdown)
 * Blueprint対応版: sales_hook/target_reader/comparison_axisに基づいた序論から結論まで一貫した記事を生成
 */
async function generateBuyingGuideBody(keyword, topProducts, intentData = null) {
    if (!client) throw new Error("Gemini Client not initialized (Missing Key)");

    const productListString = topProducts.map((p, i) => {
        const link = p.affiliateLinks?.amazon || "";
        const specsStr = p.specs ? p.specs.map(s => `${s.label}: ${s.value}`).join(', ') : "N/A";
        const prosStr = p.pros ? p.pros.join(', ') : "";
        const consStr = p.cons ? p.cons.join(', ') : "";

        return `
### Rank ${i + 1}: ${p.name}
- **ASIN**: ${p.asin || "N/A"}
- **Price**: ${p.price || "N/A"}
- **Rating (Score)**: ${p.calculatedRating || 4.0} / 5.0 (Theme Score: ${p.themeScore || 5}/10)
- **Specs**: ${specsStr}
- **Pros**: ${prosStr}
- **Cons**: ${consStr}
- **Amazon Link**: ${link}
        `.trim();
    }).join('\n\n');

    // Default Fallback Context (if no blueprint provided)
    const defaultContext = {
        target_reader: `${keyword}を探している一般的な読者`,
        comparison_axis: "音質、機能、価格のバランス",
        sales_hook: `最適な${keyword}を見つけるための完全ガイド`
    };

    // Use Blueprint data or fallback
    const ctx = {
        target_reader: intentData?.target_reader || defaultContext.target_reader,
        comparison_axis: intentData?.comparison_axis || defaultContext.comparison_axis,
        sales_hook: intentData?.sales_hook || defaultContext.sales_hook
    };

    const prompt = `
# Role
あなたは、日本のNo.1アフィリエイトメディア「マイベスト」のような**SEO最強の長文レビュー記事**を書くSEO歴40年の専門ライターです。
Google検索で上位表示されるために、E-E-A-T（経験・専門性・権威性・信頼性）を意識した上でAIっぽくない文章を記事を書いてください。

# Blueprint（購買意図）データ
このデータに基づいて、ターゲット読者に「刺さる」記事を書いてください：

- **ターゲット読者**: ${ctx.target_reader}
- **比較ポイント（検証軸）**: ${ctx.comparison_axis}
- **セールスフック（核心価値）**: ${ctx.sales_hook}

# 使用する商品リスト
${productListString}

# 厳守ルール
1. **商品リストは絶対**: 上記リスト以外の商品を推奨しない
2. **メタコメント禁止**: 「以下が記事です」などは一切書かない。記事本文のみ出力
3. **文体**: です・ます調、プロフェッショナルかつ親しみやすく
4. **文字数**: 各セクション500-1000文字以上を目安に詳しく書く（SEO対策）
5. **鍵かっこ「」の多用禁止**: 「〜」形式の引用を多用しない。AIっぽくなるため最小限に。ストレートに述べる
6. **マーカー強調（重要）**: 記事内で**特に重要な部分（メリット、数値、結論）は必ず太文字（**重要なテキスト**）にしてください**。これがサイト上で「黄色いマーカー」として表示されます。
   - 目安: 1段落につき1〜2箇所。
   - 全文を太文字にするのはNG。単語や短いフレーズ単位で引くこと。

# AIっぽい文章を避けるための絶対ルール
7. **接続詞の連続使用禁止**: 「さらに」「また」「加えて」「そして」「一方で」を連続して使わない。同じ接続詞は記事全体で3回まで。代わりに文の構造を工夫する。
8. **曖昧な形容詞禁止**: 以下の表現は使用禁止
   - ❌ 「驚くべき」「素晴らしい」「圧倒的な」「究極の」「画期的な」「革命的な」「抜群の」
   - ⭕️ 代わりに具体的な数値や比較を使う（例：「旧モデルより30%軽量」「電車の走行音が聞こえなくなる」）
9. **問いかけパターンの制限**:
   - ❌ 「〜ではないでしょうか？」「〜と思いませんか？」は記事全体で1回まで
   - ❌ 「こんな経験ありませんか？」形式は使わない
   - ⭕️ 代わりに断定的に読者の悩みを述べる（例：「通勤電車で音楽に集中できないストレスは大きい」）
10. **語尾の単調さ回避**: 「〜です。〜です。〜です。」のように同じ語尾が3回以上続かないようにする。「〜でしょう」「〜といえます」「〜になります」などを織り交ぜる。
11. **抽象的な約束禁止**:
   - ❌ 「人生が変わる」「幸せになれる」「後悔しない」「間違いない」
   - ⭕️ 具体的なベネフィット（例：「朝の満員電車でもポッドキャストに集中できる」）
12. **リスト形式の乱用禁止**: 箇条書きは1セクションにつき1箇所まで。文章で説明することを優先する。

# 記事構成（必須: この順番で全セクションを書いてください）
**注意**: ランキング詳細は別コンポーネントで表示するため、ここでは書かない

---

## セクション1: 導入（読者の心をつかむ）
**見出しルール**: 
- キーワード「${keyword}」をそのまま使わない
- 自然な日本語に言い換える（例：「ワイヤレスイヤホン おすすめ」→「自分にぴったりのワイヤレスイヤホン」）
- 読者の悩みに寄り添った問いかけにする
**見出し例**: 「## 失敗しない選び方とは？」「## 本当に買うべきモデルはどれ？」

### 書くべき内容（詳しく書く）:
1. **読者の悩みへの共感**（2-3段落）
   - 「${ctx.target_reader}」が抱える具体的な悩みを断定的に言語化する
   - 問いかけ形式ではなく、事実として述べる（例：「多くの人が〜で困っている」）
   - なぜこの悩みが解決されにくいのか、その理由

2. **この記事の価値**（1-2段落）
   - 「${ctx.sales_hook}」を読者への約束として提示
   - どんな基準で商品を評価したか

---

## セクション2: 検証ポイント（マイベスト風）
**見出し**: 「## 今回の検証ポイント」

### 書くべき内容:
「${ctx.comparison_axis}」を基に、3-5個の検証ポイントを詳しく解説。各ポイントについて:

1. **なぜこのポイントが重要なのか**
2. **どうやって判断すればいいか（具体的なチェック方法）**
3. **実際に検証してわかったこと**

例:
### ポイント①: 〇〇
[詳細な解説を3-5段落]

### ポイント②: △△
[詳細な解説を3-5段落]

---

## セクション3: 失敗しない選び方
**見出し**: 「## ${keyword}の選び方」

### 書くべき内容（詳しく書く）:

1. **価格帯別の傾向**（2-3段落）
   - 安い価格帯のメリット・デメリット
   - 中価格帯の特徴
   - 高価格帯がおすすめな人

2. **よくある失敗パターン**（2-3段落）
   - 読者が陥りやすい3つの失敗とその回避法

3. **プロからのアドバイス**（1-2段落）
   - 専門家としての具体的なアドバイス

---

## セクション4: おすすめ人気ランキング
**見出し**: 「## ${keyword}のおすすめ人気ランキングTOP5」

### 書くべき内容:
以下の**「使用する商品リスト」にある正規データ（順位・スペック・評価）をそのまま使用**して、ランキングを作成してください。
**絶対にAIが勝手に評価やスペックを捏造しないでください。リストの数値を厳守すること。**
※リストにある商品のみを紹介すること（重要）

**出力フォーマット（厳守）**:
各順位について、必ず以下の \`<RankingCard />\` コンポーネントを使用してください。

### 第1位: [Product Name]
\`\`\`jsx
<RankingCard
  rank={1}
  name="[リストの正規商品名]"
  image="[リストにあるAmazon画像URL]"
  rating={[リストにあるRating数値 (例: 4.5)]}
  // ratingsはTheme Score (1-10)から推測、または以下のように固定
  ratings={{
    functional: [Theme Score / 2], 
    cost: 4.0, 
    quality: 4.5, 
    design: 4.0, 
    ease: 4.0, 
    sound: 4.5
  }}
  description="[リストのPros/Consを参考に、この商品の魅力を200文字程度の自然な日本語で執筆]"
  bestFor="[ターゲット読者]"
  pros={[リストにあるProsを配列で記述]}
  cons={[リストにあるConsを配列で記述]}
  affiliateLinks={{ amazon: "[リストにあるAmazonリンク]" }}
  asin="[リストにあるASIN]"
/>
\`\`\`

(2位〜5位も同様に作成)

### ランキング直後の比較表
ランキングの直後に、以下の比較表コンポーネントを配置してください。
**スペック情報も必ず「使用する商品リスト」のSpecsから抽出してください。**

\`\`\`jsx
<ComparisonTable
  specLabels={{ spec1: "価格", spec2: "評価", spec3: "特徴", spec4: "スペック" }}
  products={[
    { 
      rank: 1, 
      name: "[商品名]", 
      image: "[画像URL]", 
      asin: "[ASIN]", 
      specs: { 
        spec1: "[リストのPrice]", 
        spec2: "[リストのRating]", 
        spec3: "[リストのSpecsから抜粋]", 
        spec4: "[リストのSpecsから抜粋]" 
      } 
    },
    // ... 5位まで
  ]}
/>
\`\`\`

---

## セクション5: 結論（迷っている読者の背中を押す）
**見出し**: 「## まとめ：あなたにベストな選択」

### 【絶対厳守】ランキング順位を尊重
**最重要ルール**: まとめで推奨する商品は、**ランキング上位（1位〜3位）を優先**してください。
8位や9位のような下位製品を「おすすめ」として紹介することは記事の論理的整合性を損ないます。

### 【絶対厳守】使用可能な商品
このセクションで紹介できる商品は、以下のリストにある商品のみです。
リスト外の商品名を絶対に使用しないでください：
${productListString}

### 書くべき内容:
1. **タイプ別のおすすめ**（3-5パターン）

**重要**: 各タイプでおすすめする商品は、**リストの最初の5商品（上位5位）から選ぶこと**。
下位の商品（6位以降）は「代替案」としてのみ言及可。

形式例（この形式を必ず守るが、カテゴリはキーワード「${keyword}」に合わせて適切に変更すること）:

### **🏆 ${ctx.comparison_axis}重視なら**
▶ **[商品名をクリックして詳細を見る](Amazonリンク)** がベスト！ ※リストの1-3位から選ぶこと
\> [なぜこの商品がベストなのか1-2文で解説]

### **💰 コスパ重視なら**
▶ **[商品名をクリックして詳細を見る](https://www.amazon.co.jp/dp/〇〇)** が最強！ ※リストの1-5位から選ぶこと
\> [なぜこの商品がベストなのか1-2文で解説]

### **🎯 [キーワードに合わせた別の切り口]**
▶ **[商品名をクリックして詳細を見る](Amazonリンク)** 一択！ ※リストの1-3位から選ぶこと
\> [なぜこの商品がベストなのか1-2文で解説]

※ポイント:
- 各カテゴリのh3見出しに絵文字を付ける
- 商品名は太字+リンク形式 **[商品名](URL)**
- 「▶」で視線を誘導（👉より自然）
- 引用ブロック「\>」で理由を強調
- **ランキング上位の商品を必ずおすすめとして使う（論理的整合性）**
- **カテゴリは「${keyword}」の製品タイプに合わせて適宜変更**（例：冷蔵庫なら省エネ重視/大容量重視、カメラなら画質重視/携帯性重視）

2. **最終メッセージ**（1段落）
   - 読者の行動を後押しする一言

---

# SEOのコツ（記事内で自然に実践）
- 見出しにキーワード「${keyword}」を自然に含める
- 各セクションの冒頭で要点を述べ、その後詳しく説明（PREP法）
- 「おすすめ」「比較」「選び方」などのSEOワードを自然に使う
- 箇条書きと文章を適度に混ぜる

# トーン
- **権威性**: 実際に検証した専門家として語る
- **共感**: 読者の悩みを否定せず受け止める
- **具体性**: 数字や具体例を多用する

# 出力
(Markdown形式の記事本文のみ。日本語で出力。各セクションを詳しく書く。)
`;

    console.log(`  🤖 generating Buying Guide for "${keyword}"...`);
    try {
        let text;

        // Use Claude Opus 4.5 if configured, fallback to Gemini
        if (useClaudeForArticles()) {
            console.log(`  🎭 Using Claude Opus 4.5...`);
            const response = await claudeClient.messages.create({
                model: 'claude-opus-4-5-20251101',
                max_tokens: 16384,
                messages: [{ role: 'user', content: prompt }],
            });
            text = response.content[0].text;
        } else {
            console.log(`  🤖 Using Gemini...`);
            const response = await client.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });
            if (!response.candidates || response.candidates.length === 0) {
                console.error("  ❌ AI Error: No candidates returned.");
                return "AI生成エラー";
            }
            text = response.candidates[0].content.parts[0].text;
        }

        // AGGRESSIVE CLEANING
        text = text.replace(/```markdown/g, '').replace(/```/g, '').trim();
        // Remove fenced frontmatter
        text = text.replace(/^---[\s\S]*?---/g, '').trim();

        // Loop to remove any top-level key: value lines (orphaned frontmatter)
        const lines = text.split('\n');
        let starIndex = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') continue; // skip empty lines
            // If line looks like "key: value" or "title: ...", ignore it
            if (/^[a-z_]+:\s/i.test(line)) {
                continue;
            }
            // If we hit a header or normal text, stop stripping
            starIndex = i;
            break;
        }
        text = lines.slice(starIndex).join('\n').trim();
        // Note: **bold** markers are preserved for yellow highlighter styling

        // DEDUPLICATION: Comparison Table
        // Sometimes AI generates the table, but the system also inserts one.
        // We only want the INTRO text for the table, not the table itself (checked later).
        // But if AI generated multiple "Comparison Table" headers within the body, remove dupes.
        const tableHeaderRegex = /##\s+TOP.*比較表/g;
        const matches = text.match(tableHeaderRegex);
        if (matches && matches.length > 1) {
            console.warn("  ⚠️ Detected multiple Comparison Table headers. Removing extras...");
            // Keep first instance, remove subsequent
            let firstIndex = text.search(tableHeaderRegex);
            if (firstIndex !== -1) {
                // Find end of first header line
                const afterHeader = text.indexOf('\n', firstIndex);
                // Keep everything up to there
                // And scan the rest for repeated headers and remove them?
                // Actually, safer to just replace all subsequent matches with empty string.
                // But regex replace is indiscriminate.

                // Strategy: Split by header, reconstruct.
                const parts = text.split(/##\s+TOP.*比較表/);
                // parts[0] is content before first table
                // parts[1...] are content after. 
                // We reconstruct exactly ONE header.
                text = parts[0] + matches[0] + parts.slice(1).join('\n');
            }
        }

        return text;
    } catch (e) {
        console.error("  ❌ AI Generation Failed:", e);
        return "AI生成に失敗しました。";
    }
}

/**
 * Generate Individual Review Page Body (Markdown)
 * Uses Strategy: "Match/Mismatch Advisor" (Honest Syntax)
 * @param {Object} product - Product data
 * @param {string} competitorName - Competitor product name
 * @param {Object} blueprint - Blueprint with comparison_axis, target_reader, etc.
 */
async function generateReviewBody(product, competitorName, blueprint = {}) {
    if (!client) throw new Error("Gemini Client not initialized");

    // English to Japanese label mapping for common spec labels
    const labelMap = {
        'Model Name': '型番',
        'Connectivity Technology': '接続方式',
        'Wireless Communication Technology': 'ワイヤレス技術',
        'Included Components': '付属品',
        'Age Range (Description)': '対象年齢',
        'Material': '素材',
        'Specific Uses For Product': '用途',
        'Charging Time': '充電時間',
        'Recommended Uses For Product': '推奨用途',
        'Compatible Devices': '対応機器',
        'Control Type': '操作方式',
        'Control Method': '操作方法',
        'Number of Items': '個数',
        'Batteries Required': 'バッテリー',
        'Manufacturer': 'メーカー',
        'Item Model Number': '型番',
        'Package Dimensions': 'サイズ',
        'ASIN': 'ASIN',
        'Date First Available': '発売日',
        'Customer Reviews': 'カスタマーレビュー',
        'Amazon Bestseller': 'ベストセラーランク',
        'Product Dimensions': 'サイズ',
        'Item Weight': '重量',
        'Product Weight': '重量',
        'Capacity': '容量',
        'Volume': '容量',
        'Wattage': '消費電力',
        'Voltage': '電圧',
        'Material': '素材',
        'Color': '色',
        'Warranty Description': '保証',
        'Noise Level': '騒音レベル',
        'Installation Type': '設置タイプ',
        'Form Factor': '形状',
        'Special Features': '機能',
        'Filter Type': 'フィルター',
        'Power Source': '電源',
        'Runtime': '稼働時間',
        'Suction Power': '吸引力',
        'Maximum Weight Recommendation': '耐荷重'
    };

    // Prioritize kakakuSpecs (Japanese) over Amazon specs (English)
    let specsText = '';
    if (product.kakakuSpecs && Object.keys(product.kakakuSpecs).length > 0) {
        specsText = Object.entries(product.kakakuSpecs)
            .filter(([k, v]) => !k.includes('特集') && !k.includes('満足度') && !k.includes('ランキング') && !k.includes('PV') && !k.includes('記事'))
            .slice(0, 15)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
    } else if (product.specs && product.specs.length > 0) {
        specsText = product.specs
            .filter(s => s.label && s.value && s.value !== '記載なし')
            .filter(s => !s.label.includes('特集') && !s.label.includes('満足度') && !s.label.includes('ランキング') && !s.label.includes('PV') && !s.label.includes('記事'))
            .slice(0, 10)
            .map(s => {
                const jpLabel = labelMap[s.label] || s.label;
                return `${jpLabel}: ${s.value}`;
            })
            .join(', ');
    }
    specsText = specsText || '情報なし';

    const realFeaturesText = product.realFeatures && product.realFeatures.length > 0
        ? product.realFeatures.join('\n')
        : "情報なし";

    // Parse scraped specs if available (with translation)
    const realSpecsText = product.realSpecs && Object.keys(product.realSpecs).length > 0
        ? Object.entries(product.realSpecs).slice(0, 8).map(([k, v]) => {
            const jpLabel = labelMap[k] || k;
            return `- ${jpLabel}: ${v}`;
        }).join('\n')
        : "情報なし";

    // Include real user reviews for SEO value (Amazon + 価格.com)
    let reviewsContext = '';
    if (product.rawReviews) {
        // Amazon reviews
        const amazonPositive = product.rawReviews.positive?.slice(0, 3).map(r => `「${r.text?.slice(0, 100)}」`).join('\n') || '';
        const amazonNegative = product.rawReviews.negative?.slice(0, 2).map(r => `「${r.text?.slice(0, 100)}」`).join('\n') || '';

        // 価格.com reviews
        const kakakuPositive = product.rawReviews.kakaku?.positive?.slice(0, 3).map(r => `「${r.text?.slice(0, 100)}」`).join('\n') || '';
        const kakakuNegative = product.rawReviews.kakaku?.negative?.slice(0, 2).map(r => `「${r.text?.slice(0, 100)}」`).join('\n') || '';

        if (amazonPositive || amazonNegative || kakakuPositive || kakakuNegative) {
            reviewsContext = `

## 参考情報：ユーザーの声（これを参考に自然な文章で書いてください）
【重要】以下のレビューは参考情報です。直接引用（「」付きの引用や「〜より引用」）は禁止です。
レビューから得られた知見を自分の体験として咀嚼し、自然な文章で書いてください。
❌ 禁止例：「ノイズキャンセリングは非常に強力」（Amazon口コミより引用）
⭕️ 推奨例：電車の走行音がほぼ聞こえなくなるほど、ノイズキャンセリングの効きは強力です。

### 好評の傾向
${amazonPositive || kakakuPositive || '（情報なし）'}

### 不満の傾向
${amazonNegative || kakakuNegative || '（情報なし）'}`;
        }
    }

    // Dynamic review context based on blueprint
    const reviewContext = blueprint.comparison_axis || "日常使用";
    const targetReader = blueprint.target_reader || "一般ユーザー";
    const usageScenario = blueprint.usage_scenario || "普段使い";


    // Get Amazon Link for the prompt
    const amazonLink = product.affiliateLinks?.amazon || "";

    const prompt = `
# Role
**ガジェットのプロ検証人**
この製品を「${reviewContext}」という観点で、プロの視点から正直にレビューしてください。
決してメーカーの提灯記事にはならず、読者の利益（失敗したくない）を最優先してください。

# Product Information
- Name: ${product.name}
- Amazon Link: ${amazonLink} (本記事の収益化用リンク)
- Official Specs: ${specsText}
- Real Scraped Features(Amazon):
${realFeaturesText}
- Scraped Technical Specs:
${realSpecsText}
- External Market Opinions:
${product.externalContext || "No external context available. Rely on specs and general knowledge."}
- Comparison Target: ${competitorName} (主な比較ベンチマークとして使用。ただし、同価格帯の他の競合製品との比較も歓迎します)
${reviewsContext}

# 想定読者
${targetReader}

# Strict Tone & Style Rules
- **リンクの徹底（収益化）**:
    - 本文中や比較で**この製品（${product.name}）**に言及する際は、可能な限り **[${product.name}](${amazonLink})** のようにAmazonリンクを貼ってください。
    - 特に「結論」「おすすめポイント」「他製品との違い」のセクションでは積極的にリンクを含めてください。
    - 競合製品についても、もし有名な製品でURLを知っている場合はリンクを貼って構いませんが、基本は主役であるこの製品へのリンクを優先してください。
- **導入の書き出しの厳格化**:
    - ❌ 禁止: 「Amazonで評価が高い」「Amazonランキング上位の」
    - ❌ 禁止: **スペック表やスペック概要の作成（重要）** - UI側で別途表示するため、本文中には表を作らないでください。
    - ❌ 禁止: 「スペック概要」や「基本スペック」という見出しの作成。
    - ❌ 禁止: 「その実力を深掘りします」「いざ、検証の旅へ」などの詩的・劇的な表現
    - ❌ 禁止: 「人生が変わる」「幸せになれる」「最高の一台」といった過剰で抽象的なAI特有の表現。
    - ⭕️ 推奨: 「${reviewContext}の観点で実機を検証しました。」「結論から言うと、○○が優秀です。」
- **文体の指定**:
    - 「です・ます」調で、淡々と事実を述べる「専門誌のレビュー」のようなトーン。
    - 小粋なジョークや詩的な表現は**一切禁止**です。
    - 「〜の方が幸せになれます」といった表現は避け、「〜の方が満足度が高いでしょう」「〜のニーズに適しています」のように客観的に記述してください。
- **鍵かっこ「」の多用禁止**: 
    - 「〜」形式の引用を多用しない。AIっぽくなるため最小限に。
    - 代わりに、ストレートに述べる。
- **正直なデメリット**: 「すべてが最高」とは言わず、正直に伝えてください。
- **ユーザーレビュー引用の絶対ルール**: 
    - 【重要】デメリット（Cons）の表現バリエーション:
      - 「〜は要検討です」という定型句は**禁止**します。
      - 代わりに、ターゲットを絞った具体的なアドバイスにしてください。
      - 良い例:
        - 「重低音重視の人は物足りなさを感じるかもしれません」
        - 「手が小さい人は、ケースが大きく感じる可能性があります」
        - 「ノイキャン性能はマイルドなので、完全な静寂を求める人は注意が必要です」
        - 「屋内利用なら全く気になりませんが、風の強い屋外ではノイズが入ります」
      - バリエーション意識: 「〜な人は注意」「〜なら問題なし」「〜と感じるかも」など、文末を散らしてください。
- **柔軟な比較**: 主な比較対象は **${competitorName}** ですが、市場の他の競合製品（同価格帯）とも自由に比較してください。「${competitorName}以外とは比較してはいけない」という制限はありません。

# AIっぽい文章を避けるための絶対ルール
- **接続詞の連続使用禁止**: 「さらに」「また」「加えて」「そして」「一方で」を連続して使わない。同じ接続詞は記事全体で2回まで。
- **曖昧な形容詞禁止**: 「驚くべき」「素晴らしい」「圧倒的な」「究極の」「画期的な」「革命的な」「抜群の」は使用禁止。代わりに具体的な数値や体験を使う。
- **問いかけパターンの制限**: 「〜ではないでしょうか？」「〜と思いませんか？」は使わない。断定的に述べる。
- **語尾の単調さ回避**: 「〜です。〜です。〜です。」のように同じ語尾が3回以上続かないようにする。
- **リスト形式の乱用禁止**: 箇条書きは最小限に。文章で説明することを優先する。
- **比較対象の明記**: 「2倍の性能」などの表現を使う場合は、必ず「何と比べて（旧モデル比、競合他社比）」を明記すること。不明な場合はその表現を使わず、「電車の音が気にならないレベル」のように体験ベースで記述すること。
- **マーカー強調（重要）**:
    - 記事内で**特に重要な部分（メリット、数値、結論）は必ず太文字（**重要なテキスト**）にしてください**。これがサイト上で「黄色いマーカー」として表示されます。
    - 目安: 1段落につき1〜2箇所。
    - 全文を太文字にするのはNG。単語や短いフレーズ単位で引くこと。

# Review Structure(Markdown)
（導入文：${reviewContext}の観点で実機を検証しました。結論から言うと…で始める）

## 検証：${reviewContext}での実力
   - この製品の強みと弱みを具体的に描写。
   - ${usageScenario}での使用感を具体的に。

## 他の選択肢との違い
   - この製品の立ち位置は？どういうニーズに応えるか？
   - 同価格帯の他製品と比べて何が優れているか/劣っているか？
   - **特定の1製品との比較にこだわらず**、読者のニーズ別に柔軟に言及。

## まとめ
   読者のタイプ別におすすめを提案してください。

   "### この製品がおすすめな人"
   - 具体的なライフスタイルや価値観を3パターン程度提示。

   "### 他の選択肢を検討すべき人"
   - こういうニーズがある人は別の製品（具体名を出さなくてもOK）の方が**満足度が高い / ニーズに適している**、と正直に提案。
   - 1製品に限定せず、ニーズ別に柔軟に言及。

# Output
(Markdown形式の本文のみ出力してください。Frontmatterは不要です。**必ず日本語（です・ます調）で書いてください**。)
`;

    console.log(`  🤖 generating Review for "${product.name}"...`);
    try {
        let text;

        // Use Claude Opus 4.5 if configured, fallback to Gemini
        if (useClaudeForArticles()) {
            console.log(`  🎭 Using Claude Opus 4.5...`);
            const response = await claudeClient.messages.create({
                model: 'claude-opus-4-5-20251101',
                max_tokens: 16384,
                messages: [{ role: 'user', content: prompt }],
            });
            text = response.content[0].text;
        } else {
            console.log(`  🤖 Using Gemini...`);
            const response = await client.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });
            if (!response.candidates || response.candidates.length === 0) {
                console.error("  ❌ AI Error: No candidates returned.");
                return "AI生成エラー";
            }
            text = response.candidates[0].content.parts[0].text;
        }
        // STRONG CLEANING
        text = text.replace(/```markdown/g, '').replace(/```/g, '').trim();
        text = text.replace(/^---[\s\S]*?---/g, '').trim();
        text = text.replace(/^title:.*$/gim, '');
        text = text.replace(/^description:.*$/gim, '');
        // Note: **bold** markers are preserved for yellow highlighter styling

        // Content Policing (User Feedback)
        // More aggressive regex to catch variations
        text = text.replace(/Amazon.*評価.*高い/g, '');
        text = text.replace(/正直な判定（競合比較）/g, '競合製品との比較');
        text = text.replace(/その実力を深掘りします/g, ''); // Also remove the "Deep Dive" phrase

        if (text.includes("Amazon")) {
            console.warn("  ⚠️ Warning: 'Amazon' still found in text after cleaning.");
        }

        // Deduplication Safeguard (Partial String match)
        // AI sometimes uses "##" and sometimes "1." so we match the text itself.
        // Deduplication Safeguard (Partial String match)
        // AI sometimes uses "##" and sometimes "1." so we match the text itself.
        const anchorText = `検証：${reviewContext}での実力`;
        const parts = text.split(anchorText);

        if (parts.length > 2) {
            console.warn(`  ⚠️ Detected duplicate content via partial anchor split. Truncating...`);
            // parts[0] is everything before the first occurrence (Intro)
            // parts[1] is the duplicate chunk check
            // We reconstruct: Intro + Anchor + First Content
            text = parts[0] + anchorText + parts[1];
        } else {
            // Fallback: Check for generic double-header if specific anchor fails
            const headerRegex = /(?:^|\n)##\s+([^\n]+)/g;
            let match;
            const seenHeaders = new Set();
            let truncateIndex = -1;

            while ((match = headerRegex.exec(text)) !== null) {
                const headerTitle = match[1].trim();
                if (seenHeaders.has(headerTitle)) {
                    console.warn(`  ⚠️ Detected duplicate header (Regex): "${headerTitle}". Truncating...`);
                    truncateIndex = match.index;
                    break;
                }
                seenHeaders.add(headerTitle);
            }

            if (truncateIndex !== -1) {
                text = text.substring(0, truncateIndex).trim();
            }
        }

        // --- CRITICAL FIX: Remove "Spec Overview" sections AI generates despite being told not to ---
        // This section duplicates the structured spec table in ProductContent.tsx
        // Regex targets: "## スペック概要", "## 基本スペック", "### スペック概要" etc and ALL content until next ## heading
        const specOverviewPatterns = [
            /(?:^|\n)##[#]*\s*(?:スペック概要|基本スペック|スペック一覧|製品スペック|主な仕様|主要スペック)[^\n]*\n(?:(?!^##[^#]).)*?(?=\n##[^#]|$)/gims,
            /(?:^|\n)\|[^\n]*スペック[^\n]*\|[\s\S]*?\n(?:\|[^\|]+\|[^\|]+\|\n)+/gim // Markdown tables about specs
        ];

        for (const pattern of specOverviewPatterns) {
            const before = text.length;
            text = text.replace(pattern, '\n');
            if (text.length < before) {
                console.log(`  🧹 Removed "スペック概要" section (AI ignored prompt restriction)`);
            }
        }

        // Clean up excessive newlines left by removals
        text = text.replace(/\n{3,}/g, '\n\n').trim();

        return text;
    } catch (e) {
        console.error("  ❌ AI Generation Failed:", e);
        return "レビュー生成に失敗しました。";
    }
}

/**
 * Generate AI Thumbnail for the Article
 * Uses Gemini 2.0 Flash for native image generation.
 * Constraint: Japanese models if people are present.
 */
async function generateBlogThumbnail(keyword) {
    if (!client) throw new Error("Gemini Client not initialized");

    // "Non-oppressive, Japanese-centric" Prompt
    const prompt = `
    Generate a photorealistic, high-quality blog thumbnail image for the topic: "${keyword}".
    
    1. **Style**: Minimalist, airy, "Japanese Lifestyle Magazine" aesthetic (like Kinfolk Japan, Popeye, or Brutus).
    2. **Lighting**: Soft, natural morning light. No harsh shadows. Bright and welcoming.
    3. **Tone**: "Non-oppressive", calming, sophisticated. Avoid chaotic or cluttered compositions.
    4. **Subject**: A clean desk setup, a quiet train car (clean), or a person using gadgets naturally.
    5. **MANDATORY RULE**: If any person is visible in the image, they **MUST BE JAPANESE**. 
       - Black hair, appropriate features.
       - A person is OPTIONAL (scenery/objects are fine), but if present, must be Japanese to fit the local context.
    
    Negative Prompt: Text, watermark, logo, messy, dark, gritty, neon, western models, aggressive facial expressions, anime style, blurred.
    `;

    console.log(`  🎨 Generating AI Thumbnail for "${keyword}"...`);

    try {
        // Use Gemini 3 Pro Image for high-quality image generation
        const response = await client.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: prompt,
            config: {
                responseModalities: ['image', 'text']
            }
        });

        // Parse response - look for inlineData in parts
        if (response && response.candidates && response.candidates[0] && response.candidates[0].content) {
            const parts = response.candidates[0].content.parts;
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    console.log("  ✨ AI Thumbnail Generated Successfully!");
                    return part.inlineData.data; // Base64 string
                }
            }
        }

        console.warn("  ⚠️ Image Gen response structure unexpected or no image generated. Falling back.");
        return null;

    } catch (e) {
        console.warn(`  ⚠️ Thumbnail Generation Failed (API Error: ${e.message}). Falling back to Product Image.`);
        console.error(e); // Log full error for debugging
        return null;
    }
}

/**
 * Generate Structured Specs & Pros/Cons for a Product
 * NOW: First tries to scrape real specs from Amazon, then uses AI to analyze them
 * @param {string} productName - Product name
 * @param {string} contextData - Additional context
 * @param {string} asin - Optional Amazon ASIN for direct spec lookup
 * @param {string} externalSpecContext - Optional fallback specs from web search
 */
async function generateProductSpecsAndProsCons(productInput, contextData, asin = null, externalSpecContext = null, targetLabels = null) {
    if (!client) throw new Error("Gemini Client not initialized");

    const productName = typeof productInput === 'string' ? productInput : productInput.name;
    const productObj = typeof productInput === 'object' ? productInput : null;

    // FIRST: Try to get REAL specs from Amazon
    let realSpecs = productObj?.realSpecs || null;
    let realFeatures = productObj?.realFeatures || [];
    let structuredIdentity = productObj?.structuredIdentity || null;

    if (!realSpecs && asin) {
        try {
            const { scrapeProductSpecs } = require('./spec_scraper');
            realSpecs = await scrapeProductSpecs(productName, asin);
            if (realSpecs && (realSpecs.specs?.length > 0 || realSpecs.features?.length > 0)) {
                console.log(`      ✅ Using REAL specs from: ${realSpecs.source || 'Amazon'}`);
                realFeatures = realSpecs.features || [];
                // Capture structured identity info for name verification
                if (realSpecs.structured) {
                    structuredIdentity = realSpecs.structured;
                }
            }
        } catch (e) {
            console.log(`      ⚠️ Real spec fetch failed: ${e.message}`);
        }
    }

    // Build context with REAL data if available
    const realDataContext = realFeatures.length > 0
        ? `\n【公式の特徴（実データ）】:\n${realFeatures.slice(0, 8).map((f, i) => `${i + 1}. ${f}`).join('\n')}`
        : '';

    const realSpecContext = realSpecs?.specs?.length > 0
        ? `\n【公式スペック（実データ）】:\n${realSpecs.specs.slice(0, 10).map(s => `- ${s.label}: ${s.value}`).join('\n')}`
        : '';

    // Fallback Context (if Amazon failed)
    const fallbackContext = externalSpecContext
        ? `\n【Web検索等の外部スペック情報（Official Fallback）】:\n${externalSpecContext}`
        : '';


    // Combine contexts for the prompt
    const specContext = [realDataContext, realSpecContext, fallbackContext].filter(Boolean).join('\n');


    const prompt = `
# Role
**Tech Spec Analyst**
Analyze the product "${productName}" and the provided context to extract structured data for a comparison table.

【重要】以下のデータは公式サイト/Amazonから取得した実際の情報です。これを最優先で使用してください。
${realDataContext}
${realSpecContext}
${fallbackContext}

追加コンテキスト: ${contextData}

# Task
Generate a JSON object containing:
1. **Pros**: 3 short, punchy positive points (Japanese).
   - **Banned**: "最大2倍", "業界No.1", "圧倒的" etc. (Vague marketing copy).
   - **Required**: Concrete benefits or specific comparisons (e.g. "旧モデルより低音が豊か", "電車の走行音が消える").
2. **Cons**: 2 honest negative points (Japanese).
   - **Tone**: "Awareness / Caution" rather than "Definitive Flaw".
   - **Rule**: Avoid generalizing subjective issues. Use phrases like "人によっては～と感じる場合がある" (Some might feel...), "～かもしれないため注意が必要" (Be aware that...), or "使用環境によっては" (Depending on usage environment...).
   - **Banned**: Forced follow-up excuses like "ですが、慣れれば問題ありません" (But once used to it...).
   - **Good (General)**: "サイズが大きいため、設置場所によっては圧迫感を感じるかもしれません。" (Furniture/Appliance)
   - **Good (Gadget)**: "タッチ感度が良すぎるため、不用意に触れて誤動作する場合があり注意が必要です。"
   - **Good (Wearable)**: "フィット感が強いため、人によっては長時間の使用で窮屈に感じる場合があります。"
   - **STRICTLY BANNED**: 
     - "Initial defects" (初期不良), "Support" (サポート), "Warranty" (保証).
     - "Shipping/Delivery" (配送/梱包), "Price/Resale" (価格/リセール).
     - "Individual defect reports" (個体差/不具合報告).
    3. **Specs**: 
       ${targetLabels ? `
       - **STRICTLY FOLLOW THESE COLUMNS** (Do not invent new ones):
         - Label 1: "${targetLabels.spec1}"
         - Label 2: "${targetLabels.spec2}"
         - Label 3: "${targetLabels.spec3}"
         - Label 4: "${targetLabels.spec4}"
       - **Rule**: If a label implies "Quality/Rating/Sound/NC/Comfort", you **MUST output a Grade (S/A/B/C)**.
       ` : `
       - Generate **4 key comparison columns** (Label & Value) derived from the **Comparison Axis**: "${contextData.comparison_axis || 'Performance, Features, Design, Value'}".
       - If the Comparison Axis is generic, select the most critical specs for "${productName}" (e.g., for Furniture: Size, Material, Comfort; for Audio: Sound, Battery, Function).
       `}
    
    ## 3. Specs Generation Rules (Flexible Schema)
    
    **Data Types:**
    - \`[SCORE]\`: Use for qualitative ratings (S+/S/A/B/C). **PROHIBITED**: '○', '◎'.
    - \`[VALUE]\`: Concrete metrics (e.g. "8時間", "W120xD60cm", "500g").
    - \`[LIST]\`: Short descriptive keywords (e.g. "防水/防塵", "リクライニング").
    
    **Critical Data Formatting Rules:**
    1. **Battery/Power** (Only if applicable):
       - *Earphones*: Must use **Standalone Playback Time** (e.g. "単体12時間"). No Case time.
       - *Furniture/None*: Do not include this column.
    
    ## 3. Specs Generation Rules (Review by Column Meaning)
    
    You must intelligently deduce the rules based on the contents of the chosen Comparison Axis labels.
    
    ### Rule A: If label implies "Battery" / "Power" / "Time"
    - **Context: Earphones**: MUST use **Standalone Playback Time (Main Unit Only)** (e.g. "単体12時間"). 
      - **STRICT PROHIBITION**: Do not use "Case included" time (e.g. "最大36時間" -> REJECT).
    - **Context: Vacuum**: Use Standard Mode time.
    - **Context: Furniture (Chair/Desk)**: Field should probably NOT exist. If forced, output "なし".
    
    ### Rule B: If label implies "Sound" / "NC" / "Comfort" / "Quality" (Subjective Rating)
    - **Format**: MUST use **S/A/B/C** grade.
    - **Logic**: S = Best in Class, A = Good/Standard, B = Complainable, C = Bad.
    - **Prohibited**: "◎", "○", "Highly Rated".
    
    ### Rule C: If label implies "Function" / "Features"
    - **Format**: Concise list of KEYWORDS.
    - **Logic**: Use the FEATURE NAME (e.g. "防水", "マルチポイント", "リクライニング").
    - **Prohibited**: Version numbers alone (e.g. "Ver5.3", "IPX4").
    
    ### Rule D: If label implies "Size" / "Weight" / "Capacity"
    - **Format**: Concrete numbers (e.g. "W120cm", "250g", "500L").
    
    【禁止】括弧付き説明、長文評価、「-」や空欄
    【禁止項目】配送、保証、価格、JANコード、Amazonランキング
    
    あなたはプロのガジェットレビュアーです。
以下の製品のスペック情報と、ユーザーが重視する比較軸（${targetLabels ? targetLabels.join(', ') : (contextData.comparison_axis || '基本スペック')}）に基づいて、
比較表に掲載するための「評価グレード（S/A/B/C）」および「簡潔なスペック値」を生成してください。

# 製品情報
- 製品名: ${productInput.name}
- リアルなスペック情報:
${specContext}

# 重要: 新旧モデルの評価基準
- **最新モデル・上位機種の優遇**: 型番が大きい、または明らかに最新のフラッグシップモデル（例: AZ80 → AZ100）である場合は、レビューが少なくても**スペック上の進化を信頼して「S」や「A」を積極的に付けてください**。
- **旧モデルの相対評価**: 過去の名機であっても、最新世代と比較してスペックが見劣りする場合（例: コーデック、ANC性能）は、現在の基準で厳しく評価（S→A, A→B）してください。
- "昔は凄かった" ではなく "今通用するか" で採点してください。

# 出力要件
1. ${targetLabels ? `**${targetLabels.join(', ')}** の${targetLabels.length}項目について、順に出力してください。` : `比較軸に基づいた重要なスペックを4項目出力してください。`}
2. **主観的項目（音質、ノイキャンなど）**: 必ず **S, A, B, C** の4段階で評価してください。
   - S: 業界最高クラス / 感動するレベル
   - A: 非常に良い / 満足度高い
   - B: 普通 / 価格相応
   - C: 不満 / 改善の余地あり
3. **客観的項目（重量、再生時間など）**: 具体的な数値（例: "約5.0g", "最大10時間"）を出力してください。詳細が不明な場合は "?" としてください。

# 出力形式 (JSONのみ)
{
  "specs": [
    ${targetLabels ? `{ "label": "${targetLabels[0]}", "value": "S" },` : `{ "label": "項目名", "value": "Evaluate S/A/B/C" },`}
    ${targetLabels && targetLabels[1] ? `{ "label": "${targetLabels[1]}", "value": "約7.0時間" },` : `{ "label": "項目名", "value": "Spec Value" },`}
    ...
  ]
}
    ## Example for Earphones (comparison_axis: 音質、ノイキャン、バッテリー、機能):
    {
      "pros": ["電車の騒音がほぼ消える", "8時間連続再生で通勤に十分", "3台同時接続が便利"],
      "cons": ["LDAC使用時は4.5時間に短縮。ですが通常のAACなら8時間持つので日常使いには十分", "ケースの質感がやや安っぽい。ですが本体の装着感は非常に良い"],
      "specs": [
        { "label": "音質", "value": "S" },
        { "label": "ノイキャン", "value": "A" },
        { "label": "バッテリー", "value": "8時間" },
        { "label": "機能", "value": "LDAC/マルチポイント" }
      ],
      "realFeatures": ${realFeatures.length > 0 ? 'true' : 'false'}
    }
    
    ## Example for Refrigerator (comparison_axis: 容量、省エネ、サイズ、静音性):
    {
      "specs": [
        { "label": "容量", "value": "A (168L)" },
        { "label": "省エネ", "value": "S" },
        { "label": "サイズ", "value": "W480×D595mm" },
        { "label": "静音性", "value": "B" }
      ]
    }
    `;

    console.log(`  🤖 generating Specs/Pros/Cons for "${productName}"...`);
    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        if (!response.candidates || response.candidates.length === 0) return null;

        let jsonText = response.candidates[0].content.parts[0].text;
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonText);
        if (!parsed || typeof parsed !== 'object') {
            console.error("  ❌ Spec Gen Failed: Parsed JSON is null or not an object");
            return null;
        }

        // POST-PROCESSING: Enforce S/A/B formatting programmatically
        if (parsed.specs && Array.isArray(parsed.specs)) {
            parsed.specs = parsed.specs.map(spec => {
                if (!spec) return spec; // Safety skip
                let val = spec.value;
                // Fix Rating Symbols
                if (val === '◎' || val === 'Top' || val === 'Excellent') val = 'S';
                if (val === '○' || val === 'Good') val = 'A';
                if (val === '△') val = 'B';
                if (val === '×') val = 'C';

                return { ...spec, value: val };
            });
        }

        // Attach identity info if available
        if (structuredIdentity) {
            parsed.structuredIdentity = structuredIdentity;
        }

        return parsed;
    } catch (e) {
        console.error("  ❌ Spec Gen Failed:", e.message);
        if (e.stack) console.error(e.stack);
        return null;
    }
}

/**
 * Analyze Reviews to Generate "Pseudo-Experience" Insights
 * レビューを解析し、「擬似体験コメント」と「デメリットの対象者分析」を生成
 */
async function analyzeReviewsForInsights(productName, reviews, comparisonAxis = '') {
    if (!client) throw new Error("Gemini Client not initialized");

    // Format reviews for prompt
    const situationalText = reviews.situational.map(r => `[${r.rating}星] ${r.title}: ${r.text}`).join('\n');
    const positiveText = reviews.positive.slice(0, 3).map(r => `[${r.rating}星] ${r.text.slice(0, 200)}`).join('\n');
    const negativeText = reviews.negative.slice(0, 3).map(r => `[${r.rating}星] ${r.text.slice(0, 200)}`).join('\n');

    const prompt = `
# Role
あなたは「レビュー分析の専門家」です。Amazonの実際のレビューデータを解析し、「擬似体験コメント」を生成してください。

# 商品名
${productName}

# 評価軸
${comparisonAxis || '音質、ノイキャン、バッテリー、機能'}

# シチュエーション別レビュー（電車、カフェ、ジム等を含む）
${situationalText || '(なし)'}

# 高評価レビュー（4-5星）
${positiveText || '(なし)'}

# 低評価レビュー（1-3星）
${negativeText || '(なし)'}

# 生成内容

## 1. editorComment（編集部コメント）
- 「〇〇という声が約X割」形式の具体的な傾向を述べる
- シチュエーション（電車、カフェなど）を必ず含める
- 50-80文字

例: 「『電車の走行音は消えるが、アナウンスは聞こえる』という声が多数。乗り過ごし防止に最適。」

## 2. enhancedPros（強化されたメリット）
- レビューを分析して判明した具体的なメリット3つ
- 【禁止】「〜という評価が多い」「最大2倍」「No.1」等の伝聞や宣伝文句。
- 【必須】具体的・体験的なベネフィット（例：「電車の走行音が消える」「雨の日でも誤作動しない」）。
- 親しみやすい文体で

例:
- "電車の走行音をしっかりカット。イヤホン派には嬉しい遮音性"
- "ケースから取り出すだけでペアリング。毎朝のストレスが激減"

## 3. enhancedCons（強化されたデメリット）
- レビューから抽出した具体的なデメリット2つ
- **無理なフォロー（〜だが問題ない等）は一切禁止**。
## 3. enhancedCons（強化されたデメリット）
- レビューから抽出した具体的なデメリット2つ
- **無理なフォロー（〜だが問題ない等）は一切禁止**。
- **個人差・環境差への配慮**: 断定せず、「人によっては〜」「設置環境によっては〜」「〜と感じる場合がある」という表現を使用してください。
- 文末は「〜かもしれないため注意」「〜な人は要検討」などで締めくくる。

例（様々なカテゴリ）: 
- "座面が少し硬めなため、沈み込むような柔らかさを好む人には不向きかもしれません" (家具)
- "運転音が大きめなため、寝室など静かな場所での使用には注意が必要です" (家電)
- "長時間使用だと、人によっては重さを感じる場合があるため注意が必要です" (ガジェット)

# 出力JSON
{
  "editorComment": "...",
  "enhancedPros": ["...", "...", "..."],
  "enhancedCons": ["...", "..."]
}
`;

    console.log(`  🔍 Analyzing reviews for "${productName}"...`);
    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No response from AI");
        }

        let jsonText = response.candidates[0].content.parts[0].text;
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

        const result = JSON.parse(jsonText);
        console.log(`   ✅ Review analysis complete: "${result.editorComment?.slice(0, 40)}..."`);
        return result;

    } catch (e) {
        console.error("  ❌ Review Analysis Failed:", e.message);
        return {
            editorComment: `${productName}は多くのユーザーから高い評価を得ています。`,
            enhancedPros: ["高い評価を獲得", "多くのユーザーが推薦", "コスパが良い"],
            enhancedCons: ["好みが分かれるデザイン", "一部のユーザーには不向きな場合も"]
        };
    }
}

/**
 * Normalize product names using AI (batch processing)
 * Converts Amazon spam titles to proper product names
 * 
 * CRITICAL: Never produce generic names like "Audio" or "Earphones"
 * If AI fails, keep the original name to preserve product identity
 */
async function normalizeProductNames(products) {
    if (!client || products.length === 0) return products;

    // Known brand names for validation
    const KNOWN_BRANDS = [
        'Sony', 'Anker', 'Soundcore', 'Sennheiser', 'Bose', 'Apple', 'JBL', 'Beats',
        'HUAWEI', 'Samsung', 'Audio-Technica', 'Technics', 'Jabra', 'Nothing', 'AVIOT',
        'EarFun', 'Shokz', 'Marshall', 'Skullcandy', 'Panasonic', 'Bang & Olufsen', 'B&O',
        'AKG', 'Denon', 'Yamaha', 'final', 'JPRiDE', 'Victor', 'JVC', 'JVCKENWOOD',
        'SOUNDPEATS', 'TOZO', 'Edifier', 'Tribit', 'MOONDROP', 'Google', 'Pixel'
    ];

    // Generic words that should NOT be the entire product name
    const INVALID_NAMES = ['audio', 'bluetooth', 'wireless', 'earphones', 'earbuds',
        'headphones', 'イヤホン', 'ヘッドホン', 'ワイヤレス', 'ブルートゥース'];

    // Pre-process: Extract brand from original title as fallback
    const originalNames = products.map(p => {
        const title = p.name || '';
        // Try to find a known brand in the title
        const foundBrand = KNOWN_BRANDS.find(brand =>
            title.toLowerCase().includes(brand.toLowerCase())
        );
        return { product: p, originalTitle: title, brand: foundBrand };
    });

    const rawNames = products.map(p => p.name).join('\n');

    const prompt = `あなたは製品名の専門家です。以下のAmazonの商品タイトルリストから、各商品の「正式な製品名」だけを抽出してください。

【入力】
${rawNames}

【最重要ルール】
1. 必ず「ブランド名 + 型番/モデル名」の形式で出力（例: "Sony WF-1000XM5", "Anker Soundcore Liberty 4 NC"）
2. ブランド名を必ず含めること - ブランド名なしの出力は禁止
3. 説明文（ワイヤレス、Bluetooth、ノイズキャンセリング等）は除外
4. カラー名は含めない
5. 入力と同じ順番で、1行1製品名で出力
6. 絶対に「Audio」「Earphones」「Wireless」だけの出力はしない

【出力形式】
ブランド名 モデル名
ブランド名 モデル名
...`;

    try {
        console.log(`   🤖 Normalizing ${products.length} product names with AI...`);
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt
        });

        const text = response.candidates[0].content.parts[0].text;
        const cleanNames = text.trim().split('\n').map(n => n.trim()).filter(n => n);

        // Map back to products WITH STRICT VALIDATION
        products.forEach((p, i) => {
            const original = originalNames[i];
            const aiName = cleanNames[i] || '';

            // Validation 1: Name must be at least 5 characters
            if (aiName.length < 5) {
                console.log(`   ⚠️ AI name too short for "${p.name.slice(0, 30)}..." - keeping original`);
                return; // Keep original
            }

            // Validation 2: Name must NOT be just a generic word
            if (INVALID_NAMES.some(inv => aiName.toLowerCase() === inv.toLowerCase())) {
                console.log(`   ⚠️ AI returned generic name "${aiName}" - keeping original`);
                return; // Keep original
            }

            // Validation 3: Check if AI output already contains A valid known brand
            const aiHasKnownBrand = KNOWN_BRANDS.find(brand =>
                aiName.toLowerCase().includes(brand.toLowerCase())
            );

            if (aiHasKnownBrand) {
                // AI successfully identified a known brand (e.g. "Skullcandy")
                // Even if original.brand was different (e.g. "Bose" found in description), trust AI's specific extraction
                p.name = aiName;
                return;
            }

            // Fallback: If AI didn't output a known brand, but we detected one in original title
            if (original.brand && !aiHasKnownBrand) {
                // Prepend the detected brand to the unknown name
                console.log(`   ⚠️ AI missed brand ${original.brand} in "${aiName}" - fixing`);
                p.name = `${original.brand} ${aiName}`;
                return;
            }
        });

        console.log(`   ✅ Normalized: ${products.slice(0, 3).map(p => p.name).join(', ')}...`);
    } catch (e) {
        console.error(`   ⚠️ Name normalization failed: ${e.message}`);
        // On error, keep all original names (they're better than nothing)
    }

    return products;
}

module.exports = { generateBuyingGuideBody, generateReviewBody, generateSeoMetadata, generateBlogThumbnail, generateProductSpecsAndProsCons, analyzeReviewsForInsights, normalizeProductNames };
