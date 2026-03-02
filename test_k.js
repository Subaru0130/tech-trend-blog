const https = require('https');
https.get('https://kakaku.com/interior/office-chair/ranking_6608/', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        const matches = data.match(/class="[^"]*name[^"]*"[^>]*>(.*?)<\/a>/g);
        console.log("Found items:", matches ? matches.slice(0, 5) : "None");
    });
});
