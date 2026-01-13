/**
 * Test Bing Search with proper encoding check
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    console.log("Testing Bing Search with UTF-8...");

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    try {
        const page = await browser.newPage();

        // Set Japanese locale and encoding
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8'
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        const query = "ワイヤレスイヤホン 1万円台 おすすめ 2025";
        const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&setmkt=ja-JP&setlang=ja`;

        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 3000));

        // Screenshot to verify
        await page.screenshot({ path: 'bing_test.png' });
        console.log("Screenshot saved: bing_test.png");

        const snippets = await page.evaluate(() => {
            const results = [];
            document.querySelectorAll('li.b_algo').forEach(li => {
                const titleEl = li.querySelector('h2');
                const snippetEl = li.querySelector('.b_caption p') || li.querySelector('.b_snippet');

                const title = titleEl?.innerText || '';
                const snippet = snippetEl?.innerText || '';

                results.push({
                    title: title,
                    snippet: snippet.slice(0, 150),
                    fullText: `${title} ${snippet}`
                });
            });
            return results.slice(0, 5);
        });

        console.log("\nSnippets found:", snippets.length);
        snippets.forEach((s, i) => {
            console.log(`\n${i + 1}. Title: ${s.title}`);
            console.log(`   Snippet: ${s.snippet}...`);
        });

        // Now test AI with these snippets
        if (snippets.length > 0) {
            console.log("\n\nTesting AI extraction...");

            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const context = snippets.map(s => s.fullText).join('\n\n');

            const prompt = `以下の検索結果から製品名を抽出してJSON配列で返してください。

検索結果:
${context}

出力形式: ["製品名1", "製品名2"]
製品が見つからない場合: []`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            console.log("\nAI Response:", text);

            // Parse
            const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
            const match = cleaned.match(/\[[\s\S]*\]/);
            if (match) {
                const products = JSON.parse(match[0]);
                console.log("\nExtracted products:", products.length);
                products.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
            }
        }

        await browser.close();

    } catch (e) {
        console.error("Error:", e.message);
        await browser.close();
    }
}

test();
