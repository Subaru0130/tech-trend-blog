
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const TARGET_URL = "https://kakaku.com/item/J0000041936/"; // Sony WF-1000XM5 (Known to have Amazon link)

(async () => {
    console.log("🚀 Starting Amazon Redirect Debug with FIX...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        console.log(`1️⃣  Navigating to Kakaku product page: ${TARGET_URL}`);
        await page.goto(TARGET_URL + '#tab', { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Find Amazon Link
        const amazonInfo = await page.evaluate(() => {
            const allLinks = Array.from(document.querySelectorAll('a'));
            for (const link of allLinks) {
                if (link.innerText.includes('Amazon') && link.href.includes('kakaku.com/shop/')) {
                    return { url: link.href };
                }
            }
            return null;
        });

        if (!amazonInfo) throw new Error("Amazon shop link not found on page.");
        console.log(`2️⃣  Found Amazon Shop Link: ${amazonInfo.url}`);

        // Go to shop page
        await page.goto(amazonInfo.url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Find Forwarder Link
        const forwarderUrl = await page.evaluate(() => {
            return document.querySelector('a[href*="forward.aspx"]')?.href;
        });

        if (!forwarderUrl) throw new Error("Forwarder link not found.");
        console.log(`3️⃣  Found Forwarder Link: ${forwarderUrl}`);
        console.log(`⏳ Attempting redirect with RELAXED wait condition...`);

        // === THE FIX ===
        // Don't wait for 'domcontentloaded' which might hang. 
        // Just trigger navigation and wait for URL to contain 'amazon'

        try {
            // We use Promise.all to ensure we catch the navigation event, 
            // but we use a looser 'response' wait or just rely on waitForFunction.
            const navigatePromise = page.goto(forwarderUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

            // Race: Either navigation completes OR we detect Amazon URL
            await Promise.race([
                navigatePromise.catch(e => console.log("   (Navigation promise rejected, but checking URL...)" + e.message)),
                page.waitForFunction(() => window.location.href.includes('amazon.co.jp'), { timeout: 20000 })
            ]);

        } catch (e) {
            console.log(`   ⚠️ Navigation warning (ignored if URL is correct): ${e.message}`);
        }

        const finalUrl = page.url();
        console.log(`4️⃣  Final URL: ${finalUrl}`);

        if (finalUrl.includes('amazon.co.jp')) {
            console.log("✅ SUCCESS! Reached Amazon.");

            // Extract ASIN
            const asinMatch = finalUrl.match(/\/dp\/([A-Z0-9]{10})/);
            if (asinMatch) {
                console.log(`   📦 ASIN Extracted: ${asinMatch[1]}`);
            }

            // Verify content is accessible (not robot block)
            const title = await page.evaluate(() => document.title);
            console.log(`   📄 Page Title: ${title}`);
        } else {
            console.log("❌ FAILED. Did not reach Amazon.");
        }

    } catch (e) {
        console.error(`❌ Error: ${e.message}`);
    } finally {
        await browser.close();
    }
})();
