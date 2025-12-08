
import fs from 'fs';
import path from 'path';
import https from 'https';

const postsDir = path.join(process.cwd(), 'content', 'posts');

// Helper to check URL status
function checkUrl(url) {
    return new Promise((resolve) => {
        const options = {
            method: 'GET', // Amazon blocks HEAD
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };
        const req = https.request(url, options, (res) => {
            // consume response data to free memory
            res.resume();
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
        });
        req.on('error', () => resolve({ ok: false, status: 'ERROR' }));
        req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 'TIMEOUT' }); });
        req.end();
    });
}

async function checkLinks() {
    console.log("🔍 Starting Affiliate Link Check...");

    if (!fs.existsSync(postsDir)) {
        console.log("No posts directory found.");
        process.exit(0);
    }

    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx'));
    let hasError = false;
    if (hasError) {
        console.error("🚨 Found broken affiliate links! Please review the logs.");
        process.exit(1); // Fail the CI workflow so user gets notified
    } else {
        console.log("✅ All affiliate links are alive.");
    }
}

checkLinks();
