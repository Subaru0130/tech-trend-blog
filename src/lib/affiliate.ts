/**
 * Centralized logic for generating affiliate links.
 * Ensures that the Amazon Associate Tag is ALWAYS present.
 */
export function getAmazonLink(asin?: string, affiliateLink?: string): string | null {
    // 1. Get Tag from Env or use strict fallback
    // Note: The fallback 'demo-22' is for development. 
    // The user MUST set NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG in production.
    const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG || 'demo-22';

    // 2. Priority: ASIN based link (Most reliable)
    if (asin) {
        return `https://www.amazon.co.jp/dp/${asin}?tag=${tag}`;
    }

    // 3. Fallback: Search link (if affiliateLink is a search query)
    if (affiliateLink?.startsWith('SEARCH:')) {
        const term = affiliateLink.replace('SEARCH:', '');
        return `https://www.amazon.co.jp/s?k=${encodeURIComponent(term)}&tag=${tag}`;
    }

    // 4. Legacy: Return direct link if provided (but warn if no tag)
    if (affiliateLink) {
        if (affiliateLink.includes('amazon.co.jp') && !affiliateLink.includes('tag=')) {
            // Attempt to inject tag if it's a raw amazon link
            const separator = affiliateLink.includes('?') ? '&' : '?';
            return `${affiliateLink}${separator}tag=${tag}`;
        }
        return affiliateLink;
    }

    return null;
}

export function getRakutenLink(name: string, affiliateLink?: string): string | null {
    // Return explicit link if exists
    if (affiliateLink && !affiliateLink.startsWith('SEARCH:')) return affiliateLink;

    // Else generate search
    const id = process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID || 'demo-rakuten';
    // Clean name for search
    const cleanName = name.replace(/Sony|Apple|Anker/g, '').trim();
    return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(cleanName)}/?a_id=${id}`;
}
