const puppeteer = require('puppeteer');

async function investigateKakakuFilterURL() {
    const browser = await puppeteer.launch({ headless: false }); // visible browser
    const page = await browser.newPage();

    console.log('1. Navigating to Kakaku headphones ranking...');
    await page.goto('https://kakaku.com/kaden/headphones/ranking_2046/', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });
    await new Promise(r => setTimeout(r, 3000));

    console.log('2. Looking for ノイズキャンセリング filter link...');

    // Find all links and look for feature filter
    const filterInfo = await page.evaluate(() => {
        const results = [];

        // Look for links containing feature keywords
        document.querySelectorAll('a').forEach(a => {
            const text = a.innerText?.trim() || '';
            const href = a.href || '';

            if (text.includes('ノイズキャンセリング') ||
                href.includes('spec') ||
                href.includes('pdf_Spec')) {
                results.push({
                    text: text.slice(0, 50),
                    href: href
                });
            }
        });

        // Also check for checkboxes/inputs
        document.querySelectorAll('input[type="checkbox"], label').forEach(el => {
            const text = el.innerText || el.getAttribute('value') || '';
            if (text.includes('ノイズ')) {
                results.push({
                    text: 'CHECKBOX: ' + text.slice(0, 50),
                    href: 'form input'
                });
            }
        });

        return results;
    });

    console.log('3. Found filter-related elements:');
    filterInfo.forEach(f => console.log(`   - ${f.text}: ${f.href}`));

    // Try to find and click NC filter
    const ncLink = await page.$('a[href*="pdf_Spec"]');
    if (ncLink) {
        console.log('4. Found spec filter link, clicking...');
        await ncLink.click();
        await new Promise(r => setTimeout(r, 3000));
        console.log('5. New URL after click:', page.url());
    } else {
        console.log('4. Looking for NC in feature list...');
        const ncElement = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a'));
            const nc = links.find(a => a.innerText.includes('ノイズキャンセリング'));
            return nc ? { href: nc.href, text: nc.innerText.slice(0, 30) } : null;
        });
        console.log('   NC element found:', ncElement);
    }

    // Keep browser open for manual inspection
    console.log('\n=== Browser left open for inspection. Press Ctrl+C to close. ===');
    await new Promise(r => setTimeout(r, 60000));

    await browser.close();
}

investigateKakakuFilterURL().catch(console.error);
