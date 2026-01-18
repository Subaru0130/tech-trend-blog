const fs = require('fs');
const path = require('path');

const FILE_PATH = path.resolve(__dirname, '../BATCH_BLUEPRINTS_ワイヤレスイヤホン.json');

try {
    const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
    console.log("Found keywords:");
    data.forEach(d => console.log(`- ${d.keyword}`));
} catch (e) {
    console.error("Error:", e);
}
