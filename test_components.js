/**
 * Direct Test of Market Research Components
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

console.log("🔍 Direct Component Test");
console.log("=".repeat(50));

async function test() {
    // Step 1: Check API Key
    console.log("\n1️⃣ API Key Check:");
    const key = process.env.GOOGLE_API_KEY;
    console.log(`   Key loaded: ${!!key}`);
    if (key) {
        console.log(`   Key prefix: ${key.slice(0, 15)}...`);
    } else {
        console.log("   ❌ No GOOGLE_API_KEY found!");
        return;
    }

    // Step 2: Test Gemini API directly
    console.log("\n2️⃣ Testing Gemini API...");
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    try {
        const result = await model.generateContent('列挙してください：Sony WF-1000XM5, Anker Soundcore, Bose。JSONで返して: ["製品1", "製品2"]');
        const text = result.response.text();
        console.log(`   ✅ AI Response: ${text.slice(0, 200)}`);
    } catch (e) {
        console.log(`   ❌ AI Error: ${e.message}`);
    }

    // Step 3: Test Bing Search
    console.log("\n3️⃣ Testing Bing Search...");
    const puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        await page.goto('https://www.bing.com/search?q=ワイヤレスイヤホン+おすすめ&setmkt=ja-JP', {
            waitUntil: 'domcontentloaded'
        });
        await new Promise(r => setTimeout(r, 3000));

        const count = await page.evaluate(() => document.querySelectorAll('li.b_algo').length);
        console.log(`   ✅ Bing returned ${count} results`);
        await browser.close();
    } catch (e) {
        console.log(`   ❌ Bing Error: ${e.message}`);
        await browser.close();
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Component Test Complete");
}

test().catch(console.error);
