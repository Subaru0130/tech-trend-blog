import puppeteer from 'puppeteer';

const TARGET_URL = 'https://tech-trend-blog-27mo.vercel.app';

async function verifyLiveSite() {
    console.log(`Starting verification for: ${TARGET_URL}`);
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set generous timeout
    page.setDefaultNavigationTimeout(60000);

    const pagesToCheck = [
        {
            slug: '/posts/2025-12-09-%E5%8A%A0%E6%B9%BF%E5%99%A8',
            expectedTitleFragment: '象印・ダイニチ・パナソニック徹底比較',
            expectedImageFragment: 'hero-humidifier-v2.png'
        },
        {
            slug: '/posts/2025-12-07-%E6%9C%80%E6%96%B0%E3%83%98%E3%82%A2%E3%83%89%E3%83%A9%E3%82%A4%E3%83%A4%E3%83%BC',
            expectedTitleFragment: 'パナソニック・ダイソン・リファ徹底比較',
            expectedImageFragment: 'hero-humidifier-v2.png' // Wait, dryer should not have humidifier image. Checking logic.
        }
    ];

    for (const check of pagesToCheck) {
        const url = `${TARGET_URL}${check.slug}`;
        console.log(`\nChecking: ${url}`);
        try {
            await page.goto(url, { waitUntil: 'networkidle0' });

            const title = await page.title();
            const h1 = await page.$eval('h1', el => el.innerText).catch(() => 'NO H1 FOUND');

            // Check Hero Image
            const heroSrc = await page.evaluate(() => {
                const img = document.querySelector('img[alt]');
                // Assuming hero is often the first image or main one. 
                // Better selector: div.aspect-video img
                const hero = document.querySelector('div.aspect-video img');
                return hero ? hero.src : 'NO HERO FOUND';
            });

            console.log(`[Actual Title]: ${title}`);
            console.log(`[Actual H1]: ${h1}`);
            console.log(`[Actual Hero]: ${heroSrc}`);

            const titleOk = title.includes(check.expectedTitleFragment) || h1.includes(check.expectedTitleFragment);
            // Note: Browser might encode URL in src.
            const imageOk = heroSrc.includes(check.expectedImageFragment) || (check.slug.includes('ドライヤー') && !heroSrc.includes('humidifier'));

            if (titleOk) console.log("✅ Title Update Clean: SUCCESS");
            else console.error(`❌ Title Mismatch. Expected fragment: "${check.expectedTitleFragment}"`);

            if (check.slug.includes('ドライヤー')) {
                if (heroSrc.includes('hero-dryer')) console.log("✅ Image OK (Dryer)");
                else console.error(`❌ Image Mismatch. Got: ${heroSrc}`);
            } else {
                if (heroSrc.includes(check.expectedImageFragment)) console.log("✅ Image Update Clean: SUCCESS (v2 verified)");
                else console.error(`❌ Image Mismatch. Expected fragment: "${check.expectedImageFragment}", Got: ${heroSrc}`);
            }

        } catch (e) {
            console.error(`Error visiting ${url}:`, e.message);
        }
    }

    await browser.close();
}

verifyLiveSite();
