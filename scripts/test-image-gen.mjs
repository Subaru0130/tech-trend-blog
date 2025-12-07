import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not set in .env.local");
    process.exit(1);
}

const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function testImageGen() {
    console.log("Testing Image Generation with 'gemini-3-pro-image-preview'...");

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: 'A futuristic city skyline at sunset, high quality, photorealistic',
        });

        console.log("Response received.");

        // Inspect response structure
        const candidate = response.candidates?.[0];
        const part = candidate?.content?.parts?.[0];

        if (part && part.inlineData) {
            const base64Image = part.inlineData.data;
            const buffer = Buffer.from(base64Image, 'base64');
            const filename = `test-image-${Date.now()}.png`;
            const filepath = path.join(process.cwd(), 'public', 'images', filename);

            const dir = path.dirname(filepath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(filepath, buffer);
            console.log(`Success! Image saved to ${filepath}`);
        } else {
            console.error("Unexpected response structure:", JSON.stringify(response, null, 2));
        }

    } catch (error) {
        console.error("Image generation failed:", error);
    }
}

testImageGen();
