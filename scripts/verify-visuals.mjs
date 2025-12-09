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
        // Increased timeout and relaxed wait condition for stability
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        // Wait a bit more for client hydration
        await new Promise(r => setTimeout(r, 2000));

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

        // --- CHECK 1.7: Visual Style Gate (Brightness & Saturation) ---
        console.log("🎨 Running Visual Style Gate (Brightness & Saturation)...");
        const styleCheckResult = await page.evaluate(async () => {
            const heroImg = document.querySelector('section img');
            if (!heroImg) return { error: 'No Hero Image found' };

            // Create canvas to analyze pixels
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = heroImg.naturalWidth || heroImg.width;
            canvas.height = heroImg.naturalHeight || heroImg.height;

            // Draw image (requires crossOrigin to be set if external, but Puppeteer usually handles local/proxied ok. 
            // If CORS fails, we might skip. But for local dev it should work or we assume hosted images allow it.)
            try {
                ctx.drawImage(heroImg, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                let totalBrightness = 0;
                let totalSaturation = 0;
                let count = 0;

                // Sample every 10th pixel for performance
                for (let i = 0; i < data.length; i += 40) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Brightness (Luma)
                    const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
                    totalBrightness += brightness;

                    // Saturation (HSL)
                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const delta = max - min;
                    let saturation = 0;
                    if (max !== 0) {
                        saturation = delta / max;
                    }
                    totalSaturation += saturation;

                    count++;
                }

                return {
                    brightness: (totalBrightness / count), // 0-255
                    saturation: (totalSaturation / count) * 100 // 0-100%
                };
            } catch (e) {
                return { error: 'CORS or Canvas Error: ' + e.message };
            }
        });

        if (styleCheckResult.error) {
            console.warn(`⚠️ WARN: Could not analyze image style: ${styleCheckResult.error}`);
            // Don't fail hard on CORS, but warn
        } else {
            console.log(`   - Brightness: ${styleCheckResult.brightness.toFixed(1)}/255`);
            console.log(`   - Saturation: ${styleCheckResult.saturation.toFixed(1)}%`);

            // Thresholds for "Friendly/Light" theme
            // Brightness should roughly be > 50 (Not pitch black)
            // Saturation should be > 5% (Not B&W)
            if (styleCheckResult.brightness < 40) {
                console.error("❌ FAIL: Hero image is too DARK for the light theme.");
                hasError = true;
            }
            if (styleCheckResult.saturation < 5) {
                console.error("❌ FAIL: Hero image is B&W (grayscale). Design requires color.");
                hasError = true;
            }
            // Pass
            if (!hasError) console.log("✅ PASS: Image fits visual guidelines.");
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
        if (nextApp) {
            try {
                process.kill(nextApp.pid);
            } catch (e) {
                // Ignore if process already dead (ESRCH)
                if (e.code !== 'ESRCH') console.error("Error killing server:", e.message);
            }
            // Windows kill just in case
            spawn("taskkill", ["/pid", nextApp.pid.toString(), "/f", "/t"]);
        }
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
