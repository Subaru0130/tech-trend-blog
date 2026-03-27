import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const CONTENT_TARGETS = [
    { label: 'articles', dir: path.join(process.cwd(), 'src', 'content', 'articles') },
    { label: 'reviews', dir: path.join(process.cwd(), 'src', 'content', 'reviews') }
];

function collectMarkdownFiles() {
    const today = new Date().toISOString().slice(0, 10);
    const files = [];

    for (const target of CONTENT_TARGETS) {
        if (!fs.existsSync(target.dir)) {
            continue;
        }

        for (const name of fs.readdirSync(target.dir)) {
            if (name.endsWith('.md') || name.endsWith('.mdx')) {
                const fullPath = path.join(target.dir, name);
                const modifiedDate = fs.statSync(fullPath).mtime.toISOString().slice(0, 10);
                if (modifiedDate !== today) {
                    continue;
                }

                files.push({
                    label: target.label,
                    file: name,
                    fullPath
                });
            }
        }
    }

    return files;
}

function getFrontmatterValue(frontmatter, key) {
    const match = frontmatter.match(new RegExp(`^${key}:\\s*"?(.+?)"?$`, 'm'));
    return match ? match[1].trim() : '';
}

export function verifyContentFiles() {
    console.log("🔍 Verifying content files...");

    const files = collectMarkdownFiles();
    if (files.length === 0) {
        console.log("ℹ️ No article or review markdown files updated today were found. Skipping content verification.");
        return;
    }

    let hasError = false;

    for (const entry of files) {
        const content = fs.readFileSync(entry.fullPath, 'utf8');

        if (!content.startsWith('---')) {
            console.error(`❌ ERROR in ${entry.file}: No frontmatter found.`);
            hasError = true;
            continue;
        }

        const parts = content.split('---');
        const frontmatter = parts[1] || '';
        const body = parts.slice(2).join('---').trim();

        const title = getFrontmatterValue(frontmatter, 'title');
        const description = getFrontmatterValue(frontmatter, 'description');
        const thumbnail = getFrontmatterValue(frontmatter, 'thumbnail') || getFrontmatterValue(frontmatter, 'image');
        const date = getFrontmatterValue(frontmatter, 'date');

        if (!title) {
            console.error(`❌ ERROR in ${entry.file}: Missing title.`);
            hasError = true;
        }

        if (!description) {
            console.error(`❌ ERROR in ${entry.file}: Missing description.`);
            hasError = true;
        }

        if (!date) {
            console.error(`❌ ERROR in ${entry.file}: Missing date.`);
            hasError = true;
        }

        if (!thumbnail) {
            console.error(`❌ ERROR in ${entry.file}: Missing thumbnail/image.`);
            hasError = true;
        } else if (thumbnail.startsWith('/')) {
            const localImagePath = path.join(process.cwd(), 'public', thumbnail.slice(1));
            if (!fs.existsSync(localImagePath)) {
                console.error(`❌ ERROR in ${entry.file}: Image file not found: ${localImagePath}`);
                hasError = true;
            }
        }

        if (!body.includes('## ')) {
            console.error(`❌ ERROR in ${entry.file}: Body has no section headings.`);
            hasError = true;
        }

        if (/^import\s+.*from/m.test(content)) {
            console.error(`❌ ERROR in ${entry.file}: Found import statement inside markdown.`);
            hasError = true;
        }

        if (/Here is the article/i.test(content) || /Here is the high-converting/i.test(content)) {
            console.error(`❌ ERROR in ${entry.file}: Found AI conversational filler.`);
            hasError = true;
        }

        if (/\sundefined\s/.test(content) || />undefined</.test(content)) {
            console.error(`❌ ERROR in ${entry.file}: Found 'undefined' in visible content.`);
            hasError = true;
        }

        if (entry.label === 'reviews') {
            const productId = getFrontmatterValue(frontmatter, 'product_id');
            const rankingUrl = getFrontmatterValue(frontmatter, 'ranking_url');
            if (!productId) {
                console.error(`❌ ERROR in ${entry.file}: Missing product_id.`);
                hasError = true;
            }
            if (!rankingUrl) {
                console.error(`❌ ERROR in ${entry.file}: Missing ranking_url.`);
                hasError = true;
            } else if (/^\/articles\//.test(rankingUrl)) {
                console.error(`❌ ERROR in ${entry.file}: ranking_url still points to legacy /articles path.`);
                hasError = true;
            }
        }
    }

    if (hasError) {
        console.error("❌ Content Verification FAILED.");
        process.exit(1);
    }

    console.log("✅ All content files verified successfully.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    verifyContentFiles();
}
