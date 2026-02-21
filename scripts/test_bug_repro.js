const { execSync } = require('child_process');
const http = require('http');

const userDataPath = process.env.LOCALAPPDATA + "\\Google\\Chrome\\User Data";

// 1. The Broken Command (What was in the code before)
// Note: ${userDataPath} is NOT wrapped in quotes inside the argument list
const badCommand = `Start-Process 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' -ArgumentList '--remote-debugging-port=9222', '--user-data-dir=${userDataPath}', '--profile-directory=Default'`;

// 2. The Fixed Command (What I changed it to)
// Note: "${userDataPath}" IS wrapped in quotes
const goodCommand = `Start-Process 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' -ArgumentList '--remote-debugging-port=9222', '--user-data-dir="${userDataPath}"', '--profile-directory=Default'`;

function checkPort() {
    return new Promise((resolve) => {
        const req = http.get('http://127.0.0.1:9222/json/version', (res) => {
            resolve(true); // Connected!
        });
        req.on('error', () => resolve(false)); // Failed
    });
}

function killChrome() {
    try { execSync('taskkill /F /IM chrome.exe >nul 2>&1'); } catch (e) { }
}

(async () => {
    console.log("🧪 SUGGESTED ROOT CAUSE VERIFICATION");
    console.log("====================================");

    // --- TEST 1: The "Old" Code ---
    console.log("\n💥 TEST 1: Running OLD (Buggy) Command...");
    console.log(`   Command: ... --user-data-dir=${userDataPath} ... (No Quotes)`);

    killChrome();
    try {
        execSync(`powershell -Command "${badCommand}"`, { stdio: 'ignore' });
        console.log("   👉 Chrome launched.");
    } catch (e) { console.log("   ❁ELaunch failed."); }

    // Wait for start
    await new Promise(r => setTimeout(r, 3000));

    const oldSuccess = await checkPort();
    if (oldSuccess) {
        console.log("   ❁EUNEXPECTED: Old command worked? (Maybe path has no spaces?)");
    } else {
        console.log("   ✁EPROOF: Old command FAILED directly connecting to 9222. (Expected Failure)");
        console.log("      (Chrome likely opened 'Data' as a URL instead of loading the profile)");
    }

    // --- TEST 2: The "New" Code ---
    console.log("\n✨ TEST 2: Running NEW (Fixed) Command...");
    console.log(`   Command: ... --user-data-dir="${userDataPath}" ... (With Quotes)`);

    killChrome();
    try {
        execSync(`powershell -Command "${goodCommand}"`, { stdio: 'ignore' });
        console.log("   👉 Chrome launched.");
    } catch (e) { console.log("   ❁ELaunch failed."); }

    // Wait for start
    await new Promise(r => setTimeout(r, 3000));

    const newSuccess = await checkPort();
    if (newSuccess) {
        console.log("   ✁EPROOF: New command SUCCEEDED connecting to 9222.");
    } else {
        console.log("   ❁ESomething else is wrong. New command also failed.");
    }

    console.log("\n====================================");
    if (!oldSuccess && newSuccess) {
        console.log("🏆 CONCLUSION: The missing quotes were definitely the root cause.");
    } else {
        console.log("🤁ECONNECTION: Results inconclusive.");
    }

    // Cleanup
    killChrome();
})();
