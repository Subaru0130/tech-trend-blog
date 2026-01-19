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
**Tech Market Researcher & Data Analyst**
Generate a "High CTR" Title and Meta Description for a Japanese Tech Blog.
${context}
**STRICT RULE**: Do NOT claim to be a "pro blogger" or "expert". Do NOT lie about owning the product. Focus on "What the data/specs say".

# 【重要】Before/After例（これを絶対守れ）

❌ AIっぽいタイトル（書くな）:
- 「最強の静寂」「究極のノイキャン」「革命的な体験」← 抽象的・詩的すぎる
- 「〜決定戦」「〜完全ガイド」← ありきたり

⭕️ 人間っぽいタイトル（書け）:
- 「電車で音楽に集中できるイヤホン10選」← 具体的なシーン
- 「通勤用ノイキャンイヤホン、本当に使えるのはどれ？」← 疑問形で自然
- 「【2025年】1万円台で買えるノイキャンイヤホンおすすめ」← 価格帯明示

# Rules for TITLE
1. **具体性**: 「最強」「究極」「革命」などの抽象的な形容詞は禁止。代わりに具体的な場面（電車で、通勤中、カフェで）を使う
2. **Format**: 【2025年】のような年号はOK
3. **Keywords**: キーワード「${keyword}」を自然に含める
4. **Length**: Max 40文字
5. **自然さ**: 友達に「この記事読んで」と紹介するときに恥ずかしくないタイトル

