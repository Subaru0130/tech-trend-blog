import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadImage(url, filename) {
    if (!url || !url.startsWith('http')) return null;
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) throw new Error(`Status ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const relativePath = `/images/products/${filename}`;
        const filepath = path.join(process.cwd(), 'public', relativePath);

        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(filepath, buffer);
        console.log(`[FixImager] Restored: ${filename}`);
        return relativePath;
    } catch (error) {
        console.warn(`[FixImager] Failed to download ${url}: ${error.message}`);
        return null;
    }
}

async function fixImages(mdxPath) {
    console.log(`Scanning: ${mdxPath}`);
    let content = fs.readFileSync(mdxPath, 'utf8');

    // Regex to find image prop with remote URL (in case some were not replaced)
    // Or finding local paths that don't exist? 
    // Wait, the MDX already has local paths like `/images/products/foo.jpg?v=...`
    // Failing to display means the file at `public/images/products/foo.jpg` is missing.
    // BUT we lost the original URL if we already replaced it in the file!
    // Ah! `RankingCard` component has `image` prop.
    // In `2025-12-11-coffee.mdx`, the image props are ALREADY local: `image: "/images/products/..."`.
    // If we don't have the original URL, we cannot re-download!

    // CHECK: Does the file have original URLs?
    // Let's check the file content again.
    // If it has local paths, we are stuck unless we have the original URLs somewhere.
    // Wait, `verify_products.mjs` stores them? No.

    // PANIC CHECK:
    // If content has `/images/products/prod-...jpg`, and file is missing, we are screwed?
    // NO! The `generate-post.mjs` uses `RankingCard` which has `asin`.
    // We can re-fetch the image from ASIN if needed?
    // Or we can assume the user meant "images are broken" and we need to simple RE-GENERATE the article?
    // But we did manual fixes.

    // STRATEGY:
    // 1. Check if files exist.
    // 2. If missing, we can try to re-scrape using the ASIN found in the card.
    //    ASIN is in `asin="B0..."`.
    //    Amazon Image URL format: `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.LZZZZZZZ.jpg`

    // Let's implement this "ASIN Rescue".

    const asinRegex = /asin="([A-Z0-9]{10})"/g;
    let match;
    const asins = [];
    while ((match = asinRegex.exec(content)) !== null) {
        asins.push(match[1]);
    }

    console.log(`Found ${asins.length} ASINs. Checking images...`);

    for (const asin of asins) {
        // We don't know the exact filename used in the MDX for this ASIN easily because they are decoupled in the text?
        // Actually, in the MDX, `image` and `asin` are usually close.
        // But `RankingCard` has specific props.
        // Let's look for `image="(/images/products/.*?)"` 
        // and see if it exists.
        // But better: Re-download generic images for each ASIN and UPDATE the MDX to point to the new ones.

        const imageUrl = `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.LZZZZZZZ.jpg`;
        const newFilename = `prod-rescue-${asin}.jpg`;
        const localPath = await downloadImage(imageUrl, newFilename);

        if (localPath) {
            // Now replaced the OLD image path associated with this ASIN?
            // It's hard to match exact lines.
            // BUT `RankingCard` uses `image={...}` or `image="..."`.
            // Getting complicate to parse.

            // ALTERNATIVE:
            // Just download them to `public/images/products/` and hope?
            // No we need to update MDX to point to new files.

            // Let's read the MDX line by line.
            // If line has `asin="ASIN"`, look at previous lines for `image="..."`?
            // The structure is:
            // <RankingCard
            //   rank={1}
            //   name="..."
            //   image="..."   <-- We want to replace this
            //   ...
            //   asin="..."
            // />

            // Regex replace attempt:
            // Find the card block?
            // Actually, simple regex: `image="[^"]*?"[\s\S]*?asin="${asin}"` is risk.

            // Simple approach:
            // Just replacing ALL image references is too aggressive.
            // Let's just download the image as `prod-rescue-${asin}.jpg`.
            // Then replace `image="/images/products/.*?"` inside the block that contains `asin="${asin}"`.
        }
    }

    // Actually, I will write a smarter replace.
    // Iterate ASINs. 
    // Generate valid Amazon URL.
    // Download it.
    // Replace the image path in the file for that product.
    // The file has:
    // image="/images/products/old.jpg"
    // ...
    // asin="B0..."

    // We can regex replace:
    // `image="([^"]+)"([\s\S]+?)asin="${asin}"`
    // -> replace group 1 with new path.

    let newContent = content;
    for (const asin of asins) {
        const imageUrl = `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.LZZZZZZZ.jpg`;
        const newFilename = `prod-rescue-${asin}.jpg`;
        const newPath = `/images/products/${newFilename}`;
        await downloadImage(imageUrl, newFilename);

        // Regex to match image prop BEFORE asin prop in the same component
        // Non-greedy match until asin
        const regex = new RegExp(`(image=")([^"]+)("[\\s\\S]*?asin="${asin}")`, 'g');
        newContent = newContent.replace(regex, (m, p1, oldPath, p3) => {
            console.log(`Updating image for ASIN ${asin}: ${oldPath} -> ${newPath}`);
            return `${p1}${newPath}?v=${Date.now()}${p3}`;
        });

        // Also QuickSummary? It has `asin` too.
        // `{ ..., image: "...", ..., asin: "..." }`
        // Regex: `image:\s*"([^"]+)"[\s\S]*?asin:\s*"${asin}"`
        const qsRegex = new RegExp(`(image:\\s*")([^"]+)("[\\s\\S]*?asin:\\s*"${asin}")`, 'g');
        newContent = newContent.replace(qsRegex, (m, p1, oldPath, p3) => {
            console.log(`Updating QuickSummary image for ASIN ${asin}`);
            return `${p1}${newPath}?v=${Date.now()}${p3}`;
        });
    }

    fs.writeFileSync(mdxPath, newContent);
    console.log("Fixed MDX images.");
}

const targetFile = process.argv[2];
if (targetFile) {
    fixImages(targetFile);
} else {
    // Auto-detect verify last modified?
    // Hardcode for now
    fixImages(path.join(process.cwd(), 'content/posts/2025-12-11-コーヒーメーカー.mdx'));
}
