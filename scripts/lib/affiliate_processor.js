/**
 * 🔗 Affiliate Link Processor
 * Converts any Amazon/Rakuten link to use our own affiliate tags
 */
require('dotenv').config({ path: '.env.local' });

const AMAZON_TAG = process.env.AMAZON_ASSOCIATE_TAG || 'subaru0130-22';
const RAKUTEN_ID = process.env.RAKUTEN_AFFILIATE_ID || '';

/**
 * Cleans an Amazon URL and applies our affiliate tag
 * Handles various formats:
 * - Kakaku.com redirect URLs (tag=kakaku-subtag-22)
 * - Direct Amazon URLs with/without tags
 * - Search URLs
 */
function processAmazonLink(url, asin = null) {
    if (!url && !asin) return null;

    // If we have an ASIN, generate clean link directly
    if (asin) {
        return `https://www.amazon.co.jp/dp/${asin}?tag=${AMAZON_TAG}`;
    }

    // Process existing URL
    if (!url.includes('amazon.co.jp')) return url;

    try {
        const urlObj = new URL(url);

        // Extract ASIN from URL if possible
        const dpMatch = url.match(/\/dp\/([A-Z0-9]{10})/i);
        const gp_match = url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
        const extractedAsin = dpMatch?.[1] || gp_match?.[1];

        if (extractedAsin) {
            // Clean ASIN-based link
            return `https://www.amazon.co.jp/dp/${extractedAsin}?tag=${AMAZON_TAG}`;
        }

        // For search URLs, just replace/add tag
        urlObj.searchParams.delete('tag');
        urlObj.searchParams.delete('ascsubtag');
        urlObj.searchParams.delete('linkCode');
        urlObj.searchParams.delete('creative');
        urlObj.searchParams.delete('creativeASIN');
        urlObj.searchParams.set('tag', AMAZON_TAG);

        return urlObj.toString();
    } catch (e) {
        // Fallback: simple string replacement
        let cleanUrl = url
            .replace(/tag=[^&]+/g, `tag=${AMAZON_TAG}`)
            .replace(/&ascsubtag=[^&]+/g, '')
            .replace(/&linkCode=[^&]+/g, '')
            .replace(/&creative=[^&]+/g, '')
            .replace(/&creativeASIN=[^&]+/g, '');

        if (!cleanUrl.includes('tag=')) {
            const separator = cleanUrl.includes('?') ? '&' : '?';
            cleanUrl += `${separator}tag=${AMAZON_TAG}`;
        }

        return cleanUrl;
    }
}

/**
 * Generates a Rakuten affiliate search link
 * Uses the hb.afl.rakuten.co.jp format for proper tracking
 */
function processRakutenLink(productName) {
    if (!productName) return null;

    // Clean product name for search
    const cleanName = productName
        .replace(/、E*?、Eg, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (!RAKUTEN_ID || RAKUTEN_ID === 'YOUR_RAKUTEN_ID') {
        // No affiliate ID configured, return plain search
        return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(cleanName)}`;
    }

    // Use the proper hb.afl.rakuten.co.jp format for affiliate tracking
    // This redirects through the affiliate system to the search results
    const searchUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(cleanName)}`;
    return `https://hb.afl.rakuten.co.jp/hgc/${RAKUTEN_ID}/?pc=${encodeURIComponent(searchUrl)}`;
}

/**
 * Process all affiliate links for a product
 */
function processAffiliateLinks(product) {
    const processed = { ...product };

    // Process Amazon link
    if (product.amazonUrl || product.affiliateLinks?.amazon || product.asin) {
        const amazonLink = processAmazonLink(
            product.amazonUrl || product.affiliateLinks?.amazon,
            product.asin
        );
        if (!processed.affiliateLinks) processed.affiliateLinks = {};
        processed.affiliateLinks.amazon = amazonLink;
    }

    // Process Rakuten link
    if (product.name) {
        if (!processed.affiliateLinks) processed.affiliateLinks = {};
        processed.affiliateLinks.rakuten = processRakutenLink(product.name);
    }

    return processed;
}

module.exports = {
    processAmazonLink,
    processRakutenLink,
    processAffiliateLinks,
    AMAZON_TAG,
    RAKUTEN_ID
};
