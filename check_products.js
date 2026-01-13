// Check recent products in database
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/products.json'));

// Get recent products
const recent = data.filter(p => p.id?.startsWith('scout-') || p.id?.startsWith('market-')).slice(-20);

console.log('=== Recent Products in Database ===\n');
recent.forEach(p => {
    console.log(`ID: ${p.id}`);
    console.log(`Name: ${p.name?.slice(0, 60)}`);
    console.log(`Price: ${p.price || p.priceVal}`);
    console.log(`Kakaku URL: ${p.kakakuUrl ? 'YES' : 'NO'}`);
    console.log(`Has Kakaku Amazon: ${p.hasKakakuAmazon}`);
    console.log(`Sources: ${JSON.stringify(p.sources || [])}`);
    console.log('---');
});

console.log('\n\n=== Summary ===');
const withKakaku = recent.filter(p => p.kakakuUrl).length;
const withKakakuAmazon = recent.filter(p => p.hasKakakuAmazon).length;
console.log(`Total recent products: ${recent.length}`);
console.log(`With Kakaku URL: ${withKakaku}`);
console.log(`With Kakaku Amazon link: ${withKakakuAmazon}`);
