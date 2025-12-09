
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
        const filePath = path.join(postsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Check 0: Basic Frontmatter Existence
        if (!content.startsWith('---')) {
            console.error(`❌ ERROR in ${file}: No Frontmatter found (must start with ---).`);
            hasError = true;
            continue;
        }

        // Check 1: No import statements (Next-MDX-Remote limitation)
        if (/^import\s+.*from/m.test(content)) {
            console.error(`❌ ERROR in ${file}: Found 'import' statement. MDX content should not have imports.`);
            hasError = true;
        }

        // Check 2: Frontmatter Fields (Title, Date, Image)
        const titleMatch = content.match(/title:\s*"(.*?)"/);
        const imageMatch = content.match(/image:\s*(.*?)\n/);

        if (!titleMatch || !titleMatch[1].trim()) {
            console.error(`❌ ERROR in ${file}: Missing or empty 'title' in frontmatter.`);
            hasError = true;
        }

        if (!imageMatch || !imageMatch[1].trim()) {
            console.error(`❌ ERROR in ${file}: Missing 'image' in frontmatter.`);
            hasError = true;
        } else {
            // Check 3: Local Image Existence
            const imagePath = imageMatch[1].trim();
            const localImagePath = path.join(process.cwd(), 'public', imagePath.startsWith('/') ? imagePath.slice(1) : imagePath);
            if (!fs.existsSync(localImagePath)) {
                console.error(`❌ ERROR in ${file}: Image file not found: ${localImagePath}`);
                hasError = true;
            }
        }

        // Check 4: ComparisonTable Integrity
        if (content.includes('<ComparisonTable')) {
            const ranks = (content.match(/rank:/g) || []).length;
            const asins = (content.match(/asin:/g) || []).length;
            if (asins < (ranks / 2)) {
                console.error(`❌ FAIL in ${file}: ComparisonTable missing ASINs. Ranks: ${ranks}, ASINs: ${asins}`);
                hasError = true;
            }
        }

        // Check 5: Forbidden Patterns (AI conversational filler, undefined)
        if (content.match(/Here is the article/i) || content.match(/Here is the high-converting/i)) {
            console.error(`❌ FAIL in ${file}: Found AI conversational filler ('Here is...').`);
            hasError = true;
        }

        // Check for 'undefined' in visible text (simple heuristic)
        if (content.match(/>undefined</) || content.match(/\sundefined\s/)) {
            console.warn(`⚠️ WARN in ${file}: Found 'undefined' in text body. Check generation.`);
            // Warning only for now as it might be code snippet
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
