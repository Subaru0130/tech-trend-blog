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
    console.log("側 LOGIN STATUS CHECK");

    // 1. Launch
    console.log("噫 Launching Chrome...");
    execSync(`"${path.join(__dirname, 'start_chrome_quiet.bat')}"`, { stdio: 'inherit' });

    // 2. Wait
    let wsUrl = null;
    for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1000));
        wsUrl = await checkPort();
        if (wsUrl) break;
    }

    if (!wsUrl) { console.error("笶・Failed to connect"); process.exit(1); }

    // 3. Connect
    const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl, defaultViewport: null });
    const page = (await browser.pages())[0] || await browser.newPage();

    // 4. Navigate to Amazon Top
    const url = 'https://www.amazon.co.jp/';
    console.log(`迫 Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 3000));

    // 5. Check Login Elements
    const status = await page.evaluate(() => {
        const signInText = document.body.innerText.includes('繝ｭ繧ｰ繧､繝ｳ') || document.body.innerText.includes('Sign in');
        const accountName = document.querySelector('#nav-link-accountList-nav-line-1')?.innerText || "Unknown";
        const title = document.title;
        return { signInText, accountName, title };
    });

    console.log("================ STATUS ================");
    console.log(`Page Title: ${status.title}`);
    console.log(`Account Name (Header): ${status.accountName}`);
    console.log(`Has 'Sign in' text: ${status.signInText}`);

    if (status.accountName.includes('縺薙ｓ縺ｫ縺｡縺ｯ') || !status.signInText) {
        console.log("笨・JUDGMENT: Likely Logged In");
    } else {
        console.log("笞・・JUDGMENT: Likely NOT Logged In (Cold Session)");
    }

    await browser.disconnect();
})();
