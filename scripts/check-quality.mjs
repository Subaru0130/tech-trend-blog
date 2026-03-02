
import { spawnSync } from 'child_process';
import path from 'path';

console.log("[QUALITY GATE] STARTING STRICT QUALITY GATE");
console.log("This gate must pass for any content to be considered 'Ready'.");

let exitCode = 0;

// 1. Static Analysis (MDX Structure, Links, Assets)
console.log("\n[1/2] Running Static Analysis (verify-mdx.mjs)...");
const staticCheck = spawnSync('node', ['scripts/verify-mdx.mjs'], { stdio: 'inherit', shell: true });

if (staticCheck.status !== 0) {
    console.error("❌ STATIC CHECKS FAILED.");
    exitCode = 1;
} else {
    console.log("✅ Static Checks Passed.");
}

// 2. Dynamic Analysis (Visuals, Browser, DOM)
if (exitCode === 0) {
    console.log("\n[2/2] Running Dynamic Analysis (verify-visuals.mjs)...");
    const visualCheck = spawnSync('node', ['scripts/verify-visuals.mjs'], { stdio: 'inherit', shell: true });

    if (visualCheck.status !== 0) {
        console.error("❌ VISUAL CHECKS FAILED.");
        exitCode = 1;
    } else {
        console.log("✅ Visual Checks Passed.");
    }
} else {
    console.log("Skipping Visual Checks due to Static Check failure.");
}

if (exitCode !== 0) {
    console.error("\n[ERROR] QUALITY GATE FAILED. Fix errors before deployment.");
    process.exit(1);
} else {
    console.log("\n[SUCCESS] QUALITY GATE PASSED. System is stable.");
    process.exit(0);
}
