require('dotenv').config({ path: '.env.local' });
const { generateBlogThumbnail } = require('./lib/ai_writer');

const keyword = "【ワイヤレスイヤホン】おすすめ人気ランキング5選【ソニー・Bose・Apple徹底比較】";

(async () => {
    console.log(`🚀 Testing generateBlogThumbnail for "${keyword}"...`);
    try {
        const imageBase64 = await generateBlogThumbnail(keyword);
        if (imageBase64) {
            console.log("✅ Thumbnail Generated! Length:", imageBase64.length);
        } else {
            console.log("❌ Thumbnail Generation returned null.");
        }
    } catch (e) {
        console.error("❌ CRITICAL ERROR in Test Script:", e);
    }
})();
