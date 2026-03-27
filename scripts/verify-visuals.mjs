import fs from 'fs';
import path from 'path';
import http from 'http';
import net from 'net';
import next from 'next';
import puppeteer from 'puppeteer';

const DEFAULT_PORT = 3000;
const FALLBACK_PORT_START = 3100;
const FALLBACK_PORT_END = 3199;
const TODAY = new Date().toISOString().split('T')[0];
const ARTICLES_PATH = path.resolve(process.cwd(), 'src/data/articles.json');

function log(message) {
    console.log(`[VISUAL] ${message}`);
}

function fail(message) {
    console.error(`[VISUAL] ERROR: ${message}`);
}

function readArticles() {
    if (!fs.existsSync(ARTICLES_PATH)) {
        return [];
    }

    return JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf8'));
}

function buildTargetPaths() {
    const articles = readArticles();
    const focusArticle = articles.find((article) => article.updatedDate === TODAY || article.publishedAt === TODAY) || articles[0];
    const rankingSlug = focusArticle?.slug || focusArticle?.id;
    const reviewSlug = focusArticle?.rankingItems?.[0]?.productId || focusArticle?.products?.[0];

    return Array.from(new Set([
        '/',
        rankingSlug ? `/rankings/${rankingSlug}` : null,
        reviewSlug ? `/reviews/${reviewSlug}` : null,
    ].filter(Boolean)));
}

async function isServerReachable(port) {
    return await new Promise((resolve) => {
        const req = http.get({
            hostname: '127.0.0.1',
            port,
            path: '/',
            timeout: 3000,
        }, (res) => {
            res.resume();
            resolve((res.statusCode || 0) < 500);
        });

        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function waitForServer(port, timeoutMs = 120000) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        if (await isServerReachable(port)) {
            return true;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return false;
}

async function findAvailablePort(start = FALLBACK_PORT_START, end = FALLBACK_PORT_END) {
    for (let port = start; port <= end; port += 1) {
        const available = await new Promise((resolve) => {
            const server = net.createServer();
            server.once('error', () => resolve(false));
            server.once('listening', () => {
                server.close(() => resolve(true));
            });
            server.listen(port, '127.0.0.1');
        });

        if (available) {
            return port;
        }
    }

    throw new Error(`No available port found between ${start} and ${end}.`);
}

async function startNextServer(port) {
    const lockFile = path.join(process.cwd(), '.next', 'dev', 'lock');
    if (fs.existsSync(lockFile)) {
        try {
            fs.rmSync(lockFile);
            log(`Removed stale Next dev lock: ${lockFile}`);
        } catch (error) {
            log(`Could not remove Next dev lock: ${error.message}`);
        }
    }

    const app = next({ dev: true, dir: process.cwd(), hostname: '127.0.0.1', port });
    await app.prepare();
    const handle = app.getRequestHandler();

    const server = http.createServer((req, res) => handle(req, res));

    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, '127.0.0.1', resolve);
    });

    const ready = await waitForServer(port);
    if (!ready) {
        throw new Error(`Next server did not become reachable on port ${port}.`);
    }

    return {
        baseUrl: `http://127.0.0.1:${port}`,
        cleanup: async () => {
            await new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
            if (typeof app.close === 'function') {
                await app.close();
            }
        },
    };
}

async function resolveBaseUrl() {
    if (await isServerReachable(DEFAULT_PORT)) {
        log(`Using existing local server on port ${DEFAULT_PORT}.`);
        return {
            baseUrl: `http://127.0.0.1:${DEFAULT_PORT}`,
            cleanup: async () => {},
        };
    }

    const port = await findAvailablePort();
    log(`Starting temporary Next server on port ${port}.`);
    return await startNextServer(port);
}

function filterConsoleMessages(messages = []) {
    return messages.filter((message) => {
        const normalized = String(message || '').toLowerCase();
        return normalized &&
            !normalized.includes('favicon.ico') &&
            !normalized.includes('download the react devtools') &&
            !normalized.includes('sourcemap') &&
            !normalized.includes('largest contentful paint (lcp)') &&
            !normalized.includes('failed to load resource: net::err_failed');
    });
}

