import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';

async function main() {
    console.log("🎨 Starting Visual Verification Algorithm...");

    // 1. Start Local Server
    console.log("Starting local server...");
    const nextApp = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        shell: true,
        stdio: 'pipe'
    });

    // Wait for server to be ready (naive wait)
    await new Promise(resolve => setTimeout(resolve, 5000));

    let browser;
    let hasError = false;

    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();

        // Mobile Viewport for responsive check
        await page.setViewport({ width: 390, height: 844 }); // iPhone 14

        const baseUrl = 'http://localhost:3000';

        // --- CHECK 1: Homepage Visuals ---
        console.log(`Checking Homepage (${baseUrl})...`);
        await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 30000 });

        // Check for "No Image" text
        const noImageText = await page.evaluate(() => {
            return document.body.innerText.includes('No Image');
        });

        if (noImageText) {
            console.error("❌ FAIL: 'No Image' placeholder detected on Homepage!");
            hasError = true;
        } else {
            console.log("✅ PASS: No placeholders found on Homepage.");
        }

        // --- CHECK 1.5: Hero Title Existence (Void Check) ---
        const heroTitle = await page.$eval('section h1', el => el.textContent).catch(() => null);
        if (!heroTitle || heroTitle.trim() === '') {
            console.error("❌ FAIL: Hero section has no title! Frontmatter parsing likely failed.");
            hasError = true;
        }

        // --- CHECK 1.6: Broken Images ---
        const brokenImages = await page.evaluate(() => {
            return Array.from(document.images).filter(img => img.naturalWidth === 0).map(img => img.src);
        });

        if (brokenImages.length > 0) {
            console.error("❌ FAIL: Found broken images:", brokenImages);
            hasError = true;
        }

        // --- CHECK 2: Featured Post Visuals ---
        // Find first post link
        const firstPostHref = await page.evaluate(() => {
            const link = document.querySelector('a[href^="/posts/"]');
            return link ? link.getAttribute('href') : null;
        });

        if (firstPostHref) {
            console.log(`Checking Post Page (${firstPostHref})...`);
            await page.goto(`${baseUrl}${firstPostHref}`, { waitUntil: 'networkidle0' });

            // Check CTA Visibility (Amazon Button)
            const ctaVisible = await page.evaluate(() => {
                const button = document.querySelector('a[href*="amazon"]');
                if (!button) return false;
                const style = window.getComputedStyle(button);
                const color = style.color;
                // We expect white text (rgb(255, 255, 255))
                return color === 'rgb(255, 255, 255)';
            });

            if (!ctaVisible) {
                console.warn("⚠️ WARN: Amazon CTA text might not be white. Please verify manually.");
            } else {
                console.log("✅ PASS: Amazon CTA button has white text.");
            }
        }

    } catch (e) {
        console.error("❌ FATAL: Verification failed:", e.message);
        hasError = true;
    } finally {
        if (browser) await browser.close();
        if (nextApp) process.kill(nextApp.pid); // Attempt to kill
        // Windows kill
        spawn("taskkill", ["/pid", nextApp.pid.toString(), "/f", "/t"]);
    }

    if (hasError) {
        console.error("\n🚫 Design Verification FAILED.");
        process.exit(1);
    } else {
        console.log("\n✨ Design Verification PASSED.");
        process.exit(0);
    }
}

main();
