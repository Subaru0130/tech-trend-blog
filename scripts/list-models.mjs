import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not set in .env.local");
    process.exit(1);
}

const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function listModels() {
    console.log("Listing available models...");
    try {
        const response = await client.models.list();
        // The response structure might vary, let's log it carefully
        console.log("Models found:");
        if (Array.isArray(response)) {
            response.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
        } else if (response.models) {
            response.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
        } else {
            console.log(JSON.stringify(response, null, 2));
        }
    } catch (error) {
        console.error("Failed to list models:", error);
    }
}

listModels();
