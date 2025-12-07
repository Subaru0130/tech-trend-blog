import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Helper to wait for server
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer(url, timeout = 60000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try {
            const res = await fetch(url);
            if (res.ok) return true;
        } catch (e) {
            // ignore connection refused
        }
        await wait(1000);
    }
    return false;
}

async function main() {
    console.log("Starting verification loop...");

    // 1. Start Next.js Server
    console.log("Starting dev server...");
    const server = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], {
        detached: false,
        stdio: 'inherit',
        shell: true
    });

    let browser;

    try {
        // Target URL
        const port = 3000;
        const baseUrl = `http://localhost:${port}`;
        // Adjust date dynamically or find latest post? For now hardcoded is okay as per previous logic, 
        // but let's try to be smarter or stick to the known generated file date.
        // Dynamically find the latest post
        const postsDir = path.join(process.cwd(), 'content', 'posts');
        const files = fs.readdirSync(postsDir)
            .filter(f => f.endsWith('.mdx'))
            .sort((a, b) => {
                return fs.statSync(path.join(postsDir, b)).mtimeMs - fs.statSync(path.join(postsDir, a)).mtimeMs;
            });

        if (files.length === 0) throw new Error("No posts found to verify.");

        const latestPost = files[0].replace('.mdx', ''); // url encoded? Next.js handles it.
        const encodedPost = encodeURIComponent(latestPost);
        const url = `${baseUrl}/posts/${latestPost}`; // Browser handles encoding usually, but let's be safe if needed. Standard fetch might need encoded.
        // Actually Next.js file based routing: 2025-12-07-最新ヘアドライヤー -> /posts/2025-12-07-%E6%9C%80...
        // Let's rely on standard encoding.


        console.log(`Waiting for server at ${baseUrl}...`);
        const isUp = await waitForServer(baseUrl);
        if (!isUp) throw new Error("Server failed to start in time.");
        console.log("Server is UP!");

        // 2. Launch Browser
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        const errors = [];

        page.on('console', msg => {
            if (msg.type() === 'error') errors.push(`Console Error: ${msg.text()}`);
        });
        page.on('pageerror', err => errors.push(`Page Error: ${err.message}`));

        console.log(`Navigating to ${url}...`);
        const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

        if (response.status() !== 200) {
            throw new Error(`Page returned status ${response.status()}`);
        }

        // 3. Verify Content
        const title = await page.$eval('h1', el => el.textContent).catch(() => null);
        if (!title) errors.push("CRITICAL: H1 title not found.");
        console.log(`Found Title: ${title}`);

        const rankingCards = await page.$$('.bg-white.shadow-lg, article'); // Adjust selector as needed
        console.log(`Found ${rankingCards.length} potential content blocks.`);

        // Screenshot
        const screenshotPath = path.join(process.cwd(), 'verification-result.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Screenshot saved to ${screenshotPath}`);

        if (errors.length > 0) {
            console.error("❌ Verification FAILED with errors:");
            errors.forEach(e => console.error(`  - ${e}`));
            throw new Error("Verification failed");
        }

        console.log("✅ Verification PASSED.");

    } catch (e) {
        console.error(`Verification Loop Failed: ${e.message}`);
        process.exitCode = 1;
    } finally {
        // 4. Cleanup
        if (browser) await browser.close();
        if (server) {
            console.log("Stopping server...");
            // Windows kill is tricky, spawn 'taskkill' if needed, but tree kill is best.
            // For simple usage:
            try {
                if (process.platform === 'win32') {
                    spawn("taskkill", ["/pid", server.pid, '/f', '/t']);
                } else {
                    server.kill();
                }
            } catch (err) {
                console.error("Failed to kill server:", err);
            }
        }
    }
}

main();
