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
