import googleTrends from 'google-trends-api';

export async function getRisingKeywords(keyword) {
    console.log(`[TrendHunter] Scanning for rising queries related to: ${keyword}`);

    try {
        const results = await googleTrends.relatedQueries({
            keyword: keyword,
            geo: 'JP',
            hl: 'ja'
        });

        const data = JSON.parse(results);
        const rankedList = data.default.rankedList;

        // Extract "Rising" queries (Top % growth)
        const rising = rankedList.find(list => list.title === 'Rising');
        let queries = [];

        if (rising && rising.rankedKeyword) {
            queries = rising.rankedKeyword.map(item => ({
                query: item.query,
                value: item.value, // e.g., "Breakout" or numbers
                type: 'Rising'
            }));
        }

        // If Rising is empty, get "Top" queries
        if (queries.length === 0) {
            const top = rankedList.find(list => list.title === 'Top');
            if (top && top.rankedKeyword) {
                queries = top.rankedKeyword.slice(0, 10).map(item => ({
                    query: item.query,
                    value: item.value,
                    type: 'Top'
                }));
            }
        }

        console.log(`[TrendHunter] Found ${queries.length} related keywords.`);
        return queries.map(q => q.query);

    } catch (error) {
        console.warn("[TrendHunter] API failed (likely blocked). Switching to AI Simulation...", error.message);
        return await getSimulatedTrends(keyword);
    }
}

// Fallback: Use Gemini to predict/simulate current trends
async function getSimulatedTrends(keyword) {
    try {
        const { GoogleGenAI } = await import('@google/genai');
        const dotenv = await import('dotenv');
        dotenv.config({ path: '.env.local' });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return [];

        const client = new GoogleGenAI({ apiKey });
        const prompt = `
            You are a rigorous SEO Strategist.
            Task: List 10 "Rising related search queries" for the keyword "${keyword}" in Japan as of late 2024/2025.
            Focus on:
            1. User Pain points (e.g. "cleaning", "smell")
            2. Specific comparison intents (e.g. "BrandA vs BrandB")
            3. Hidden commercial intents (e.g. "running cost")
            
            Return ONLY a JSON array of strings.
            Example: ["humidifier mold prevention", "humidifier electricity cost"]
        `;

        const resp = await client.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const text = resp.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
        const trends = JSON.parse(text);
        console.log(`[TrendHunter] AI Simulated ${trends.length} trends.`);
        return trends;

    } catch (e) {
        console.error("[TrendHunter] AI Simulation failed:", e);
        return [];
    }
}

// Standalone execution for testing
if (process.argv[1] === import.meta.url || process.argv[1].endsWith('trend_hunter.mjs')) {
    const keyword = process.argv[2] || '加湿器';
    getRisingKeywords(keyword).then(trends => {
        console.log("--- Result ---");
        console.log(trends);
    });
}
