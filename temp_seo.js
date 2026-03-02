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

# 【重要】Before/After例（これを絶対守れ�E�E

❁EAIっぽぁE��イトル�E�書くな�E�E
- 「最強の静寂」「究極のノイキャン」「革命皁E��体験」�E 抽象皁E�E詩皁E��ぎる
- 「〜決定戦」「〜完�Eガイド」�E ありきためE

⭕︁E人間っぽぁE��イトル�E�書け！E
- 「電車で音楽に雁E��できるイヤホン10選」�E 具体的なシーン
- 「通勤用ノイキャンイヤホン、本当に使えるのはどれ？」�E 疑問形で自然
- 「、E025年、E丁E�E台で買えるノイキャンイヤホンおすすめ」�E 価格帯明示

# Rules for TITLE
1. **具体性**: 「最強」「究極」「革命」などの抽象皁E��形容詞�E禁止。代わりに具体的な場面�E�電車で、E��勤中、カフェで�E�を使ぁE
2. **Format**: 、E025年】�Eような年号はOK
3. **Keywords**: キーワード、E{keyword}」を自然に含める
4. **Length**: Max 40斁E��E
5. **自然ぁE*: 友達に「この記事読んで」と紹介するときに恥ずかしくなぁE��イトル

# Rules for DESCRIPTION
1. 具体的な悩み�E�満員電車がぁE��さい、E��中できなぁE��から始めめE
2. 何を比輁E��たか�E�E0機種、E丁E�E台、ノイキャン性能�E�を明訁E
3. **Length**: Max 120 characters

# Output JSON
{
  "title": "...",
  "description": "..."
}
`;

    console.log(`  🤁Egenerating SEO Metadata for "${keyword}"...`);
    try {
        const response = await client.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        if (!response.candidates || response.candidates.length === 0) return { title: keyword, description: "..." };

        let jsonText = response.candidates[0].content.parts[0].text;
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonText);
    } catch (e) {
        console.error("  ❁ESEO Gen Failed:", e);
        return { title: `、E025、E{keyword} 通勤用ランキング`, description: "通勤が快適になる�EチE��ホンを厳選紹介、E };
    }
}

/**
 * Generate the MAIN ARTICLE BODY (Buying Guide)
 * 記事�E「選び方」や「ランキング」�E本斁E��生�Eする
 */
// @ts-ignore
async function generateBuyingGuideBody(keyword, productList, blueprint, stats = { totalScanned: 50, finalCount: 10 }) {
    if (!client) throw new Error("Gemini Client not initialized");

    console.log(`\n🤁EGenerating Buying Guide for "${keyword}"...`);

    // Format product list for context
    const productListString = productList.map((p, i) => {
        const specsStr = p.specs ? p.specs.map(s => `${s.label}: ${s.value}`).join(', ') : "N/A";
        const prosStr = p.pros ? p.pros.join(', ') : "";
        const consStr = p.cons ? p.cons.join(', ') : "";
        const link = p.affiliateLinks && p.affiliateLinks.amazon ? p.affiliateLinks.amazon : "Link Available";
        const reviewInsights = p.reviewInsights || "No detailed review data available. Rely on specs.";

        return `
