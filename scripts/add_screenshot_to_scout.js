const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lib/amazon_scout.js');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = "// Process results";
const replacementStr = `// DEBUG: Screenshot if 0 reviews
        if (allReviews.length === 0) {
            console.log("   📸 0 reviews found. Capturing debug screenshot...");
            try {
                await page.screenshot({ path: 'amazon_review_debug.png', fullPage: false });
                console.log("   ✁ESaved 'amazon_review_debug.png'");
            } catch(e) { console.log("   ❁EAuto-screenshot failed: " + e.message); }
        }

        // Process results`;

if (content.indexOf(targetStr) !== -1) {
    const newContent = content.replace(targetStr, replacementStr);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Successfully injected screenshot logic!");
} else {
    console.error("Target string not found!");
    process.exit(1);
}
