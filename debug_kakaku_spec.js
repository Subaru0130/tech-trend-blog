/**
 * Debug Kakaku Spec Page HTML Structure
 * Puppeteer script to find correct selectors
 * Using correct earphone product URL
 */
const puppeteer = require('puppeteer');

async function debugKakakuSpec() {
    console.log("🔍 Debugging Kakaku Spec Page Structure\n");

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        // Correct URL: Sony WF-1000XM5 earphones (not case)
        const specUrl = 'https://kakaku.com/item/K0001709588/spec/';

        console.log(`🔗 Visiting: ${specUrl}`);
        await page.goto(specUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        // Dump page structure info
        const pageInfo = await page.evaluate(() => {
            const info = {
                tables: [],
                dls: [],
                specContainers: [],
                ncMention: null
            };

            // Check all tables
            document.querySelectorAll('table').forEach((table, i) => {
                const rows = table.querySelectorAll('tr');
                const sample = [];
                rows.forEach((row, j) => {
                    if (j < 5) { // First 5 rows as sample
                        const th = row.querySelector('th')?.innerText?.trim().slice(0, 40);
                        const td = row.querySelector('td')?.innerText?.trim().slice(0, 40);
                        if (th || td) sample.push({ th, td });
                    }
                });
                if (sample.length > 0) {
                    info.tables.push({
                        index: i,
                        className: table.className,
                        rowCount: rows.length,
                        sample
                    });
                }
            });

            // Check all definition lists
            document.querySelectorAll('dl').forEach((dl, i) => {
                const dts = dl.querySelectorAll('dt');
                const dds = dl.querySelectorAll('dd');
                const sample = [];
                dts.forEach((dt, j) => {
                    if (j < 3 && dds[j]) {
                        sample.push({
                            dt: dt.innerText?.trim().slice(0, 40),
                            dd: dds[j].innerText?.trim().slice(0, 40)
                        });
                    }
                });
                if (sample.length > 0) {
                    info.dls.push({
                        index: i,
                        className: dl.className,
                        dtCount: dts.length,
                        sample
                    });
                }
            });

            // Find spec-related containers
            document.querySelectorAll('[class*="spec"], [class*="Spec"]').forEach(el => {
                info.specContainers.push({
                    tagName: el.tagName,
                    className: el.className,
                    childCount: el.children.length
                });
            });

            // Find where "ノイズキャンセリング" appears
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT
            );
            while (walker.nextNode()) {
                if (walker.currentNode.textContent.includes('ノイズキャンセリング')) {
                    const parent = walker.currentNode.parentElement;
                    info.ncMention = {
                        parentTag: parent?.tagName,
                        parentClass: parent?.className,
                        grandparentTag: parent?.parentElement?.tagName,
                        grandparentClass: parent?.parentElement?.className,
                        text: walker.currentNode.textContent.trim().slice(0, 50)
                    };
                    break;
                }
            }

            return info;
        });

        console.log("\n📊 Tables found:");
        pageInfo.tables.forEach(t => {
            console.log(`  [${t.index}] class="${t.className}" rows=${t.rowCount}`);
            t.sample.forEach(s => console.log(`      th: ${s.th} | td: ${s.td}`));
        });

        console.log("\n📋 Definition Lists found:");
        pageInfo.dls.forEach(d => {
            console.log(`  [${d.index}] class="${d.className}" items=${d.dtCount}`);
            d.sample.forEach(s => console.log(`      dt: ${s.dt} | dd: ${s.dd}`));
        });

        console.log("\n🔧 Spec-related containers:");
        pageInfo.specContainers.slice(0, 5).forEach(c => {
            console.log(`  <${c.tagName}> class="${c.className}" children=${c.childCount}`);
        });

        console.log("\n🔍 ノイズキャンセリング mention:");
        if (pageInfo.ncMention) {
            console.log(`  Parent: <${pageInfo.ncMention.parentTag}> class="${pageInfo.ncMention.parentClass}"`);
            console.log(`  Grandparent: <${pageInfo.ncMention.grandparentTag}> class="${pageInfo.ncMention.grandparentClass}"`);
            console.log(`  Text: "${pageInfo.ncMention.text}"`);
        } else {
            console.log("  Not found on page!");
        }

    } catch (e) {
        console.error("❌ Error:", e.message);
    } finally {
        await browser.close();
    }
}

debugKakakuSpec();