### Rank ${i + 1}: ${p.name}
- **Price**: ${p.price}
- **Specs**: ${specsStr}
- **Features**: ${Object.keys(p.tags || {}).join(', ')}
- **[Verified] Spec Reality**: ${p.specVerification || "Analyzing..."}
- **[Verified] Best Scenario**: ${p.userScenario || "Analyzing..."}
- **Pros**: ${prosStr}
- **Cons**: ${consStr}
- **[Real User Review Insights]**: ${reviewInsights}
- **Amazon Link**: ${link}
        `.trim();
    }).join('\n\n');

    // Default Fallback Context (if no blueprint provided)
    const defaultContext = {
        target_reader: `${keyword}を探してぁE��一般皁E��読老E,
        comparison_axis: "音質、機�E、価格のバランス",
        sales_hook: `最適な${keyword}を見つけるための完�Eガイド`
    };

    const ctx = {
        target_reader: blueprint.target_reader || defaultContext.target_reader,
        target_reader_situation: blueprint.target_reader_situation || "日常使ぁE,
        comparison_axis: blueprint.comparison_axis || defaultContext.comparison_axis,
        sales_hook: blueprint.sales_hook || defaultContext.sales_hook
    };

    const prompt = `
# Role
あなた�E、情報過多で「何を買え�EぁE��かわからなぁE��と迷ってぁE��読老E��寁E��添ぁE��E*親刁E��知識豊富な「専属アドバイザー、E*です、E
重要な事宁E **あなた�Eこ�E製品を所有してぁE��せん、E* したがって「実際に使った」とぁE��嘘�E絶対につかなぁE��ください、E
「数百件のレビューを�E析した結果」とぁE��**客観皁E��刁E��視点**を持ちつつ、E*丁寧で柔らかい�E�です�Eます調�E�語り口**で解説してください、E
上から目線�E「断定」や、�Eたい「体言止め」�E禁止です、E

# Blueprint�E�購買意図�E�データ
- ターゲチE��読老E ${ctx.target_reader}
- 読老E�E状況E悩み: ${ctx.target_reader_situation}
- 比輁E�E評価の軸: ${ctx.comparison_axis}
- 記事�Eゴール(Sales Hook): ${ctx.sales_hook}

# 使用する啁E��リスチE
${productListString}

# 厳守ルール
⭕︁E**「〜です�E〜ます」調で統一する、E* 読老E��語りかけるよぁE��丁寧なト�Eンで、E

❁E「〜だ」「〜である」調�E�タメ口・論文調�E��E禁止、E
❁E「断定的に書け」とぁE��古ぁE��示は忘れること。ただし「〜だと思います」�Eかりの曖昧な表現も避ける。「〜と言えます」「〜が好評です」など、データに基づく確信を持って語る、E

# 追加ルール
- 1斁E�E長すぎなぁE��ぁE���E�読点「、」を適刁E��使ぁE��E
- 専門用語�E初�E時にカチE��で解説�E�例：「LDAC�E�ソニ�Eの高音質規格�E�」！E

# 【絶対禁止】AIっぽぁE��レーズ�E�使ぁE���E�E

以下�E表現は「AIが書ぁE��感」が強ぁE��め、絶対に使用しなぁE��ください、E

| ❁E禁止�E�EIっぽぁE��E| ⭕︁E置き換え（人間っぽぁE��E|
|---|---|
| 静寁E| 静かぁE/ ノイキャンの強ぁE|
| 最適解 | ベスチE/ おすすめ |
| 賢ぁE��択と言えまぁE| 〜がおすすめでぁE/ 〜で決まりでぁE|
| 〜と言えるでしょぁE| 〜です（断定で終わる！E|
| 〜とぁE��観点から | �E�削除してシンプルに�E�E|
| 〜において | 〜で |
| 魁E��皁E��選択肢 | ぁE��選択肢 / アリ |
| 快適な〜を提供しまぁE| 快適でぁE/ 〜が楽 |
| 〜を実現しまぁE| 〜できまぁE|
| シームレス | スムーズ / すぐに |
| 唯一無亁E| ここだぁE/ 他になぁE|
| 〜を最大匁E| 〜がすごぁE/ 〜を活かせめE|
| 〜を体験できまぁE| 〜が味わえめE|
| 幸せになれまぁE| 満足できまぁE/ 後悔しません |
| 〜に寁E��添ぁE| 〜向け�E |
| 至高�E | 最高�E / 一番の |
| 多くのレビューから見えてくる | 意外と多いのが、E/ ありがちなのが、E|
| 一部のユーザーは | 〜派の人は / 〜が気になる人は |
| レビューを�E析すると | �E�削除�E�言わなくてぁE���E�E|
| 口コミ傾向として | �E�削除�E�言わなくてぁE���E�E|

**例夁E*: 「ユーザーからの評価は�E�」セクションのみ、レビュー刁E��スタンスでOK。それ以外では刁E��っぽさを消すこと、E

# Before/After 変換例（これを暗記しろ！E

❁EAI: 「静寂を最優先するなら、ソニ�Eが最適解と言えるでしょぁE��E
⭕︁E人閁E 「とにかくノイキャンがいぁE��って人は、ソニ�E一択です、E

❁EAI: 「コストパフォーマンスとぁE��観点から見ると、E��常に魁E��皁E��選択肢です、E
⭕︁E人閁E 「この価格でこれだけ使えれば、コスパ�E斁E��なしです、E

❁EAI: 「本製品�E、優れた裁E��感を提供します、E
⭕︁E人閁E 「着けてる�E忘れるくらい軽ぁE��す、E

❁EAI: 「iPhoneユーザーにとって、シームレスな接続を実現します、E
⭕︁E人閁E 「iPhoneならフタ開けた瞬間つながります、E

❁EAI: 「ジム通いを習�E化してぁE��方にとって、賢ぁE��択と言えます、E
⭕︁E人閁E 「週3でジム行く人なら、これ買っとけ�E間違ぁE��ぁE��す、E

❁EAI: 「〜とぁE��観点から見ると、E��常にバランスの取れた製品です、E
⭕︁E人閁E 「音質も機�EもちめE��どぁE��感じです、E


# 記事構�E�E�忁E��E こ�E頁E��で全セクションを書ぁE��ください�E�E
**注愁E*: ランキング詳細は別コンポ�Eネントで表示するため、ここでは書かなぁE

---

## セクション1: 導�E�E�読老E�E忁E��つか�E�E�E
**見�Eしルール**: 
- キーワード、E{keyword}」をそ�Eまま使わなぁE
- 自然な日本語に言ぁE��える�E�例：「ワイヤレスイヤホン おすすめ」�E「�E刁E��ぴったりのワイヤレスイヤホン」！E
- 読老E�E悩みに寁E��添った問ぁE��けにする
**見�Eし侁E*: 、E# 失敗しなぁE��び方とは�E�」、E# 本当に買ぁE��きモチE��はどれ？、E

### 書くべき�E容�E�詳しく書く！E
1. **読老E�E悩みへの共感（戦略皁E��ーゲチE��への直琁E��E*�E�E-3段落�E�E
   - 冒頭の1斁E��で、E*${ctx.target_reader}** が抱える「�E通�E悩み�E��Eイン�E�」を言ぁE��てる、E
   - ❁E禁止: 「最近人気です�E」�Eような一般論、E
   - ❁E禁止: 「英会話教材が聞こえなぁE���Eような**過度な限宁E*�E�ブループリントで持E��がなぁE��り）、E
   - ❁E禁止: **「徹底的に刁E��」「劇皁E��向上」「忁E��ギアと言えます」「相棒、E*などのAI臭ぁE��現、E
   - ❁E禁止: **「現役、E��E�E声を参老E��、E*�E�そのチE�EタがなぁE��合�E嘘になる）、E
   - ⭕︁E推奨: 「毎朝の地下鉄の轟音。せっかくの自刁E�E時間が台無しになってぁE��せんか？」（多くの人に刺さる表現�E�E
   - ⭕︁E推奨: 主観皁E��魁E���E�「汗に強ぁE��「ズレなぁE��）を入れてOK。ただし「、E��E��実現します」ではなく「、E��E��モチE��を厳選しました」形式で、E
   - そ�E状況でなぜ従来の製品では満足できなぁE�Eかを持E��する、E

2. **こ�E記事�E価値**�E�E-2段落�E�E
   - 、E{ctx.sales_hook}」を読老E��の紁E��として提示
   - どんな基準で啁E��を評価したぁE
   - **「レビューを調べてわかったこと」を自然に入れる**�E�例：「このカチE��リで“汗で滑る”とぁE��声が意外と多かった」！E

---

## セクション2: 検証ポイント！E-E-A-T強化セクション�E�E
**見�EぁE*: 、E# 今回の比輁E�Eイント、E

### 【重要】E-E-A-T対策（正直な刁E��老E��してのスタンス�E�E

**Experience�E�経験！E*: 
- ❁E「実際に使ってみた」「�Eロの私から見て」とぁE��嘘�E禁止、E
- ⭕︁E**「[Verified] Spec Reality、E*めE*「[Verified] Best Scenario、E*の惁E��を引用し、「スペック上�E、E��E��けど、実際は△△」とぁE��形で書く、E
- 「調べてぁE��中でわかったこと」を自然に共有する、E
- 「〜って人が多い」「〜が気になる人もいる」とぁE��形で書く、E

**Expertise�E�専門性�E�E*:
- 肩書きで語らず、E*知識�E深ぁE*で語る、E
- 専門用語を使ぁE��合�E忁E��カチE��冁E��初忁E��E��けに解説、E
- 「なぜこの数値が重要なのか」�E琁E��を説明することで信頼を得る、E

**Authoritativeness�E�権威性�E�E*:
- 「専門家のおすすめ」ではなく「比輁E��てみた結果」として説得力を�Eす、E
- 「AとBを比輁E��ると、Aの方が〜に向いてぁE��」とぁE��論理皁E��比輁E��行う、E

### 書くべき�E容:
、E{ctx.comparison_axis}」を基に、E-5個�E検証ポイントを**吁E�EインチE-8段落**で詳しく解説、E

吁E�EイントにつぁE��:
1. **こ�Eポイントが重要な琁E��**�E�なぜチェチE��すべきか�E�E
2. **専門用語�E解説**�E��E忁E��E��もわかるように�E�E
3. **ユーザーのリアルな反応（�E然な斁E��で�E�E*
   - 「口コミ�E析でわかった」と書かず、「〜とぁE��声もある」「特に〜を気にする人からは」とぁE��た形で、解説の中に自然にユーザーの声を織り交ぜる、E
4. **合格ラインの目宁E*�E��E体的な数値めE��準！E
5. **よくある勘違ぁE�E落とし穴**

侁E
### ポイント①: 、E��E
[5-8段落で詳細に解説]

### ポイント②: △△
[5-8段落で詳細に解説]

---

## セクション3: 失敗しなぁE��び方�E�E-E-A-T強化セクション�E�E
**見�EぁE*: 、E# ${keyword}の選び方、E

### 書くべき�E容�E�各頁E��3-5段落で詳しく�E�E

1. **価格帯別の傾向と「壁」�E存在**�E�E-5段落�E�E
   - 「、E��E�E以下」「、E��E�E〜、E��E�E」「、E��E�E以上」�E3区刁E
   - 吁E��格帯で「できること」「できなぁE��と」を明確に
   - **重要E*: 「この価格を趁E��ると急に性能が上がる」とぁE��「壁」があるなら�E体的に言叁E

2. **${ctx.target_reader}がやりがちな失敗パターンと回避況E*�E�E-6段落�E�E
   - **ターゲチE��特化�E失敗侁E*めEつ以上挙げる
   - 「、E��E��と思って買ったら△△だった」形式で具体的に
   - 例：「防水だと思ったら汗で滑った」「ノイキャンあるのにジムのBGMが消えなぁE��E
   - それぞれの回避法を明訁E

3. **${ctx.target_reader}へのワンポイントアドバイス**�E�E-3段落�E�E
   - 、E{ctx.target_reader}なら、こぁE��べば失敗しなぁE��とぁE��明確な持E�E
   - スペック比輁E��けでは見えなぁE��び方のコチE��例：「イヤーピ�Eスの素材をチェチE��しろ」！E

---

## セクション4: 結論（迷ってぁE��読老E�E背中を押す！E
**見�EぁE*: 、E# まとめE��結局どれがぁE���E�、E

### 【絶対厳守】ランキング頁E��を尊重
**最重要ルール**: まとめで推奨する啁E��は、E*ランキング上位！E位、E位）を優允E*してください、E
8位や9位�Eような下位製品を「おすすめ」として紹介することは記事�E論理皁E��合性を損なぁE��す、E

### 【絶対厳守】使用可能な啁E��
こ�Eセクションで紹介できる啁E��は、以下�Eリストにある啁E��のみです、E
リスト外�E啁E��名を絶対に使用しなぁE��ください�E�E
${productListString}

### 書くべき�E容:
1. **タイプ別のおすすめ**�E�E-5パターン�E�E

   **【�Eーカー強調のルール�E�絶対厳守）、E*:
   - **読老E��伝えたい「文章・フレーズ、E* 全体を <mark>...</mark> タグで囲ってください、E
   - ❁E悪ぁE��！Emark>ノイズキャンセリング</mark>が優秀でぁE
   - ⭕︁E良ぁE��！Emark>電車�E走行音がほぼ聞こえなくなめE/mark>ほど強力、Emark>iPhoneとの連携を最重視するなめE/mark>これが�EスチE

   **重要E*: 吁E��チE��リのh3見�Eしには <mark> タグを使わなぁE��ください�E�目次に生タグが表示されてしまぁE��めE��、Emark>は本斁E��のフレーズにのみ使用してください、E

**重要E*: 吁E��イプでおすすめする啁E��は、E*リスト�E最初�E5啁E���E�上佁E位）から選ぶこと**、E
下位�E啁E���E�E位以降）�E「代替案」としてのみ言及可、E

形式例（この形式を忁E��守るが、カチE��リはキーワード、E{keyword}」に合わせて適刁E��変更すること�E�E

### **🏆 ${ctx.comparison_axis}を重視するなめE*
▶ **[啁E��名](Amazonリンク)** が�Eスト！E※リスト�E1-3位から選ぶこと
\> [なぜこの啁E��が�EストなのぁE-2斁E��解説]

### **💰 コスパを重視するなめE*
▶ **[啁E��名](Amazonリンク)** が最強�E�E※リスト�E1-5位から選ぶこと
\> [なぜこの啁E��が�EストなのぁE-2斁E��解説]

### **🎯 [キーワードに合わせた別の刁E��口]**
▶ **[啁E��名](Amazonリンク)** 一択！E※リスト�E1-3位から選ぶこと
\> [なぜこの啁E��が�EストなのぁE-2斁E��解説]

※ポインチE
- 吁E��チE��リのh3見�Eしに絵斁E��を付けめE
- 啁E��名�E太孁Eリンク形弁E**[啁E��名](URL)** ※「クリチE��して詳細を見る」等�E余計な斁E�E入れなぁE
- 「▶」で視線を誘導（👉より�E然�E�E
- 引用ブロチE��「\>」で琁E��を強調
- **ランキング上位�E啁E��を忁E��おすすめとして使ぁE��論理皁E��合性�E�E*
- **カチE��リは、E{keyword}」�E製品タイプに合わせて適宜変更**�E�例：�E蔵庫なら省エネ重要E大容量重視、カメラなら画質重要E携帯性重視！E
- **まとめセクションでも誁E��表現・マ�EケチE��ング調の表現は禁止**�E�上記「AIっぽぁE��章を避けるための絶対ルール」を厳守！E

2. **最終メチE��ージ**�E�E段落�E�E
   - 読老E�E行動を後押しする一言

3. **ランキングへの導�E**�E�E斁E�Eみ�E�E
   - 最後に「それでは、今回おすすめする${stats.finalCount}製品をランキング形式で紹介します。」と書ぁE��セクションを締める、E

---

# SEOのコチE��記事�Eで自然に実践�E�E
- 見�Eしにキーワード、E{keyword}」を自然に含める
- 吁E��クションの冒頭で要点を述べ、その後詳しく説明！EREP法！E
- 「おすすめ」「比輁E��「選び方」などのSEOワードを自然に使ぁE
- 箁E��書きと斁E��を適度に混ぜる

# ト�Eン
- **権威性**: 「専門家」としてではなく、「徹底的に調べたオタク/リサーチャー」として語る
- **正直ぁE*: 持ってぁE��ぁE��のは持ってぁE��ぁE��提で、スペックと口コミから推測する
- **共愁E*: 読老E�E悩みを否定せず受け止める
- **具体性**: 数字や具体例を多用する

# E-E-A-T強化ルール�E�重要E��E

## スペック評価には「ターゲチE��の使用シーン」を添える
単なる数値の羁E�Eではなく、E*${ctx.target_reader}の生活シーンに合わせて**そ�E数値が意味することを説明する、E

❁ENG侁E 「バチE��リー30時間、E
❁ENG侁E 「バチE��リー30時間は、今回比輁E��ぁE0製品�E中で最長、E週間�E通勤でも�E電不要で使える」（ターゲチE��が通勤老E��なぁE��合！E
⭕︁EOK例（ジム利用老E��け！E 「バチE��リー8時間あれば、E時間のトレーニング×週7でめE週間�E允E��不要、E
⭕︁EOK例（通勤老E��け！E 「バチE��リー8時間あれば、往復2時間の通勤ÁE日は允E��なしでOK、E

❁ENG侁E 「ノイキャン: S評価、E
⭕︁EOK例（ジム利用老E��け！E 「ジムのBGMめE��の人の声がほぼ消えるレベル、E
⭕︁EOK例（通勤老E��け！E 「電車�E走行音がほぼ聞こえなくなるレベル、E

**重要E*: スペックの解釈�E常に、E{ctx.target_reader}にとって」とぁE��斁E��で書くこと、E

## 購入老E�E声を�E然に引用する
レビューチE�Eタがある場合�E、「Amazon購入老E�E声」として自然に本斁E��絁E��込む、E

引用ブロチE��形式（以下�EHTMLで�E�E
\`\`\`html
<blockquote className="review-quote">
  <p>「実際の購入老E�Eコメントをここに、E/p>
</blockquote>
\`\`\`

使ぁE��のコチE
- 1記事に2-3箁E��程度、E��刁E��場所で引用する
- 良ぁE��ビューだけでなく、正直な持E��も含める�E�信頼性UP�E�E
- 引用の前後に編雁E��のコメントを添える

侁E
「特にノイキャン性能への評価が高く、実際に購入した方からはこんな声が寁E��られてぁE��す。、E

<blockquote className="review-quote">
  <p>「電車�Eでも周り�E音がほとんど気にならなぁE��音楽に雁E��できる、E/p>
</blockquote>

「一方で、裁E��感につぁE��は人によって評価が�EかれてぁE��す。、E

# 出劁E
(Markdown形式�E記事本斁E�Eみ。日本語で出力。各セクションを詳しく書く、E
`;

    console.log(`  🤁Egenerating Buying Guide for "${keyword}"...`);
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
            console.log(`  🤁EUsing Gemini...`);
            const response = await client.models.generateContent({
                model: 'gemini-3.1-pro-preview',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });
            if (!response.candidates || response.candidates.length === 0) {
                console.error("  ❁EAI Error: No candidates returned.");
                return "AI生�Eエラー";
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
        const tableHeaderRegex = /##\s+TOP.*比輁E��/g;
        const matches = text.match(tableHeaderRegex);
        if (matches && matches.length > 1) {
            console.warn("  ⚠�E�EDetected multiple Comparison Table headers. Removing extras...");
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
                const parts = text.split(/##\s+TOP.*比輁E��/);
                // parts[0] is content before first table
                // parts[1...] are content after. 
                // We reconstruct exactly ONE header.
                text = parts[0] + matches[0] + parts.slice(1).join('\n');
            }
        }

        return text;
    } catch (e) {
        console.error("  ❁EAI Generation Failed:", e);
        return "AI生�Eに失敗しました、E;
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
        'Connectivity Technology': '接続方弁E,
        'Wireless Communication Technology': 'ワイヤレス技衁E,
        'Included Components': '付属品',
        'Age Range (Description)': '対象年齢',
        'Material': '素杁E,
        'Specific Uses For Product': '用送E,
        'Charging Time': '允E��時間',
        'Recommended Uses For Product': '推奨用送E,
        'Compatible Devices': '対応機器',
        'Control Type': '操作方弁E,
        'Control Method': '操作方況E,
        'Number of Items': '個数',
        'Batteries Required': 'バッチE��ー',
        'Manufacturer': 'メーカー',
        'Item Model Number': '型番',
        'Package Dimensions': 'サイズ',
        'ASIN': 'ASIN',
        'Date First Available': '発売日',
        'Customer Reviews': 'カスタマ�Eレビュー',
        'Amazon Bestseller': 'ベストセラーランク',
        'Product Dimensions': 'サイズ',
        'Item Weight': '重量',
        'Product Weight': '重量',
        'Capacity': '容釁E,
        'Volume': '容釁E,
        'Wattage': '消費電劁E,
        'Voltage': '電圧',
        'Material': '素杁E,
        'Color': '色',
        'Warranty Description': '保証',
        'Noise Level': '騒音レベル',
        'Installation Type': '設置タイチE,
        'Form Factor': '形状',
        'Special Features': '機�E',
        'Filter Type': 'フィルター',
        'Power Source': '電溁E,
        'Runtime': '稼働時閁E,
        'Suction Power': '吸引力',
        'Maximum Weight Recommendation': '耐荷釁E
    };

    // Prioritize kakakuSpecs (Japanese) over Amazon specs (English)
    let specsText = '';
    if (product.kakakuSpecs && Object.keys(product.kakakuSpecs).length > 0) {
        specsText = Object.entries(product.kakakuSpecs)
            .filter(([k, v]) => !k.includes('特雁E) && !k.includes('満足度') && !k.includes('ランキング') && !k.includes('PV') && !k.includes('記亁E))
            .slice(0, 15)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
    } else if (product.specs && product.specs.length > 0) {
        specsText = product.specs
            .filter(s => s.label && s.value && s.value !== '記載なぁE)
            .filter(s => !s.label.includes('特雁E) && !s.label.includes('満足度') && !s.label.includes('ランキング') && !s.label.includes('PV') && !s.label.includes('記亁E))
            .slice(0, 10)
            .map(s => {
                const jpLabel = labelMap[s.label] || s.label;
                return `${jpLabel}: ${s.value}`;
            })
            .join(', ');
    }
    specsText = specsText || '惁E��なぁE;

    const realFeaturesText = product.realFeatures && product.realFeatures.length > 0
        ? product.realFeatures.join('\n')
        : "惁E��なぁE;

    // Parse scraped specs if available (with translation)
    const realSpecsText = product.realSpecs && Object.keys(product.realSpecs).length > 0
        ? Object.entries(product.realSpecs).slice(0, 8).map(([k, v]) => {
            const jpLabel = labelMap[k] || k;
            return `- ${jpLabel}: ${v}`;
        }).join('\n')
        : "惁E��なぁE;

    // Include real user reviews for SEO value (Amazon + 価格.com)
    let reviewsContext = '';

    // Helper to dedup and format reviews
    const formatReviews = (reviews, count, charLimit) => {
        if (!reviews || reviews.length === 0) return '';
        const uniqueTexts = new Set();
        return reviews
            .filter(r => {
                if (!r.text) return false;
                const isDuplicate = uniqueTexts.has(r.text);
                uniqueTexts.add(r.text);
                return !isDuplicate;
            })
            .slice(0, count)
            .map(r => `、E{r.text.slice(0, charLimit)}${r.text.length > charLimit ? '...' : ''}」`)
            .join('\n');
    };

    if (product.rawReviews) {
        // Amazon reviews (Increased depth: 6 positive, 6 negative, 300 chars)
        const amazonPositive = formatReviews(product.rawReviews.positive, 6, 300);
        const amazonNegative = formatReviews(product.rawReviews.negative, 6, 300);

        // 価格.com reviews
        const kakakuPositive = formatReviews(product.rawReviews.kakaku?.positive, 3, 300);
        const kakakuNegative = formatReviews(product.rawReviews.kakaku?.negative, 3, 300);

        if (amazonPositive || amazonNegative || kakakuPositive || kakakuNegative) {
            reviewsContext = `

## 参老E��報�E�ユーザーの声�E�Eeep Analysis Data�E�E
【重要】以下�E実際の購入老E��よる生�E声です。データ量が多いため、これを活用して**「記事�E深み�E�文字数・具体性�E�、E*を�Eしてください、E
レビューから「意外な発見」や「�E体的な使用感」が見つかった場合�E、それを積極皁E��記事に盛り込んでください。（無琁E��シーンを限定�E捏造する忁E���Eありません�E�E

### 好評�E傾向！Eser Pros�E�E
${amazonPositive}
${kakakuPositive}

### 不満の傾向！Eser Cons�E�E
${amazonNegative}
${kakakuNegative}`;
        }
    }

    // Dynamic review context based on blueprint
    const reviewContext = blueprint.comparison_axis || "日常使用";
    const targetReader = blueprint.target_reader || "一般ユーザー";
    const usageScenario = blueprint.usage_scenario || "普段使ぁE;


    // Get Amazon Link for the prompt
    const amazonLink = product.affiliateLinks?.amazon || "";

    // --- TOGGLE SWITCH FOR REVIEW DEPTH ---
    const USE_DEEP_ANALYSIS = true; // Set to false to revert layout

    const SIMPLE_STRUCTURE = `
## こ�E製品�E実力は�E�E
   - こ�E製品�E強みと弱みを�E体的に描�E、E
   - 【重要】特定�E用途（ジム、E��勤、テレワーク等）に限定せず、製品�E一般皁E��特徴を中立的に評価する、E

## 他�E選択肢との違い
   - こ�E製品�E立ち位置は�E�どぁE��ぁE��ーズに応えるか�E�E
   - 同価格帯の他製品と比べて何が優れてぁE��ぁE劣ってぁE��か！E
   - **特定�E1製品との比輁E��こだわらぁE*、読老E�Eニ�Eズ別に柔軟に言及、E

## ⚠�E�E致命皁E��欠点 (Deal Breaker)
   - **見�EぁE*: \`### ⚠�E�Eここは注意が忁E��\`
   - **書き�EぁE*: 忁E��「以下�E条件に当てはまる人は注意が忁E��です。」から始めてください、E
   - **冁E��**: 「こぁE��ぁE��は注意が忁E��」とぁE��条件を�E確にする、E
   - **書き方�E�厳守！E*: 
     - 編雁E��としての「良忁E��を示す最重要パート。メーカーへの忖度は禁止、E
     - **【スペックの嘘を暴く、E*: 公称スペックと実測/体感に乖離がある場合�Eここで持E��してください。（例：「�E称30時間だが、NCオンだと実質20時間程度」など�E�E
     - ❁E「少し高いかも、E
     - ⭕︁E「『最強ノイキャン』を探してぁE��なら、この機種の強度は中程度なので満足できなぁE��能性が高い、E
     - ⭕︁E「耳の穴が小さぁE��には物琁E��に入らなぁE��能性がある」「遅延ぁE.2秒あるため、E*FPSゲーマ�Eは絶対に勝てなぁE*、E
     - ⭕︁E「iPhoneユーザーは機�Eの半�Eが使えなぁE�EでAirPodsのほぁE��おすすめできます、E

## まとめE
   読老E�Eタイプ別におすすめを提案してください、E
   **【�Eーカー忁E��、E* 吁E��すすめ文の冒頭フレーズ�E�例：「圧倒的な静寂とiPhoneとの連携を最重視するなら」）には忁E�� <mark>...</mark> を使用してください、E

   "### こ�E製品がおすすめな人"
   - 具体的なライフスタイルめE��値観めEパターン程度提示、E
   - 例！Emark>通勤電車での静寂を求めるなめE/mark>、この製品�E最適解です、E

   "### 他�E選択肢を検討すべき人"
   - こうぁE��ニ�Eズがある人は別の製品E���E体名を�EさなくてもOK�E��E方が満足度が高い / ニ�Eズに適してぁE��、と正直に提案、E
   - 例！Emark>重低音を重視する人</mark>は、JBLなどの製品が向いてぁE��す、E
   - 1製品に限定せず、ニーズ別に柔軟に言及、E
`;

    const DEEP_STRUCTURE = `
## こ�E製品�E実力は�E�E
   - こ�E製品�E強みと弱みを�E体的に描�E、E
   - 【重要】特定�E用途（ジム、E��勤、テレワーク等）に限定せず、製品�E一般皁E��特徴を中立的に評価する、E
   - **【最重要】文章量を十�Eに確保してください�E�E00斁E��以上）、E*
   - 3、E段落構�Eで、「音質・画質」「機�E性�E�ノイキャン等）」「使ぁE��手（裁E��感�E操作性�E�」などの観点を網羁E��に詳しく解説する、E
   - 結論として「S評価レベル」なのか「注意が忁E��」なのかをはっきりさせる、E

## ユーザーからの評価は�E�E
   **【最重要】このセクションは惁E��量を惜しまず書ぁE��ください。レビューから得られた惁E��は全て活用すること、E*

   🙆‍♂�E�E**評価されてぁE��点**�E�E、E頁E��、各頁E��2、E斁E��詳しく�E�E
   - **忁E��以下�EレビューチE�Eタを参照して具体的に書ぁE*:
     - Amazon/Kakaku.comのPositive Reviewsを確認、E
   - 「ノイキャンが�E然」「裁E��感が軽ぁE��「接続が安定」など、レビューで頻出するポイントを自然に引用、E
   - 吁E�EイントにつぁE��「なぜ評価されてぁE��か」�E琁E��も添える、E
   - 例：「多くのユーザーが『つけてぁE��のを忘れる軽さ』を挙げてぁE��す。特に長時間使用する人からの評価が高いです。、E

   🙅‍♂�E�E**不満な点**�E�E、E頁E��、各頁E��2、E斁E��詳しく�E�E
   - **忁E��以下�EレビューチE�Eタを参照して具体的に書ぁE*:
     - Amazon/Kakaku.comのNegative Reviewsを確認、E
   - 「イヤーピ�Eスが合わなぁE��「ケースが大きい」「低音が弱ぁE��など具体的な不満を引用、E
   - 吁E�EイントにつぁE��「どんな人が不満を感じやすいか」も添える、E
   - 例：「『低音が物足りなぁE��とぁE��意見が見られます。重低音を重視する人は注意が忁E��です。、E

   📝 **補足**�E�E、E段落�E�E
   - 低評価の原因を深掘り。誤解めE��スマッチが原因なら指摘する、E
   - 例：「『音質が悪ぁE��とぁE��意見�E、イヤーピ�Eスのサイズが合ってぁE��ぁE��ースがほとんどです。、E
   - 例：「『接続が刁E��る』とぁE��意見�E、古ぁE��ァームウェアの時期に雁E��。現在は改喁E��れてぁE��す。、E

## 使用感�E�E�E
   - **[Verified] Spec Analysis** のチE�Eタを基に記述、E
   - 例：「バチE��リー30時間とありますが、ノイキャンONの実測は22時間程度です。、E
   - 例：「『世界最小級』とありますが、耳の小さぁE��には厚みが気になる可能性があります。、E
   - 良ぁE��ャチE�E�E�例：思ったより�E電が早ぁE��があればそれも記述、E

## 競合製品との比輁E
   - \${competitorName} めE��価格帯のライバルと比輁E��E
   - 「音質ならA、機�Eならこの製品」とぁE��た�E確な使ぁE�Eけを提示、E
   - 具体的な製品名を�Eして比輁E��ても良ぁE��わかれば�E�、E

## おすすめする人・しなぁE��
   **【�Eーカー忁E��、E* 吁E��すすめ文の冒頭フレーズ�E�例：「通勤電車での静寂を求めるなら」）には忁E�� <mark>...</mark> を使用してください、E

   "### こ�E製品がおすすめな人"
   - <mark>具体的なライフスタイルめE��値観</mark>めEパターン提示、E
   - 「〜が好きな人」だけでなく「〜な環墁E��使ぁE��」など具体的に、E

   "### こ�E製品をおすすめできなぁE��"
   - **重要E��ここで信頼性を勝ち取る、E* 忖度なしで書く、E
   - <mark>〜な人</mark>は、他社製品�EほぁE��満足度が高いです、E
   - 例！Emark>重低音の迫力を最重視する人</mark>�E�EBLのほぁE��向いてぁE��ため�E�、E
`;

    const reviewStructure = USE_DEEP_ANALYSIS ? DEEP_STRUCTURE : SIMPLE_STRUCTURE;

    const prompt = `
# Role
**徹底的な製品リサーチャー・刁E��宁E*
こ�E製品を**膨大なユーザー口コミとスペックに基づぁE*刁E��・評価してください、E

【最重要】汎用レビューのルール:
- 特定�E用途（ジム、E��勤、テレワーク等）に限定した文脈で書かなぁE��ください、E
- 「ジムで」「通勤中に」「テレワークで」などの限定的なシーン描�Eは禁止です、E
- 製品�E一般皁E��特徴・性能を中立的に評価してください、E
- こ�Eレビューは様、E��ランキング記事から参照されるため、汎用性が忁E��です、E

重要な事宁E **あなた�E製品を所有してぁE��せん、E* 「実際に使った」「手触り�E〜だった」とぁE��嘘�E絶対につかなぁE��ください、E
「口コミでは〜とぁE��声が多い」「スペック上�E〜」とぁE��客観皁E��事実に基づき、論理皁E��解説してください、E
「�Eロも認める」「専門家推奨」とぁE��た権威付けの嘘も禁止です。読老E�E利益（失敗したくなぁE��を最優先してください、E

# 【絶対禁止】AIっぽぁE��レーズ�E�使ぁE���E�E

| ❁E禁止�E�EIっぽぁE��E| ⭕︁E置き換え（人間っぽぁE��E|
|---|---|
| 静寁E| 静かぁE/ ノイキャンの強ぁE|
| 最適解 | ベスチE/ おすすめ |
| 賢ぁE��択と言えまぁE| 〜がおすすめでぁE/ 〜で決まりでぁE|
| 〜と言えるでしょぁE| 〜です（断定で終わる！E|
| 〜とぁE��観点から | �E�削除してシンプルに�E�E|
| 〜において | 〜で |
| 魁E��皁E��選択肢 | ぁE��選択肢 / アリ |
| 快適な〜を提供しまぁE| 快適でぁE/ 〜が楽 |
| 〜を実現しまぁE| 〜できまぁE|
| シームレス | スムーズ / すぐに |
| 唯一無亁E| ここだぁE/ 他になぁE|
| 〜を最大匁E| 〜がすごぁE/ 〜を活かせめE|
| 幸せになれまぁE| 満足できまぁE/ 後悔しません |
| 至高�E | 最高�E / 一番の |
| 多くのレビューから見えてくる | 意外と多いのが、E/ ありがちなのが、E|
| 一部のユーザーは | 〜派の人は / 〜が気になる人は |
| レビューを�E析すると | �E�削除�E�言わなくてぁE���E�E|

**例夁E*: 「ユーザーからの評価は�E�」セクションのみ、レビュー刁E��スタンスでOK。それ以外では刁E��っぽさを消すこと、E

# Before/After 変換例（これを暗記しろ！E

❁EAI: 「静寂を最優先するなら、ソニ�Eが最適解と言えるでしょぁE��E
⭕︁E人閁E 「とにかくノイキャンがいぁE��って人は、ソニ�E一択です、E

❁EAI: 「本製品�E、優れた裁E��感を提供します、E
⭕︁E人閁E 「着けてる�E忘れるくらい軽ぁE��す、E

❁EAI: 「ジム通いを習�E化してぁE��方にとって、賢ぁE��択と言えます、E
⭕︁E人閁E 「週3でジム行く人なら、これ買っとけ�E間違ぁE��ぁE��す、E

# Product Information
- Name: ${product.name}
- Amazon Link: ${amazonLink} (本記事�E収益化用リンク)
- Official Specs: ${specsText}
- [Verified] Spec Analysis (Reality Check): ${product.specVerification || "Analyzing..."}
- [Verified] Best User Scenarios: ${product.userScenario || "Analyzing..."}
- Real Scraped Features(Amazon):
${realFeaturesText}
- Scraped Technical Specs:
${realSpecsText}
- External Market Opinions:
${product.externalContext || "No external context available. Rely on specs and general knowledge."}
- Comparison Target: ${competitorName} (主な比輁E�Eンチ�Eークとして使用。ただし、同価格帯の他�E競合製品との比輁E��歓迎しまぁE
${reviewsContext}
- AI Evaluated Grades (CONSISTENCY REQUIRED):
${product.specs && product.specs.length > 0 ? product.specs.map(s => `  - ${s.label}: ${s.value}`).join('\n') : "  - (No pre-evaluations available)"}

# 想定読老E
${targetReader}

# Strict Tone & Style Rules
- **リンクの徹底（収益化�E�E*:
    - 本斁E��めE��輁E��**こ�E製品E��E{product.name}�E�E*に言及する際は、可能な限り **[${product.name}](${amazonLink})** のようにAmazonリンクを貼ってください、E
    - 特に「結論」「おすすめ�Eイント」「他製品との違い」�Eセクションでは積極皁E��リンクを含めてください、E
    - 競合製品につぁE��も、もし有名な製品でURLを知ってぁE��場合�Eリンクを貼って構いませんが、基本は主役であるこ�E製品へのリンクを優先してください、E
- **導�Eの書き�Eし�E厳格匁E*:
    - ❁E禁止: 「Amazonで評価が高い」「Amazonランキング上位�E、E
    - ❁E禁止: **スペック表めE��ペック概要�E作�E�E�重要E��E* - UI側で別途表示するため、本斁E��には表を作らなぁE��ください、E
    - ❁E禁止: 「スペック概要」や「基本スペック」とぁE��見�Eし�E作�E、E
    - ❁E禁止: 「その実力を深掘りします」「いざ、検証の旁E��」などの詩皁E�E劁E��な表現
    - ❁E禁止: 「人生が変わる」「幸せになれる」「最高�E一台」とぁE��た過剰で抽象皁E��AI特有�E表現、E
    - ⭕︁E推奨: 、E{reviewContext}の観点でスペックとユーザー評価を徹底�E析しました。」「結論から言ぁE��、○○が優秀です。、E
- **斁E���E持E��E*:
    - 「です�Eます」調で、淡、E��事実を述べる「調査レポ�Eト」�Eようなト�Eン、E
    - 小粋なジョークめE��皁E��表現は**一刁E��止**です、E
    - 「専門家の私が保証します」�Eような表現は禁止。「データが示してぁE��す」としてください、E
    - 「〜�E方が幸せになれます」とぁE��た表現は避け、「〜�E方が満足度が高いでしょぁE��「〜�Eニ�Eズに適してぁE��す」�Eように客観皁E��記述してください、E
- **鍵かっこ「」�E多用禁止**: 
    - 「〜」形式�E引用を多用しなぁE��EIっぽくなるため最小限に、E
    - 代わりに、ストレートに述べる、E
- **正直なチE��リチE��**: 「すべてが最高」とは言わず、正直に伝えてください、E
- **評価との整合性�E�最重要E��E*:
    - 上記「AI Evaluated Grades」と矛盾する記述は禁止です、E
    - Grade Sなら「最高クラス」「文句なし」と絶賛してください、E
    - Grade B/Cなら「価格相応」「ここが惜しぁE��と正直に持E��してください、E
    - 「評価はSだが、実際は微妙」とぁE��た記述は論理破綻するため禁止です、E
    - こ�E記事�E「筁E��E�E意見だけ」ではなく、E*実際の購入老E�E声も交えた多角的な刁E��**であることを示してください、E
    - 具体的には、�E刁E�E評価を述べた後に「実際に使用してぁE��ユーザーからも同様�E声が多い」「一方でこんな意見もある」とぁE��形で**刁E��結果**を挿入します、E
    - ❁E**直接引用めE��個人の感想を捏造する「擬似皁E��鍵カチE��」書き�E完�Eに禁止**です、E
    - ❁E**「紁E割」、E0%」�Eような具体的な数値/割合�E捏造は禁止**�E�統計データがなぁE��めE��、E
    - ⭕︁E「多くのユーザー」「一部のユーザー」「〜とぁE��声が散見されます」とぁE��ぁE*定性皁E��表現**に留めてください、E
    
    \`\`\`html
    <div className="review-summary">
        <p><strong>🙆‍♂�E�E評価されてぁE��点�E�E/strong>多くのユーザーが「ノイキャンの自然さ」を挙げており、特に〜とぁE��声が目立ちます、E/p>
        <p><strong>🙅‍♂�E�E不満な点�E�E/strong>一部のユーザーから「ケースの大きさ」に関する持E��があり、〜とぁE��意見も見られます、E/p>
    </div>
    \`\`\`
    
    - **使ぁE��の侁E*:
      - メリチE��の裏付け: 「ノイキャン性能は非常に高く、実際の購入老E��らも『電車�E音が消える』とぁE��報告が多数寁E��られてぁE��す、E
      - チE��リチE��の補足: 「一方で、裁E��感につぁE��は『長時間だと痛い』とぁE��意見も一部で見られます、E
      - 意外な発要E 「予想外だった�Eは通話品質への高評価です」�E 引用
- **チE��リチE��表現のバリエーション**:
    - 「〜�E要検討です」とぁE��定型句は禁止、E
    - 代わりにターゲチE��を絞った�E体的なアドバイス�E�E
      - 「重低音重視�E人は物足りなさを感じるかもしれません、E
      - 「手が小さぁE��は、ケースが大きく感じる可能性があります、E
      - 「完�Eな静寂を求める人は上位モチE��を検討したほぁE��よいでしょぁE��E
- **柔軟な比輁E*: 主な比輁E��象は **${competitorName}** ですが、市場の他�E競合製品E��同価格帯�E�とも�E由に比輁E��てください。、E{competitorName}以外とは比輁E��てはぁE��なぁE��とぁE��制限�Eありません、E

# 【最重要】Before/After例で覚えろ（これを絶対守れ�E�E

あなた�E友達にLINEで製品を勧めてぁE��口調で書く。「レビュー記事っぽさ」「AIっぽさ」を消せ、E

❁EAIっぽぁE��絶対書くな�E��E ⭕︁E人間っぽぁE��こぁE��け！E

❁E「接続�E刁E��替えが魔法�Eようにスムーズです、E
⭕︁E「iPhoneからMacに刁E��替えるとき一瞬。地味に助かる、E

❁E「ノイズキャンセリングが極めて自然で、快適な静寂空間を提供します、E
⭕︁E「電車�EガタンゴトンがスチE��消える。これだけで買ぁE��値ある�E�Eudio�E�、E
⭕︁E、E時間座ってても�Eが痛くならなぁE��在宁E��ークの救世主�E�Eurniture�E�、E
⭕︁E「猫の毛がカーペットから一発で取れる！Eppliance�E�、E

❁E「人によっては長時間の使用で〜と感じる場合があるかもしれません、E
⭕︁E、E時間趁E��ると耳痛い人もいる！Eudio�E�、E
⭕︁E「絁E��立てのネジが硬すぎて電動ドライバ�E忁E��！Eurniture�E�、E

❁E「〜�Eため注意が忁E��です」「〜�E要検討です、E
⭕︁E「〜なのは正直マイナス」「〜�E好み刁E��れる、E

❁E「さらに〜。また〜。加えて〜。」（接続詞連打！E
⭕︁E同じ接続詞�E記事で2回まで。文の構造で工夫しろ

# 追加ルール
- 1斁E�E30斁E��以冁E��長くなったら刁E��。同じ語尾めE回続けるな
- 体言止め「〜だ」OK。�E部「〜です」で終わらせるな
- **マ�Eカー**: 単語ではなくフレーズに<mark>、E段落に1、E箁E���E�重要なポイント�E送E��ず引く�E�E

# Review Structure(Markdown)
    �E�導�E斁E��E{reviewContext}の観点でスペックとユーザー評価を徹底�E析しました。結論から言ぁE��…で始める！E

    ${reviewStructure}
# Output
(Markdown形式�E本斁E�Eみ出力してください、Erontmatterは不要です、E*忁E��日本語（です�Eます調�E�で書ぁE��ください**、E
`;

    console.log(`  🤁Egenerating Review for "${product.name}"...`);
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
            console.log(`  🤁EUsing Gemini...`);
            const response = await client.models.generateContent({
                model: 'gemini-3.1-pro-preview',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });
            if (!response.candidates || response.candidates.length === 0) {
                console.error("  ❁EAI Error: No candidates returned.");
                return "AI生�Eエラー";
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
        text = text.replace(/正直な判定（競合比輁E��Eg, '競合製品との比輁E);
        text = text.replace(/そ�E実力を深掘りしまぁEg, ''); // Also remove the "Deep Dive" phrase

        if (text.includes("Amazon")) {
            console.warn("  ⚠�E�EWarning: 'Amazon' still found in text after cleaning.");
        }

        // Deduplication Safeguard (Partial String match)
        // AI sometimes uses "##" and sometimes "1." so we match the text itself.
        // Deduplication Safeguard (Partial String match)
        // AI sometimes uses "##" and sometimes "1." so we match the text itself.
        const anchorText = `検証�E�E{reviewContext}での実力`;
        const parts = text.split(anchorText);

        if (parts.length > 2) {
            console.warn(`  ⚠�E�EDetected duplicate content via partial anchor split. Truncating...`);
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
                    console.warn(`  ⚠�E�EDetected duplicate header (Regex): "${headerTitle}". Truncating...`);
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
        // Regex targets: "## スペック概要E, "## 基本スペック", "### スペック概要E etc and ALL content until next ## heading
        const specOverviewPatterns = [
            /(?:^|\n)##[#]*\s*(?:スペック概要|基本スペック|スペック一覧|製品スペック|主な仕槁E主要スペック)[^\n]*\n(?:(?!^##[^#]).)*?(?=\n##[^#]|$)/gims,
            /(?:^|\n)\|[^\n]*スペック[^\n]*\|[\s\S]*?\n(?:\|[^\|]+\|[^\|]+\|\n)+/gim // Markdown tables about specs
        ];

        for (const pattern of specOverviewPatterns) {
            const before = text.length;
            text = text.replace(pattern, '\n');
            if (text.length < before) {
                console.log(`  🧹 Removed "スペック概要E section (AI ignored prompt restriction)`);
            }
        }

        // Clean up excessive newlines left by removals
        text = text.replace(/\n{3,}/g, '\n\n').trim();

        return text;
    } catch (e) {
        console.error("  ❁EAI Generation Failed:", e);
        return "レビュー生�Eに失敗しました、E;
    }
}

/**
 * Generate AI Thumbnail for the Article
 * Uses Gemini 2.0 Flash for native image generation.
 * Constraint: Japanese models if people are present.
 */
