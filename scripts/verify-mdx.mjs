
import fs from 'fs';
import path from 'path';

const postsDir = path.join(process.cwd(), 'content', 'posts');

export function verifyMdxFiles() {
    console.log("🔍 Verifying MDX files...");

    if (!fs.existsSync(postsDir)) {
        console.log("No posts directory found.");
        return false;
    }

    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));
    let hasError = false;

    for (const file of files) {
        const content = fs.readFileSync(path.join(postsDir, file), 'utf8');

        // Check 1: No import statements (Next-MDX-Remote limitation)
        if (/^import\s+.*from/m.test(content)) {
            console.error(`❌ ERROR in ${file}: Found 'import' statement. MDX content should not have imports.`);
            hasError = true;
        }

        // Check 2: ComparisonTable should have ASINs if products exist
        // Simple heuristic: if ComparisonTable exists, 'asin:' should appear roughly as many times as 'rank:'
        if (content.includes('<ComparisonTable')) {
            const ranks = (content.match(/rank:/g) || []).length;
            const asins = (content.match(/asin:/g) || []).length;
            // This is a loose check, but good for catching complete failure
            if (asins < (ranks / 2)) {
                console.warn(`⚠️ WARNING in ${file}: Low ASIN count in ComparisonTable? Ranks: ${ranks}, ASINs: ${asins}`);
            }
        }
    }

    if (hasError) {
        console.error("🚨 Verification FAILED.");
        process.exit(1);
    } else {
        console.log("✅ All MDX files verified successfully.");
    }
}

// Allow running directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    verifyMdxFiles();
}
