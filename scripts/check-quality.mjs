
import { spawnSync } from 'child_process';
import path from 'path';

console.log("孱・・STARTING STRICT QUALITY GATE 孱・・);
console.log("This gate must pass for any content to be considered 'Ready'.");

let exitCode = 0;

// 1. Static Analysis (MDX Structure, Links, Assets)
console.log("\n[1/2] Running Static Analysis (verify-mdx.mjs)...");
const staticCheck = spawnSync('node', ['scripts/verify-mdx.mjs'], { stdio: 'inherit', shell: true });

if (staticCheck.status !== 0) {
    console.error("笶・STATIC CHECKS FAILED.");
    exitCode = 1;
} else {
    console.log("笨・Static Checks Passed.");
}

// 2. Dynamic Analysis (Visuals, Browser, DOM)
if (exitCode === 0) {
    console.log("\n[2/2] Running Dynamic Analysis (verify-visuals.mjs)...");
    const visualCheck = spawnSync('node', ['scripts/verify-visuals.mjs'], { stdio: 'inherit', shell: true });

    if (visualCheck.status !== 0) {
        console.error("笶・VISUAL CHECKS FAILED.");
        exitCode = 1;
    } else {
        console.log("笨・Visual Checks Passed.");
    }
} else {
    console.log("Skipping Visual Checks due to Static Check failure.");
}

if (exitCode !== 0) {
    console.error("\n圻 QUALITY GATE FAILED. Fix errors before deployment.");
    process.exit(1);
} else {
    console.log("\n笨ｨ QUALITY GATE PASSED. System is stable. 笨ｨ");
    process.exit(0);
}
