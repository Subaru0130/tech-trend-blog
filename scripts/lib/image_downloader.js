
const fs = require('fs');
const path = require('path');
const https = require('https');
const { injectAiMetadata } = require('./image_metadata');

/**
 * Downloads an image from a URL, saves it locally with a semantic name,
 * and injects AI transparency metadata.
 * 
 * @param {string} url - The URL of the image to download.
 * @param {string} filename - The desired filename (e.g., product-name.jpg).
 * @param {string} directory - The directory to save the image in.
 * @returns {Promise<string>} - The public path to the saved image (e.g., /images/products/foo.jpg).
 */
async function downloadImage(url, filename, directory = 'public/images/products') {
    if (!url || !filename) return null;

    // Ensure directory exists
    const saveDir = path.resolve(process.cwd(), directory);
    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
    }

    const filepath = path.join(saveDir, filename);
    const publicPath = `/${directory.replace('public/', '')}/${filename}`;

    // If file exists and is recent (optional: skip download), just return it?
    // For now, we overwrite to ensure latest version or if metadata is needed.
    // Actually, to be safe, let's download.

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                // Determine failure reason
                console.error(`❌ Failed to download image: ${response.statusCode} ${response.statusMessage} for ${url}`);
                response.resume(); // Consume valid cleanup
                fs.unlink(filepath, () => { }); // Delete empty file
                resolve(null); // Resolve null so we can fallback
                return;
            }

            response.pipe(file);

            file.on('finish', async () => {
                file.close(async () => {
                    // Inject AI Metadata (IPTC)
                    try {
                        const { injectAiMetadata } = require('./image_metadata'); // Lazy load if needed or top level
                        await injectAiMetadata(filepath);
                        // console.log(`   ✨ Meta-injected: ${filename}`);
                        resolve(publicPath); // Return the web-accessible path
                    } catch (e) {
                        console.warn(`   ⚠️ Metadata injection failed for ${filename}:`, e.message);
                        // Still return the image path, as the image itself is valid
                        resolve(publicPath);
                    }
                });
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            console.error(`❌ Error downloading image ${url}:`, err.message);
            resolve(null);
        });
    });
}

/**
 * Helper to generate a semantic filename from a product name.
 * e.g., "Sony WF-1000XM5" -> "sony-wf-1000xm5-hash.jpg"
 */
function generateSemanticFilename(productName, id, extension = 'jpg') {
    const safeName = productName
        .toLowerCase()
        .replace(/[^a-z0-9\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/g, '-') // Keep Japanese chars? Or simplify?
        // Let's simplify to English-ish if possible, or fully safe chars.
        // Actually, existing logic in generate-post.mjs used a specific regex.
        // Let's stick to simple safe characters for filenames.
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    // Hash based on ID or unique string to prevent collisions and busting cache
    const hash = require('crypto').createHash('md5').update(id + Date.now().toString()).digest('hex').substring(0, 4);

    return `${safeName}-${hash}.${extension}`;
}

module.exports = { downloadImage, generateSemanticFilename };
