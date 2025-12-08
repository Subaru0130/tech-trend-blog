
import fs from 'fs';
import path from 'path';

function checkSEO() {
    console.log("🔍 Starting SEO Configuration Check...");
    let errors = [];

    // 1. Check Sitemap existence
    const sitemapPath = path.join(process.cwd(), 'src/app/sitemap.ts');
    if (fs.existsSync(sitemapPath)) {
        console.log("✅ sitemap.ts exists.");
    } else {
        errors.push("❌ sitemap.ts is MISSING.");
    }

    // 2. Check Robots.txt existence
    const robotsPath = path.join(process.cwd(), 'src/app/robots.ts');
    if (fs.existsSync(robotsPath)) {
        console.log("✅ robots.ts exists.");
    } else {
        errors.push("❌ robots.ts is MISSING.");
    }

    // 3. Check JSON-LD in Root Layout
    const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
    if (fs.existsSync(layoutPath)) {
        const content = fs.readFileSync(layoutPath, 'utf8');
        // Check for WebSite schema with flexible quoting
        if (content.includes('application/ld+json') && (content.includes("'@type': 'WebSite'") || content.includes('"@type": "WebSite"'))) {
            console.log("✅ Root Layout contains 'WebSite' JSON-LD.");
        } else {
            console.warn("⚠️  Root Layout content snippet:\n" + content.substring(0, 500)); // Debug
            errors.push("❌ Root Layout MISSING 'WebSite' JSON-LD.");
        }
    }

    // 4. Check JSON-LD in Post Page
    const postPagePath = path.join(process.cwd(), 'src/app/posts/[slug]/page.tsx');
    if (fs.existsSync(postPagePath)) {
        const content = fs.readFileSync(postPagePath, 'utf8');
        if (content.includes('application/ld+json') && (content.includes("'@type': 'BlogPosting'") || content.includes('"@type": "BlogPosting"'))) {
            console.log("✅ Post Page contains 'BlogPosting' JSON-LD.");
        } else {
            errors.push("❌ Post Page MISSING 'BlogPosting' JSON-LD.");
        }
    }

    console.log("\n--- SEO Check Result ---");
    if (errors.length > 0) {
        errors.forEach(e => console.error(e));
        console.error("🚨 SEO Check FAILED.");
        process.exit(1);
    } else {
        console.log("✅ All SEO configurations are correct.");
    }
}

checkSEO();
