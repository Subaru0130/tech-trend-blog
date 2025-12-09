import http from 'http';

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
    timeout: 2000 // 2s timeout
};

console.log('Checking server health at http://localhost:3000...');

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log('Server is UP and HEALTHY.');
        process.exit(0);
    } else {
        console.error('Server returned error status.');
        process.exit(1);
    }
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    console.log('Server is DOWN or Unreachable.');
    process.exit(1);
});

req.on('timeout', () => {
    console.error('Request timed out.');
    req.destroy();
    process.exit(1);
});

req.end();
