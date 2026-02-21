const fs = require('fs');
const path = require('path');

const REVIEWS_DIR = path.join(process.cwd(), 'src/content/reviews');

function cleanSpecsFromReviews() {
    if (!fs.existsSync(REVIEWS_DIR)) {
        console.error("Reviews directory not found.");
        return;
    }

    const files = fs.readdirSync(REVIEWS_DIR).filter(f => f.endsWith('.md'));
    console.log(`Found ${files.length} review files to scan.`);

    let cleanedCount = 0;

    files.forEach(file => {
        const filePath = path.join(REVIEWS_DIR, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Regex to match "## スペック概要E and the table following it
        // Matches: ## スペック概要E[newlines] |...| [newlines] until next header or end
        const specTableRegex = /## スペック概要\s*\n(\|.*\|\n)+/g;
        // Also simpler regex just for the header if table matching is flaky
        const headerOnlyRegex = /## スペック概要Eg;

        if (headerOnlyRegex.test(content)) {
            // console.log(`Cleaning ${file}...`);

            // Removing the section. We try to be careful.
            // Assumption: The table is immediately after the header.
            // We'll replace the header and the following table lines.

            const newContent = content.replace(/## スペック概要\s*\n(\|.*\|\n)+/g, '');

            // Just in case the table formatting is weird (e.g. empty lines), try a broader approach if first failed but header exists
            let finalContent = newContent;
            if (finalContent.includes('## スペック概要E)) {
                // Fallback: Remove up to the next "##" or EOF
                finalContent = finalContent.replace(/## スペック概要[\s\S]*?(?=\n## |\n$)/g, '');
            }

            if (content !== finalContent) {
                fs.writeFileSync(filePath, finalContent, 'utf8');
                console.log(`✁ECleaned: ${file}`);
                cleanedCount++;
            } else {
                console.log(`⚠�E�ESkipped (Regex mismatch): ${file}`);
            }
        }
    });

    console.log(`\nDone. Cleaned ${cleanedCount} files.`);
}

cleanSpecsFromReviews();