# Rules for DESCRIPTION
1. 具体的な悩み（満員電車がうるさい、集中できない）から始める
2. 何を比較したか（10機種、1万円台、ノイキャン性能）を明記
3. **Length**: Max 120 characters

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
- **[Verified] Spec Reality**: ${p.specVerification || "Analyzing..."}
- **[Verified] Best Scenario**: ${p.userScenario || "Analyzing..."}
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
        target_reader_situation: intentData?.user_demographics?.situation || "あなたの日常",
        comparison_axis: intentData?.comparison_axis || defaultContext.comparison_axis,
        sales_hook: intentData?.sales_hook || defaultContext.sales_hook
    };

    const prompt = `
# Role
あなたは、情報過多で「何を買えばいいかわからない」と迷っている読者のために、**膨大な口コミとスペックを分析してくれる「徹底的なリサーチャー（分析官）」**です。
重要な事実: **あなたはこの製品を所有していません。** したがって「実際に使った」という嘘は絶対につかないでください。
代わりに「数百件のレビューを分析した結果」という**客観的なデータアナリストの視点**で、論理的に信頼性を獲得してください。
「専門家」や「プロ」という言葉は絶対に使わず、「調査の結果」「データによると」という言葉で語ってください。

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
5. **鍵かっこ「」の使用制限**: 記事全体で「〜」は**最大3回まで**。それ以上使うとAI感が出る。直接的な表現に言い換える。
   - ❌ 「失敗したくない」という方にも → 失敗を避けたい方にも
   - ❌ 「コスパ最強」と言われる → コスパ最強と評価される
6. **マーカー強調のルール**:
   - **読者に伝えたい重要な「文章・フレーズ」** に <mark>...</mark> タグを使用してください。
   - **1段落に1〜2箇所程度**（重要なメリットや注意点は積極的にマーカーを引く）
   - ❌ 悪い例：<mark>ノイズキャンセリング</mark>が優秀です → 単語だけで意味が薄い
   - ⭕️ 良い例：口コミでも<mark>電車の走行音がほぼ聞こえなくなる</mark>と評判 → 読者に刺さるフレーズ
   - アスタリスク（**）による太字は禁止。使わないでください。

# 【最重要】Before/After例で覚えろ（これを絶対守れ）

あなたは友達にLINEで製品を勧めている口調で書く。「レビュー記事っぽさ」「AIっぽさ」を消せ。

❌ AIっぽい（絶対書くな）→ ⭕️ 人間っぽい（こう書け）

❌ 「接続の切り替えが魔法のようにスムーズです」
⭕️ 「iPhoneからMacに切り替えるとき一瞬。地味に助かる」

❌ 「ノイズキャンセリングが極めて自然で、快適な静寂空間を提供します」
⭕️ 「口コミでも『電車の走行音が消える』という声が圧倒的多数。静寂性は本物」

❌ 「毎日の通勤や通学、あるいはカフェでの勉強中、周囲の騒音を消して自分だけの世界に没頭したい」
⭕️ 「電車で音楽に集中したい。それだけ」

❌ 「人によっては長時間の使用で〜と感じる場合があるかもしれません」
⭕️ 「2時間超えると耳痛い人もいる」

❌ 「〜のため注意が必要です」「〜は要検討です」
⭕️ 「〜なのは正直マイナス」「〜は好み分かれる」

❌ 「こんな経験はありませんか？」「〜ではないでしょうか？」
⭕️ 断定的に書け。問いかけは全記事で1回まで

❌ 「さらに〜。また〜。加えて〜。」（接続詞連打）
⭕️ 同じ接続詞は記事で2回まで。文の構造で工夫しろ

# 追加ルール
- 1文は30文字以内。長くなったら切れ
- 体言止め「〜だ」OK。全部「〜です」で終わらせるな
- 専門用語は初出時にカッコで解説（例：「LDAC（ソニーの高音質規格）」）


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
1. **読者の悩みへの共感（戦略的ターゲットへの直球）**（2-3段落）
   - 冒頭の1文目で、**${ctx.target_reader}** が抱える「共通の悩み（ペイン）」を言い当てる。
   - ❌ 禁止: 「最近人気ですね」のような一般論。
   - ❌ 禁止: 「英会話教材が聞こえない」のような**過度な限定**（ブループリントで指定がない限り）。
   - ⭕️ 推奨: 「毎朝の地下鉄の轟音。せっかくの自分の時間が台無しになっていませんか？」（多くの人に刺さる表現）
   - その状況でなぜ従来の製品では満足できないのかを指摘する。

2. **この記事の価値**（1-2段落）
   - 「${ctx.sales_hook}」を読者への約束として提示
   - どんな基準で商品を評価したか

---

## セクション2: 検証ポイント（E-E-A-T強化セクション）
**見出し**: 「## 今回の比較ポイント」

### 【重要】E-E-A-T対策（正直な分析者としてのスタンス）:

**Experience（経験）**: 
- ❌ 「実際に使ってみた」「プロの私から見て」という嘘は禁止。
- ⭕️ **「[Verified] Spec Reality」**や**「[Verified] Best Scenario」**の情報を引用し、「データ上はこうだが、実際はこう」という**「分析結果」**を提示する。
- 「膨大な口コミを分析してわかったこと」という**「データに基づいた知見」**を書く。
- 「多くのユーザーが〜と言っている」「特に〜という意見が目立つ」という形式で書く。

**Expertise（専門性）**:
- 肩書きで語らず、**知識の深さ**で語る。
- 専門用語を使う場合は必ずカッコ内で初心者向けに解説。
- 「なぜこの数値が重要なのか」の理由を説明することで信頼を得る。

**Authoritativeness（権威性）**:
- 「専門家のおすすめ」ではなく「徹底的な比較の結果」として権威性を出す。
- 「AとBを比較すると、Aの方が〜に向いている」という論理的な比較を行う。

### 書くべき内容:
「${ctx.comparison_axis}」を基に、3-5個の検証ポイントを**各ポイント5-8段落**で詳しく解説。

各ポイントについて:
1. **このポイントが重要な理由**（なぜチェックすべきか）
2. **専門用語の解説**（初心者でもわかるように）
3. **口コミ分析でわかったこと**（分析結果として）
4. **合格ラインの目安**（具体的な数値や基準）
5. **よくある勘違い・落とし穴**

例:
### ポイント①: 〇〇
[5-8段落で詳細に解説]

### ポイント②: △△
[5-8段落で詳細に解説]

---

## セクション3: 失敗しない選び方（E-E-A-T強化セクション）
**見出し**: 「## ${keyword}の選び方」

### 書くべき内容（各項目3-5段落で詳しく）:

1. **価格帯別の傾向と「壁」の存在**（3-5段落）
   - 「〇万円以下」「〇万円〜〇万円」「〇万円以上」の3区分
   - 各価格帯で「できること」「できないこと」を明確に
   - **重要**: 「この価格を超えると急に性能が上がる」という「壁」があるなら具体的に言及

2. **よくある失敗パターンと回避法**（4-6段落）
   - 実際にあった失敗例を3つ以上挙げる
   - 「〇〇だと思って買ったら△△だった」形式で具体的に
   - それぞれの回避法を明記

3. **選び方のワンポイント**（2-3段落）
   - 「迷ったらこう選べ」という明確な指針
   - スペック比較だけでは見えない選び方のコツ

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

### 【重要】ランキング直後の「360°徹底分析パート」
**RankingCardの直後に、以下の3つの視点から詳細な分析を必ず書いてください。**
ここでは「単なるスペック紹介」ではなく、「ターゲットにとってどう役立つか」と「膨大なデータのメタ分析」を提供します。

**視点1: 🌅 生活変革アングル (Situation Fit)**
- **見出し**: \`#### 🌅 【生活が変わる】${ctx.target_reader_situation}での使い心地\`
- **内容**: ターゲット読者の具体的なシチュエーション（例：満員電車、カフェ作業）において、この製品がどう役立つかを具体的に描写する。
- **書き方**: 「物理ボタンだから手袋をしたまま操作できる」など、スペックが生活に与えるメリットを書く。

**視点2: 🆚 ライバル比較アングル (Competitor Checkmate)**
- **見出し**: \`#### 🆚 【ライバル比較】同価格帯の定番機と比べて\`
- **内容**: なぜ競合製品（同価格帯の有名モデル）ではなく、これを選ぶべきか？
- **書き方**: 「定番のモデルYは低音重視だが、こちらはボーカルがクリア。${ctx.target_reader}の用途（例：語学学習）にはこちらが正解」と断言する。

**視点3: 📊 データ分析アングル (Data-Driven Deep Knowledge)**
- **見出し**: \`#### 📊 【データ分析】1,000件のレビューから判明した事実\`
- **内容**: 「一人の感想」ではなく、「AIによる網羅的なデータ分析結果」を提示する。
- **書き方（厳守）**:
    - ❌ 「私が使ってみたら〜」（個人の体験談を捏造しない）
    - ⭕️ 「専門家は音質を絶賛しているが、**長期使用者のレビューの約3割**が『ヒンジの緩み』を指摘している。耐久性重視なら注意が必要」
    - ⭕️ 「この価格帯でこのドライバー素材を採用しているのは、過去5年の市場データを見ても異例」
    - ※スペックや価格から論理的に導き出せる事実、または一般的なレビュー傾向の分析のみを書く。嘘は書かない。

**視点4: 🗣️ ユーザーの本音 (Review Synthesis)**
- **見出し**: \`#### 🗣️ ユーザーの「本音」を分析\`
- **内容**: データ分析アングルで触れた以外の、具体的な口コミパターンを紹介。

**視点5: ⚠️ 致命的な欠点 (Deal Breaker)**
- **見出し**: \`⚠️ ここは注意が必要\`
- **書き出し**: 必ず「以下の条件に当てはまる人は注意が必要です。」から始めてください。
- **内容**: **この記事のテーマ（${ctx.sales_hook}）や比較軸（${ctx.comparison_axis}）と照らし合わせて**、「こういう人は注意が必要」という条件を明確にする。
- **書き方（厳守）**: 
    - 編集部としての「良心」を示す最重要パート。メーカーへの忖度は禁止。
    - 編集部としての「良心」を示す最重要パート。メーカーへの忖度は禁止。
    - ❌ 「少し高いかも」
    - ⭕️ 「『最強ノイキャン』を探しているなら、この機種の強度は中程度なので**満足できない**可能性が高い」
    - ⭕️ 「耳の穴が小さい人には**物理的に入らない**可能性がある」「遅延が0.2秒あるため、**FPSゲーマーは絶対に勝てない**」
    - ⭕️ 「iPhoneユーザーは機能の半分が使えない。AirPodsを買うべき」

(2位〜5位も同様に、この詳細な分析ブロックを作成してください)

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

   **【マーカー強調のルール（絶対厳守）】**:
   - **読者に伝えたい「文章・フレーズ」** 全体を <mark>...</mark> タグで囲ってください。
   - ❌ 悪い例：<mark>ノイズキャンセリング</mark>が優秀です
   - ⭕️ 良い例：<mark>電車の走行音がほぼ聞こえなくなる</mark>ほど強力、<mark>iPhoneとの連携を最重視するなら</mark>これがベスト

   **重要**: 各カテゴリのh3見出しには、ターゲット層を表す部分に必ず <mark>...</mark> タグを使って強調してください。

**重要**: 各タイプでおすすめする商品は、**リストの最初の5商品（上位5位）から選ぶこと**。
下位の商品（6位以降）は「代替案」としてのみ言及可。

形式例（この形式を必ず守るが、カテゴリはキーワード「${keyword}」に合わせて適切に変更すること）:

### **🏆 <mark>${ctx.comparison_axis}を重視するなら</mark>**
▶ **[商品名](Amazonリンク)** がベスト！ ※リストの1-3位から選ぶこと
\> [なぜこの商品がベストなのか1-2文で解説]

### **💰 <mark>コスパを重視するなら</mark>**
▶ **[商品名](Amazonリンク)** が最強！ ※リストの1-5位から選ぶこと
\> [なぜこの商品がベストなのか1-2文で解説]

### **🎯 <mark>[キーワードに合わせた別の切り口]</mark>**
▶ **[商品名](Amazonリンク)** 一択！ ※リストの1-3位から選ぶこと
\> [なぜこの商品がベストなのか1-2文で解説]

※ポイント:
- 各カテゴリのh3見出しに絵文字を付ける
- 商品名は太字+リンク形式 **[商品名](URL)** ※「クリックして詳細を見る」等の余計な文は入れない
- 「▶」で視線を誘導（👉より自然）
- 引用ブロック「\>」で理由を強調
- **ランキング上位の商品を必ずおすすめとして使う（論理的整合性）**
- **カテゴリは「${keyword}」の製品タイプに合わせて適宜変更**（例：冷蔵庫なら省エネ重視/大容量重視、カメラなら画質重視/携帯性重視）
- **まとめセクションでも誇張表現・マーケティング調の表現は禁止**（上記「AIっぽい文章を避けるための絶対ルール」を厳守）

2. **最終メッセージ**（1段落）
   - 読者の行動を後押しする一言

---

# SEOのコツ（記事内で自然に実践）
- 見出しにキーワード「${keyword}」を自然に含める
- 各セクションの冒頭で要点を述べ、その後詳しく説明（PREP法）
- 「おすすめ」「比較」「選び方」などのSEOワードを自然に使う
- 箇条書きと文章を適度に混ぜる

# トーン
- **権威性**: 「専門家」としてではなく、「徹底的に調べたオタク/リサーチャー」として語る
- **正直さ**: 持っていないものは持っていない前提で、スペックと口コミから推測する
- **共感**: 読者の悩みを否定せず受け止める
- **具体性**: 数字や具体例を多用する

# E-E-A-T強化ルール（重要）

## スペック評価には「比較の文脈」を添える
単なる数値の羅列ではなく、その数値が意味することを説明する。

❌ NG例: 「バッテリー30時間」
⭕️ OK例: 「バッテリー30時間は、今回比較した10製品の中で最長。1週間の通勤でも充電不要で使える」

❌ NG例: 「ノイキャン: S評価」
⭕️ OK例: 「ノイキャン性能はS評価。電車の走行音がほぼ聞こえなくなるレベルで、今回テストした中ではトップクラス」

## 購入者の声を自然に引用する
レビューデータがある場合は、「Amazon購入者の声」として自然に本文に組み込む。

引用ブロック形式（以下のHTMLで）:
\`\`\`html
<blockquote className="review-quote">
  <p>「実際の購入者のコメントをここに」</p>
</blockquote>
\`\`\`

使い方のコツ:
- 1記事に2-3箇所程度、適切な場所で引用する
- 良いレビューだけでなく、正直な指摘も含める（信頼性UP）
- 引用の前後に編集部のコメントを添える

例:
「特にノイキャン性能への評価が高く、実際に購入した方からはこんな声が寄せられています。」

<blockquote className="review-quote">
  <p>「電車内でも周りの音がほとんど気にならない。音楽に集中できる」</p>
</blockquote>

「一方で、装着感については人によって評価が分かれています。」

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
        // Remove any stray asterisks from AI output (we use <mark> tags instead)
        text = text.replace(/\*\*/g, '');

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
**徹底的な製品リサーチャー・分析官**
この製品を「${reviewContext}」という観点で、**膨大なユーザー口コミとスペックに基づき**分析・評価してください。
重要な事実: **あなたは製品を所有していません。** 「実際に使った」「手触りは〜だった」という嘘は絶対につかないでください。
「口コミでは〜という声が多い」「スペック上は〜」という客観的な事実に基づき、論理的に解説してください。
「プロも認める」「専門家推奨」といった権威付けの嘘も禁止です。読者の利益（失敗したくない）を最優先してください。

# Product Information
- Name: ${product.name}
- Amazon Link: ${amazonLink} (本記事の収益化用リンク)
- Official Specs: ${specsText}
- [Verified] Spec Analysis (Reality Check): ${product.specVerification || "Analyzing..."}
- [Verified] Best User Scenarios: ${product.userScenario || "Analyzing..."}
- Real Scraped Features(Amazon):
${realFeaturesText}
- Scraped Technical Specs:
${realSpecsText}
- External Market Opinions:
${product.externalContext || "No external context available. Rely on specs and general knowledge."}
- Comparison Target: ${competitorName} (主な比較ベンチマークとして使用。ただし、同価格帯の他の競合製品との比較も歓迎します)
${reviewsContext}
- AI Evaluated Grades (CONSISTENCY REQUIRED):
${product.specs && product.specs.length > 0 ? product.specs.map(s => `  - ${s.label}: ${s.value}`).join('\n') : "  - (No pre-evaluations available)"}

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
    - ⭕️ 推奨: 「${reviewContext}の観点でスペックとユーザー評価を徹底分析しました。」「結論から言うと、○○が優秀です。」
- **文体の指定**:
    - 「です・ます」調で、淡々と事実を述べる「調査レポート」のようなトーン。
    - 小粋なジョークや詩的な表現は**一切禁止**です。
    - 「専門家の私が保証します」のような表現は禁止。「データが示しています」としてください。
    - 「〜の方が幸せになれます」といった表現は避け、「〜の方が満足度が高いでしょう」「〜のニーズに適しています」のように客観的に記述してください。
- **鍵かっこ「」の多用禁止**: 
    - 「〜」形式の引用を多用しない。AIっぽくなるため最小限に。
    - 代わりに、ストレートに述べる。
- **正直なデメリット**: 「すべてが最高」とは言わず、正直に伝えてください。
- **評価との整合性（最重要）**:
    - 上記「AI Evaluated Grades」と矛盾する記述は禁止です。
    - Grade Sなら「最高クラス」「文句なし」と絶賛してください。
    - Grade B/Cなら「価格相応」「ここが惜しい」と正直に指摘してください。
    - 「評価はSだが、実際は微妙」といった記述は論理破綻するため禁止です。
- **多角的な視点で分析（重要）**:
    - この記事は「筆者の意見だけ」ではなく、**実際の購入者の声も交えた多角的な分析**であることを示してください。
    - 具体的には、自分の評価を述べた後に「実際に使用しているユーザーからも同様の声が多い」「一方でこんな意見もある」という形で引用を挿入します。
    - 以下のHTML形式で引用ブロックを作成（記事全体で2〜3回）：
    \`\`\`html
    <blockquote className="review-quote">
      <p>「実際のレビュー内容を短く」</p>
    </blockquote>
    \`\`\`
    - **使い方の例**:
      - メリットの裏付け: 「ノイキャン性能は非常に高く、実際の購入者からも〜」→ 引用
      - デメリットの補足: 「一方で、装着感については人によって評価が分かれています」→ 引用
      - 意外な発見: 「予想外だったのは通話品質への高評価です」→ 引用
- **デメリット表現のバリエーション**:
    - 「〜は要検討です」という定型句は禁止。
    - 代わりにターゲットを絞った具体的なアドバイス：
      - 「重低音重視の人は物足りなさを感じるかもしれません」
      - 「手が小さい人は、ケースが大きく感じる可能性があります」
      - 「完全な静寂を求める人は上位モデルを検討したほうがよいでしょう」
- **柔軟な比較**: 主な比較対象は **${competitorName}** ですが、市場の他の競合製品（同価格帯）とも自由に比較してください。「${competitorName}以外とは比較してはいけない」という制限はありません。

# 【最重要】Before/After例で覚えろ（これを絶対守れ）

あなたは友達にLINEで製品を勧めている口調で書く。「レビュー記事っぽさ」「AIっぽさ」を消せ。

❌ AIっぽい（絶対書くな）→ ⭕️ 人間っぽい（こう書け）

❌ 「接続の切り替えが魔法のようにスムーズです」
⭕️ 「iPhoneからMacに切り替えるとき一瞬。地味に助かる」

❌ 「ノイズキャンセリングが極めて自然で、快適な静寂空間を提供します」
⭕️ 「電車のガタンゴトンがスッと消える。これだけで買う価値ある（Audio）」
⭕️ 「3時間座ってても腰が痛くならない。在宅ワークの救世主（Furniture）」
⭕️ 「猫の毛がカーペットから一発で取れる（Appliance）」

❌ 「人によっては長時間の使用で〜と感じる場合があるかもしれません」
⭕️ 「2時間超えると耳痛い人もいる（Audio）」
⭕️ 「組み立てのネジが硬すぎて電動ドライバー必須（Furniture）」

❌ 「〜のため注意が必要です」「〜は要検討です」
⭕️ 「〜なのは正直マイナス」「〜は好み分かれる」

❌ 「さらに〜。また〜。加えて〜。」（接続詞連打）
⭕️ 同じ接続詞は記事で2回まで。文の構造で工夫しろ

# 追加ルール
- 1文は30文字以内。長くなったら切れ。同じ語尾を3回続けるな
- 体言止め「〜だ」OK。全部「〜です」で終わらせるな
- **マーカー**: 単語ではなくフレーズに<mark>。1段落に1〜2箇所（重要なポイントは逃さず引く）

# Review Structure(Markdown)
（導入文：${reviewContext}の観点でスペックとユーザー評価を徹底分析しました。結論から言うと…で始める）

## 検証：${reviewContext}での実力
   - この製品の強みと弱みを具体的に描写。
   - ${usageScenario}での使用感を具体的に。

## 他の選択肢との違い
   - この製品の立ち位置は？どういうニーズに応えるか？
   - 同価格帯の他製品と比べて何が優れているか/劣っているか？
   - **特定の1製品との比較にこだわらず**、読者のニーズ別に柔軟に言及。

## ⚠️ 致命的な欠点 (Deal Breaker)
   - **見出し**: \`### ⚠️ ここは注意が必要\`
   - **書き出し**: 必ず「以下の条件に当てはまる人は注意が必要です。」から始めてください。
   - **内容**: **この記事のテーマ（${reviewContext}）やターゲット（${targetReader}）と照らし合わせて**、「こういう人は注意が必要」という条件を明確にする。
   - **書き方（厳守）**: 
     - 編集部としての「良心」を示す最重要パート。メーカーへの忖度は禁止。
     - ❌ 「少し高いかも」
     - ⭕️ 「『最強ノイキャン』を探しているなら、この機種の強度は中程度なので**満足できない**可能性が高い」
     - ⭕️ 「耳の穴が小さい人には**物理的に入らない**可能性がある」「遅延が0.2秒あるため、**FPSゲーマーは絶対に勝てない**」
     - ⭕️ 「iPhoneユーザーは機能の半分が使えない。AirPodsを買うべき」

## まとめ
   読者のタイプ別におすすめを提案してください。
   **【マーカー必須】** 各おすすめ文の冒頭フレーズ（例：「圧倒的な静寂とiPhoneとの連携を最重視するなら」）には必ず <mark>...</mark> を使用してください。

   "### この製品がおすすめな人"
   - 具体的なライフスタイルや価値観を3パターン程度提示。
   - 例：<mark>通勤電車での静寂を求めるなら</mark>、この製品は最適解です。

   "### 他の選択肢を検討すべき人"
   - こういうニーズがある人は別の製品（具体名を出さなくてもOK）の方が満足度が高い / ニーズに適している、と正直に提案。
   - 例：<mark>重低音を重視する人</mark>は、JBLなどの製品が向いています。
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
        // Remove any stray asterisks from AI output (we use <mark> tags instead)
        text = text.replace(/\*\*/g, '');

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
 * @param {string} asin - Optional Amazon ASIN for direct spec lookup
 * @param {string} externalSpecContext - Optional fallback specs from web search
 * @param {Array} targetLabels - Labels for spec comparison
 * @param {Object} rawReviews - Real scraped reviews (Amazon/Kakaku)
 */
async function generateProductSpecsAndProsCons(productInput, contextData, asin = null, externalSpecContext = null, targetLabels = null, rawReviews = null) {
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

    // --- REAL REVIEW INTEGRATION ---
    let reviewContext = "";
    if (rawReviews) {
        const azPos = rawReviews.positive?.slice(0, 4).map(r => `[Amazon Good] ${r.text.slice(0, 100)}`).join('\n') || "";
        const azNeg = rawReviews.negative?.slice(0, 3).map(r => `[Amazon Bad] ${r.text.slice(0, 100)}`).join('\n') || "";

        let kkPos = "", kkNeg = "";
        if (rawReviews.kakaku) {
            kkPos = rawReviews.kakaku.positive?.slice(0, 4).map(r => `[Kakaku Good] ${r.text.slice(0, 100)}`).join('\n') || "";
            kkNeg = rawReviews.kakaku.negative?.slice(0, 3).map(r => `[Kakaku Bad] ${r.text.slice(0, 100)}`).join('\n') || "";
        }

        if (azPos || azNeg || kkPos || kkNeg) {
            reviewContext = `
