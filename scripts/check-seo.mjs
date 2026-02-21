
import fs from 'fs';
import path from 'path';

function checkSEO() {
    console.log("剥 Starting SEO Configuration Check...");
    let errors = [];

    // 1. Check Sitemap existence
    const sitemapPath = path.join(process.cwd(), 'src/app/sitemap.ts');
    if (fs.existsSync(sitemapPath)) {
        console.log("笨・sitemap.ts exists.");
    } else {
        errors.push("笶・sitemap.ts is MISSING.");
    }

    // 2. Check Robots.txt existence
    const robotsPath = path.join(process.cwd(), 'src/app/robots.ts');
    if (fs.existsSync(robotsPath)) {
        console.log("笨・robots.ts exists.");
    } else {
        errors.push("笶・robots.ts is MISSING.");
    }

    // 3. Check JSON-LD in Root Layout
    const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
    if (fs.existsSync(layoutPath)) {
        const content = fs.readFileSync(layoutPath, 'utf8');
        // Check for WebSite schema with flexible quoting
        if (content.includes('application/ld+json') && (content.includes("'@type': 'WebSite'") || content.includes('"@type": "WebSite"'))) {
            console.log("笨・Root Layout contains 'WebSite' JSON-LD.");
        } else {
            console.warn("笞・・ Root Layout content snippet:\n" + content.substring(0, 500)); // Debug
            errors.push("笶・Root Layout MISSING 'WebSite' JSON-LD.");
        }
    }

    // 4. Check JSON-LD in Post Page
    const postPagePath = path.join(process.cwd(), 'src/app/posts/[slug]/page.tsx');
    if (fs.existsSync(postPagePath)) {
        const content = fs.readFileSync(postPagePath, 'utf8');
        if (content.includes('application/ld+json') && (content.includes("'@type': 'BlogPosting'") || content.includes('"@type": "BlogPosting"'))) {
            console.log("笨・Post Page contains 'BlogPosting' JSON-LD.");
        } else {
            errors.push("笶・Post Page MISSING 'BlogPosting' JSON-LD.");
        }
    }

    console.log("\n--- SEO Check Result ---");
    if (errors.length > 0) {
        errors.forEach(e => console.error(e));
        console.error("圷 SEO Check FAILED.");
        process.exit(1);
    } else {
        console.log("笨・All SEO configurations are correct.");
    }
}

checkSEO();
