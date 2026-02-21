const { execSync, spawn } = require('child_process');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const http = require('http');
puppeteer.use(StealthPlugin());

async function debugResetStrategy() {
    console.log("屏・・Testing 'Reset & Launch' Strategy...");

    // 1. Force Kill ALL Chrome Processes
    console.log("   八 Killing all running Chrome processes...");
    try {
        execSync('taskkill /F /IM chrome.exe');
        console.log("   笨・Chrome killed successfully.");
    } catch (e) {
        console.log("   邃ｹ・・No Chrome processes found (or kill failed). Continuing...");
    }

    // Wait a moment for OS cleanup
    await new Promise(r => setTimeout(r, 2000));

    // 2. Launch Chrome via PowerShell (Corrected Quoting)
    console.log("   噫 Launching Chrome via PowerShell (Start-Process)...");

    // Resolve path in Node to avoid quote complexity with $env inside string
    const userDataPath = process.env.LOCALAPPDATA + "\\Google\\Chrome\\User Data";

    // Use SINGLE QUOTES for internal PowerShell strings to avoid conflict with CMD double quotes
    // Note: PowerShell treats '...' as literal string (no expansion needed now)
    const psCommand = `Start-Process 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' -ArgumentList '--remote-debugging-port=9222', '--user-data-dir=${userDataPath}', '--profile-directory=Default', 'https://www.amazon.co.jp/gp/your-account/order-history'`;

    console.log(`   統 Command: powershell -Command "${psCommand}"`);

    try {
        // Wrap entire PS command in double quotes for CMD
        execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
    } catch (launchErr) {
        console.error("   笶・Failed to launch Chrome via PowerShell:", launchErr.message);
        return;
    }

    // No process reference with execSync, just wait
    // chromeProcess variable removed

    console.log("   竢ｳ Waiting for Chrome to initialize (5s)...");
    await new Promise(r => setTimeout(r, 5000));

    // 3. Connect Puppeteer
    console.log("   伯 Connecting Puppeteer to port 9222...");
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
        console.log("   笨・Puppeteer Connected!");

        // 4. Verify Login via Page Title
        const pages = await browser.pages();
        const page = pages[0] || await browser.newPage(); // Use existing tab if available
        const title = await page.title();
        console.log(`   塘 Current Page Title: "${title}"`);

        const screenshotPath = 'debug_reset_result.png';
        await page.screenshot({ path: screenshotPath });
        console.log(`   萄 Screenshot saved: ${screenshotPath}`);

        if (title.includes('繝ｭ繧ｰ繧､繝ｳ') || title.includes('Sign-In')) {
            console.log("   笞・・RESULT: Not Logged In. (Default profile might not be the right one?)");
        } else {
            console.log("   笨・RESULT: SUCCESS! Logged In.");
        }

        // Leave browser OPEN for user to see
        console.log("   窓 Script finished. Browser left open.");
        browser.disconnect();

    } catch (e) {
        console.error(`   笶・Connection Failed: ${e.message}`);
    }
}

debugResetStrategy();
