import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import util from 'util';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
const client = new GoogleGenAI({ apiKey });

async function main() {
    console.log('Debugging Image Generation Response...');
    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: 'A red apple',
        });

        if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
            const part = response.candidates[0].content.parts[0];
            console.log('Part Keys:', Object.keys(part));

            if (part.inlineData) {
                console.log('inlineData Keys:', Object.keys(part.inlineData));
                console.log('inlineData.mimeType:', part.inlineData.mimeType);
                console.log('inlineData.data length:', part.inlineData.data ? part.inlineData.data.length : 'undefined');
            } else {
                console.log('No inlineData found in part.');
                console.log('Part content:', util.inspect(part, { showHidden: false, depth: null, colors: true }));
            }
        } else {
            console.log('Unexpected structure:', util.inspect(response, { showHidden: false, depth: null, colors: true }));
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
