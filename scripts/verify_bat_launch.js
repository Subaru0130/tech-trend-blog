const { execSync } = require('child_process');
const http = require('http');
const path = require('path');

function checkPort() {
    return new Promise((resolve) => {
        const req = http.get('http://127.0.0.1:9222/json/version', (res) => {
            resolve(true); // Connected!
        });
        req.on('error', () => resolve(false)); // Failed
    });
}

function killChrome() {
    console.log("🔪 Killing existing Chrome...");
    try { execSync('taskkill /F /IM chrome.exe >nul 2>&1'); } catch (e) { }
}

(async () => {
    console.log("🧪 BATCH FILE LAUNCH VERIFICATION");
    console.log("=================================");

    // 1. Clean Slate
    killChrome();
    await new Promise(r => setTimeout(r, 2000));

    // 2. Launch via Bat
    const batPath = path.join(__dirname, 'start_chrome_quiet.bat');
    console.log(`🚀 Executing: ${batPath}`);

    try {
        execSync(`"${batPath}"`, { stdio: 'inherit' });
    } catch (e) {
        console.error("❁EFailed to execute batch file:", e.message);
        process.exit(1);
    }

    // 3. Wait and Poll
    console.log("⏳ Waiting for Chrome (max 20s)...");
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const alive = await checkPort();
        if (alive) {
            console.log("✁ESUCCESS: Chrome is listening on port 9222!");
            console.log("   (This confirms start_chrome_quiet.bat works)");
            process.exit(0);
        }
        process.stdout.write(".");
    }

    console.log("\n❁EFAILURE: Chrome did not open port 9222 within 20s.");
    process.exit(1);
})();