async function checkPage(browser, baseUrl, pathname) {
    const page = await browser.newPage();
    const consoleMessages = [];
    const pageErrors = [];

    page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            consoleMessages.push(msg.text());
        }
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.setViewport({ width: 1440, height: 1200 });
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const url = request.url();
        if (
            url.includes('fonts.googleapis.com') ||
            url.includes('fonts.gstatic.com') ||
            url.includes('googletagmanager.com') ||
            url.includes('google-analytics.com')
        ) {
            request.abort();
            return;
        }

        request.continue();
    });

    const url = `${baseUrl}${pathname}`;
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

    if (!response) {
        throw new Error(`No response received for ${url}`);
    }

    if ((response.status() || 0) >= 400) {
        throw new Error(`HTTP ${response.status()} for ${url}`);
    }

    await page.waitForSelector('body', { timeout: 30000 });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const pageInfo = await page.evaluate(() => {
        const bodyText = document.body?.innerText || '';
        const images = Array.from(document.images || []);
        const visibleLocalImages = images.filter((img) => {
            const src = img.currentSrc || img.src || '';
            const rect = img.getBoundingClientRect();
            const isNearViewport = rect.top < window.innerHeight * 1.5 && rect.bottom > -100;
            return src.includes(window.location.host) && isNearViewport;
        });

        return {
            title: document.title,
            hasMain: Boolean(document.querySelector('main')),
            h1Count: document.querySelectorAll('h1').length,
            affiliateLinks: document.querySelectorAll('a[href*="/link/"], a[href*="amazon.co.jp"], a[href*="rakuten.co.jp"]').length,
            fatalText: /application error|unexpected error|this page could not be found/i.test(bodyText),
            brokenLocalImages: visibleLocalImages
                .filter((img) => img.naturalWidth === 0 || img.naturalHeight === 0)
                .map((img) => img.currentSrc || img.src)
                .slice(0, 5),
        };
    });

    await page.close();

    const issues = [];
    if (!pageInfo.hasMain) {
        issues.push('Missing <main> element');
    }
    if (pageInfo.h1Count < 1) {
        issues.push('Missing <h1>');
    }
    if (pageInfo.fatalText) {
        issues.push('Fatal error text detected in body');
    }
    if (pageInfo.brokenLocalImages.length > 0) {
        issues.push(`Broken local images: ${pageInfo.brokenLocalImages.join(', ')}`);
    }
    if (pathname !== '/' && pageInfo.affiliateLinks < 1) {
        issues.push('No affiliate-style links found on content page');
    }

    const filteredConsole = filterConsoleMessages(consoleMessages);
    if (filteredConsole.length > 0) {
        issues.push(`Browser console issues: ${filteredConsole.slice(0, 3).join(' | ')}`);
    }
    if (pageErrors.length > 0) {
        issues.push(`Runtime errors: ${pageErrors.slice(0, 3).join(' | ')}`);
    }

    return {
        pathname,
        title: pageInfo.title,
        issues,
    };
}

async function main() {
    const targets = buildTargetPaths();
    if (targets.length === 0) {
        fail('No pages available for visual verification.');
        process.exit(1);
    }

    const { baseUrl, cleanup } = await resolveBaseUrl();
    const browser = await puppeteer.launch({ headless: true });
    let hasError = false;

    try {
        log(`Checking ${targets.length} page(s) against ${baseUrl}`);

        for (const pathname of targets) {
            const result = await checkPage(browser, baseUrl, pathname);
            if (result.issues.length > 0) {
                hasError = true;
                fail(`${pathname} failed: ${result.issues.join(' / ')}`);
            } else {
                log(`${pathname} passed (${result.title})`);
            }
        }
    } finally {
        await browser.close();
        await cleanup();
    }

    if (hasError) {
        process.exit(1);
    }

    log('Visual verification passed.');
    process.exit(0);
}

main().catch((error) => {
    fail(error.stack || error.message);
    process.exit(1);
});