# Real Scraped Reviews (CRITICAL SOURCE FOR PROS/CONS)
The following are ACTUAL USER REVIEWS. Use these specific phrases and pain points for your "Pros" and "Cons".
DO NOT HALLUCINATE. If a specific complaint exists here (e.g. "slippery case"), YOU MUST USE IT.

${azPos}
${kkPos}
${azNeg}
${kkNeg}
`;
        }
    }

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
${reviewContext}

追加コンテキスト: ${contextData}

# Task
Generate a JSON object containing:

## 1. Pros (メリット3つ)
**SOURCE RULE**: You MUST generate these based on the "# Real Scraped Reviews" provided above. If reviews mention specific benefits, use them.
簡潔かつ具体的なメリットとして書く。友達口調や「〜だよ」は禁止。「〜できる」「〜なので快適」など、機能的価値を端的に伝える。レビュー記事っぽさは消すが、馴れ馴れしくはしない。

❌ AIっぽい（書くな）→ ⭕️ 人間っぽい（書け）

❌ 「ノイズキャンセリングが極めて自然で、快適な静寂空間を提供」
⭕️ 「電車の揺れの音が消える（Audio）」

❌ 「人間工学に基づいたデザインで快適な座り心地」
⭕️ 「3時間座ってても腰が痛くならない（Furniture）」

❌ 「強力な吸引力で微細なゴミも逃さない」
⭕️ 「猫の毛がカーペットから一発で取れる（Appliance）」

❌ 「接続がスムーズで快適」
⭕️ 「ケースから出した瞬間につながるので、ストレスフリー」

## 2. Cons (デメリット2つ)
**SOURCE RULE**: You MUST generate these based on the "# Real Scraped Reviews" provided above. If users complain about "heavy case" or "bad fit", USE THAT.
フォロー禁止。「〜だが問題ない」は絶対ダメ。

❌ AIっぽい: 「人によっては長時間の使用で圧迫感を感じる場合があるかもしれません」
⭕️ 人間っぽい: 「2時間超えると耳に痛みを感じる人もいるので注意が必要（Audio）」

❌ AIっぽい: 「組み立てには多少の力が必要な場合があります」
⭕️ 「ネジが硬すぎて電動ドライバー必須（Furniture）」


禁止項目: 初期不良、サポート、保証、配送、価格、リセール

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
            model: 'gemini-3-pro-preview',
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

    // Ensure reviews object has required properties
    const positive = reviews?.positive || [];
    const negative = reviews?.negative || [];

    // Format reviews for prompt (positive/negative only)
    const positiveText = positive.slice(0, 5).map(r => `[${r.rating}星] ${r.text?.slice(0, 200) || ''}`).join('\n');
    const negativeText = negative.slice(0, 3).map(r => `[${r.rating}星] ${r.text?.slice(0, 200) || ''}`).join('\n');

    // DEBUG: Verify data passed to AI
    console.log(`   📊 Review Data for AI: Pos(${positive.length}), Neg(${negative.length})`);
    if (positiveText.length < 10 && negativeText.length < 10) console.log(`   ⚠️ WARNING: Very little review text available for ${productName}`);

    const prompt = `
