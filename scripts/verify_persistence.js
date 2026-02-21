const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const http = require('http');
const path = require('path');

async function getWsUrl() {
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
    console.log("ｧｪ VERIFYING CHROME PERSISTENCE");

    // 1. Launch
    console.log("1・鞘Ε  Launching Chrome (if needed)...");
    execSync(`"${path.join(__dirname, 'start_chrome_quiet.bat')}"`, { stdio: 'inherit' });

    // Wait for start
    let wsUrl = null;
    for (let i = 0; i < 10; i++) {
        wsUrl = await getWsUrl();
        if (wsUrl) break;
        await new Promise(r => setTimeout(r, 500));
    }
    if (!wsUrl) { console.error("笶・Launch failed"); process.exit(1); }
    console.log("   笨・Chrome Running.");

    // 2. Connect Cycle 1
    console.log("2・鞘Ε  Connecting (Session 1)...");
    const browser1 = await puppeteer.connect({ browserWSEndpoint: wsUrl, defaultViewport: null });
    const page1 = await browser1.newPage();
    console.log("   Process 1 connected. Doing work...");
    await new Promise(r => setTimeout(r, 1000));

    // 3. The Crucial Step: DISCONNECT
    console.log("3・鞘Ε  Disconnecting (NOT Closing)...");
    await browser1.disconnect();
    console.log("   笨・Disconnected.");

    // 4. Verify Persistence
    console.log("4・鞘Ε  Checking if Chrome is still alive...");
    await new Promise(r => setTimeout(r, 2000)); // Wait a bit

    const wsUrl2 = await getWsUrl();
    if (!wsUrl2) {
        console.error("笶・FAIL: Chrome died after disconnect!");
        process.exit(1);
    }
    console.log("   笨・Chrome is still alive!");

    // 5. Connect Cycle 2
    console.log("5・鞘Ε  Re-Connecting (Session 2)...");
    try {
        const browser2 = await puppeteer.connect({ browserWSEndpoint: wsUrl2, defaultViewport: null });
        console.log("   笨・Re-connected successfully!");
        await browser2.disconnect();
        console.log("\n脂 PERSISTENCE CONFIRMED: Chrome survived the cycle.");
        process.exit(0);
    } catch (e) {
        console.error("笶・FAIL: Could not re-connect:", e.message);
        process.exit(1);
    }
})();
