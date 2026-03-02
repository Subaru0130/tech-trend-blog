const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

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
            // Check if it's a 503 or "high demand" / rate limit error
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
                // Exponential backoff for next attempt
                delayMs *= 2; 
            } else {
                throw error; // Not retryable or max retries reached
            }
        }
    }
    throw lastError;
}
`;

// Insert the retry logic right after the Claude/Gemini provider setup
let insertIndex = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i] && lines[i].includes('const useClaudeForArticles = () =>')) {
        insertIndex = i + 1;
        break;
    }
}

if (insertIndex !== -1 && !lines.some(l => l.includes('function withRetry'))) {
    lines.splice(insertIndex, 0, retryLogic);

    // Now replace client.models.generateContent and claudeClient.messages.create with wrapped versions
    let fileContent = lines.join('\\n');

    // Replace Gemini calls
    fileContent = fileContent.replace(/await client\.models\.generateContent\(\{/g, 'await withRetry(() => client.models.generateContent({');
    fileContent = fileContent.replace(/\}\);\s*(?:(?:\/\/.*\n)*|\n*)if \(!response.candidates/g, '}));\n        if (!response.candidates');
    fileContent = fileContent.replace(/\}\);\s*text = response\.candidates\[0\]\.content\.parts\[0\]\.text;/g, '}));\n        text = response.candidates[0].content.parts[0].text;');
    fileContent = fileContent.replace(/\}\);\s*const text = response\.candidates\[0\]\.content\.parts\[0\]\.text;/g, '}));\n        const text = response.candidates[0].content.parts[0].text;');
    fileContent = fileContent.replace(/\}\);\s*if \(response\.candidates\)/g, '}));\n        if (response.candidates)');

    // Specifically handle the generateBuyingGuideBody and generateReviewBody formats
    fileContent = fileContent.replace(/\}\);\n\s*/ / fallback text check / g, '}));\n            // fallback text check');

    // Replace Claude calls
    fileContent = fileContent.replace(/await claudeClient\.messages\.create\(\{/g, 'await withRetry(() => claudeClient.messages.create({');
    fileContent = fileContent.replace(/\}\);\s*text = response\.content\[0\]\.text;/g, '}));\n            text = response.content[0].text;');

    fs.writeFileSync('scripts/lib/ai_writer.js', fileContent);
    console.log("Injected withRetry wrapper successfully.");
} else {
    console.log("Could not find insert point or retry logic already injected.");
}
