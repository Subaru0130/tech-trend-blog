const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const path = require('path');
const http = require('http');

async function checkPort() {
    return new Promise((resolve) => {
        const req = http.get('http://127.0.0.1:9222/json/version', (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.webSocketDebuggerUrl);
                } catch (e) { resolve(null); }
            });
        });
        req.on('error', () => resolve(null));
    });
}

(async () => {
    console.log("🕵️ FINDING SELECTORS");

    // 1. Launch
    console.log("🚀 Launching Chrome...");
    execSync(`"${path.join(__dirname, 'start_chrome_quiet.bat')}"`, { stdio: 'inherit' });

    // 2. Wait
    let wsUrl = null;
    for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1000));
        wsUrl = await checkPort();
        if (wsUrl) break;
    }

    if (!wsUrl) { console.error("❌ Failed to connect"); process.exit(1); }

    // 3. Connect
    const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl, defaultViewport: null });
    const page = (await browser.pages())[0] || await browser.newPage();

    // 4. Navigate
    const url = 'https://www.amazon.co.jp/product-reviews/B0DGL3XD3D';
    console.log(`🔗 Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 5000)); // Wait for render

    // 5. Inspect DOM with BROAD search
    const analysis = await page.evaluate(() => {
        // Find ALL div elements that might be reviews
        // Strategy: Look for "a-section" class which is common in Amazon
        const sections = Array.from(document.querySelectorAll('div.a-section'));

        // Filter for those that look like reviews (contain star rating or review body)
        const candidates = sections.filter(div => {
            return div.innerHTML.includes('review-title') || div.innerHTML.includes('5つ星のうち');
        });

        // Analyze specific data-hooks found
        const hooks = {};
        candidates.forEach(div => {
            const hook = div.getAttribute('data-hook');
            if (hook) hooks[hook] = (hooks[hook] || 0) + 1;
        });

        // Also check "review" class specifically
        const reviewClassCount = document.querySelectorAll('.review').length;

        // Get the first candidate's full attributes for inspection
        const firstCandidate = candidates.length > 0 ? {
            class: candidates[0].className,
            id: candidates[0].id,
            dataHook: candidates[0].getAttribute('data-hook'),
            htmlSnippet: candidates[0].outerHTML.substring(0, 300)
        } : null;

        return {
            totalSections: sections.length,
            candidateCount: candidates.length,
            reviewClassCount: reviewClassCount,
            hooksFound: hooks,
            firstCandidate: firstCandidate,
            bodyTextLength: document.body.innerText.length
        };
    });

    console.log("================ ANALYSIS ================");
    console.log(`Total 'a-section' divs: ${analysis.totalSections}`);
    console.log(`Review Candidates found: ${analysis.candidateCount}`);
    console.log(`Elements with .review class: ${analysis.reviewClassCount}`);
    console.log(`Body Text Length: ${analysis.bodyTextLength}`);
    console.log("------------------------------------------");
    console.log("Found Data-Hooks:", JSON.stringify(analysis.hooksFound, null, 2));
    console.log("------------------------------------------");
    if (analysis.firstCandidate) {
        console.log("First Candidate Details:");
        console.log(`Class: ${analysis.firstCandidate.class}`);
        console.log(`Data-Hook: ${analysis.firstCandidate.dataHook}`);
        console.log(`HTML Snippet: ${analysis.firstCandidate.htmlSnippet}`);
    } else {
        console.log("❌ No likely review elements found.");
    }

    await browser.disconnect();
})();
