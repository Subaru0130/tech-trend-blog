const fs = require('fs');
let fileContent = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8');

const retryLogic = `
/**
 * Generic retry logic for AI API calls
 * Used for handling 503 High Demand, Rate Limits, and temporary network errors
 */
async function withRetry(operation, maxRetries = 3, delayMs = 15000) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            const errorStr = error.toString().toLowerCase();
            const isRetryable = error.status === 503 || 
                               error.status === 429 || 
                               errorStr.includes('503') || 
                               errorStr.includes('high demand') ||
                               errorStr.includes('rate limit') ||
                               errorStr.includes('fetch failed');

            if (isRetryable && attempt < maxRetries) {
                console.warn(\`  ⚠️ [Retry \${attempt}/\${maxRetries}] AI API Error: \${error.message || '503/429'}\`);
                console.warn(\`  ⏳ Waiting \${delayMs / 1000}s before retrying...\`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                delayMs *= 2; 
            } else {
                throw error;
            }
        }
    }
    throw lastError;
}

`;

if (!fileContent.includes('function withRetry')) {
    // Insert just before generateSeoMetadata
    fileContent = fileContent.replace('/**\r\n * Generate SEO Metadata', retryLogic + '/**\r\n * Generate SEO Metadata');
    fileContent = fileContent.replace('/**\n * Generate SEO Metadata', retryLogic + '/**\n * Generate SEO Metadata');

    // SEO Gen
    fileContent = fileContent.replace(/const response = await client\.models\.generateContent\(\{[\s\n]*model: 'gemini-3\.1-pro-preview',[\s\n]*contents: \[\{ role: 'user', parts: \[\{ text: prompt \}\] \}\],[\s\n]*generationConfig: \{ responseMimeType: "application\/json" \}[\s\n]*\}\);/g,
        `const response = await withRetry(() => client.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        }));`);

    // Buying Guide / Review Body - Claude
    fileContent = fileContent.replace(/const response = await claudeClient\.messages\.create\(\{[\s\n]*model: 'claude-opus-4-5-20251101',[\s\n]*max_tokens: 16384,[\s\n]*messages: \[\{ role: 'user', content: prompt \}\],[\s\n]*\}\);/g,
        `const response = await withRetry(() => claudeClient.messages.create({
                model: 'claude-opus-4-5-20251101',
                max_tokens: 16384,
                messages: [{ role: 'user', content: prompt }],
            }));`);

    // Buying Guide / Review Body / Specs - Gemini
    fileContent = fileContent.replace(/const response = await client\.models\.generateContent\(\{[\s\n]*model: 'gemini-3\.1-pro-preview',[\s\n]*contents: \[\{ role: 'user', parts: \[\{ text: prompt \}\] \}\],[\s\n]*\}\);/g,
        `const response = await withRetry(() => client.models.generateContent({
                model: 'gemini-3.1-pro-preview',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            }));`);

    // Image gen
    fileContent = fileContent.replace(/const response = await client\.models\.generateContent\(\{[\s\n]*model: 'gemini-3-pro-image-preview',[\s\n]*contents: \[\{ role: 'user', parts: \[\{ text: prompt \}\] \}\],[\s\n]*\}\);/g,
        `const response = await withRetry(() => client.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }));`);

    fs.writeFileSync('scripts/lib/ai_writer.js', fileContent);
    console.log("Injected withRetry wrapper successfully.");
} else {
    console.log("retry logic already injected.");
}
