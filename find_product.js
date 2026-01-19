
const fs = require('fs');
const content = fs.readFileSync('./src/data/products.json', 'utf8');
const lines = content.split('\n');

const ids = ['scout-B0DDKHF9XY', 'scout-B0DDKGK41D', 'scout-B0DDKK9DRV']; // Known ASINs from previous steps 

console.log('Searching for lines containing IDs...');
lines.forEach((line, index) => {
    if (ids.some(id => line.includes(id))) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
        // Print context to confirm it's the start of an object (usually id is near top)
    }
});