# Role
あなたは「製品検証のアナリスト」です。ユーザーレビューの生データを分析し、スペック表には載らない「実態」を暴き出してください。
「書いてあることをまとめる」のではなく、「行間を読み解き、真実を判定する」のがあなたの仕事です。

# 商品名
${productName}

# 評価軸（分析の重点）
${comparisonAxis || '基本性能・実際の使い勝手'}

# 高評価レビュー（検証の証拠：Positive）
${positiveText || '(データなし)'}

# 低評価レビュー（検証の証拠：Negative）
${negativeText || '(データなし)'}

# 分析タスク
以下の4つの視点でレビューを徹底的に分析し、JSONで出力してください。

## 1. specVerification（スペックと実態の乖離検証）
メーカー公称値（スペック）とユーザーの実感にズレがないか判定してください。
特に「バッテリー持ち」「静寂性（ノイキャン）」「装着感」について、ユーザーがあえて言及している「本音」を探してください。
例: 「公称8時間だが、ノイキャンONだと実質5時間程度」
例: 「『重低音』とあるが、実際はかなりフラットで聞きやすい」

## 2. userScenario（具体的な利用シーンの発見）
「どんな状況で」「誰が」使った時に真価を発揮しているか、または失敗しているか特定してください。
例: 「満員電車では途切れるが、カフェで作業する分には完璧」
例: 「ランニング用としては、タッチノイズがひどくて不向き」

## 3. editorComment（プロの推奨・結論）
上記分析を踏まえた、あなた自身の「結論」を50文字以内で。
単なる要約ではなく、「買いかどうか」「誰にすすめるか」をズバリ言い切る。
文体: 専門家が友人にアドバイスするような、信頼感がありつつもフランクな口調（〜だ、〜だろう）。

## 4. enhancedPros / enhancedCons（深掘りメリット・デメリット）
- 具体的な「体験」に基づく記述にする（抽象的な形容詞は禁止）。
- メリット: 「〜できる」「〜が変わる」という生活の変化。
- デメリット: 「〜なのは痛い」「〜には向かない」という具体的な制約。

# 出力JSON形式
{
  "specVerification": "...",
  "userScenario": "...",
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
            model: 'gemini-3-pro-preview',
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
