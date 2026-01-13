console.log("Starting test...");
try {
    const pkg = require('@google/genai');
    console.log("Require success:", pkg);
} catch (e) {
    console.error("Require failed:", e);
}
