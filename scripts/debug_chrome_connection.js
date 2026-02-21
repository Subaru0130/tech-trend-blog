const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const http = require('http');
const fs = require('fs');

async function debugChromeConnection() {
    console.log("剥 Debugging Chrome Connection & Login Status...");

    // 1. Try to get WebSocket URL
    let isConnected = false;
    let wsUrl = null;
    try {
        wsUrl = await new Promise((resolve, reject) => {
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
        isConnected = true;
        console.log("   笨・Found Remote Debugging Port (9222) open.");
    } catch (e) {
        console.log("   笶・Could NOT connect to port 9222. Chrome is not running with remote debugging.");
        console.log("      Please close ALL Chrome windows and run:");
        console.log('      Start-Process "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" -ArgumentList "--remote-debugging-port=9222","--user-data-dir=$env:LOCALAPPDATA\\Google\\Chrome\\User Data","--profile-directory=Default"');
        return;
    }

    // 2. Connect Puppeteer
    console.log("   伯 Connecting Puppeteer...");
    const browser = await puppeteer.connect({
        browserWSEndpoint: wsUrl,
        defaultViewport: null
    });

    // 3. Check Login Status
    console.log("   操 Checking Login Status on Amazon...");
    const page = await browser.newPage();
    try {
        await page.goto('https://www.amazon.co.jp/gp/your-account/order-history', { waitUntil: 'domcontentloaded', timeout: 30000 });

        const title = await page.title();
        console.log(`   Page Title: ${title}`);

        const screenshotPath = 'debug_login_status.png';
        await page.screenshot({ path: screenshotPath });
        console.log(`   萄 Saved screenshot to: ${screenshotPath}`);

        if (title.includes('繝ｭ繧ｰ繧､繝ｳ') || title.includes('Sign-In')) {
            console.log("   笞・・RESULT: NOT Logged In. (You need to sign in manually in this window)");
        } else {
            console.log("   笨・RESULT: Logged In! (Accessing Order History successfully)");
        }

    } catch (e) {
        console.log(`   笞・・Navigation failed: ${e.message}`);
    } finally {
        // Don't close browser, just page
        await page.close();
        await browser.disconnect();
        console.log("   窓 Disconnected (Browser left open)");
    }
}

debugChromeConnection();
