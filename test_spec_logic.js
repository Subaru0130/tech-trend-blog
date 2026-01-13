/**
 * Final Verification Test for Spec Extraction
 */
const puppeteer = require('puppeteer');

async function testFinalSpec() {
    console.log("🧪 Final Spec Extraction Verification\n");

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        const specUrl = 'https://kakaku.com/item/K0001709588/spec/';

        console.log(`🔗 Visiting: ${specUrl}`);
        await page.goto(specUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        // Same logic as updated market_research.js
        const specData = await page.evaluate(() => {
            const specs = {};

            document.querySelectorAll('table tr, .specList tr, [class*="spec"] tr').forEach(row => {
                const th = row.querySelector('th, dt, .specName');
                const td = row.querySelector('td, dd, .specValue');
                if (th && td) {
                    const key = th.innerText?.trim().replace(/\s+/g, ' ') || '';
                    const value = td.innerText?.trim().replace(/\s+/g, ' ') || '';
                    if (key && value && key.length < 50) {
                        specs[key] = value;
                    }
                }
            });

            document.querySelectorAll('dl').forEach(dl => {
                const dts = dl.querySelectorAll('dt');
                const dds = dl.querySelectorAll('dd');
                dts.forEach((dt, i) => {
                    if (dds[i]) {
                        const key = dt.innerText?.trim() || '';
                        const value = dds[i].innerText?.trim() || '';
                        if (key && value && key.length < 50) {
                            specs[key] = value;
                        }
                    }
                });
            });

            return specs;
        });

        const specCount = Object.keys(specData).length;
        console.log(`📋 Specs found: ${specCount} items\n`);

        // Updated NC detection logic
        const specStr = JSON.stringify(specData).toLowerCase();
        const specKeys = Object.keys(specData);

        const ncKey = specKeys.find(k =>
            k.includes('ノイズキャンセリング') ||
            k.includes('ノイズキャンセル') ||
            k.includes('NC') ||
            k.includes('ANC')
        );

        let hasNoiseCancel = false;
        if (ncKey) {
            const ncValue = specData[ncKey];
            hasNoiseCancel = ncValue === '○' ||
                ncValue.includes('対応') ||
                ncValue.includes('あり') ||
                ncValue.includes('搭載');
            console.log(`✅ NC Key found: "${ncKey}" = "${ncValue}"`);
        } else {
            hasNoiseCancel = specStr.includes('ノイズキャンセ') ||
                specStr.includes('anc') ||
                specStr.includes('外音取り込み');
            if (hasNoiseCancel) {
                console.log(`✅ NC detected via value search (外音取り込み or ANC mention)`);
            }
        }

        console.log(`\n🎯 hasNoiseCancel: ${hasNoiseCancel}`);

        // Check for 外音取り込み
        if (specData['外音取り込み']) {
            console.log(`🔊 外音取り込み: ${specData['外音取り込み']}`);
        }

        if (specCount >= 5 && hasNoiseCancel) {
            console.log("\n✅✅ SUCCESS: Spec extraction and NC detection working!");
        } else if (specCount >= 5) {
            console.log("\n⚠️ PARTIAL: Specs extracted but NC detection failed");
        } else {
            console.log("\n❌ FAILURE: Not enough specs extracted");
        }

    } catch (e) {
        console.error("❌ Error:", e.message);
    } finally {
        await browser.close();
    }
}

testFinalSpec();
