import fs from 'fs';

async function testUrl() {
    const asin = "B09B9V4PXC";
    // Try multiple patterns
    const urls = [
        `https://m.media-amazon.com/images/I/${asin}.jpg`, // Sometimes works if ID is ASIN? No usually weird hash.
        `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg`,
        `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.LZZZZZZZ.jpg` // The one that failed?
    ];

    for (const url of urls) {
        console.log(`Testing: ${url}`);
        try {
            const res = await fetch(url);
            const buf = await res.arrayBuffer();
            console.log(`Status: ${res.status}`);
            console.log(`Size: ${buf.byteLength} bytes`);
        } catch (e) {
            console.error(e.message);
        }
    }
}

testUrl();
