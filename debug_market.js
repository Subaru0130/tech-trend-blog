/**
 * Debug Market Research - Step by Step with more detail
 */

require('dotenv').config({ path: '.env.local' });

async function debugMarketResearch() {
    const puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());

    const { GoogleGenerativeAI } = require('@google/generative-ai');

    console.log("🔍 Debug: Step-by-step Market Research");
    console.log("=".repeat(50));

    // Step 1: Check API Key
    console.log("\n1️⃣ Checking API Key...");
    const apiKey = process.env.GEMINI_API_KEY;
    console.log(`   API Key exists: ${!!apiKey}`);
    if (!apiKey) {
        console.log("   ❌ No API key found!");
        return;
    }

    // Step 2: Test Bing Search
    console.log("\n2️⃣ Testing Bing Search...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const query = "ワイヤレスイヤホン 1万円台 おすすめ 2025";
    await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}&setmkt=ja-JP`, {
        waitUntil: 'domcontentloaded'
    });
    await new Promise(r => setTimeout(r, 3000));

    const snippets = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('li.b_algo').forEach(li => {
            const title = li.querySelector('h2')?.innerText || '';
            const snippet = li.querySelector('.b_caption p')?.innerText || '';
            results.push({ title, snippet, fullText: `${title} ${snippet}` });
        });
        return results.slice(0, 5);
    });

    await browser.close();

    console.log(`   Found ${snippets.length} snippets`);
    snippets.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.title.slice(0, 50)}...`);
    });

    if (snippets.length === 0) {
        console.log("   ❌ No snippets found!");
        return;
    }

    // Step 3: Test Gemini API
    console.log("\n3️⃣ Testing Gemini AI Extraction...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const context = snippets.map(s => s.fullText).join('\n\n');
    const prompt = `
検索結果から具体的な製品名を抽出してJSON配列で返してください。

【検索結果】
${context}

【出力形式】
["製品名1", "製品名2", ...]
`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log(`   AI Response:\n${text}`);

        const jsonMatch = text.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
            const products = JSON.parse(jsonMatch[0]);
            console.log(`\n   ✅ Extracted ${products.length} products:`);
            products.forEach((p, i) => console.log(`      ${i + 1}. ${p}`));
        } else {
            console.log("   ❌ No JSON array in response");
        }
    } catch (e) {
        console.log(`   ❌ AI Error: ${e.message}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("Debug Complete");
}

debugMarketResearch().catch(console.error);
