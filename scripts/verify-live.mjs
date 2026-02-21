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
            expectedTitleFragment: '縲仙刈貉ｿ蝎ｨ縲代♀縺吶☆繧・,
            expectedImageFragment: 'hero-humidifier-gen.png'
        },
        {
            slug: '/posts/2025-12-07-%E6%9C%80%E6%96%B0%E3%83%98%E3%82%A2%E3%83%89%E3%83%A9%E3%82%A4%E3%83%A4%E3%83%BC',
            expectedTitleFragment: '縲舌・繧｢繝峨Λ繧､繝､繝ｼ縲醍ｾ主ｮｹ蟶ｫ縺翫☆縺吶ａ',
            expectedImageFragment: 'hero-dryer-v3.png'
        },
        {
            slug: '/posts/2025-12-10-%E7%A9%BA%E6%B0%97%E6%B8%85%E6%B5%84%E6%A9%9F',
            expectedTitleFragment: '縲千ｩｺ豌玲ｸ・ｵ・ｩ溘代♀縺吶☆繧・,
            expectedImageFragment: 'hero-air-purifier-gen.png'
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

            // Check Affiliate Links in Conclusion/Body
            const affiliateLinks = await page.evaluate(() => {
                // Select links inside the prose content
                const links = Array.from(document.querySelectorAll('.prose a'));
                return links.map(a => ({
                    text: a.innerText,
                    href: a.href
                }));
            });

            console.log(`[Actual Title]: ${title}`);
            console.log(`[Actual H1]: ${h1}`);
            console.log(`[Actual Hero]: ${heroSrc}`);

            // Filter for amazon/rakuten links
            const monetizableLinks = affiliateLinks.filter(l => l.href.includes('amazon.co.jp') || l.href.includes('rakuten.co.jp'));
            console.log(`[Found ${monetizableLinks.length} monetizable links]`);

            let linksOk = true;
            monetizableLinks.forEach(l => {
                const isTagged = l.href.includes('tag=') || l.href.includes('a_id=');
                console.log(` - Link "${l.text}": ${isTagged ? 'OK' : 'MISSING TAG'} (${l.href})`);
                if (!isTagged) linksOk = false;
            });

            const titleOk = title.includes(check.expectedTitleFragment) || h1.includes(check.expectedTitleFragment);
            // Note: Browser might encode URL in src.
            const imageOk = heroSrc.includes(check.expectedImageFragment) || (check.slug.includes('繝峨Λ繧､繝､繝ｼ') && !heroSrc.includes('humidifier'));

            if (titleOk) console.log("笨・Title Update Clean: SUCCESS");
            else console.error(`笶・Title Mismatch. Expected fragment: "${check.expectedTitleFragment}"`);

            if (check.slug.includes('繝峨Λ繧､繝､繝ｼ')) {
                if (heroSrc.includes('hero-dryer')) console.log("笨・Image OK (Dryer)");
                else console.error(`笶・Image Mismatch. Got: ${heroSrc}`);
            } else {
                if (heroSrc.includes(check.expectedImageFragment)) console.log("笨・Image Update Clean: SUCCESS (v2 verified)");
                else console.error(`笶・Image Mismatch. Expected fragment: "${check.expectedImageFragment}", Got: ${heroSrc}`);
            }

            if (linksOk && monetizableLinks.length > 0) console.log("笨・Affiliate Links: ALL TAGGED");
            else if (monetizableLinks.length === 0) console.warn("笞・・No monetizable links found in body.");
            else console.error("笶・Affiliate Links: FAILED (Some links missing tags)");

        } catch (e) {
            console.error(`Error visiting ${url}:`, e.message);
        }
    }

    await browser.close();
}

verifyLiveSite();
