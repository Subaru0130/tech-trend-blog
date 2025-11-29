import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';

dotenv.config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is not set in .env.local");
  process.exit(1);
}

// Initialize new SDK Client
const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
});

async function fetchTrends() {
  console.log('Fetching comparison topics...');
  // Pivot to Daily Necessities / Lifestyle (mybest/LDK style)
  return [
    'ドラム式洗濯機 vs 縦型洗濯機',
    '人気の食器用洗剤 徹底比較',
    'ロボット掃除機 ルンバ vs エコバックス',
    '無印良品 vs ニトリ 収納ボックス',
    '最新ヘアドライヤー ナノケア vs ダイソン',
    'フライパン 鉄 vs テフロン'
  ];
}

async function fetchNews(query) {
  console.log(`Simulating fetching news for: ${query}`);
  return [
    { title: `${query}の主婦の口コミ`, snippet: `${query}は汚れ落ちが抜群と評判。一方で価格が高めという声も。` },
    { title: `【2025年】${query}のおすすめランキング`, snippet: `今年のベストバイはこれ！${query}を実際に使って検証しました。` },
    { title: `${query} コスパ最強はどっち？`, snippet: `毎日使うものだからこそ、安くて良いものを選びたい。${query}のコスパを徹底調査。` },
  ];
}

async function generateImage(topic) {
  console.log(`Generating lifestyle image for: ${topic}`);

  // LDK/Magazine Style Image Prompt
  const imagePrompt = `
    A bright, clean, high-quality lifestyle photography of ${topic}.
    Style: Japanese lifestyle magazine (like LDK or mybest), bright natural lighting, clean white background or cozy living room setting.
    Composition: Product comparison shot, neatly arranged, professional product photography.
    Mood: Trustworthy, fresh, organized, domestic bliss.
    Quality: 8k resolution, highly detailed, photorealistic.
    No text, no watermarks.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: imagePrompt
    });

    // Inspect response structure
    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];

    if (part && part.inlineData) {
      const base64Image = part.inlineData.data;
      const buffer = Buffer.from(base64Image, 'base64');
      const filename = `img-${Date.now()}.png`;

      const filepath = path.join(process.cwd(), 'public', 'images', filename);

      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(filepath, buffer);
      console.log(`Image saved to ${filepath}`);
      return `/images/${filename}`;
    } else {
      console.warn("Unexpected image response structure. Full response:", JSON.stringify(response, null, 2));
      throw new Error("No image data in response");
    }

  } catch (error) {
    console.warn(`Image generation failed (or model unavailable): ${error.message}`);
    console.log("Using fallback gradient image.");
    return null;
  }
}

async function generateArticle(topic) {
  console.log(`Generating comparison review for: ${topic}`);

  const newsItems = await fetchNews(topic);
  const newsContext = newsItems.map((n, i) => `[Source ${i + 1}] ${n.title}\n${n.snippet}`).join('\n\n');

  const imageUrl = await generateImage(topic);

  const prompt = `
  You are a "Lifestyle & Home Goods Expert" writing for a popular Japanese comparison media (like mybest or LDK).
  The user is a busy housewife or working mom deciding between daily necessities related to: "${topic}".
  
  **Context from Web:**
  ${newsContext}
  
  **Goal:** Write a "Thorough Verification & Ranking" article in **JAPANESE (日本語)**.
  
  **Tone:**
  - Trustworthy, Helpful, Empathetic.
  - Use "We verified" (検証しました) perspective.
  - Focus on "Life benefits" (e.g., saves time, easy to clean) rather than just specs.
  
  **CRITICAL STRUCTURE (Markdown):**
  
  # [Title: Catchy Japanese Title, e.g., "【2025徹底比較】食器用洗剤のおすすめ人気ランキング10選！汚れ落ち最強は？"]
  
  ## 検証の結論 (The Verdict)
  (Summarize the winner clearly. "If you want X, buy A. If you want Y, buy B.")
  
  ## 比較表 (Comparison Table)
  | 項目 (Item) | 商品A (Product A) | 商品B (Product B) |
  | :--- | :--- | :--- |
  | 価格 | ... | ... |
  | 使いやすさ | ... | ... |
  | コスパ | ... | ... |
  (Use ◎, ◯, △ for easy reading)
  
  ## 徹底検証レビュー (Detailed Review)
  ### 1. 汚れ落ち・効果
  ...
  ### 2. 使い勝手・収納性
  ...
  ### 3. コスパ
  ...
  
  ## メリット・デメリット (Pros & Cons)
  ### 商品A
  *   ✅ ...
  *   ❌ ...
  
  ### 商品B
  *   ✅ ...
  *   ❌ ...
  
  ## 🏆 編集部のおすすめ (Editor's Choice)
  **【商品A】はこんな人におすすめ:**
  *   ...
  
  **【商品B】はこんな人におすすめ:**
  *   ...
  
  **Frontmatter:**
  - title: (Japanese Title)
  - date: (Current date)
  - description: (Japanese Summary)
  - tags: [Life, Home, Comparison, Review]
  - image: ${imageUrl || ''} 
  
  Output raw Markdown only.
  `;

  const response = await client.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt
  });

  return response.candidates[0].content.parts[0].text;
}

async function saveArticle(content, topic) {
  const dateStr = new Date().toISOString().split('T')[0];
  const safeTopic = topic.replace(/[^a-z0-9\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\s]/gi, '').trim().replace(/\s+/g, '-');
  const filename = `${dateStr}-${safeTopic}.mdx`;
  const filepath = path.join(process.cwd(), 'content', 'posts', filename);

  let cleanContent = content.replace(/^```markdown\n/, '').replace(/\n```$/, '');

  if (cleanContent.includes('date:')) {
    cleanContent = cleanContent.replace(/date: .*/, `date: ${dateStr}`);
  } else {
    cleanContent = cleanContent.replace(/title: .*/, `$&
date: ${dateStr}`);
  }

  cleanContent = cleanContent.replace(/title: (.*)/, 'title: "$1"');

  fs.writeFileSync(filepath, cleanContent, 'utf8');
  console.log(`Saved article to ${filepath}`);
}

async function main() {
  const trends = await fetchTrends();
  console.log('Comparison topics:', trends);

  const targetTrend = trends[Math.floor(Math.random() * trends.length)];

  const article = await generateArticle(targetTrend);
  await saveArticle(article, targetTrend);
}

main();
