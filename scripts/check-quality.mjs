
import { spawnSync } from 'child_process';
import path from 'path';

console.log("[QUALITY GATE] STARTING STRICT QUALITY GATE");
console.log("This gate must pass for any content to be considered 'Ready'.");

let exitCode = 0;

// 1. Metadata Analysis (Title, Description, Ranking Structure)
console.log("\n[1/3] Running Metadata Analysis (check-generated-metadata.mjs)...");
const metadataCheck = spawnSync('node', ['scripts/check-generated-metadata.mjs'], { stdio: 'inherit', shell: true });

if (metadataCheck.status !== 0) {
    console.error("❌ METADATA CHECKS FAILED.");
    exitCode = 1;
} else {
    console.log("✅ Metadata Checks Passed.");
}

// 2. Static Analysis (Content Structure, Links, Assets)
if (exitCode === 0) {
    console.log("\n[2/3] Running Static Analysis (verify-content.mjs)...");
    const staticCheck = spawnSync('node', ['scripts/verify-content.mjs'], { stdio: 'inherit', shell: true });

    if (staticCheck.status !== 0) {
        console.error("❌ STATIC CHECKS FAILED.");
        exitCode = 1;
    } else {
        console.log("✅ Static Checks Passed.");
    }
} else {
    console.log("Skipping Static Checks due to Metadata Check failure.");
}

// 3. Dynamic Analysis (Visuals, Browser, DOM)
if (exitCode === 0) {
    console.log("\n[3/3] Running Dynamic Analysis (verify-visuals.mjs)...");
    const visualCheck = spawnSync('node', ['scripts/verify-visuals.mjs'], { stdio: 'inherit', shell: true });

    if (visualCheck.status !== 0) {
        console.error("❌ VISUAL CHECKS FAILED.");
        exitCode = 1;
    } else {
        console.log("✅ Visual Checks Passed.");
    }
} else {
    console.log("Skipping Visual Checks due to earlier Quality Gate failure.");
}

if (exitCode !== 0) {
    console.error("\n[ERROR] QUALITY GATE FAILED. Fix errors before deployment.");
    process.exit(1);
} else {
    console.log("\n[SUCCESS] QUALITY GATE PASSED. System is stable.");
    process.exit(0);
}
