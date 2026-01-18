const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lib/amazon_scout.js');
let content = fs.readFileSync(filePath, 'utf8');

// We will replace the entire scrapeProductReviews function
// Anchor: start of function
const startAnchor = `async function scrapeProductReviews(asin, maxReviews = 10) {`;
// Anchor: start of next function (CATEGORY_KEYWORDS)
const endAnchor = `/**\r\n * Category-specific keyword filters`;
// Note: endAnchor might need adjustment for line endings (\r\n vs \n). 
// Let's rely on finding "const CATEGORY_KEYWORDS" and backtracking.

const startIndex = content.indexOf(startAnchor);
const endIndex = content.indexOf("const CATEGORY_KEYWORDS");

if (startIndex === -1 || endIndex === -1) {
    console.error("Anchors not found!");
    process.exit(1);
}

// Backtrack from endIndex to find the closing brace of the previous function and its JSDoc
const realEndIndex = content.lastIndexOf("/**", endIndex);

const newFunction = `async function scrapeProductReviews(asin, maxReviews = 10) {
    console.log(\`\\n📖 Scraping Reviews for ASIN: \${asin}...\`);
    const situationKeywords = ['電車', '通勤', 'カフェ', 'ジム', 'ランニング', '風切り音', 'オフィス', '飛行機', '地下鉄', '会議', 'テレワーク', '在宅'];

    // HELPER: Scrape logic to be reused for initial attempt and retry
    const doScrape = async (isRetry = false) => {
        console.log(isRetry ? \`   🔄 Retry Attempt: Launching fresh browser...\` : \`   🚀 Initial Attempt: Launching browser...\`);
        
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });

        const page = await browser.newPage();
        try {
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Referer': 'https://www.google.com/',
                'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'Upgrade-Insecure-Requests': '1'
            });

            // WARMUP: Essential for bypassing auth wall
            // Longer wait on retry
            const warmupWait = isRetry ? 5000 : 2000;
            console.log(\`   🏠 Warmup: Visiting Amazon Home Page (wait \${warmupWait}ms)...\`);
            try {
                await page.goto('https://www.amazon.co.jp/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
                await new Promise(r => setTimeout(r, warmupWait + Math.random() * 1000));
                
                // On retry, scroll a bit to look human
                if (isRetry) {
                    await page.evaluate(() => window.scrollBy(0, 300));
                    await new Promise(r => setTimeout(r, 1000));
                }
            } catch (e) {
                console.log(\`      ⚠️ Warmup issue: \${e.message}\`);
            }

            const reviewUrl = \`https://www.amazon.co.jp/product-reviews/\${asin}?reviewerType=all_reviews\`;
            
            // STRATEGY: Direct for initial, Indirect (via Product Page) for retry
            let allReviews = [];
            let currentPage = 1;
            const maxPages = Math.ceil(maxReviews / 10);
            let blocked = false;
            let navSuccess = false;

            if (!isRetry) {
                // Initial: Try fast direct link
                console.log(\`   🔗 Fetching review page (Direct): \${reviewUrl}\`);
                try {
                    await page.goto(reviewUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log(\`      ⚠️ Nav timeout ignored\`));
                    const currentUrl = page.url();
                    const pageTitle = await page.title();
                    if (currentUrl.includes('signin') || pageTitle.includes('Sign-In') || pageTitle.includes('ログイン')) {
                        console.log("   🚨 Redirected to Sign-In page! Blocking detected.");
                        blocked = true;
                    } else {
                        try { await page.waitForSelector('[data-hook="review"]', { timeout: 8000 }); navSuccess = true; } catch(e) {}
                    }
                } catch (e) {
                    console.log(\`      ⚠️ Nav error: \${e.message}\`);
                }
            } else {
                // Retry: Go via Product Page (Natural flow)
                console.log(\`   🔗 Fetching review page (Via Product Page): https://www.amazon.co.jp/dp/\${asin}\`);
                try {
                    await page.goto(\`https://www.amazon.co.jp/dp/\${asin}\`, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
                    await new Promise(r => setTimeout(r, 2000));
                    
                    // Click "See all reviews"
                    const seeAll = await page.$('a[data-hook="see-all-reviews-link-foot"], a[href*="product-reviews"]');
                    if (seeAll) {
                         console.log("   🔗 Following 'See All Reviews' link...");
                         await Promise.all([
                             page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }), 
                             seeAll.click()
                         ]).catch(() => console.log("   ⚠️ Click nav timeout"));
                         
                         // Check for block again
                         const currentUrl = page.url();
                         if (currentUrl.includes('signin')) {
                             console.log("   🚨 Redirected to Sign-In after click!");
                             blocked = true;
                         } else {
                             navSuccess = true;
                             try { await page.waitForSelector('[data-hook="review"]', { timeout: 8000 }); } catch(e) {}
                         }
                    } else {
                        console.log("   ⚠️ 'See all reviews' link not found on Product Page.");
                        // Treat as not blocked, but standard fallback will handle scraping from main page
                    }
                } catch(e) { console.log(\`      ⚠️ Indirect nav failed: \${e.message}\`); }
            }

            // PAGINATION LOOP (Only if we successfully reached a review list)
            if (navSuccess && !blocked) {
                while (allReviews.length < maxReviews && currentPage <= maxPages) {
                    await new Promise(r => setTimeout(r, 1500));
                    const pageReviews = await page.evaluate((keywords) => {
                        const results = [];
                        const reviewEls = document.querySelectorAll('[data-hook="review"]');
                        reviewEls.forEach(reviewEl => {
                            const ratingEl = reviewEl.querySelector('[data-hook="review-star-rating"]');
                            const bodyEl = reviewEl.querySelector('[data-hook="review-body"]');
                            const titleEl = reviewEl.querySelector('[data-hook="review-title"]');
                            if (!bodyEl) return;
                            
                            const ratingText = ratingEl?.innerText || ratingEl?.getAttribute('class') || '';
                            let rating = 3;
                            if (ratingText.includes('5')) rating = 5;
                            else if (ratingText.includes('4')) rating = 4;
                            else if (ratingText.includes('3')) rating = 3;
                            else if (ratingText.includes('2')) rating = 2;
                            else if (ratingText.includes('1')) rating = 1;

                            results.push({
                                rating,
                                title: titleEl?.innerText.trim().replace(/^\\d\\.0\\s+/, '') || '',
                                text: bodyEl.innerText.trim(),
                                body: bodyEl.innerText.trim()
                            });
                        });
                        return results;
                    }, situationKeywords);

                    if (pageReviews.length === 0) break;
                    allReviews = allReviews.concat(pageReviews);
                    console.log(\`      📄 Page \${currentPage}: Found \${pageReviews.length} reviews\`);
                    if (allReviews.length >= maxReviews) break;

                    const nextButton = await page.$('.a-pagination .a-last a');
                    if (nextButton) {
                        currentPage++;
                        await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), nextButton.click()]).catch(() => {});
                    } else {
                        break;
                    }
                }
            }

            // FALLBACK TO PRODUCT PAGE
            if (allReviews.length === 0 && !blocked) {
                 console.log("   ⚠️ No reviews on dedicated page. Falling back to Product Page...");
                 await page.goto(\`https://www.amazon.co.jp/dp/\${asin}\`, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
                 await new Promise(r => setTimeout(r, 2000));
                 
                 // Try "See all reviews" link first
                 const seeAll = await page.$('a[data-hook="see-all-reviews-link-foot"]');
                 if (seeAll) {
                     console.log("   🔗 Following 'See All Reviews'...");
                     await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), seeAll.click()]).catch(() => {});
                     // Reuse pagination loop code? For simplicity, we'll just scrape current page here
                     // Ideally we refactor, but for now let's just scrape what's visible
                 }
                 
                 // Scrape current page (either review list or product page body)
                 const fallbackReviews = await page.evaluate(() => {
                        const results = [];
                        const reviewEls = document.querySelectorAll('[data-hook="review"], .review, #cm_cr-review_list .a-section');
                        reviewEls.forEach(reviewEl => {
                            const bodyEl = reviewEl.querySelector('[data-hook="review-body"], .review-text-content');
                            if (bodyEl) results.push({
                                rating: 3, // simplified
                                title: '',
                                text: bodyEl.innerText.trim(),
                                body: bodyEl.innerText.trim()
                            });
                        });
                        return results;
                 });
                 allReviews = fallbackReviews;
                 console.log(\`      📄 Fallback found \${allReviews.length} reviews\`);
            }

            // Close browser
            await browser.close();

            // Return results AND block status
            return { reviews: allReviews, blocked };
            
        } catch (e) {
            if (browser) await browser.close();
            return { reviews: [], blocked: false, error: e };
        }
    };

    // EXECUTION FLOW
    let result = await doScrape(false); // Initial

    // RETRY LOGIC
    if (result.blocked || result.reviews.length === 0) {
        console.log(\`   ⚠️ Initial scrape failed (Blocked: \${result.blocked}, Count: \${result.reviews.length}). Initiating RETRY with enhanced warmup...\`);
        result = await doScrape(true); // Retry
    }

    // PROCESS RESULTS
    const allReviews = result.reviews || [];
    const reviews = { positive: [], negative: [], situational: [] };
    
    // DEBUG: Final Screenshot if still 0
    // We can't take a screenshot here because browser is closed. 
    // The doScrape function should handle debug screenshots if we wanted them.
    // For now, trust the retry logic.

    allReviews.forEach(r => {
        const hasSituation = situationKeywords.some(kw => r.text.includes(kw) || r.title.includes(kw));
        if (hasSituation) reviews.situational.push(r);
        if (r.rating >= 4) reviews.positive.push(r);
        else if (r.rating <= 3) reviews.negative.push(r);
    });

    const output = {
        situational: reviews.situational.slice(0, 10),
        positive: reviews.positive.slice(0, 10),
        negative: reviews.negative.slice(0, 10),
        summary: {
            totalFound: allReviews.length,
            situationalCount: reviews.situational.length,
        }
    };
    console.log(\`   ✅ Reviews scraped: \${output.summary.totalFound} total\`);
    return output;
}
`;

const newContent = content.substring(0, startIndex) + newFunction + content.substring(realEndIndex);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Successfully injected retry logic into amazon_scout.js!");
