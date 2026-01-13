/**
 * Verbose Debug of Market Research Flow
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log("🔍 VERBOSE DEBUG: Market Research Flow");
console.log("=".repeat(60));

async function debugFlow() {
    // Step 1: Verify API Key
    const apiKey = process.env.GOOGLE_API_KEY;
    console.log(`\n1️⃣ API Key: ${apiKey ? '✅ Found (' + apiKey.slice(0, 10) + '...)' : '❌ Missing'}`);
    if (!apiKey) return;

    // Step 2: Test Bing Search
    console.log(`\n2️⃣ Bing Search Test:`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    const query = "ワイヤレスイヤホン 1万円台 おすすめ 2025";
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&setmkt=ja-JP&setlang=ja`;

    console.log(`   URL: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    // Extract snippets same way as market_research.js
    const TRUSTED_SOURCES = [
        { domain: 'kakaku.com', priority: 10, name: '価格.com' },
        { domain: 'my-best.com', priority: 9, name: 'mybest' },
        { domain: 'av.watch.impress.co.jp', priority: 8, name: 'AV Watch' }
    ];

    const snippets = await page.evaluate((trustedDomains) => {
        const results = [];
        document.querySelectorAll('li.b_algo').forEach(li => {
            const titleEl = li.querySelector('h2');
            const linkEl = li.querySelector('a');
            const snippetEl = li.querySelector('.b_caption p') || li.querySelector('.b_snippet');

            if (!titleEl || !linkEl) return;

            const url = linkEl.href || '';
            const title = titleEl.innerText || '';
            const snippet = snippetEl?.innerText || '';

            // Skip Amazon/Rakuten
            if (url.includes('amazon') || url.includes('rakuten')) return;

            const domain = trustedDomains.find(d => url.includes(d.domain));
            const sourcePriority = domain ? domain.priority : 1;
            const sourceName = domain ? domain.name : 'Other';

            results.push({
                title,
                url: url.slice(0, 50) + '...',
                snippet: snippet.slice(0, 100) + '...',
                source: sourceName,
                priority: sourcePriority,
                fullText: `${title} ${snippet}`
            });
        });
        return results.slice(0, 10);
    }, TRUSTED_SOURCES);

    await browser.close();

    console.log(`   Found ${snippets.length} snippets:`);
    snippets.forEach((s, i) => {
        console.log(`   ${i + 1}. [${s.source}] ${s.title.slice(0, 40)}...`);
    });

    if (snippets.length === 0) {
        console.log("   ❌ No snippets collected! Check selectors.");
        return;
    }

    // Step 3: Test AI Extraction
    console.log(`\n3️⃣ AI Extraction Test:`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const context = snippets.map(s => `[${s.source}] ${s.fullText}`).join('\n\n');

    const prompt = `
あなたは製品調査アシスタントです。以下のWeb検索結果から、「ワイヤレスイヤホン 1万円台」に該当する具体的な製品名を抽出してください。

【検索結果】
${context}

【抽出ルール】
1. 具体的な製品名のみを抽出（例: "Sony WF-1000XM5", "Anker Soundcore Space A40"）
2. カテゴリ名（例: "ワイヤレスイヤホン"）は除外
3. 関連商品（ケース、イヤーピース等）は除外
4. 最大20製品まで

【出力形式】
JSON配列で出力:
["製品名1", "製品名2", ...]

製品が見つからない場合は空配列 [] を返してください。
`;

    console.log(`   Prompt length: ${prompt.length} chars`);
    console.log(`   Context snippets: ${snippets.length}`);

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();

        console.log(`   Raw AI Response:`);
        console.log(`   ---`);
        console.log(`   ${text}`);
        console.log(`   ---`);

        // Clean and parse
        text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
        const jsonMatch = text.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
            console.log(`   JSON matched: ${jsonMatch[0].slice(0, 100)}...`);
            try {
                const products = JSON.parse(jsonMatch[0]);
                console.log(`\n   ✅ Extracted ${products.length} products:`);
                products.forEach((p, i) => console.log(`      ${i + 1}. ${p}`));
            } catch (e) {
                console.log(`   ❌ JSON parse error: ${e.message}`);
            }
        } else {
            console.log(`   ❌ No JSON array found in response`);
        }
    } catch (e) {
        console.log(`   ❌ AI Error: ${e.message}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("Debug Complete");
}

debugFlow().catch(e => console.error("Fatal:", e));
