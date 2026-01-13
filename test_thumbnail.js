// Test generateBlogThumbnail from ai_writer module
const ai_writer = require('./scripts/lib/ai_writer');

async function test() {
    console.log('Testing ai_writer.generateBlogThumbnail...');
    try {
        const b64 = await ai_writer.generateBlogThumbnail('ワイヤレスイヤホン おすすめ');
        if (b64) {
            console.log('✅ Success! Base64 length:', b64.length);
            const fs = require('fs');
            fs.writeFileSync('test_thumb_module.png', Buffer.from(b64, 'base64'));
            console.log('✅ Saved to test_thumb_module.png');
        } else {
            console.log('❌ No image returned');
        }
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}
test();
