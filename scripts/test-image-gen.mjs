import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

async function main() {
    console.log('Testing Image Generation with gemini-3-pro-image-preview...');
    try {
        const prompt = "A futuristic cyberpunk city with neon lights, high quality, 4k";

        // Note: For some image models, the prompt might need to be passed differently or the response handling differs.
        // We'll try standard generateContent first.
        const result = await model.generateContent(prompt);
        const response = await result.response;

        console.log('Response received.');
        console.log(JSON.stringify(response, null, 2));

        // Check for inline data (images)
        // Usually it's in candidates[0].content.parts[0].inlineData

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
