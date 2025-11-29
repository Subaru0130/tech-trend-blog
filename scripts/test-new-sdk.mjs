import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

async function main() {
    console.log('Testing new @google/genai SDK...');

    try {
        const client = new GoogleGenAI({ apiKey });
        console.log('Client initialized.');

        // Test Text Generation
        console.log('Testing Text Gen (gemini-3-pro-preview)...');
        const textResponse = await client.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: 'Hello'
        });
        console.log('Text Response OK');

        // Test Image Generation
        console.log('Testing Image Gen (gemini-3-pro-image-preview)...');
        const imagePrompt = "A futuristic city, neon lights, 8k";
        const imageResponse = await client.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: imagePrompt
        });

        console.log('Image Response Structure:', JSON.stringify(imageResponse, null, 2));

        if (imageResponse.response && imageResponse.response.candidates) {
            console.log('Candidates Content Parts:', JSON.stringify(imageResponse.response.candidates[0].content.parts, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
