const { execSync, spawn } = require('child_process');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const http = require('http');
puppeteer.use(StealthPlugin());

async function debugResetStrategy() {
    console.log("🛠️ Testing 'Reset & Launch' Strategy...");

    // 1. Force Kill ALL Chrome Processes
    console.log("   🔪 Killing all running Chrome processes...");
    try {
        execSync('taskkill /F /IM chrome.exe');
        console.log("   ✅ Chrome killed successfully.");
    } catch (e) {
        console.log("   ℹ️ No Chrome processes found (or kill failed). Continuing...");
    }

    // Wait a moment for OS cleanup
    await new Promise(r => setTimeout(r, 2000));

    // 2. Launch Chrome via PowerShell (Corrected Quoting)
    console.log("   🚀 Launching Chrome via PowerShell (Start-Process)...");

    // Resolve path in Node to avoid quote complexity with $env inside string
    const userDataPath = process.env.LOCALAPPDATA + "\\Google\\Chrome\\User Data";

    // Use SINGLE QUOTES for internal PowerShell strings to avoid conflict with CMD double quotes
    // Note: PowerShell treats '...' as literal string (no expansion needed now)
    const psCommand = `Start-Process 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' -ArgumentList '--remote-debugging-port=9222', '--user-data-dir=${userDataPath}', '--profile-directory=Default', 'https://www.amazon.co.jp/gp/your-account/order-history'`;

    console.log(`   📝 Command: powershell -Command "${psCommand}"`);

    try {
        // Wrap entire PS command in double quotes for CMD
        execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
    } catch (launchErr) {
        console.error("   ❌ Failed to launch Chrome via PowerShell:", launchErr.message);
        return;
    }

    // No process reference with execSync, just wait
    // chromeProcess variable removed

    console.log("   ⏳ Waiting for Chrome to initialize (5s)...");
    await new Promise(r => setTimeout(r, 5000));

    // 3. Connect Puppeteer
    console.log("   🔌 Connecting Puppeteer to port 9222...");
    try {
        const wsUrl = await new Promise((resolve, reject) => {
            const req = http.get('http://127.0.0.1:9222/json/version', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        resolve(json.webSocketDebuggerUrl);
                    } catch (e) { reject(e); }
                });
            });
            req.on('error', reject);
            req.setTimeout(2000, () => { req.destroy(); reject(new Error('timeout')); });
        });

        const browser = await puppeteer.connect({
            browserWSEndpoint: wsUrl,
            defaultViewport: null
        });
        console.log("   ✅ Puppeteer Connected!");

        // 4. Verify Login via Page Title
        const pages = await browser.pages();
        const page = pages[0] || await browser.newPage(); // Use existing tab if available
        const title = await page.title();
        console.log(`   📄 Current Page Title: "${title}"`);

        const screenshotPath = 'debug_reset_result.png';
        await page.screenshot({ path: screenshotPath });
        console.log(`   📸 Screenshot saved: ${screenshotPath}`);

        if (title.includes('ログイン') || title.includes('Sign-In')) {
            console.log("   ⚠️ RESULT: Not Logged In. (Default profile might not be the right one?)");
        } else {
            console.log("   ✅ RESULT: SUCCESS! Logged In.");
        }

        // Leave browser OPEN for user to see
        console.log("   👋 Script finished. Browser left open.");
        browser.disconnect();

    } catch (e) {
        console.error(`   ❌ Connection Failed: ${e.message}`);
    }
}

debugResetStrategy();
