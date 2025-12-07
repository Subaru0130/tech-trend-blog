import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not set in .env.local");
    process.exit(1);
}
const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function auditStrategy() {
    console.log("🚀 Starting Strategic Audit with Gemini 3 Pro (Thinking: High)...");

    // 1. Gather Context
    const generateScript = fs.readFileSync('scripts/generate-post.mjs', 'utf8');
    const rankingCard = fs.readFileSync('src/components/affiliate/RankingCard.tsx', 'utf8');

    // Try to read the latest post, or a placeholder if none
    let samplePost = "";
    try {
        const postsDir = path.join(process.cwd(), 'content', 'posts');
        const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));
        if (files.length > 0) {
            samplePost = fs.readFileSync(path.join(postsDir, files[files.length - 1]), 'utf8');
        }
    } catch (e) {
        console.warn("Could not read sample post:", e.message);
    }

    const context = `
  --- SYSTEM ARCHITECTURE (Generation Logic) ---
  ${generateScript.substring(0, 3000)}... (truncated)

  --- UI COMPONENT (Conversion Element) ---
  ${rankingCard}

  --- SAMPLE OUTPUT (Actual Article) ---
  ${samplePost.substring(0, 3000)}... (truncated)
  `;

    const prompt = `
  You are a Chief Revenue Officer and SEO Strategist using Gemini 3 Pro (High Reasoning).
  
  **Your Mission:** Audit this automated affiliate blog system.
  The goal is to MAXIMIZE REVENUE from Amazon/Rakuten affiliate links.
  
  **Review the provided Code (Strategy) and Output (Execution).**
  
  **Analyse Deeply (Thinking Level: High):**
  1.  **Conversion Psychology:** Is the \`RankingCard\` and article copy *truly* compelling? Or is it generic?
  2.  **Traffic Strategy:** Is the content SEO-optimized enough? Are we targeting the right "Buying Intent" keywords?
  3.  **Trust Factors:** Does the site look trustworthy or like a spammy AI farm?
  4.  **Blind Spots:** What are we missing? (e.g., Comparison tables? User intent segmentation? Micro-copy?)
  
  **Deliverable:**
  Provide a brutal, honest report with:
  - **Strengths**: What is working?
  - **Critical Weaknesses**: What is killing sales?
  - **Actionable Fixes**: Concrete code or prompting changes to implement IMMEDIATELY.
  
  Format as Markdown.
  `;

    try {
        const result = await client.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [{ role: 'user', parts: [{ text: prompt + "\n\nCONTEXT:\n" + context }] }],
            config: {
                thinkingConfig: { thinkingLevel: "high" }
            }
        });

        const report = result.candidates[0].content.parts[0].text;

        // Save report
        fs.writeFileSync('STRATEGY_AUDIT_REPORT.md', report);
        console.log("\n✅ Audit Complete. Report saved to STRATEGY_AUDIT_REPORT.md");
        console.log("---------------------------------------------------------");
        console.log(report.substring(0, 500) + "...\n(See file for full report)");

    } catch (e) {
        console.error("Audit Failed:", e);
    }
}

auditStrategy();
